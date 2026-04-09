type CacheKey = string;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

/**
 * In-memory cache for AI responses to avoid duplicate Gemini calls.
 * Entries expire after TTL (default 30 minutes).
 */
export class AICacheService {
  private cache = new Map<CacheKey, CacheEntry<unknown>>();
  private pending = new Map<CacheKey, Promise<unknown>>();

  generateCacheKey(prefix: string, params: Record<string, unknown>): CacheKey {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  async getOrFetch<T>(
    key: CacheKey,
    fetchFn: () => Promise<T>,
    ttl = 1000 * 60 * 30
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }

    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const data = await fetchFn();
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
        return data;
      } finally {
        this.pending.delete(key);
      }
    })();

    this.pending.set(key, promise);
    return promise;
  }

  invalidate(key: CacheKey): void {
    this.cache.delete(key);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const aiCache = new AICacheService();
