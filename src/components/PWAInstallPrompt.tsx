/**
 * PWA Install Prompt Component
 * Provides a native app installation experience
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installCount, setInstallCount] = useState(0);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Get install prompt count from localStorage
    const stored = localStorage.getItem('pwa-install-prompt-count');
    const count = stored ? parseInt(stored, 10) : 0;
    setInstallCount(count);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt only if not dismissed too many times
      if (count < 3 && !isInstalled) {
        setTimeout(() => setShowPrompt(true), 5000); // Show after 5 seconds
      }
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        // Increment dismiss count
        const newCount = installCount + 1;
        localStorage.setItem('pwa-install-prompt-count', newCount.toString());
        setInstallCount(newCount);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const newCount = installCount + 1;
    localStorage.setItem('pwa-install-prompt-count', newCount.toString());
    setInstallCount(newCount);
    onDismiss?.();
  };

  const getDeviceIcon = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone size={24} className="text-purple-400" />;
    }
    return <Monitor size={24} className="text-purple-400" />;
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      return {
        title: 'Install TruIndee App',
        subtitle: 'Get the full experience with our native app',
        instructions: 'Tap "Install" to add TruIndee to your home screen'
      };
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        title: 'Add to Home Screen',
        subtitle: 'Install TruIndee for quick access',
        instructions: 'Tap the share button and select "Add to Home Screen"'
      };
    } else {
      return {
        title: 'Install TruIndee App',
        subtitle: 'Access TruIndee like a native desktop app',
        instructions: 'Click "Install" to add TruIndee to your applications'
      };
    }
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  const { title, subtitle, instructions } = getInstallInstructions();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getDeviceIcon()}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       transition-colors p-1"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {instructions}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                       bg-purple-600 hover:bg-purple-700 text-white text-sm 
                       rounded-md transition-colors touch-manipulation"
          >
            <Download size={16} />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-gray-600 dark:text-gray-300 
                       hover:text-gray-800 dark:hover:text-white text-sm 
                       transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing PWA installation
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  return {
    canInstall,
    isInstalled,
    install
  };
};

export default PWAInstallPrompt;
