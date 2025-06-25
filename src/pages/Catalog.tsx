import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, Download, MoreHorizontal, Filter, Grid, List } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useAuthStore } from '../stores/authStore';
import { GenreSelect } from '../components/forms/GenreSelect';
import { MoodSelect } from '../components/forms/MoodSelect';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

const mockTracks = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Luna Rodriguez',
    duration: '3:42',
    format: 'WAV',
    size: '42.3 MB',
    uploadDate: '2024-01-15',
    status: 'Ready',
    isrc: 'USRC17607839',
    metadata: {
      genre: ['Electronic', 'Ambient'],
      mood: ['Dreamy', 'Atmospheric'],
      bpm: 120,
      key: 'C minor',
      edu_safe: true
    }
  },
  {
    id: '2',
    title: 'Electric Nights',
    artist: 'Luna Rodriguez',
    duration: '4:18',
    format: 'MP3',
    size: '8.9 MB',
    uploadDate: '2024-01-14',
    status: 'Processing',
    isrc: null,
    metadata: {
      genre: ['Electronic', 'Dance'],
      mood: ['Energetic', 'Uplifting'],
      bpm: 128,
      key: 'A major'
    }
  },
  {
    id: '3',
    title: 'Summer Vibes',
    artist: 'Luna Rodriguez',
    duration: '3:56',
    format: 'WAV',
    size: '38.7 MB',
    uploadDate: '2024-01-12',
    status: 'Ready',
    isrc: 'USRC17607840',
    metadata: {
      genre: ['Pop', 'Indie'],
      mood: ['Happy', 'Relaxed'],
      bpm: 110,
      key: 'G major',
      edu_safe: true
    }
  },
];

const filterOptions = [
  { id: 'all', label: 'All Tracks', count: 142 },
  { id: 'pending', label: 'Pending', count: 3 },
  { id: 'published', label: 'Published', count: 128 },
  { id: 'archived', label: 'Archived', count: 11 },
];

export function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { user } = useAuthStore();
  const { isFeatureEnabled } = useFeatureFlags();
  const gridViewEnabled = isFeatureEnabled('GRID_VIEW');

  // Set initial view mode based on feature flag
  useEffect(() => {
    setViewMode(gridViewEnabled ? 'grid' : 'list');
  }, [gridViewEnabled]);

  const getUserRole = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    return user?.role || 'artist';
  };

  const canUpload = getUserRole() !== 'fan';

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Catalog' }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {canUpload ? 'Manage your music library and track metadata' : 'Discover and explore music'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {gridViewEnabled && (
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
          )}
          {canUpload && (
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Track
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tracks by title, artist, genre, mood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
                <span className="ml-1 opacity-75">({filter.count})</span>
              </button>
            ))}
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <GenreSelect 
              value={selectedGenres}
              onChange={setSelectedGenres}
              multiple
            />
            <MoodSelect
              value={selectedMoods}
              onChange={setSelectedMoods}
              multiple
            />
          </div>
        )}
      </Card>

      {/* Tracks Display */}
      {viewMode === 'list' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Metadata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ISRC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockTracks.map((track, index) => (
                  <motion.tr
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {track.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {track.artist} • {track.duration}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {track.metadata.genre?.map((genre) => (
                            <span key={genre} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {track.metadata.bpm} BPM • {track.metadata.key}
                          {track.metadata.edu_safe && (
                            <span className="ml-2 px-1 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
                              EDU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {track.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {track.isrc || (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        track.status === 'Ready'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {track.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                        {canUpload && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden" hover>
                <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {track.artist}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {track.metadata.genre?.slice(0, 2).map((genre) => (
                      <span key={genre} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {track.duration}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.status === 'Ready'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {track.status}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpload(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload New Track
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop your audio file here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Supports WAV, MP3, FLAC up to 100MB
                </p>
              </div>
              <Input label="Track Title" placeholder="Enter track title" />
              <Input label="Artist" placeholder="Enter artist name" />
              
              <div className="space-y-4">
                <GenreSelect 
                  label="Genre" 
                  multiple 
                  placeholder="Select genres..."
                />
                
                <MoodSelect 
                  label="Mood" 
                  multiple 
                  placeholder="Select moods..."
                />
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button>Upload</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}