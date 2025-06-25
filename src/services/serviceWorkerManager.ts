import { Workbox } from 'workbox-window';

// Extended interface for ServiceWorkerRegistration with sync support
interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
}

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOfflineReady: boolean;
  registration?: ServiceWorkerRegistrationWithSync;
}

// Event listener function type
type EventListenerFunction = (data?: unknown) => void;

class ServiceWorkerManager {
  private wb: Workbox | null = null;
  private status: ServiceWorkerStatus = {
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    isOfflineReady: false,
  };
  
  private listeners: Map<string, EventListenerFunction[]> = new Map();

  constructor() {
    this.status.isSupported = 'serviceWorker' in navigator;
    this.initializeWorkbox();
  }

  private initializeWorkbox(): void {
    if (!this.status.isSupported) {
      console.warn('Service Worker not supported in this browser');
      return;
    }

    // Initialize Workbox
    this.wb = new Workbox('/sw.js');

    // Listen for waiting state
    this.wb.addEventListener('waiting', (event) => {
      console.log('New service worker is waiting to activate');
      this.status.isUpdateAvailable = true;
      this.emit('updateAvailable', event);
    });

    // Listen for controlling state
    this.wb.addEventListener('controlling', (event) => {
      console.log('New service worker is now controlling the page');
      this.emit('updateActivated', event);
      // Reload the page to ensure new assets are used
      window.location.reload();
    });

    // Listen for offline ready state
    this.wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('Service worker installed for the first time');
        this.status.isOfflineReady = true;
        this.emit('offlineReady', event);
      }
    });

    // Listen for external updates - Note: These events may not be supported in all Workbox versions
    // Commenting out unsupported events to avoid TypeScript errors
    /*
    this.wb.addEventListener('externalinstalled', (event) => {
      console.log('External service worker installed');
      this.emit('externalUpdate', event);
    });

    // Listen for external activations
    this.wb.addEventListener('externalactivated', (event) => {
      console.log('External service worker activated');
      this.emit('externalActivated', event);
    });
    */
  }

  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (!this.wb) {
      console.warn('Workbox not initialized');
      return;
    }

    try {
      const registration = await this.wb.register();
      this.status.isRegistered = true;
      this.status.registration = registration;
      
      console.log('Service Worker registered successfully');
      this.emit('registered', registration);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.emit('registrationError', error);
      throw error;
    }
  }

  async update(): Promise<void> {
    if (!this.wb) {
      throw new Error('Service Worker not initialized');
    }

    try {
      await this.wb.messageSkipWaiting();
      this.status.isUpdateAvailable = false;
      console.log('Service Worker update triggered');
    } catch (error) {
      console.error('Service Worker update failed:', error);
      throw error;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.status.registration) {
      return false;
    }

    try {
      const result = await this.status.registration.unregister();
      if (result) {
        this.status.isRegistered = false;
        this.status.registration = undefined;
        console.log('Service Worker unregistered successfully');
      }
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Event system for listening to SW events
  on(event: string, callback: EventListenerFunction): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventListenerFunction): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Cache management
  async clearCache(cacheName?: string): Promise<void> {
    if (!this.status.isSupported) {
      throw new Error('Service Worker not supported');
    }

    if (cacheName) {
      await caches.delete(cacheName);
      console.log(`Cache '${cacheName}' cleared`);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    }
  }

  async getCacheSize(): Promise<{ name: string; size: number }[]> {
    if (!this.status.isSupported) {
      return [];
    }

    const cacheNames = await caches.keys();
    const cacheSizes = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return { name, size: keys.length };
      })
    );

    return cacheSizes;
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get current status
  getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  // Background sync support
  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!this.status.registration) {
      throw new Error('Service Worker not registered');
    }

    if ('sync' in this.status.registration && this.status.registration.sync) {
      try {
        await this.status.registration.sync.register(tag);
        console.log(`Background sync scheduled: ${tag}`);
      } catch (error) {
        console.error('Background sync scheduling failed:', error);
        throw error;
      }
    } else {
      console.warn('Background sync not supported');
    }
  }

  // Push notifications support
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log(`Notification permission: ${permission}`);
    return permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.status.registration) {
      throw new Error('Service Worker not registered');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const subscription = await this.status.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'YOUR_VAPID_PUBLIC_KEY_HERE'
        ),
      });

      console.log('Push notification subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push notification subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
