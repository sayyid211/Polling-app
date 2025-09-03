import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as supabaseModule from '@/lib/supabase';
import { createPoll, getPollWithResults, voteOnPoll, hasUserVoted, getUserVotes } from '@/lib/actions';

vi.mock('@/lib/supabase');

const supabase = supabaseModule as unknown as {
  supabase: {
    from: ReturnType<any>;
    rpc: ReturnType<any>;
  };
};

function mockFrom() {
  const chain: any = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  };
  (supabaseModule as any).supabase.from = vi.fn(() => chain);
  return chain;
}

describe('actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createPoll inserts poll and options, returns id', async () => {
    const chain = mockFrom();
    chain.single.mockResolvedValueOnce({ data: { id: 'poll-1' }, error: null });

    const optionsChain: any = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    (supabaseModule as any).supabase.from = vi
      .fn()
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(optionsChain);

    const res = await createPoll(
      {
        title: 'Test',
        description: 'Desc',
        options: ['A', 'B'],
        allowMultipleVotes: false,
      },
      'user-1'
    );

    expect(res.success).toBe(true);
    expect(res.pollId).toBe('poll-1');
  });

  it('getPollWithResults calls RPC and returns first row', async () => {
    (supabaseModule as any).supabase.rpc = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'poll-1' }], error: null });

    const res = await getPollWithResults('poll-1');
    expect(res).toEqual({ id: 'poll-1' });
  });

  it('voteOnPoll inserts vote', async () => {
    const chain = mockFrom();
    chain.insert = vi.fn().mockResolvedValue({ error: null });

    const res = await voteOnPoll('poll-1', 'opt-1', 'user-1');
    expect(res.success).toBe(true);
  });

  it('hasUserVoted returns boolean from rpc', async () => {
    (supabaseModule as any).supabase.rpc = vi
      .fn()
      .mockResolvedValue({ data: true, error: null });

    const res = await hasUserVoted('poll-1', 'user-1');
    expect(res).toBe(true);
  });

  it('getUserVotes returns array from rpc', async () => {
    (supabaseModule as any).supabase.rpc = vi
      .fn()
      .mockResolvedValue({ data: [{ option_id: 'opt-1' }], error: null });

    const res = await getUserVotes('poll-1', 'user-1');
    expect(res).toEqual([{ option_id: 'opt-1' }]);
  });
});
