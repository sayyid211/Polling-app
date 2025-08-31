'use client';

import { useState } from 'react';
import { Poll } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  showResults?: boolean;
}

export function PollCard({ poll, onVote, showResults = false }: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  const handleOptionClick = (optionId: string) => {
    if (hasVoted) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;
    
    selectedOptions.forEach(optionId => {
      onVote?.(poll.id, optionId);
    });
    
    setHasVoted(true);
  };

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription className="mt-2">
                {poll.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={poll.isActive ? "default" : "secondary"}>
              {poll.isActive ? "Active" : "Closed"}
            </Badge>
            {poll.allowMultipleVotes && (
              <Badge variant="outline">Multiple votes</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/api/placeholder/24/24" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>Created by {poll.createdBy}</span>
          <span>•</span>
          <span>{totalVotes} votes</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = getVotePercentage(option.votes);
            const isSelected = selectedOptions.includes(option.id);
            
            return (
              <div
                key={option.id}
                className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                } ${hasVoted ? 'cursor-default' : ''}`}
                onClick={() => handleOptionClick(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.text}</span>
                  {showResults && (
                    <span className="text-sm text-muted-foreground">
                      {option.votes} votes ({percentage}%)
                    </span>
                  )}
                </div>
                {showResults && (
                  <div className="mt-2 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {!hasVoted && !showResults && (
          <Button 
            onClick={handleVote}
            disabled={selectedOptions.length === 0}
            className="w-full"
          >
            Vote
          </Button>
        )}
        
        {hasVoted && (
          <div className="text-center text-sm text-muted-foreground">
            ✓ You have voted
          </div>
        )}
      </CardContent>
    </Card>
  );
}
