import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define types for metadata and data
type TrackMetadata = {
  bpm?: number;
  key?: string;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  [key: string]: unknown;
};

type SyncData = {
  id?: string;
  [key: string]: unknown;
};

type PreferenceValue = string | number | boolean | object | null;

interface TruIndeeDB extends DBSchema {
  catalog: {
    key: string;
    value: {
      id: string;
      title: string;
      artist: string;
      album?: string;
      genre?: string;
      duration?: number;
      artwork?: string;
      audioUrl?: string;
      metadata?: TrackMetadata;
      createdAt: Date;
      updatedAt: Date;
      syncStatus: 'synced' | 'pending' | 'offline';
    };
    indexes: {
      'by-artist': string;
      'by-genre': string;
      'by-sync-status': string;
    };
  };
  playlists: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      trackIds: string[];
      artwork?: string;
      createdAt: Date;
      updatedAt: Date;
      syncStatus: 'synced' | 'pending' | 'offline';
    };
    indexes: {
      'by-sync-status': string;
    };
  };
  user_preferences: {
    key: string;
    value: {
      key: string;
      value: PreferenceValue;
      updatedAt: Date;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: SyncData;
      createdAt: Date;
      retryCount: number;
    };
    indexes: {
      'by-table': string;
      'by-action': string;
    };
  };
}

class OfflineStore {
  private db: IDBPDatabase<TruIndeeDB> | null = null;

  async init(): Promise<void> {
    this.db = await openDB<TruIndeeDB>('truindee-store', 1, {
      upgrade(db) {
        // Catalog store
        const catalogStore = db.createObjectStore('catalog', { keyPath: 'id' });
        catalogStore.createIndex('by-artist', 'artist');
        catalogStore.createIndex('by-genre', 'genre');
        catalogStore.createIndex('by-sync-status', 'syncStatus');

        // Playlists store
        const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' });
        playlistsStore.createIndex('by-sync-status', 'syncStatus');

        // User preferences store
        db.createObjectStore('user_preferences', { keyPath: 'key' });

        // Sync queue store
        const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-table', 'table');
        syncQueueStore.createIndex('by-action', 'action');
      },
    });
  }

  // Catalog methods
  async saveCatalogItem(item: TruIndeeDB['catalog']['value']): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('catalog', {
      ...item,
      updatedAt: new Date(),
      syncStatus: navigator.onLine ? 'synced' : 'offline',
    });
  }

  async getCatalogItems(): Promise<TruIndeeDB['catalog']['value'][]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('catalog');
  }

  async getCatalogItem(id: string): Promise<TruIndeeDB['catalog']['value'] | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('catalog', id);
  }

  async deleteCatalogItem(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('catalog', id);
  }

  async getCatalogByArtist(artist: string): Promise<TruIndeeDB['catalog']['value'][]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('catalog', 'by-artist', artist);
  }

  async getCatalogByGenre(genre: string): Promise<TruIndeeDB['catalog']['value'][]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('catalog', 'by-genre', genre);
  }

  // Playlist methods
  async savePlaylist(playlist: TruIndeeDB['playlists']['value']): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('playlists', {
      ...playlist,
      updatedAt: new Date(),
      syncStatus: navigator.onLine ? 'synced' : 'offline',
    });
  }

  async getPlaylists(): Promise<TruIndeeDB['playlists']['value'][]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('playlists');
  }

  async getPlaylist(id: string): Promise<TruIndeeDB['playlists']['value'] | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('playlists', id);
  }

  async deletePlaylist(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('playlists', id);
  }

  // User preferences methods
  async setPreference(key: string, value: PreferenceValue): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('user_preferences', {
      key,
      value,
      updatedAt: new Date(),
    });
  }

  async getPreference(key: string): Promise<PreferenceValue | undefined> {
    if (!this.db) await this.init();
    const result = await this.db!.get('user_preferences', key);
    return result?.value;
  }

  async getAllPreferences(): Promise<Record<string, PreferenceValue>> {
    if (!this.db) await this.init();
    const preferences = await this.db!.getAll('user_preferences');
    return preferences.reduce((acc, pref) => {
      acc[pref.key] = pref.value;
      return acc;
    }, {} as Record<string, PreferenceValue>);
  }

  // Sync queue methods
  async addToSyncQueue(action: 'create' | 'update' | 'delete', table: string, data: SyncData): Promise<void> {
    if (!this.db) await this.init();
    const id = `${table}-${action}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await this.db!.put('sync_queue', {
      id,
      action,
      table,
      data,
      createdAt: new Date(),
      retryCount: 0,
    });
  }

  async getSyncQueue(): Promise<TruIndeeDB['sync_queue']['value'][]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('sync_queue');
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('sync_queue', id);
  }

  async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) await this.init();
    const item = await this.db!.get('sync_queue', id);
    if (item) {
      item.retryCount += 1;
      await this.db!.put('sync_queue', item);
    }
  }

  // Utility methods
  async getUnSyncedItems(): Promise<{
    catalog: TruIndeeDB['catalog']['value'][];
    playlists: TruIndeeDB['playlists']['value'][];
  }> {
    if (!this.db) await this.init();
    const [catalog, playlists] = await Promise.all([
      this.db!.getAllFromIndex('catalog', 'by-sync-status', 'offline'),
      this.db!.getAllFromIndex('playlists', 'by-sync-status', 'offline'),
    ]);
    return { catalog, playlists };
  }

  async markAsSynced(table: 'catalog' | 'playlists', id: string): Promise<void> {
    if (!this.db) await this.init();
    const item = await this.db!.get(table, id);
    if (item) {
      item.syncStatus = 'synced';
      await this.db!.put(table, item);
    }
  }

  async clearStore(storeName?: keyof TruIndeeDB): Promise<void> {
    if (!this.db) await this.init();
    if (storeName) {
      // Type assertion to satisfy IDB clear method requirements
      await this.db!.clear(storeName as 'catalog' | 'playlists' | 'user_preferences' | 'sync_queue');
    } else {
      // Clear all stores
      const storeNames: (keyof TruIndeeDB)[] = ['catalog', 'playlists', 'user_preferences', 'sync_queue'];
      await Promise.all(storeNames.map(name => 
        this.db!.clear(name as 'catalog' | 'playlists' | 'user_preferences' | 'sync_queue')
      ));
    }
  }
}

export const offlineStore = new OfflineStore();
