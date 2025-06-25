import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Music, 
  ShoppingBag, 
  Info, 
  Award, 
  Heart, 
  Calendar,
  MapPin,
  ExternalLink,
  Play,
  Share2,
  Settings,
  Shield,
  Disc3,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileEditDrawer } from './ProfileEditDrawer';
import { FollowersTab } from '../community/FollowersTab';
import { FollowingTab } from '../community/FollowingTab';

interface Profile {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  workspace_id: string | null;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface Achievement {
  id: number;
  key: string;
  label: string;
  icon_url: string;
  granted_at: string;
}

export function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('music');
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', handle],
    queryFn: async (): Promise<Profile | null> => {
      if (!handle) return null;

      // In a real app, this would call the Supabase function
      // For demo, return mock data based on the handle
      const mockProfiles: Record<string, Profile> = {
        'artist': {
          id: 'profile-1',
          user_id: 'user-1',
          handle: 'artist',
          display_name: 'Demo Artist',
          bio: 'Electronic music producer and DJ based in Los Angeles. Creating vibes since 2015.',
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
          banner_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          role: 'ARTIST',
          workspace_id: 'workspace-1',
          created_at: '2023-01-15T00:00:00Z',
          followers_count: 1247,
          following_count: 83,
          is_following: false
        },
        'fan': {
          id: 'profile-2',
          user_id: 'user-2',
          handle: 'fan',
          display_name: 'Music Lover',
          bio: 'Passionate about discovering new music and supporting independent artists.',
          avatar_url: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600',
          banner_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          role: 'FAN',
          workspace_id: null,
          created_at: '2023-02-20T00:00:00Z',
          followers_count: 42,
          following_count: 156,
          is_following: true
        },
        'admin': {
          id: 'profile-3',
          user_id: 'user-3',
          handle: 'admin',
          display_name: 'Platform Admin',
          bio: 'Platform administrator. Here to help with any technical issues.',
          avatar_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
          banner_url: 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          role: 'ADMIN',
          workspace_id: null,
          created_at: '2023-01-10T00:00:00Z',
          followers_count: 128,
          following_count: 42,
          is_following: false
        }
      };

      // Return the mock profile or a default one if not found
      return mockProfiles[handle] || {
        id: `profile-${handle}`,
        user_id: `user-${handle}`,
        handle,
        display_name: handle.charAt(0).toUpperCase() + handle.slice(1),
        bio: 'No bio yet.',
        avatar_url: null,
        banner_url: null,
        role: 'FAN',
        workspace_id: null,
        created_at: new Date().toISOString(),
        followers_count: 0,
        following_count: 0,
        is_following: false
      };
    },
    enabled: !!handle,
  });

  // Set appropriate initial tab based on role
  useEffect(() => {
    if (profile) {
      if (profile.role === 'ARTIST') {
        setActiveTab('music');
      } else if (profile.role === 'FAN') {
        setActiveTab('collection');
      } else if (profile.role === 'ADMIN') {
        setActiveTab('about');
      }
    }
  }, [profile]);

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['achievements', profile?.id],
    queryFn: async (): Promise<Achievement[]> => {
      if (!profile?.id) return [];

      // Mock achievements data
      return [
        {
          id: 1,
          key: 'FIRST_UPLOAD',
          label: 'First Track Upload',
          icon_url: '/icons/achievements/upload.svg',
          granted_at: '2023-03-15T00:00:00Z'
        },
        {
          id: 2,
          key: 'FIRST_5K_STREAMS',
          label: '5K Streams',
          icon_url: '/icons/achievements/streams.svg',
          granted_at: '2023-04-20T00:00:00Z'
        },
        {
          id: 3,
          key: 'VERIFIED_ARTIST',
          label: 'Verified Artist',
          icon_url: '/icons/achievements/verified.svg',
          granted_at: '2023-05-10T00:00:00Z'
        }
      ];
    },
    enabled: !!profile?.id,
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) => {
      // In a real app, this would call Supabase to insert/delete a follow record
      console.log(`${isFollowing ? 'Unfollowing' : 'Following'} profile ${profileId}`);
      return { success: true };
    },
    onMutate: async ({ isFollowing }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ['profile', handle] });
      
      const previousProfile = queryClient.getQueryData<Profile>(['profile', handle]);
      
      if (previousProfile) {
        queryClient.setQueryData<Profile>(['profile', handle], {
          ...previousProfile,
          is_following: !isFollowing,
          followers_count: isFollowing 
            ? (previousProfile.followers_count || 0) - 1 
            : (previousProfile.followers_count || 0) + 1
        });
      }
      
      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      // Revert to the previous state if there's an error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', handle], context.previousProfile);
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['profile', handle] });
    },
  });

  const handleFollowToggle = () => {
    if (!profile) return;
    
    followMutation.mutate({
      profileId: profile.id,
      isFollowing: !!profile.is_following
    });
  };

  const isOwnProfile = user?.id === profile?.user_id;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Button as={Link} to="/">
          Return Home
        </Button>
      </div>
    );
  }

  // Helper function to get artist-specific tabs
  const getArtistTabs = () => [
    { id: 'music', label: 'Music', icon: Music, show: true },
    { id: 'releases', label: 'Releases', icon: Disc3, show: true },
    { id: 'merch', label: 'Merch', icon: ShoppingBag, show: true },
    { id: 'stats', label: 'Statistics', icon: BarChart3, show: true },
    { id: 'posts', label: 'Posts', icon: MessageSquare, show: true },
    { id: 'about', label: 'About', icon: Info, show: true },
    { id: 'achievements', label: 'Achievements', icon: Award, show: true },
    { id: 'followers', label: 'Followers', icon: Users, show: true },
    { id: 'following', label: 'Following', icon: Users, show: true },
  ];
  
  // Helper function to get fan-specific tabs
  const getFanTabs = () => [
    { id: 'collection', label: 'Collection', icon: Heart, show: true },
    { id: 'posts', label: 'Posts', icon: MessageSquare, show: true },
    { id: 'about', label: 'About', icon: Info, show: true },
    { id: 'achievements', label: 'Achievements', icon: Award, show: true },
    { id: 'followers', label: 'Followers', icon: Users, show: true },
    { id: 'following', label: 'Following', icon: Users, show: true },
  ];
  
  // Helper function to get admin-specific tabs
  const getAdminTabs = () => [
    { id: 'about', label: 'About', icon: Info, show: true },
    { id: 'activity', label: 'Activity', icon: Clock, show: true },
    { id: 'settings', label: 'Settings', icon: Settings, show: true },
    { id: 'followers', label: 'Followers', icon: Users, show: true },
    { id: 'following', label: 'Following', icon: Users, show: true },
  ];

  // Get tabs based on profile role
  const getTabs = () => {
    switch (profile.role) {
      case 'ARTIST':
        return getArtistTabs();
      case 'FAN':
        return getFanTabs();
      case 'ADMIN':
        return getAdminTabs();
      default:
        return getFanTabs(); // Default to fan tabs
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500">
          {profile.banner_url && (
            <img 
              src={profile.banner_url} 
              alt={`${profile.display_name || profile.handle}'s banner`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-6 -mt-16 relative z-10">
          <div className="flex items-end">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name || profile.handle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-500" />
                </div>
              )}
            </div>
            <div className="ml-4 mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.display_name || profile.handle}
                </h1>
                {profile.role === 'ARTIST' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                )}
                {profile.role === 'ADMIN' && (
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{profile.handle}
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {isOwnProfile ? (
              <Button onClick={() => setShowEditDrawer(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  variant={profile.is_following ? 'outline' : 'primary'}
                  onClick={handleFollowToggle}
                  loading={followMutation.isPending}
                >
                  {profile.is_following ? (
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
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {profile.role && (
                <div className="flex items-center gap-1">
                  {profile.role === 'ARTIST' ? (
                    <Music className="w-4 h-4" />
                  ) : profile.role === 'ADMIN' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  <span>{profile.role}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.role === 'ARTIST' ? 'Los Angeles, CA' : 'New York, NY'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.followers_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Followers
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.following_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Following
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {getTabs().filter(tab => tab.show).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Artist-specific tabs */}
        {profile.role === 'ARTIST' && (
          <>
            {/* Music Tab */}
            {activeTab === 'music' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden" hover>
                    <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center relative group">
                      <Play className="w-8 h-8 text-white" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="primary" size="sm" className="mx-1">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="mx-1 bg-white/20 text-white border-white/30 hover:bg-white/30">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Track Title {i}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.display_name || profile.handle}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          3:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 10)}K plays
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Releases Tab */}
            {activeTab === 'releases' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden" hover>
                    <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative group">
                      <Disc3 className="w-12 h-12 text-white" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="primary" size="sm" className="mx-1">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="mx-1 bg-white/20 text-white border-white/30 hover:bg-white/30">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {i === 1 ? 'Summer Vibes EP' : i === 2 ? 'Midnight Dreams' : 'Electric Nights'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.display_name || profile.handle}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {i === 1 ? '4 tracks' : i === 2 ? '1 track' : '1 track'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {i === 1 ? 'Jan 15, 2025' : i === 2 ? 'Mar 22, 2024' : 'Nov 10, 2023'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Merch Tab */}
            {activeTab === 'merch' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden" hover>
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img 
                        src={`https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2`} 
                        alt={`Merch item ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        T-Shirt Design {i}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Limited Edition
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-primary-600">
                          $29.99
                        </span>
                        <Button size="sm">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Total Streams</h4>
                      <Play className="w-4 h-4 text-primary-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">145.2K</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑ 12.5% from last month</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Followers</h4>
                      <Users className="w-4 h-4 text-primary-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑ 8.3% from last month</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Revenue</h4>
                      <DollarSign className="w-4 h-4 text-primary-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$3,247</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑ 15.3% from last month</p>
                  </div>
                </div>

                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Top Tracks</h4>
                <div className="space-y-2 mb-6">
                  {[
                    { title: 'Midnight Dreams', streams: 58420 },
                    { title: 'Electric Nights', streams: 32180 },
                    { title: 'Summer Vibes', streams: 28760 },
                    { title: 'Ocean Waves', streams: 15840 },
                    { title: 'City Lights', streams: 9940 }
                  ].map((track, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{idx + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{track.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{track.streams.toLocaleString()} streams</p>
                    </div>
                  ))}
                </div>

                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Audience Demographics</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">18-24</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">25-34</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">42%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">35-44</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">45+</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">8%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={profile.avatar_url || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600"} 
                          alt={profile.display_name || profile.handle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {profile.display_name || profile.handle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {i === 1 ? '2 hours ago' : i === 2 ? '2 days ago' : '1 week ago'}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-900 dark:text-white mb-4">
                      {i === 1 ? 
                        "Just finished recording a new track! Can't wait to share it with you all. The energy in the studio was incredible 🎵" :
                        i === 2 ? 
                        "Thanks to everyone who came out to the show last night! It was amazing to see so many familiar faces." :
                        "Working on something special for the upcoming release. Stay tuned!"
                      }
                    </p>

                    {i === 2 && (
                      <img
                        src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt="Concert"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 47 : i === 2 ? 156 : 23}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 12 : i === 2 ? 34 : 5}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 5 : i === 2 ? 28 : 2}</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Fan-specific tabs */}
        {profile.role === 'FAN' && (
          <>
            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Favorite Tracks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden" hover>
                      <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center relative group">
                        <Play className="w-8 h-8 text-white" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="primary" size="sm" className="mx-1">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="mx-1 bg-white/20 text-white border-white/30 hover:bg-white/30">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {i === 1 ? 'Midnight Dreams' : i === 2 ? 'Electric Nights' : 'Summer Vibes'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {i === 1 ? 'Luna Rodriguez' : i === 2 ? 'Luna Rodriguez' : 'Alex Chen'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            3:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Added {i === 1 ? '2 days ago' : i === 2 ? '1 week ago' : '3 weeks ago'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  Followed Artists
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      name: 'Luna Rodriguez',
                      handle: 'artist',
                      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600'
                    },
                    {
                      name: 'DJ Smith',
                      handle: 'djsmith',
                      avatar: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600'
                    },
                    {
                      name: 'Jane Vocals',
                      handle: 'vocalist_jane',
                      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600'
                    },
                    {
                      name: 'Indie Records',
                      handle: 'indie_label',
                      avatar: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'
                    }
                  ].map((artist, idx) => (
                    <Card key={idx} className="p-4" hover>
                      <div className="flex items-center gap-3">
                        <Link to={`/u/${artist.handle}`} className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={artist.avatar} 
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <Link 
                            to={`/u/${artist.handle}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {artist.name}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{artist.handle}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Fan Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={profile.avatar_url || "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600"} 
                          alt={profile.display_name || profile.handle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {profile.display_name || profile.handle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {i === 1 ? '3 days ago' : '1 week ago'}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-900 dark:text-white mb-4">
                      {i === 1 ? 
                        "Just discovered this amazing new artist! Check out Luna Rodriguez's latest EP, it's incredible! 🎧 #NewMusic #MusicDiscovery" :
                        "The concert last night was absolutely mind-blowing! Thanks @djsmith for an unforgettable experience. Can't wait for the next one! 🎵🔥"
                      }
                    </p>

                    {i === 2 && (
                      <img
                        src="https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt="Concert"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 28 : 76}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 5 : 12}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">{i === 1 ? 2 : 8}</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Admin-specific tabs */}
        {profile.role === 'ADMIN' && (
          <>
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { action: 'Updated system notification', time: '2 hours ago', type: 'update' },
                    { action: 'Moderated user post', time: '4 hours ago', type: 'moderation' },
                    { action: 'Approved artist verification', time: '1 day ago', type: 'approval' },
                    { action: 'Updated feature flag settings', time: '2 days ago', type: 'update' },
                    { action: 'System maintenance', time: '3 days ago', type: 'system' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'update' ? 'bg-blue-500' :
                          activity.type === 'moderation' ? 'bg-red-500' :
                          activity.type === 'approval' ? 'bg-green-500' :
                          activity.type === 'system' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Admin Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Admin Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Admin Access Level</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current access privileges</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded-full">
                        Platform Admin
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced security for your admin account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Admin Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get alerts for important system events</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Access Logs</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">View your account activity history</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Shared tabs across all user types */}
        {/* About Tab */}
        {activeTab === 'about' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About {profile.display_name || profile.handle}
            </h3>
            
            {profile.bio ? (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.bio}
                </p>
                
                {profile.role === 'ARTIST' && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">
                      Links
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {['Spotify', 'Apple Music', 'Instagram', 'YouTube'].map((platform) => (
                        <a 
                          key={platform}
                          href="#" 
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {platform}
                        </a>
                      ))}
                    </div>
                  </>
                )}

                {profile.role === 'FAN' && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">
                      Favorite Genres
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Electronic', 'Hip-Hop', 'Indie', 'Rock', 'Pop'].map((genre) => (
                        <span key={genre} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 text-sm rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {profile.role === 'ADMIN' && (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">
                      Responsibilities
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      <li>Platform moderation and content review</li>
                      <li>User support and issue resolution</li>
                      <li>System maintenance and monitoring</li>
                      <li>Policy enforcement and compliance</li>
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                This user hasn't added any bio information yet.
              </p>
            )}
          </Card>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h3>
            
            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {achievement.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned {new Date(achievement.granted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Custom achievements based on role */}
                {profile.role === 'ARTIST' && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        First Release
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned 6 months ago
                      </p>
                    </div>
                  </motion.div>
                )}

                {profile.role === 'FAN' && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Super Fan
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned 3 months ago
                      </p>
                    </div>
                  </motion.div>
                )}

                {profile.role === 'ADMIN' && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Platform Expert
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned 1 year ago
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No achievements yet. Keep using the platform to earn badges!
              </p>
            )}
          </Card>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <FollowersTab profileId={profile.id} handle={profile.handle} />
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <FollowingTab profileId={profile.id} handle={profile.handle} />
        )}
      </div>

      {/* Edit Profile Drawer */}
      <ProfileEditDrawer 
        isOpen={showEditDrawer} 
        onClose={() => setShowEditDrawer(false)} 
        profile={profile}
      />
    </div>
  );
}