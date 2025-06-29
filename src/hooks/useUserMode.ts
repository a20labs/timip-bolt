import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { fanToArtistService } from '../services/fanToArtistService';

export function useUserMode() {
  const { user } = useAuthStore();
  const [currentMode, setCurrentMode] = useState<'fan' | 'artist'>('fan');
  const [availableModes, setAvailableModes] = useState<('fan' | 'artist')[]>([]);

  useEffect(() => {
    if (user) {
      const modes = fanToArtistService.getAvailableModes(user);
      const mode = fanToArtistService.getCurrentMode();
      
      setAvailableModes(modes);
      setCurrentMode(mode);
    } else {
      setAvailableModes([]);
      setCurrentMode('fan');
    }
  }, [user]);

  useEffect(() => {
    const handleModeChange = (event: CustomEvent) => {
      setCurrentMode(event.detail.mode);
    };

    window.addEventListener('userModeChanged', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('userModeChanged', handleModeChange as EventListener);
    };
  }, []);

  const switchMode = (mode: 'fan' | 'artist') => {
    if (availableModes.includes(mode)) {
      fanToArtistService.switchMode(mode);
      setCurrentMode(mode);
    }
  };

  const canConvert = user ? fanToArtistService.canConvertToArtist(user) : false;
  const isDualMode = user ? fanToArtistService.isDualModeUser(user) : false;

  return {
    currentMode,
    availableModes,
    switchMode,
    canConvert,
    isDualMode,
    isArtist: currentMode === 'artist',
    isFan: currentMode === 'fan',
  };
}
