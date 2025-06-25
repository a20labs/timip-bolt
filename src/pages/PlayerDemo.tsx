import React, { useState } from 'react';
import { Music, Play, List, Grid, Filter, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import MusicPlayer from '../components/player/MusicPlayer';
import TrackList from '../components/player/TrackList';
import { PlayerProvider } from '../components/player/PlayerContext';
import NowPlaying from '../components/player/NowPlaying';

// Mock data for track list
const mockTracks = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Luna Rodriguez',
    album: 'Summer Vibes EP',
    duration: 222,
    coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
    isPurchased: true
  },
  {
    id: '2',
    title: 'Electric Nights',
    artist: 'Luna Rodriguez',
    album: 'Summer Vibes EP',
    duration: 258,
    coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
    isPurchased: false
  },
  {
    id: '3',
    title: 'Chill Waves',
    artist: 'Ocean Breeze',
    album: 'Coastal Rhythms',
    duration: 198,
    coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600',
    isPurchased: false
  },
  {
    id: '4',
    title: 'Ambient Reflections',
    artist: 'Sarah James',
    album: 'Acoustic Sessions',
    duration: 172,
    coverUrl: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600',
    isPurchased: true
  }
];

export function PlayerDemo() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>('1');
  const [showPlayer, setShowPlayer] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tracks based on search term
  const filteredTracks = mockTracks.filter(
    track => track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (track.album && track.album.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PlayerProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Music Player</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stream and manage your music
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded ${viewType === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded ${viewType === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <Input
            placeholder="Search tracks, artists, or albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Track List */}
        <TrackList
          tracks={filteredTracks}
          showHeader={true}
          showAlbum={true}
        />

        {/* Player Demo Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Player Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Select a Track
                </h3>
                
                <div className="space-y-2">
                  {mockTracks.map(track => (
                    <button
                      key={track.id}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedTrackId === track.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedTrackId(track.id)}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                      {track.isPurchased && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Player
                </h3>
                
                {selectedTrackId ? (
                  <MusicPlayer
                    trackId={selectedTrackId}
                    showFullPlayer={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Music className="w-12 h-12 text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Select a track to play
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => {
                      if (selectedTrackId) {
                        setShowPlayer(true);
                      }
                    }}
                    disabled={!selectedTrackId}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Show Now Playing Bar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Spacing for the fixed player */}
        {showPlayer && (
          <div className="h-24" />
        )}
      </div>
      
      {/* Now Playing Bar (fixed at bottom) */}
      {showPlayer && selectedTrackId && (
        <NowPlaying trackId={selectedTrackId} autoplay={true} />
      )}
    </PlayerProvider>
  );
}

export default PlayerDemo;