import { Redis } from 'ioredis';
import { logger } from './logger.js';
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy(times) {
        if (times > 3) {
            return null;
        }
        return Math.min(times * 100, 1000);
    },
});
let isRedisConnected = false;
redis.on('connect', () => {
    isRedisConnected = true;
    logger.info({ redisUrl }, '⚡ [CWC Season 4] Redis connected successfully!');
});
redis.on('error', (err) => {
    isRedisConnected = false;
    logger.warn({ err: err?.message || err }, '⚠️ Redis connection offline or unreachable. Falling back to MongoDB.');
});
// Attempt async connection without throwing startup exception
redis.connect().catch(() => {
    isRedisConnected = false;
});
/**
 * Retrieve cached value from Redis
 */
export async function getCache(key) {
    if (!isRedisConnected && redis.status !== 'ready')
        return null;
    try {
        const cachedStr = await redis.get(key);
        if (!cachedStr)
            return null;
        return JSON.parse(cachedStr);
    }
    catch (error) {
        logger.error({ error, key }, 'Error reading from Redis cache');
        return null;
    }
}
/**
 * Store value in Redis cache with TTL in seconds
 */
export async function setCache(key, value, ttlSeconds = 30) {
    if (!isRedisConnected && redis.status !== 'ready')
        return;
    try {
        const stringified = JSON.stringify(value);
        await redis.setex(key, ttlSeconds, stringified);
    }
    catch (error) {
        logger.error({ error, key }, 'Error setting Redis cache key');
    }
}
/**
 * Delete key from Redis cache
 */
export async function delCache(key) {
    if (!isRedisConnected && redis.status !== 'ready')
        return;
    try {
        await redis.del(key);
    }
    catch (error) {
        logger.error({ error, key }, 'Error deleting Redis cache key');
    }
}
/**
 * Invalidate Redis keys matching a pattern
 */
export async function delCachePattern(pattern) {
    if (!isRedisConnected && redis.status !== 'ready')
        return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        logger.error({ error, pattern }, 'Error clearing Redis cache pattern');
    }
}
