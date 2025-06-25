import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, Video, Plus, Users, Calendar, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Link } from 'react-router-dom';

const mockPosts = [
  {
    id: '1',
    author: 'Luna Rodriguez',
    authorHandle: 'artist',
    content: 'Just finished recording a new track! Can\'t wait to share it with you all. The energy in the studio was incredible 🎵',
    timestamp: '2 hours ago',
    likes: 47,
    comments: 12,
    shares: 5,
    image: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '2',
    author: 'TruIndee Team',
    authorHandle: 'truindee',
    content: 'Announcing our new NFT marketplace! Artists can now mint and sell exclusive digital collectibles directly through the platform.',
    timestamp: '4 hours ago',
    likes: 89,
    comments: 23,
    shares: 15,
  },
  {
    id: '3',
    author: 'Alex Chen',
    authorHandle: 'producer_alex',
    content: 'Huge shoutout to everyone who attended the virtual concert last night! You made it special ❤️',
    timestamp: '1 day ago',
    likes: 156,
    comments: 34,
    shares: 28,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const upcomingEvents = [
  { name: 'Live Q&A Session', date: 'Today, 8 PM', attendees: 234 },
  { name: 'Virtual Concert', date: 'Tomorrow, 7 PM', attendees: 1567 },
  { name: 'Producer Masterclass', date: 'Friday, 3 PM', attendees: 89 },
];

interface SuggestedProfile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  followers_count: number;
  is_following: boolean;
}

export function Community() {
  const [newPost, setNewPost] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // Fetch suggested profiles
  const { data: suggestedProfiles } = useQuery({
    queryKey: ['suggested-profiles'],
    queryFn: async (): Promise<SuggestedProfile[]> => {
      // In a real app, this would call Supabase to get suggested profiles
      // For demo, return mock data
      return [
        {
          id: 'profile-1',
          handle: 'artist',
          display_name: 'Demo Artist',
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Electronic music producer and DJ based in Los Angeles',
          role: 'ARTIST',
          followers_count: 1247,
          is_following: false
        },
        {
          id: 'profile-2',
          handle: 'vocalist_jane',
          display_name: 'Jane Vocals',
          avatar_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Vocalist and songwriter',
          role: 'ARTIST',
          followers_count: 892,
          is_following: false
        },
        {
          id: 'profile-3',
          handle: 'producer_mike',
          display_name: 'Producer Mike',
          avatar_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
          bio: 'Electronic music producer and DJ',
          role: 'ARTIST',
          followers_count: 342,
          is_following: false
        }
      ];
    },
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with fans and fellow artists
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Go Live
          </Button>
          <Button onClick={() => setShowPostModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Post */}
          <Card className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Input
                placeholder="What's on your mind?"
                className="flex-1"
                onClick={() => setShowPostModal(true)}
              />
              <Button size="sm">Post</Button>
            </div>
          </Card>

          {/* Posts */}
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Link to={`/u/${post.authorHandle}`} className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/u/${post.authorHandle}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                      {post.author}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.timestamp}
                    </p>
                  </div>
                </div>

                <p className="text-gray-900 dark:text-white mb-4">
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{post.shares}</span>
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Profiles */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Suggested Profiles
            </h3>
            <div className="space-y-4">
              {suggestedProfiles?.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  id={profile.id}
                  handle={profile.handle}
                  displayName={profile.display_name}
                  avatarUrl={profile.avatar_url}
                  bio={profile.bio}
                  role={profile.role}
                  isFollowing={profile.is_following}
                  followersCount={profile.followers_count}
                  size="sm"
                />
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                as={Link}
                to="/community/discover"
              >
                <User className="w-4 h-4 mr-2" />
                Discover More
              </Button>
            </div>
          </Card>

          {/* Community Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Community Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Members</span>
                <span className="font-medium text-gray-900 dark:text-white">12.4K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Today</span>
                <span className="font-medium text-gray-900 dark:text-white">2.1K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Posts This Week</span>
                <span className="font-medium text-gray-900 dark:text-white">847</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {event.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {event.attendees} attending
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* New Post Modal */}
      {showPostModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPostModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Post
            </h3>
            <div className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button>Post</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}