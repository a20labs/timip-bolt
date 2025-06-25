import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  List,
  Grid,
  Search,
  Filter,
  Clock,
  Heart,
  Download,
  Share2,
  Disc3,
  ChevronDown,
  ChevronUp,
  ShoppingBag
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

interface PurchasedItem {
  id: string;
  title: string;
  artist: string;
  type: 'track' | 'release';
  coverUrl: string;
  purchaseDate: string;
  orderId: string;
  audioUrl?: string; // URL to the full audio file
}

interface PlayingTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

export function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<PlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuthStore();

  // Fetch purchased content
  const { data: purchasedItems, isLoading } = useQuery({
    queryKey: ['user-library', user?.id],
    queryFn: async (): Promise<PurchasedItem[]> => {
      // In a real app, this would call the get_user_purchases function
      // For demo, return mock data
      return [
        {
          id: '1',
          title: 'Midnight Dreams',
          artist: 'Luna Rodriguez',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
          purchaseDate: '2024-05-20T00:00:00Z',
          orderId: 'order-1',
          audioUrl: '/audio/sample-track-1.mp3'
        },
        {
          id: '2',
          title: 'Electric Nights',
          artist: 'Luna Rodriguez',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
          purchaseDate: '2024-05-20T00:00:00Z',
          orderId: 'order-1',
          audioUrl: '/audio/sample-track-2.mp3'
        },
        {
          id: '3',
          title: 'Summer Vibes EP',
          artist: 'Luna Rodriguez',
          type: 'release',
          coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
          purchaseDate: '2024-05-15T00:00:00Z',
          orderId: 'order-2',
          audioUrl: '/audio/sample-track-3.mp3'
        },
        {
          id: '4',
          title: 'Neon City',
          artist: 'DJ Smith',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600',
          purchaseDate: '2024-05-10T00:00:00Z',
          orderId: 'order-3',
          audioUrl: '/audio/sample-track-4.mp3'
        },
        {
          id: '5',
          title: 'Acoustic Sessions',
          artist: 'Sarah James',
          type: 'release',
          coverUrl: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600',
          purchaseDate: '2024-04-25T00:00:00Z',
          orderId: 'order-4',
          audioUrl: '/audio/sample-track-5.mp3'
        }
      ];
    },
    enabled: !!user?.id,
  });

  // Filter purchased items based on search term and filters
  const filteredItems = purchasedItems?.filter(item => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Content type filter
    const matchesType = activeFilter === 'all' || 
      (activeFilter === 'tracks' && item.type === 'track') ||
      (activeFilter === 'releases' && item.type === 'release');
    
    return matchesSearch && matchesType;
  }) || [];

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      // Set volume
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Play/pause
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, isMuted, currentlyPlaying]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next track logic could go here
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Play a track
  const playTrack = (item: PurchasedItem) => {
    if (currentlyPlaying?.id === item.id) {
      // Toggle play/pause if it's the same track
      setIsPlaying(!isPlaying);
    } else {
      // Play new track
      setCurrentlyPlaying({
        id: item.id,
        title: item.title,
        artist: item.artist,
        coverUrl: item.coverUrl,
        audioUrl: item.audioUrl || ''
      });
      setIsPlaying(true);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(itemId => itemId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your purchased music collection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'tracks', 'releases'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="recent">Recently Purchased</option>
                <option value="title">Title (A-Z)</option>
                <option value="artist">Artist (A-Z)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Date
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Now Playing Bar (fixed at bottom) */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={currentlyPlaying.coverUrl} 
                alt={currentlyPlaying.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {currentlyPlaying.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentlyPlaying.artist}
              </p>
            </div>
            <div className="flex-1 hidden md:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2"
                onClick={() => {
                  // Previous track logic would go here
                }}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                className="rounded-full p-3"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2"
                onClick={() => {
                  // Next track logic would go here
                }}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 hidden md:block"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audio Element (hidden) */}
      <audio 
        ref={audioRef}
        src={currentlyPlaying?.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Library Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden" hover>
                  <div className="relative">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={() => playTrack(item)}
                        className="rounded-full p-3"
                      >
                        {isPlaying && currentlyPlaying?.id === item.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'track'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                      }`}>
                        {item.type === 'track' ? 'Track' : 'Release'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <Link 
                      to={`/u/${item.artist.toLowerCase().replace(/\s+/g, '_')}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 truncate block"
                    >
                      {item.artist}
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Purchased {new Date(item.purchaseDate).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-2"
                          onClick={() => toggleFavorite(item.id)}
                        >
                          <Heart className={`w-4 h-4 ${
                            favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''
                          }`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-2"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden mb-20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Purchased
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={item.coverUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/u/${item.artist.toLowerCase().replace(/\s+/g, '_')}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {item.artist}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'track'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                        }`}>
                          {item.type === 'track' ? 'Track' : 'Release'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playTrack(item)}
                          >
                            {isPlaying && currentlyPlaying?.id === item.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <Heart className={`w-4 h-4 ${
                              favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''
                            }`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <Card className="p-8 text-center">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Your library is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Purchase music from the store to start building your collection.
          </p>
          <Button as={Link} to="/store">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse Store
          </Button>
        </Card>
      )}
    </div>
  );
}

export default Library;