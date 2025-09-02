-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- Types
create type poll_status as enum ('active', 'closed', 'draft');

-- Profiles (companion to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Polls
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status poll_status not null default 'active',
  allow_multiple_votes boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Poll options
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Prevent duplicate votes for the same option by the same user
  unique (poll_id, user_id, option_id)
);

-- Indexes for performance
create index if not exists idx_polls_created_by on public.polls(created_by);
create index if not exists idx_polls_status on public.polls(status);
create index if not exists idx_polls_created_at on public.polls(created_at);
create index if not exists idx_poll_options_poll_id on public.poll_options(poll_id);
create index if not exists idx_votes_poll_id on public.votes(poll_id);
create index if not exists idx_votes_user_id on public.votes(user_id);
create index if not exists idx_votes_option_id on public.votes(option_id);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

-- Profiles policies
create policy if not exists "profiles_select_all" on public.profiles
  for select using (true);

create policy if not exists "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy if not exists "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Polls policies
create policy if not exists "polls_select_active" on public.polls
  for select using (status = 'active');

create policy if not exists "polls_select_own" on public.polls
  for select using (auth.uid() = created_by);

create policy if not exists "polls_insert_auth" on public.polls
  for insert with check (auth.uid() = created_by);

create policy if not exists "polls_update_own" on public.polls
  for update using (auth.uid() = created_by);

create policy if not exists "polls_delete_own" on public.polls
  for delete using (auth.uid() = created_by);

-- Poll options policies
create policy if not exists "options_select_active" on public.poll_options
  for select using (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.status = 'active'
    )
  );

create policy if not exists "options_select_own" on public.poll_options
  for select using (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.created_by = auth.uid()
    )
  );

create policy if not exists "options_insert_own" on public.poll_options
  for insert with check (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.created_by = auth.uid()
    )
  );

create policy if not exists "options_update_own" on public.poll_options
  for update using (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.created_by = auth.uid()
    )
  );

create policy if not exists "options_delete_own" on public.poll_options
  for delete using (
    exists (
      select 1 from public.polls p
      where p.id = poll_options.poll_id and p.created_by = auth.uid()
    )
  );

-- Votes policies
create policy if not exists "votes_select_active" on public.votes
  for select using (
    exists (
      select 1 from public.polls p
      where p.id = votes.poll_id and p.status = 'active'
    )
  );

create policy if not exists "votes_select_own" on public.votes
  for select using (auth.uid() = user_id);

create policy if not exists "votes_insert_auth_active" on public.votes
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.polls p
      where p.id = votes.poll_id and p.status = 'active'
    )
  );

create policy if not exists "votes_delete_own" on public.votes
  for delete using (auth.uid() = user_id);

-- Updated timestamp trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_polls_updated_at
  before update on public.polls
  for each row execute function public.set_updated_at();

create trigger trg_poll_options_updated_at
  before update on public.poll_options
  for each row execute function public.set_updated_at();

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper function: get poll with options and vote counts
create or replace function public.get_poll_with_results(poll_uuid uuid)
returns table (
  poll_id uuid,
  title text,
  description text,
  created_by uuid,
  status poll_status,
  allow_multiple_votes boolean,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  options json,
  total_votes bigint
) language plpgsql security definer as $$
begin
  return query
  select
    p.id,
    p.title,
    p.description,
    p.created_by,
    p.status,
    p.allow_multiple_votes,
    p.expires_at,
    p.created_at,
    p.updated_at,
    coalesce(
      (
        select json_agg(
          json_build_object(
            'id', o.id,
            'text', o.text,
            'order_index', o.order_index,
            'votes', coalesce(vc.vote_count, 0)
          ) order by o.order_index
        )
        from public.poll_options o
        left join (
          select option_id, count(*) as vote_count
          from public.votes
          where poll_id = p.id
          group by option_id
        ) vc on vc.option_id = o.id
        where o.poll_id = p.id
      ), '[]'::json
    ) as options,
    coalesce((select count(*) from public.votes v where v.poll_id = p.id), 0) as total_votes
  from public.polls p
  where p.id = poll_uuid;
end;
$$;

-- Helper function: check if user has voted
create or replace function public.has_user_voted(poll_uuid uuid, user_uuid uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.votes v
    where v.poll_id = poll_uuid and v.user_id = user_uuid
  );
$$;

-- Helper function: get user votes for a poll
create or replace function public.get_user_votes(poll_uuid uuid, user_uuid uuid)
returns table(option_id uuid) language sql security definer as $$
  select v.option_id from public.votes v
  where v.poll_id = poll_uuid and v.user_id = user_uuid;
$$;

-- Function to enforce voting rules
create or replace function public.votes_enforce_rules()
returns trigger language plpgsql as $$
declare
  opt_poll_id uuid;
  allow_multi boolean;
begin
  -- Ensure the option belongs to the provided poll
  select o.poll_id into opt_poll_id from public.poll_options o where o.id = new.option_id;
  if opt_poll_id is null then
    raise exception 'Invalid option_id: option not found';
  end if;
  if opt_poll_id <> new.poll_id then
    raise exception 'Option % does not belong to poll %', new.option_id, new.poll_id;
  end if;

  -- Check allow_multiple_votes setting
  select p.allow_multiple_votes into allow_multi from public.polls p where p.id = new.poll_id;
  if allow_multi is null then
    raise exception 'Invalid poll_id: poll not found';
  end if;

  if not allow_multi then
    -- If multiple votes are not allowed, ensure user has not already voted in this poll
    if exists (
      select 1 from public.votes v
      where v.poll_id = new.poll_id and v.user_id = new.user_id
    ) then
      raise exception 'Multiple votes are not allowed for this poll';
    end if;
  end if;

  return new;
end;
$$;

-- Create trigger to enforce voting rules
create trigger trg_votes_enforce_rules
  before insert on public.votes
  for each row execute function public.votes_enforce_rules();
