import Redis from "ioredis";
import { logger } from "./logger";

// Create Redis client if enabled
const redisEnabled = process.env.REDIS_ENABLED !== "false";
let redisClient: Redis | null = null;

if (redisEnabled) {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Handle Redis errors
    redisClient.on("error", (error) => {
      logger.error("Redis connection error", { error: error.message });
    });

    // Handle Redis connection
    redisClient.on("connect", () => {
      logger.info("Connected to Redis server");
    });
  } catch (error) {
    logger.error("Failed to initialize Redis client", {
      error: (error as Error).message,
    });
    redisClient = null;
  }
} else {
  logger.info("Redis is disabled. Using memory-only cache.");
}

// Memory cache fallback for development
const memoryCache = new Map<string, { value: any; expiry: number | null }>();

/**
 * Cache service for storing and retrieving data
 */
export class CacheService {
  private readonly keyPrefix: string;
  private readonly defaultTtl: number;

  constructor(keyPrefix = "sui-ai:", defaultTtl = 3600) {
    this.keyPrefix = keyPrefix;
    this.defaultTtl = defaultTtl; // Default TTL in seconds (1 hour)
  }

  /**
   * Generate full key with prefix
   */
  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Set a value in the cache
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const serializedValue = JSON.stringify(value);

      if (redisClient) {
        // Use Redis if available
        if (ttl !== undefined) {
          await redisClient.set(fullKey, serializedValue, "EX", ttl);
        } else {
          await redisClient.set(
            fullKey,
            serializedValue,
            "EX",
            this.defaultTtl
          );
        }
      } else {
        // Fallback to memory cache
        const expiry = ttl ? Date.now() + ttl * 1000 : null;
        memoryCache.set(fullKey, { value, expiry });
      }
    } catch (error) {
      logger.error("Cache set error", { key, error: (error as Error).message });
    }
  }

  /**
   * Get a value from the cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);

      if (redisClient) {
        // Use Redis if available
        const value = await redisClient.get(fullKey);
        if (!value) return null;
        return JSON.parse(value) as T;
      } else {
        // Fallback to memory cache
        const cached = memoryCache.get(fullKey);
        if (!cached) return null;

        // Check if expired
        if (cached.expiry && cached.expiry < Date.now()) {
          memoryCache.delete(fullKey);
          return null;
        }

        return cached.value as T;
      }
    } catch (error) {
      logger.error("Cache get error", { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  public async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);

      if (redisClient) {
        // Use Redis if available
        await redisClient.del(fullKey);
      } else {
        // Fallback to memory cache
        memoryCache.delete(fullKey);
      }
    } catch (error) {
      logger.error("Cache delete error", {
        key,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Clear all values with the current prefix
   */
  public async clear(): Promise<void> {
    try {
      if (redisClient) {
        // Use Redis if available
        const keys = await redisClient.keys(`${this.keyPrefix}*`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        // Fallback to memory cache
        for (const key of memoryCache.keys()) {
          if (key.startsWith(this.keyPrefix)) {
            memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      logger.error("Cache clear error", { error: (error as Error).message });
    }
  }
}

// Export default instance
export const cache = new CacheService();
