import NodeCache from 'node-cache';
import { config } from '../config';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: 120,
      useClones: false,
      deleteOnExpire: true,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  invalidatePattern(pattern: string): void {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    matchingKeys.forEach((key) => this.cache.del(key));
  }

  getStats() {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
