'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePollForm } from '@/components/polls/CreatePollForm';
import { CreatePollData } from '@/types';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreatePollPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleCreatePoll = async (data: CreatePollData) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Creating poll:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to polls page after successful creation
      router.push('/polls');
    } catch (error) {
      console.error('Failed to create poll:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to create a poll
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to your account to create and manage polls.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <a href="/auth/login">Sign In</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/register">Create Account</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a New Poll</h1>
        <p className="text-muted-foreground">
          Create engaging polls to gather opinions from your community
        </p>
      </div>

      <CreatePollForm onSubmit={handleCreatePoll} isLoading={isLoading} />
    </div>
  );
}
