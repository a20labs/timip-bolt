/**
 * Native Mobile Features Component
 * Provides native-like mobile functionality for PWA
 */

import React, { useState, useEffect } from 'react';
import { Share2, Download, Bell, Vibrate } from 'lucide-react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface NativeMobileFeaturesProps {
  className?: string;
}

export const NativeMobileFeatures: React.FC<NativeMobileFeaturesProps> = ({ 
  className = '' 
}) => {
  const [canShare, setCanShare] = useState(false);
  const [canVibrate, setCanVibrate] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check for native sharing support
    setCanShare('share' in navigator);
    
    // Check for vibration support
    setCanVibrate('vibrate' in navigator);
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleNativeShare = async (data: ShareData) => {
    if (!canShare) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(data.url || window.location.href);
        showNotification('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
      return;
    }

    try {
      await navigator.share({
        title: data.title || 'TruIndee Music Platform',
        text: data.text || 'Check out this amazing music platform',
        url: data.url || window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVibrate = (pattern: number | number[] = 200) => {
    if (canVibrate) {
      navigator.vibrate(pattern);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        showNotification('Notifications enabled!', {
          body: 'You\'ll now receive updates from TruIndee',
          icon: '/icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'truindee-notification',
        ...options
      });
    } else {
      // Fallback to in-app notification
      console.log(`Notification: ${title}`);
    }
  };

  const downloadForOffline = async () => {
    try {
      // Trigger service worker to cache important resources
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Send message to service worker to pre-cache resources
        registration.active?.postMessage({
          type: 'CACHE_RESOURCES',
          resources: [
            '/dashboard',
            '/catalog',
            '/ai-team',
            '/analytics'
          ]
        });

        handleVibrate([100, 50, 100]);
        showNotification('App ready for offline use!', {
          body: 'Key features are now available offline'
        });
      }
    } catch (error) {
      console.error('Error preparing offline mode:', error);
    }
  };

  return (
    <div className={`native-mobile-features ${className}`}>
      {/* Native Share Button */}
      <button
        onClick={() => handleNativeShare({
          title: 'TruIndee Music Platform',
          text: 'Professional music industry platform for artists and labels',
          url: window.location.href
        })}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                   text-white rounded-lg transition-colors touch-manipulation"
        aria-label="Share this page"
      >
        <Share2 size={18} />
        <span>{canShare ? 'Share' : 'Copy Link'}</span>
      </button>

      {/* Notification Permission Button */}
      {notificationPermission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-lg transition-colors touch-manipulation"
          aria-label="Enable notifications"
        >
          <Bell size={18} />
          <span>Enable Notifications</span>
        </button>
      )}

      {/* Offline Download Button */}
      <button
        onClick={downloadForOffline}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                   text-white rounded-lg transition-colors touch-manipulation"
        aria-label="Download for offline use"
      >
        <Download size={18} />
        <span>Offline Mode</span>
      </button>

      {/* Haptic Feedback Test (for development) */}
      {process.env.NODE_ENV === 'development' && canVibrate && (
        <button
          onClick={() => handleVibrate([100, 50, 100, 50, 100])}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 
                     text-white rounded-lg transition-colors touch-manipulation"
          aria-label="Test vibration"
        >
          <Vibrate size={18} />
          <span>Test Haptics</span>
        </button>
      )}
    </div>
  );
};

// Hook for using native mobile features
export const useNativeMobileFeatures = () => {
  const [capabilities, setCapabilities] = useState({
    canShare: false,
    canVibrate: false,
    canNotify: false,
    isStandalone: false,
    isInstalled: false
  });

  useEffect(() => {
    setCapabilities({
      canShare: 'share' in navigator,
      canVibrate: 'vibrate' in navigator,
      canNotify: 'Notification' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isInstalled: (window.navigator as Navigator & { standalone?: boolean }).standalone === true || 
                  window.matchMedia('(display-mode: standalone)').matches
    });
  }, []);

  const share = async (data: ShareData) => {
    if (capabilities.canShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    return false;
  };

  const vibrate = (pattern: number | number[] = 200) => {
    if (capabilities.canVibrate) {
      navigator.vibrate(pattern);
    }
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (capabilities.canNotify && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
    }
    return null;
  };

  return {
    capabilities,
    share,
    vibrate,
    notify
  };
};

export default NativeMobileFeatures;
