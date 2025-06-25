import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Heart,
  ChevronLeft,
  ChevronRight, 
  Music, 
  Disc3, 
  User,
  Search,
  Plus,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  Bot
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SubscriptionBanner } from '../components/ui/SubscriptionBanner';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  type: 'album' | 'single' | 'playlist';
}

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  coverUrl: string;
  color: string;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const getUserRole = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    return user?.role || 'artist';
  };

  const isFan = getUserRole() === 'fan';

  // Toggle play/pause
  const togglePlay = (id: string) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(id);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(itemId => itemId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Hero slider data
  const heroSlides: HeroSlide[] = [
    {
      id: 'hero1',
      title: 'R&B NOW',
      subtitle: 'The best new R&B tracks',
      artist: 'Various Artists',
      coverUrl: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      id: 'hero2',
      title: 'Summer Hits',
      subtitle: 'Hot tracks for the season',
      artist: 'TruIndee Editors',
      coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'hero3',
      title: 'Chill Mix',
      subtitle: 'Relax with these smooth tracks',
      artist: 'TruIndee Editors',
      coverUrl: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  // Handle slide navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Mock data for fan dashboard
  const recentReleases: Album[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Rodriguez',
      coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '2',
      title: 'Electric Nights',
      artist: 'Luna Rodriguez',
      coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'single'
    },
    {
      id: '3',
      title: 'Summer Vibes',
      artist: 'DJ Smith',
      coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '4',
      title: 'Acoustic Sessions',
      artist: 'Sarah James',
      coverUrl: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '5',
      title: 'Urban Beats',
      artist: 'Mike Beats',
      coverUrl: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '6',
      title: 'Neon City',
      artist: 'Electro Collective',
      coverUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    }
  ];

  const trendingNow: Album[] = [
    {
      id: '7',
      title: 'Rhythm & Soul',
      artist: 'R&B Queens',
      coverUrl: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '8',
      title: 'Beats & Pieces',
      artist: 'The Producers',
      coverUrl: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '9',
      title: 'Midnight Jazz',
      artist: 'Smooth Quartet',
      coverUrl: 'https://images.pexels.com/photos/4571219/pexels-photo-4571219.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '10',
      title: 'Electronic Dreams',
      artist: 'Synth Masters',
      coverUrl: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '11',
      title: 'Hip Hop Essentials',
      artist: 'Urban Legends',
      coverUrl: 'https://images.pexels.com/photos/2479312/pexels-photo-2479312.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '12',
      title: 'Rock Anthems',
      artist: 'Guitar Heroes',
      coverUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    }
  ];

  const newReleases: Album[] = [
    {
      id: '13',
      title: 'Future Sounds',
      artist: 'Tomorrow\'s Beat',
      coverUrl: 'https://images.pexels.com/photos/1293551/pexels-photo-1293551.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '14',
      title: 'Heartbeats',
      artist: 'Pulse',
      coverUrl: 'https://images.pexels.com/photos/2746823/pexels-photo-2746823.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'single'
    },
    {
      id: '15',
      title: 'Synthwave Dreams',
      artist: 'Retro Wave',
      coverUrl: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '16',
      title: 'Acoustic Vibes',
      artist: 'Unplugged',
      coverUrl: 'https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '17',
      title: 'Neon Lights',
      artist: 'City Glow',
      coverUrl: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    },
    {
      id: '18',
      title: 'Summer Beats',
      artist: 'Beach Vibes',
      coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
      type: 'album'
    }
  ];

  // Featured playlists
  const featuredPlaylists = [
    {
      id: 'p1',
      title: 'Chill Mix',
      coverUrl: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-teal-500 to-blue-500'
    },
    {
      id: 'p2',
      title: 'New Music',
      coverUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'p3',
      title: 'Friends Mix',
      coverUrl: 'https://images.pexels.com/photos/2479312/pexels-photo-2479312.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'p4',
      title: 'Heavy Rotation',
      coverUrl: 'https://images.pexels.com/photos/1293551/pexels-photo-1293551.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'p5',
      title: 'Favorites',
      coverUrl: 'https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // If user is an artist, show the original dashboard
  if (!isFan) {
    // Original artist dashboard code would go here
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.user_metadata?.full_name || 'Artist'}! Here's what's happening with your music.
            </p>
          </div>
          <Button as={Link} to="/catalog">
            <Plus className="w-4 h-4 mr-2" />
            Upload Track
          </Button>
        </motion.div>

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Total Streams', value: '12.8K', change: '+8.2%', icon: Play, color: 'text-blue-600' },
            { name: 'Total Revenue', value: '$2,847', change: '+5.3%', icon: DollarSign, color: 'text-green-600' },
            { name: 'Active Listeners', value: '3.2K', change: '+12.5%', icon: Users, color: 'text-emerald-600' },
            { name: 'New Followers', value: '128', change: '+3.2%', icon: Heart, color: 'text-purple-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Releases */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Releases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Midnight Dreams',
                date: 'Jun 12, 2025',
                streams: '4.2K',
                cover: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600'
              },
              {
                title: 'Electric Nights',
                date: 'May 18, 2025',
                streams: '3.8K',
                cover: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600'
              },
              {
                title: 'Summer Vibes EP',
                date: 'Apr 22, 2025',
                streams: '8.9K',
                cover: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600'
              },
            ].map((release, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={release.cover}
                  alt={release.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{release.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{release.date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{release.streams} streams</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Task List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Next Steps
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Complete profile setup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your artist profile is ready for fans</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Schedule your next release</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan your promotion strategy</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Try your AI team</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">PAM can help with career planning</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Fan dashboard
  return (
    <div className="space-y-8 pb-8">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Home</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.user_metadata?.full_name || 'Fan'}!
          </p>
        </motion.div>
        <div className="w-full md:w-64">
          <Input
            placeholder="Search music..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Hero Slider */}
      <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentSlide === index ? 1 : 0,
              zIndex: currentSlide === index ? 10 : 0 
            }}
            transition={{ duration: 0.7 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-90`}></div>
            <img 
              src={slide.coverUrl} 
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">{slide.title}</h2>
                <p className="text-xl text-white/90 mb-4">{slide.subtitle}</p>
                <p className="text-sm text-white/80">Curated by {slide.artist}</p>
                
                <div className="mt-6 flex gap-4">
                  <Button className="bg-white text-gray-900 hover:bg-white/90">
                    <Play className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/20">
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Library
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
        
        {/* Navigation Arrows */}
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Recent Releases Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Releases
          </h2>
          <Button variant="ghost" size="sm" as={Link} to="/store">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentReleases.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => togglePlay(album.id)}
                      className="rounded-full p-3 bg-white/90 hover:bg-white text-primary-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {currentlyPlaying === album.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trending Now Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Trending Now
          </h2>
          <Button variant="ghost" size="sm" as={Link} to="/store">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingNow.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => togglePlay(album.id)}
                      className="rounded-full p-3 bg-white/90 hover:bg-white text-primary-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {currentlyPlaying === album.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Releases Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Releases
          </h2>
          <Button variant="ghost" size="sm" as={Link} to="/store">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newReleases.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => togglePlay(album.id)}
                      className="rounded-full p-3 bg-white/90 hover:bg-white text-primary-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {currentlyPlaying === album.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Playlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Featured Playlists
          </h2>
          <Button variant="ghost" size="sm" as={Link} to="/library">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredPlaylists.map((playlist) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br ${playlist.color}">
                  <div className={`w-full h-full bg-gradient-to-br ${playlist.color} p-4 flex items-end`}>
                    <h3 className="font-bold text-white text-xl z-10">
                      {playlist.title}
                    </h3>
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      className="absolute bottom-0 right-0 w-3/4 h-3/4 object-cover opacity-50 transform rotate-12 translate-x-4 translate-y-4"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => togglePlay(playlist.id)}
                      className="rounded-full p-3 bg-white/90 hover:bg-white text-primary-600 shadow-lg"
                    >
                      {currentlyPlaying === playlist.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recently Played
          </h2>
          <Button variant="ghost" size="sm" as={Link} to="/library">
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentReleases.slice(0, 6).reverse().map((album) => (
            <motion.div
              key={`recent-${album.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => togglePlay(album.id)}
                      className="rounded-full p-3 bg-white/90 hover:bg-white text-primary-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {currentlyPlaying === album.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;