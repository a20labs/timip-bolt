import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FollowButtonProps {
  profileId: string;
  isFollowing: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline';
  className?: string;
}

export function FollowButton({ 
  profileId, 
  isFollowing, 
  size = 'md', 
  variant = 'primary',
  className = ''
}: FollowButtonProps) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ action }: { action: 'follow' | 'unfollow' }) => {
      // In a real app, this would call Supabase to insert/delete a follow record
      console.log(`${action === 'follow' ? 'Following' : 'Unfollowing'} profile ${profileId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    },
    onMutate: async ({ action }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      
      // Get the current profile data
      const profiles = queryClient.getQueriesData<any>({ queryKey: ['profile'] });
      
      // For each profile query, update the isFollowing status if it matches the profileId
      profiles.forEach(([queryKey, profile]) => {
        if (profile && profile.id === profileId) {
          queryClient.setQueryData(queryKey, {
            ...profile,
            is_following: action === 'follow',
            followers_count: action === 'follow' 
              ? (profile.followers_count || 0) + 1 
              : (profile.followers_count || 0) - 1
          });
        }
      });
      
      return { profiles };
    },
    onError: (err, variables, context) => {
      // Revert to the previous state if there's an error
      if (context?.profiles) {
        context.profiles.forEach(([queryKey, profile]) => {
          queryClient.setQueryData(queryKey, profile);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleClick = () => {
    followMutation.mutate({
      action: isFollowing ? 'unfollow' : 'follow'
    });
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      loading={followMutation.isPending}
      className={className}
    >
      {isFollowing ? (
        <>
          <Heart className="w-4 h-4 mr-2 fill-current" />
          Following
        </>
      ) : (
        <>
          <Heart className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}