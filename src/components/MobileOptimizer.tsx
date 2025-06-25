import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Wifi, WifiOff, Battery, Signal } from 'lucide-react';

// Type definitions for web APIs
interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly rtt: number;
  readonly saveData: boolean;
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  isOnline: boolean;
  connection?: NetworkInformation;
  battery?: BatteryManager;
}

export const MobileOptimizer: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    detectDevice();
    setupConnectionMonitoring();
    setupBatteryMonitoring();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width <= 768) type = 'mobile';
    else if (width <= 1024) type = 'tablet';

    let os = 'unknown';
    if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
    else if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';

    let browser = 'unknown';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';

    setDeviceInfo({
      type,
      os,
      browser,
      isOnline: navigator.onLine,
    });
  };

  const setupConnectionMonitoring = () => {
    const updateConnectionStatus = () => {
      const isOnline = navigator.onLine;
      
      if (!isOnline) {
        setConnectionQuality('offline');
        return;
      }

      // Check connection quality if available
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionQuality('fast');
        } else if (effectiveType === '3g' || effectiveType === '2g') {
          setConnectionQuality('slow');
        } else {
          setConnectionQuality('fast');
        }
        
        setDeviceInfo(prev => prev ? { ...prev, connection, isOnline } : null);
      } else {
        setConnectionQuality('fast'); // Assume fast if can't detect
      }
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    updateConnectionStatus();

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  };

  const setupBatteryMonitoring = async () => {
    const nav = navigator as NavigatorWithConnection;
    if (nav.getBattery) {
      try {
        const battery = await nav.getBattery();
        
        const updateBatteryStatus = () => {
          setIsLowPowerMode(battery.level < 0.2 || battery.charging === false);
          setDeviceInfo(prev => prev ? { ...prev, battery } : null);
        };

        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
        updateBatteryStatus();
      } catch {
        console.log('Battery API not available');
      }
    }
  };

  // Apply mobile optimizations based on device and connection
  useEffect(() => {
    if (!deviceInfo) return;

    const applyOptimizations = () => {
      // Reduce animations on mobile or low power
      if (deviceInfo.type === 'mobile' || isLowPowerMode) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }

      // Adjust image quality based on connection
      if (connectionQuality === 'slow') {
        document.body.classList.add('low-bandwidth');
      } else {
        document.body.classList.remove('low-bandwidth');
      }

      // Mobile-specific optimizations
      if (deviceInfo.type === 'mobile') {
        document.body.classList.add('mobile-optimized');
        
        // Prevent zoom on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }
    };

    applyOptimizations();
  }, [deviceInfo, isLowPowerMode, connectionQuality]);

  if (!deviceInfo) return null;

  return (
    <>
      {/* Device Status Indicator (Development only) */}

      {/* Mobile Performance Warning */}
      {false && connectionQuality === 'slow' && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-yellow-600 text-white p-3 rounded-lg shadow-lg md:max-w-sm md:left-auto md:right-4">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Slow Connection Detected</p>
              <p className="text-xs opacity-90">Optimizing content for better performance</p>
            </div>
          </div>
        </div>
      )}

      {/* Low Battery Warning */}
      {false && isLowPowerMode && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-orange-600 text-white p-3 rounded-lg shadow-lg md:max-w-sm md:left-auto md:right-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Low Power Mode</p>
              <p className="text-xs opacity-90">Reducing animations to save battery</p>
            </div>
          </div>
        </div>
      )}

      {/* Add mobile-specific CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Mobile Optimizations */
        .mobile-optimized {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .mobile-optimized input,
        .mobile-optimized textarea,
        .mobile-optimized [contenteditable] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* Reduce Motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        /* Low Bandwidth Optimizations */
        .low-bandwidth img {
          image-rendering: optimizeSpeed;
        }

        .low-bandwidth video {
          poster: '';
        }

        /* Touch-friendly targets */
        @media (pointer: coarse) {
          button,
          [role="button"],
          input[type="button"],
          input[type="submit"],
          .clickable {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Improved scrolling on iOS */
        .scroll-smooth {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Better focus indicators for keyboard navigation */
        @media (prefers-reduced-motion: no-preference) {
          :focus-visible {
            outline: 2px solid #8b5cf6;
            outline-offset: 2px;
          }
        }
        `
      }} />
    </>
  );
};
