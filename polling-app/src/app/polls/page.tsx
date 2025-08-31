'use client';

import { useState, useEffect } from 'react';
import { PollCard } from '@/components/polls/PollCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Poll, mockPolls } from '@/lib/api';

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadPolls = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPolls(mockPolls);
      } catch (error) {
        console.error('Failed to load polls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolls();
  }, []);

  useEffect(() => {
    let filtered = polls;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(poll =>
        poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(poll => poll.isActive);
    } else if (filter === 'closed') {
      filtered = filtered.filter(poll => !poll.isActive);
    }

    setFilteredPolls(filtered);
  }, [polls, searchTerm, filter]);

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Voting for poll:', pollId, 'option:', optionId);
      
      // Update local state optimistically
      setPolls(prevPolls =>
        prevPolls.map(poll =>
          poll.id === pollId
            ? {
                ...poll,
                options: poll.options.map(option =>
                  option.id === optionId
                    ? { ...option, votes: option.votes + 1 }
                    : option
                ),
              }
            : poll
        )
      );
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Polls</h1>
        <p className="text-muted-foreground">
          Discover and participate in polls created by the community
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              Closed
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''} found</span>
          {searchTerm && (
            <>
              <span>•</span>
              <span>Searching for "{searchTerm}"</span>
            </>
          )}
        </div>
      </div>

      {/* Polls Grid */}
      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm ? 'No polls found matching your search.' : 'No polls available.'}
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
