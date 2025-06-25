import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProfileCard } from '../profile/ProfileCard';

interface FollowersTabProps {
  profileId: string;
  handle: string;
}

interface Follower {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  followers_count: number;
  is_following: boolean;
}

export function FollowersTab({ profileId, handle }: FollowersTabProps) {
  // Fetch followers
  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers', profileId],
    queryFn: async (): Promise<Follower[]> => {
      // In a real app, this would call Supabase to get followers
      // For demo, return mock data
      return [
        {
          id: 'follower-1',
          handle: 'musicfan42',
          display_name: 'Music Fan',
          avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Always looking for new music to discover!',
          role: 'FAN',
          followers_count: 12,
          is_following: false
        },
        {
          id: 'follower-2',
          handle: 'producer_mike',
          display_name: 'Producer Mike',
          avatar_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Electronic music producer and DJ',
          role: 'ARTIST',
          followers_count: 342,
          is_following: true
        },
        {
          id: 'follower-3',
          handle: 'beatmaker',
          display_name: 'Beat Maker',
          avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Creating beats since 2010',
          role: 'ARTIST',
          followers_count: 156,
          is_following: false
        }
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!followers || followers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Followers Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          @{handle} doesn't have any followers yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <ProfileCard
          key={follower.id}
          id={follower.id}
          handle={follower.handle}
          displayName={follower.display_name}
          avatarUrl={follower.avatar_url}
          bio={follower.bio}
          role={follower.role}
          isFollowing={follower.is_following}
          followersCount={follower.followers_count}
        />
      ))}
    </div>
  );
}