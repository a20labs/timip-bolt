import { Button } from '../ui/Button';
import { User, Music } from 'lucide-react';
import { useUserMode } from '../../hooks/useUserMode';

export function UserModeToggle() {
  const { currentMode, availableModes, switchMode, isDualMode } = useUserMode();

  // Only show toggle if user has dual capabilities
  if (!isDualMode || availableModes.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={currentMode === 'fan' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => switchMode('fan')}
        className="flex items-center gap-2 px-3 py-1"
      >
        <User className="w-4 h-4" />
        Fan
      </Button>
      <Button
        variant={currentMode === 'artist' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => switchMode('artist')}
        className="flex items-center gap-2 px-3 py-1"
      >
        <Music className="w-4 h-4" />
        Artist
      </Button>
    </div>
  );
}
