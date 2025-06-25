import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Music, 
  Disc3, 
  Play, 
  Pause, 
  Heart, 
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface StoreItem {
  id: string;
  title: string;
  artist: string;
  type: 'track' | 'release';
  coverUrl: string;
  price: number;
  releaseDate: string;
  workspaceId: string;
}

interface Artist {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export function Store() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const { user } = useAuthStore();

  // Fetch store content
  const { data: storeItems, isLoading } = useQuery({
    queryKey: ['store-content', activeFilter],
    queryFn: async (): Promise<StoreItem[]> => {
      // In a real app, this would call the get_store_content function
      // For demo, return mock data
      return [
        {
          id: '1',
          title: 'Midnight Dreams',
          artist: 'Luna Rodriguez',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 1.99,
          releaseDate: '2024-05-15T00:00:00Z',
          workspaceId: 'demo-workspace'
        },
        {
          id: '2',
          title: 'Electric Nights',
          artist: 'Luna Rodriguez',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 1.99,
          releaseDate: '2024-05-10T00:00:00Z',
          workspaceId: 'demo-workspace'
        },
        {
          id: '3',
          title: 'Summer Vibes EP',
          artist: 'Luna Rodriguez',
          type: 'release',
          coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 7.99,
          releaseDate: '2024-05-01T00:00:00Z',
          workspaceId: 'demo-workspace'
        },
        {
          id: '4',
          title: 'Neon City',
          artist: 'DJ Smith',
          type: 'track',
          coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 1.99,
          releaseDate: '2024-04-20T00:00:00Z',
          workspaceId: 'demo-workspace-2'
        },
        {
          id: '5',
          title: 'Urban Beats Collection',
          artist: 'DJ Smith',
          type: 'release',
          coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 9.99,
          releaseDate: '2024-04-15T00:00:00Z',
          workspaceId: 'demo-workspace-2'
        },
        {
          id: '6',
          title: 'Acoustic Sessions',
          artist: 'Sarah James',
          type: 'release',
          coverUrl: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600',
          price: 6.99,
          releaseDate: '2024-04-05T00:00:00Z',
          workspaceId: 'demo-workspace-3'
        }
      ];
    },
  });

  // Fetch featured artists
  const { data: featuredArtists } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async (): Promise<Artist[]> => {
      // In a real app, this would call Supabase to get featured artists
      // For demo, return mock data
      return [
        {
          handle: 'artist',
          displayName: 'Luna Rodriguez',
          avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          handle: 'dj_smith',
          displayName: 'DJ Smith',
          avatarUrl: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          handle: 'sarah_james',
          displayName: 'Sarah James',
          avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ];
    },
  });

  // Filter store items based on search term and filters
  const filteredItems = storeItems?.filter(item => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Content type filter
    const matchesType = activeFilter === 'all' || 
      (activeFilter === 'tracks' && item.type === 'track') ||
      (activeFilter === 'releases' && item.type === 'release');
    
    // Price range filter
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesSearch && matchesType && matchesPrice;
  }) || [];

  // Handle play/pause
  const togglePlay = (id: string) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(id);
    }
  };

  // Handle add to cart
  const addToCart = (id: string) => {
    if (!cart.includes(id)) {
      setCart([...cart, id]);
    }
  };

  // Handle remove from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter(itemId => itemId !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and purchase music from all artists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Button variant="outline" className="relative">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title, artist, or genre..."
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
                Price Range
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {['Electronic', 'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      if (selectedGenres.includes(genre)) {
                        setSelectedGenres(selectedGenres.filter(g => g !== genre));
                      } else {
                        setSelectedGenres([...selectedGenres, genre]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Featured Artists */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Featured Artists
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {featuredArtists?.map((artist) => (
            <Link
              key={artist.handle}
              to={`/u/${artist.handle}`}
              className="flex-shrink-0"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
                {artist.avatarUrl ? (
                  <img 
                    src={artist.avatarUrl} 
                    alt={artist.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-500" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-center text-gray-900 dark:text-white">
                {artist.displayName}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Store Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      onClick={() => togglePlay(item.id)}
                      className="rounded-full p-3"
                    >
                      {currentlyPlaying === item.id ? (
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
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full p-2"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      {cart.includes(item.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(item.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No items found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </Card>
      )}

      {/* New Releases Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          New Releases
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeItems?.filter(item => item.type === 'release')
            .slice(0, 4)
            .map((item) => (
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
                        onClick={() => togglePlay(item.id)}
                        className="rounded-full p-3"
                      >
                        {currentlyPlaying === item.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                        Release
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
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-2"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {cart.includes(item.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Top Tracks Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Top Tracks
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Released
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {storeItems?.filter(item => item.type === 'track')
                  .slice(0, 5)
                  .map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={track.coverUrl} 
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {track.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/u/${track.artist.toLowerCase().replace(/\s+/g, '_')}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {track.artist}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          ${track.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(track.releaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlay(track.id)}
                          >
                            {currentlyPlaying === track.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          {cart.includes(track.id) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(track.id)}
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(track.id)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Store;