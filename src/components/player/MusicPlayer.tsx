import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface MusicPlayerProps {
  trackId?: string;
  className?: string;
  onClose?: () => void;
  showFullPlayer?: boolean;
  autoplay?: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  isPurchased: boolean;
  isInLibrary: boolean;
  isLiked: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  trackId,
  className = '',
  onClose,
  showFullPlayer = false,
  autoplay = false
}) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(showFullPlayer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuthStore();
  
  // Load track data
  useEffect(() => {
    if (trackId) {
      fetchTrack(trackId);
    }
  }, [trackId]);

  // Handle autoplay when track changes
  useEffect(() => {
    if (track && autoplay && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [track, autoplay]);

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
      // Could implement auto-next track here
    };

    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load audio file');
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setError(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    // Set initial volume
    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback error:', error);
          setIsPlaying(false);
          setError('Playback failed: ' + error.message);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Update volume/mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const fetchTrack = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch the track from Supabase
      // For demo, we'll use mock data
      const mockTrack = getMockTrack(id);
      
      // Check if user has purchased this track
      if (user) {
        mockTrack.isPurchased = await hasUserPurchased(id);
        mockTrack.isInLibrary = await isInUserLibrary(id);
        mockTrack.isLiked = await isTrackLiked(id);
      }
      
      setTrack(mockTrack);
      setIsLiked(mockTrack.isLiked);
      
      // In a real app, log play to analytics
      if (user) {
        logPlayEvent(id);
      }
    } catch (err) {
      console.error('Error fetching track:', err);
      setError('Failed to load track');
    } finally {
      setLoading(false);
    }
  };

  const getMockTrack = (id: string): Track => {
    // Using publicly accessible audio files from archive.org and other reliable sources
    const tracks: Record<string, Track> = {
      '1': {
        id: '1',
        title: 'Midnight Dreams',
        artist: 'Luna Rodriguez',
        album: 'Summer Vibes EP',
        coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
        audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
        duration: 222,
        isPurchased: false,
        isInLibrary: false,
        isLiked: false
      },
      '2': {
        id: '2',
        title: 'Electric Nights',
        artist: 'Luna Rodriguez',
        album: 'Summer Vibes EP',
        coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
        audioUrl: 'https://ia902606.us.archive.org/35/items/shortmp3file/SampleAudio_0.4mb_mp3.mp3',
        duration: 258,
        isPurchased: false,
        isInLibrary: false,
        isLiked: false
      },
      '3': {
        id: '3',
        title: 'Chill Waves',
        artist: 'Ocean Breeze',
        album: 'Coastal Rhythms',
        coverUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600',
        audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
        duration: 198,
        isPurchased: false,
        isInLibrary: false,
        isLiked: false
      },
      '4': {
        id: '4',
        title: 'Ambient Reflections',
        artist: 'Sarah James',
        album: 'Acoustic Sessions',
        coverUrl: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600',
        audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
        duration: 172,
        isPurchased: false,
        isInLibrary: false,
        isLiked: false
      }
    };
    
    return tracks[id] || tracks['1']; // Default to track 1 if ID not found
  };

  const hasUserPurchased = async (trackId: string): Promise<boolean> => {
    // In a real app, this would query the database
    // For demo, randomly decide based on track ID
    return parseInt(trackId) % 2 === 0;
  };

  const isInUserLibrary = async (trackId: string): Promise<boolean> => {
    // In a real app, this would query the database
    // For demo, use trackId to determine
    return parseInt(trackId) % 3 === 0;
  };

  const isTrackLiked = async (trackId: string): Promise<boolean> => {
    // In a real app, this would query the database
    return parseInt(trackId) % 4 === 0;
  };

  const logPlayEvent = async (trackId: string) => {
    // In a real app, this would log to analytics and update play count
    console.log(`Logging play for track ${trackId}`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = async () => {
    if (!user) return;
    
    setIsLiked(!isLiked);
    
    // In a real app, this would update the database
    if (track) {
      try {
        console.log(`Toggling like for track ${track.id} to ${!isLiked}`);
      } catch (err) {
        console.error('Error toggling like:', err);
        setIsLiked(!isLiked); // Revert on error
      }
    }
  };

  const addToCart = async () => {
    if (!track) return;
    
    // In a real app, this would add to shopping cart
    console.log(`Adding track ${track.id} to cart`);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex justify-center items-center h-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (error || !track) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center p-4">
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'Track not found'}
          </p>
        </div>
      </Card>
    );
  }

  // Mini player (collapsed state)
  if (!isExpanded) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md overflow-hidden">
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
            <Link 
              to={`/u/${track.artist.toLowerCase().replace(/\s+/g, '_')}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 truncate block"
            >
              {track.artist}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full"
              onClick={() => setIsExpanded(true)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <audio 
          ref={audioRef} 
          src={track.audioUrl} 
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
        />
      </Card>
    );
  }

  // Full player (expanded state)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden ${className}`}
    >
      <div className="p-6">
        {/* Close button if onClose provided */}
        {onClose && (
          <div className="flex justify-end mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Art */}
          <div className="md:w-64 md:h-64 rounded-lg overflow-hidden">
            <img 
              src={track.coverUrl} 
              alt={track.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Track Info and Controls */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {track.isPurchased ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Owned
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    Purchase
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {track.title}
              </h2>
              
              <Link 
                to={`/u/${track.artist.toLowerCase().replace(/\s+/g, '_')}`}
                className="text-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {track.artist}
              </Link>
              
              {track.album && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  From album: {track.album}
                </p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-primary-600"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleTimeSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full p-2"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button 
                  className="rounded-full p-3"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full p-2"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full p-2 ${isLiked ? 'text-red-500' : ''}`}
                  onClick={toggleLike}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-24 hidden md:block">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Minimize
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            {track.isPurchased ? (
              <Button
                variant="ghost"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : (
              <Button
                onClick={addToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={track.audioUrl} 
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
      />
    </motion.div>
  );
};

export default MusicPlayer;