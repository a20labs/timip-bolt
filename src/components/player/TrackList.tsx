import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  MoreHorizontal, 
  ShoppingCart,
  CheckCircle,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';
import { usePlayer } from './PlayerContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl: string;
  isPurchased: boolean;
}

interface TrackListProps {
  tracks: Track[];
  showHeader?: boolean;
  showAlbum?: boolean;
  compact?: boolean;
  className?: string;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  showHeader = true,
  showAlbum = true,
  compact = false,
  className = ''
}) => {
  const { currentTrackId, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (trackId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentTrackId === trackId) {
      togglePlayPause();
    } else {
      playTrack(trackId);
    }
  };

  const handlePurchase = (trackId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Add track ${trackId} to cart`);
    // In a real app, this would add the track to the cart
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="w-14 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                {showAlbum && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Album
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4 inline-block" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
          )}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tracks.map((track, index) => (
              <motion.tr
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() => playTrack(track.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {(hoveredTrack === track.id || currentTrackId === track.id) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={(e) => handlePlayPause(track.id, e)}
                      >
                        {currentTrackId === track.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {track.title}
                        {track.isPurchased && (
                          <span className="ml-2 inline-flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </span>
                        )}
                      </p>
                      <Link
                        to={`/u/${track.artist.toLowerCase().replace(/\s+/g, '_')}`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {track.artist}
                      </Link>
                    </div>
                  </div>
                </td>
                {showAlbum && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {track.album || '-'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-right">
                  {formatDuration(track.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    {track.isPurchased ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={(e) => handlePurchase(track.id, e)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TrackList;