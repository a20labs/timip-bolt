import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  file_url: string;
  artwork_url?: string;
  isrc?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPurchased: boolean;
  isInLibrary: boolean;
  isLiked: boolean;
  queue: Track[];
  history: Track[];
}

export const usePlayerState = (initialTrackId?: string) => {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isPurchased: false,
    isInLibrary: false,
    isLiked: false,
    queue: [],
    history: []
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuthStore();
  
  // Initialize audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set initial volume
      if (audioRef.current) {
        audioRef.current.volume = state.volume;
      }
    }
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Load initial track if provided
  useEffect(() => {
    if (initialTrackId) {
      loadTrack(initialTrackId);
    }
  }, [initialTrackId]);
  
  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    
    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };
    
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      playNextTrack();
    };
    
    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };
    
    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      // Remove event listeners
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);
  
  // Update audio element when playing state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (state.isPlaying) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);
  
  // Update volume and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = state.isMuted ? 0 : state.volume;
    audio.muted = state.isMuted;
  }, [state.volume, state.isMuted]);
  
  // Load track data and audio
  const loadTrack = async (trackId: string) => {
    try {
      // In a real app, this would fetch from Supabase
      // For demo purposes, use mock data
      const mockTrack = getMockTrack(trackId);
      
      // Set current track
      setState(prev => ({ 
        ...prev, 
        currentTrack: mockTrack,
        isPlaying: true,
        currentTime: 0,
        isPurchased: isTrackPurchased(trackId),
        isInLibrary: isTrackInLibrary(trackId),
        isLiked: isTrackLiked(trackId)
      }));
      
      // Load and play audio
      if (audioRef.current) {
        audioRef.current.src = mockTrack.file_url;
        audioRef.current.load();
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setState(prev => ({ ...prev, isPlaying: false }));
        });
      }
      
      // Log play in analytics (if user is logged in)
      if (user) {
        logPlay(trackId);
      }
      
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };
  
  // Get mock track data
  const getMockTrack = (trackId: string): Track => {
    // In a real app, this would fetch from Supabase
    // For demo, return mock data
    const mockTracks: Record<string, Track> = {
      '1': {
        id: '1',
        title: 'Midnight Dreams',
        artist: 'Luna Rodriguez',
        album: 'Summer Vibes EP',
        duration: 222,
        file_url: '/audio/sample-track-1.mp3',
        artwork_url: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=600',
        isrc: 'USRC17607839'
      },
      '2': {
        id: '2',
        title: 'Electric Nights',
        artist: 'Luna Rodriguez',
        album: 'Summer Vibes EP',
        duration: 258,
        file_url: '/audio/sample-track-2.mp3',
        artwork_url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
        isrc: 'USRC17607840'
      }
    };
    
    // Return mock track or first track if not found
    return mockTracks[trackId] || mockTracks['1'];
  };
  
  // Check if track is purchased
  const isTrackPurchased = (trackId: string): boolean => {
    // For demo purposes, even IDs are purchased
    return parseInt(trackId) % 2 === 0;
  };
  
  // Check if track is in library
  const isTrackInLibrary = (trackId: string): boolean => {
    // For demo purposes, track IDs divisible by 3 are in library
    return parseInt(trackId) % 3 === 0;
  };
  
  // Check if track is liked
  const isTrackLiked = (trackId: string): boolean => {
    // For demo purposes, track IDs divisible by 4 are liked
    return parseInt(trackId) % 4 === 0;
  };
  
  // Log play event
  const logPlay = (trackId: string) => {
    // In a real app, this would log to Supabase
    console.log(`Logging play for track ${trackId}`);
  };
  
  // Play/pause control
  const togglePlayPause = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };
  
  // Seek to time
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };
  
  // Set volume
  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
  };
  
  // Toggle mute
  const toggleMute = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };
  
  // Play next track in queue
  const playNextTrack = () => {
    const { currentTrack, queue } = state;
    if (!currentTrack || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    if (currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      loadTrack(nextTrack.id);
    }
  };
  
  // Play previous track in history
  const playPreviousTrack = () => {
    const { currentTrack, history } = state;
    if (!currentTrack || history.length <= 1) return;
    
    // Last item in history is current track, get the one before
    const prevTrack = history[history.length - 2];
    loadTrack(prevTrack.id);
  };
  
  // Add track to queue
  const addToQueue = (trackId: string) => {
    const track = getMockTrack(trackId);
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  };
  
  // Add to library
  const addToLibrary = async () => {
    if (!user || !state.currentTrack) return;
    
    try {
      // In a real app, this would add to Supabase
      console.log(`Adding track ${state.currentTrack.id} to library`);
      setState(prev => ({ ...prev, isInLibrary: true }));
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  };
  
  // Toggle like
  const toggleLike = async () => {
    if (!user || !state.currentTrack) return;
    
    try {
      // In a real app, this would update Supabase
      console.log(`Toggling like for track ${state.currentTrack.id}`);
      setState(prev => ({ ...prev, isLiked: !prev.isLiked }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  return {
    ...state,
    loadTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    playNextTrack,
    playPreviousTrack,
    addToQueue,
    addToLibrary,
    toggleLike,
    audioRef
  };
};