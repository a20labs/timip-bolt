import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { RefreshCw } from 'lucide-react';

export const PWAComponents: React.FC = () => {
  const { needRefresh, updateSW } = usePWA();

  return (
    <>
      {/* Update Available Notification */}
      {needRefresh && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Update Available</p>
              <p className="text-sm opacity-90">A new version is ready to install</p>
            </div>
            <button
              onClick={updateSW}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready Notification - DISABLED */}
      {/* {offlineReady && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">App Ready Offline</p>
              <p className="text-sm opacity-90">You can now use the app without internet</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Install App Prompt - DISABLED */}
      {/* {isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Install TruIndee</p>
              <p className="text-sm opacity-90">Add to your home screen for quick access</p>
            </div>
            <button
              onClick={installApp}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      )} */}

      {/* Network Status Indicator - DISABLED */}
      {/* <div className="fixed top-4 left-4 z-40">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
            isOnline
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div> */}
    </>
  );
};
