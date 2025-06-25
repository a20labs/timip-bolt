import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';

interface NowPlayingProps {
  trackId: string;
  autoplay?: boolean;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ trackId, autoplay = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <>
      {/* Mini Player - Fixed at bottom */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto max-w-7xl">
          {isExpanded ? (
            <div className="p-4">
              <button 
                onClick={() => setIsExpanded(false)}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 mx-auto"
              >
                <ChevronDown className="w-4 h-4" />
                Minimize Player
              </button>
              <MusicPlayer 
                trackId={trackId}
                showFullPlayer={true}
                autoplay={autoplay}
              />
            </div>
          ) : (
            <div className="p-2">
              <div className="flex items-center justify-between">
                <MusicPlayer 
                  trackId={trackId}
                  autoplay={autoplay}
                />
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <ChevronUp className="w-4 h-4" />
                  Expand
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default NowPlaying;