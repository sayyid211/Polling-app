'use client';

import { CreatePollForm } from '@/components/polls/CreatePollForm';

export default function CreatePollPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a New Poll</h1>
        <p className="text-muted-foreground">
          Create engaging polls to gather opinions from your community
        </p>
      </div>

      <CreatePollForm />
    </div>
  );
}
