import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProfileCard } from '../profile/ProfileCard';

interface FollowingTabProps {
  profileId: string;
  handle: string;
}

interface Following {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  followers_count: number;
  is_following: boolean;
}

export function FollowingTab({ profileId, handle }: FollowingTabProps) {
  // Fetch following
  const { data: following, isLoading } = useQuery({
    queryKey: ['following', profileId],
    queryFn: async (): Promise<Following[]> => {
      // In a real app, this would call Supabase to get following
      // For demo, return mock data
      return [
        {
          id: 'following-1',
          handle: 'dj_smith',
          display_name: 'DJ Smith',
          avatar_url: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'DJ and producer specializing in house music',
          role: 'ARTIST',
          followers_count: 1247,
          is_following: true
        },
        {
          id: 'following-2',
          handle: 'vocalist_jane',
          display_name: 'Jane Vocals',
          avatar_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Vocalist and songwriter',
          role: 'ARTIST',
          followers_count: 892,
          is_following: true
        },
        {
          id: 'following-3',
          handle: 'indie_label',
          display_name: 'Indie Records',
          avatar_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Independent record label supporting emerging artists',
          role: 'ARTIST',
          followers_count: 3456,
          is_following: true
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

  if (!following || following.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Not Following Anyone
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          @{handle} isn't following anyone yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {following.map((follow) => (
        <ProfileCard
          key={follow.id}
          id={follow.id}
          handle={follow.handle}
          displayName={follow.display_name}
          avatarUrl={follow.avatar_url}
          bio={follow.bio}
          role={follow.role}
          isFollowing={follow.is_following}
          followersCount={follow.followers_count}
        />
      ))}
    </div>
  );
}