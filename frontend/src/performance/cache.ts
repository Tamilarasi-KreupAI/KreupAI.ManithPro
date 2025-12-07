// ============================================================
// CACHING UTILITIES - In-memory, localStorage, and IndexedDB caching
// ============================================================

// ============================================
// Types
// ============================================
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  storage?: 'memory' | 'local' | 'session' | 'indexeddb';
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// ============================================
// In-Memory Cache
// ============================================
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 5 * 60 * 1000, tags } = options; // Default 5 minutes

    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      tags,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

// ============================================
// Storage Cache (localStorage/sessionStorage)
// ============================================
class StorageCache {
  private prefix: string;
  private storage: Storage;

  constructor(storage: Storage, prefix = 'cache:') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(this.getKey(key));
      if (!raw) return null;

      const entry = JSON.parse(raw) as CacheEntry<T>;

      if (Date.now() > entry.expiresAt) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 5 * 60 * 1000, tags } = options;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        tags,
      };

      this.storage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      // Storage full - try to prune expired entries
      if ((error as Error).name === 'QuotaExceededError') {
        this.prune();
        try {
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
            tags,
          };
          this.storage.setItem(this.getKey(key), JSON.stringify(entry));
        } catch {
          console.warn('Cache storage full, unable to save');
        }
      }
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const fullKey = this.getKey(key);
    const existed = this.storage.getItem(fullKey) !== null;
    this.storage.removeItem(fullKey);
    return existed;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const raw = this.storage.getItem(key);
          if (raw) {
            const entry = JSON.parse(raw) as CacheEntry<unknown>;
            if (entry.tags?.includes(tag)) {
              keysToDelete.push(key);
            }
          }
        } catch {
          // Invalid entry, skip
        }
      }
    }

    for (const key of keysToDelete) {
      this.storage.removeItem(key);
      count++;
    }

    return count;
  }

  clear(): void {
    const keysToDelete: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.storage.removeItem(key);
    }
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;
    const keysToDelete: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const raw = this.storage.getItem(key);
          if (raw) {
            const entry = JSON.parse(raw) as CacheEntry<unknown>;
            if (now > entry.expiresAt) {
              keysToDelete.push(key);
            }
          }
        } catch {
          keysToDelete.push(key!);
        }
      }
    }

    for (const key of keysToDelete) {
      this.storage.removeItem(key);
      pruned++;
    }

    return pruned;
  }
}

// ============================================
// IndexedDB Cache
// ============================================
class IndexedDBCache {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(dbName = 'app-cache', storeName = 'cache') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            store.createIndex('expiresAt', 'expiresAt', { unique: false });
            store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          }
        };
      });
    }

    return this.dbPromise;
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as (CacheEntry<T> & { key: string }) | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() > result.expiresAt) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 5 * 60 * 1000, tags } = options;
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const entry = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        tags,
      };

      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async has(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result !== null;
  }

  async delete(key: string): Promise<boolean> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async invalidateByTag(tag: string): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('tags');
      const request = index.getAllKeys(IDBKeyRange.only(tag));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const keys = request.result;
        let deleted = 0;

        for (const key of keys) {
          store.delete(key);
          deleted++;
        }

        resolve(deleted);
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async prune(): Promise<number> {
    const db = await this.getDB();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      let pruned = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          pruned++;
          cursor.continue();
        } else {
          resolve(pruned);
        }
      };
    });
  }
}

// ============================================
// Unified Cache Manager
// ============================================
class CacheManager {
  private memory: MemoryCache;
  private local: StorageCache;
  private session: StorageCache;
  private indexed: IndexedDBCache;

  constructor() {
    this.memory = new MemoryCache();
    this.local = new StorageCache(localStorage, 'cache:');
    this.session = new StorageCache(sessionStorage, 'cache:');
    this.indexed = new IndexedDBCache();

    // Periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.memory.prune();
        this.local.prune();
        this.session.prune();
        this.indexed.prune();
      }, 60000); // Every minute
    }
  }

  async get<T>(key: string, storage: CacheOptions['storage'] = 'memory'): Promise<T | null> {
    switch (storage) {
      case 'local':
        return this.local.get<T>(key);
      case 'session':
        return this.session.get<T>(key);
      case 'indexeddb':
        return this.indexed.get<T>(key);
      default:
        return this.memory.get<T>(key);
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { storage = 'memory' } = options;

    switch (storage) {
      case 'local':
        return this.local.set(key, data, options);
      case 'session':
        return this.session.set(key, data, options);
      case 'indexeddb':
        return this.indexed.set(key, data, options);
      default:
        return this.memory.set(key, data, options);
    }
  }

  async delete(key: string, storage?: CacheOptions['storage']): Promise<void> {
    if (storage) {
      switch (storage) {
        case 'local':
          this.local.delete(key);
          break;
        case 'session':
          this.session.delete(key);
          break;
        case 'indexeddb':
          await this.indexed.delete(key);
          break;
        default:
          this.memory.delete(key);
      }
    } else {
      // Delete from all storages
      this.memory.delete(key);
      this.local.delete(key);
      this.session.delete(key);
      await this.indexed.delete(key);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    this.memory.invalidateByTag(tag);
    this.local.invalidateByTag(tag);
    this.session.invalidateByTag(tag);
    await this.indexed.invalidateByTag(tag);
  }

  async clear(): Promise<void> {
    this.memory.clear();
    this.local.clear();
    this.session.clear();
    await this.indexed.clear();
  }

  getMemoryStats(): CacheStats {
    return this.memory.getStats();
  }
}

// ============================================
// Cache Decorator for Functions
// ============================================
export function cached<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: CacheOptions & { keyGenerator?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new MemoryCache();
  const { keyGenerator = (...args) => JSON.stringify(args), ...cacheOptions } = options;

  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, cacheOptions);
    return result;
  }) as T;
}

// ============================================
// Request Deduplication
// ============================================
const pendingRequests = new Map<string, Promise<unknown>>();

export function dedupe<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = pendingRequests.get(key) as Promise<T> | undefined;

  if (existing) {
    return existing;
  }

  const promise = fn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ============================================
// Singleton Export
// ============================================
export const cacheManager = new CacheManager();

export default cacheManager;
