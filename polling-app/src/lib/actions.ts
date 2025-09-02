'use server';

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export interface CreatePollInput {
  title: string;
  description?: string;
  options: string[];
  allowMultipleVotes: boolean;
  expiresAt?: Date;
}

export async function createPoll(input: CreatePollInput, userId: string) {
  try {
    // Start a transaction by creating the poll first
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: input.title,
        description: input.description,
        created_by: userId,
        status: 'active',
        allow_multiple_votes: input.allowMultipleVotes,
        expires_at: input.expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      throw new Error('Failed to create poll');
    }

    // Create poll options
    const pollOptions = input.options.map((text, index) => ({
      poll_id: poll.id,
      text,
      order_index: index,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      // Clean up the poll if options creation fails
      await supabase.from('polls').delete().eq('id', poll.id);
      throw new Error('Failed to create poll options');
    }

    // Revalidate the polls page to show the new poll
    revalidatePath('/polls');
    revalidatePath('/');

    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('Error in createPoll:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPolls() {
  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        *,
        profiles!polls_created_by_fkey(name, email),
        poll_options(
          id,
          text,
          order_index,
          votes:votes(count)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching polls:', error);
      throw new Error('Failed to fetch polls');
    }

    return polls;
  } catch (error) {
    console.error('Error in getPolls:', error);
    return [];
  }
}

export async function getPollWithResults(pollId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_poll_with_results', { poll_uuid: pollId });

    if (error) {
      console.error('Error fetching poll results:', error);
      throw new Error('Failed to fetch poll results');
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getPollWithResults:', error);
    return null;
  }
}

export async function voteOnPoll(pollId: string, optionId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      });

    if (error) {
      console.error('Error voting on poll:', error);
      throw new Error('Failed to vote on poll');
    }

    // Revalidate the poll page to show updated results
    revalidatePath(`/polls/${pollId}`);
    revalidatePath('/polls');

    return { success: true };
  } catch (error) {
    console.error('Error in voteOnPoll:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function hasUserVoted(pollId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('has_user_voted', { poll_uuid: pollId, user_uuid: userId });

    if (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error in hasUserVoted:', error);
    return false;
  }
}

export async function getUserVotes(pollId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_votes', { poll_uuid: pollId, user_uuid: userId });

    if (error) {
      console.error('Error getting user votes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserVotes:', error);
    return [];
  }
}
