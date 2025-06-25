import { offlineStore } from '../utils/offlineStore';

interface SyncConfig {
  retryInterval: number;
  maxRetries: number;
  batchSize: number;
}

class BackgroundSyncService {
  private config: SyncConfig = {
    retryInterval: 30000, // 30 seconds
    maxRetries: 3,
    batchSize: 10,
  };
  
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private isSyncing = false;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sync when the app becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.triggerSync();
      }
    });
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.triggerSync();
      }
    }, this.config.retryInterval);
  }

  async triggerSync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    console.log('Starting background sync...');

    try {
      await this.syncPendingChanges();
      await this.syncOfflineData();
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncPendingChanges(): Promise<void> {
    const syncQueue = await offlineStore.getSyncQueue();
    
    if (syncQueue.length === 0) {
      return;
    }

    console.log(`Syncing ${syncQueue.length} pending changes...`);

    // Process in batches
    for (let i = 0; i < syncQueue.length; i += this.config.batchSize) {
      const batch = syncQueue.slice(i, i + this.config.batchSize);
      
      await Promise.allSettled(
        batch.map(async (item) => {
          try {
            await this.syncQueueItem(item);
            await offlineStore.removeSyncQueueItem(item.id);
          } catch (error) {
            console.error(`Failed to sync item ${item.id}:`, error);
            
            if (item.retryCount < this.config.maxRetries) {
              await offlineStore.incrementRetryCount(item.id);
            } else {
              // Remove item after max retries
              await offlineStore.removeSyncQueueItem(item.id);
              console.warn(`Removing item ${item.id} after ${this.config.maxRetries} failed retries`);
            }
          }
        })
      );
    }
  }

  private async syncQueueItem(item: any): Promise<void> {
    const { action, table, data } = item;
    
    // This would typically make API calls to your backend
    // For now, we'll simulate the API calls
    const apiEndpoint = this.getApiEndpoint(table);
    
    switch (action) {
      case 'create':
        await this.apiRequest('POST', apiEndpoint, data);
        break;
      case 'update':
        await this.apiRequest('PUT', `${apiEndpoint}/${data.id}`, data);
        break;
      case 'delete':
        await this.apiRequest('DELETE', `${apiEndpoint}/${data.id}`);
        break;
    }
  }

  private async syncOfflineData(): Promise<void> {
    const { catalog, playlists } = await offlineStore.getUnSyncedItems();
    
    // Sync catalog items
    for (const item of catalog) {
      try {
        await this.apiRequest('POST', '/api/catalog', item);
        await offlineStore.markAsSynced('catalog', item.id);
      } catch (error) {
        console.error(`Failed to sync catalog item ${item.id}:`, error);
      }
    }

    // Sync playlists
    for (const playlist of playlists) {
      try {
        await this.apiRequest('POST', '/api/playlists', playlist);
        await offlineStore.markAsSynced('playlists', playlist.id);
      } catch (error) {
        console.error(`Failed to sync playlist ${playlist.id}:`, error);
      }
    }
  }

  private getApiEndpoint(table: string): string {
    const endpoints: Record<string, string> = {
      catalog: '/api/catalog',
      playlists: '/api/playlists',
      user_preferences: '/api/preferences',
    };
    return endpoints[table] || '/api/data';
  }

  private async apiRequest(method: string, url: string, data?: any): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  // Public methods for manual sync triggers
  async syncCatalog(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const catalog = await offlineStore.getCatalogItems();
    const unsynced = catalog.filter(item => item.syncStatus !== 'synced');
    
    for (const item of unsynced) {
      try {
        await this.apiRequest('POST', '/api/catalog', item);
        await offlineStore.markAsSynced('catalog', item.id);
      } catch (error) {
        console.error(`Failed to sync catalog item ${item.id}:`, error);
        throw error;
      }
    }
  }

  async syncPlaylists(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const playlists = await offlineStore.getPlaylists();
    const unsynced = playlists.filter(item => item.syncStatus !== 'synced');
    
    for (const playlist of unsynced) {
      try {
        await this.apiRequest('POST', '/api/playlists', playlist);
        await offlineStore.markAsSynced('playlists', playlist.id);
      } catch (error) {
        console.error(`Failed to sync playlist ${playlist.id}:`, error);
        throw error;
      }
    }
  }

  getStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime?: Date;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    window.removeEventListener('online', this.triggerSync);
    window.removeEventListener('offline', this.triggerSync);
    document.removeEventListener('visibilitychange', this.triggerSync);
  }
}

export const backgroundSync = new BackgroundSyncService();
