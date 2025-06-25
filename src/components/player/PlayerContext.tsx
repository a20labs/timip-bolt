import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerContextType {
  currentTrackId: string | null;
  isPlaying: boolean;
  queue: string[];
  playTrack: (trackId: string) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (trackId: string) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);

  const playTrack = (trackId: string) => {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
    
    // If track is not in queue, add it
    if (!queue.includes(trackId)) {
      setQueue(prev => [...prev, trackId]);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const nextTrack = () => {
    if (!currentTrackId || queue.length === 0) return;
    
    const currentIndex = queue.indexOf(currentTrackId);
    if (currentIndex < queue.length - 1) {
      // Play next track in queue
      const nextTrackId = queue[currentIndex + 1];
      setCurrentTrackId(nextTrackId);
      setIsPlaying(true);
    } else {
      // End of queue, stop playback
      setIsPlaying(false);
    }
  };

  const previousTrack = () => {
    if (!currentTrackId || queue.length === 0) return;
    
    const currentIndex = queue.indexOf(currentTrackId);
    if (currentIndex > 0) {
      // Play previous track in queue
      const prevTrackId = queue[currentIndex - 1];
      setCurrentTrackId(prevTrackId);
      setIsPlaying(true);
    } else {
      // Start of queue, restart current track
      // This would be handled by the MusicPlayer component resetting the time to 0
    }
  };

  const addToQueue = (trackId: string) => {
    if (!queue.includes(trackId)) {
      setQueue(prev => [...prev, trackId]);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentTrackId(null);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrackId,
        isPlaying,
        queue,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        addToQueue,
        clearQueue
      }}
    >
      {children}
      {currentTrackId && (
        <div id="global-player-container">
          {/* Global player will be rendered here */}
        </div>
      )}
    </PlayerContext.Provider>
  );
};