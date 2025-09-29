import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';
import { ICache } from '@infra/cache/interfaces/ICache';

@Injectable()
export class NodeCacheService implements ICache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes default
      checkperiod: 120, // check every 2 minutes
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }

  del(key: string): void {
    this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
  }
}
