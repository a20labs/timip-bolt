import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '../hooks/useNavigation';

export function DebugPanel() {
  const { user, loading } = useAuthStore();
  const { navigation } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only show in production for debugging, or when a specific flag is set
    const showDebug = import.meta.env.PROD || localStorage.getItem('debug-mode') === 'true';
    setIsVisible(showDebug);
  }, []);
  
  const hideDebug = () => {
    localStorage.removeItem('debug-mode');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white p-2 text-xs font-mono opacity-90">
      <div className="flex justify-between items-center">
        <div>
          🔍 Debug: User={user?.email || 'none'} | Role={user?.role || 'none'} | Loading={loading.toString()} | Nav={navigation.length}
        </div>
        <button 
          onClick={hideDebug}
          className="bg-red-700 px-2 py-1 rounded text-xs hover:bg-red-800"
        >
          Hide
        </button>
      </div>
      {user && (
        <div className="mt-1 text-xs">
          Navigation: {navigation.map(item => item.label).join(', ')}
        </div>
      )}
    </div>
  );
}
