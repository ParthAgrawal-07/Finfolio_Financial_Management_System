/**
 * Redis Client Configuration
 * Uses ioredis — the battle-tested Redis client for Node.js.
 *
 * Strategy:
 *  - Portfolio holdings cached for CACHE_TTL_SECONDS (60 s).
 *  - Cache keys are namespaced: "portfolio:<userId>".
 *  - On Redis failure the app falls through to PostgreSQL gracefully.
 */

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  // Retry strategy: exponential backoff, max 30 s
  retryStrategy(times) {
    const delay = Math.min(times * 200, 30_000);
    console.warn(`[Redis] Reconnecting attempt #${times} in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => console.log("✅  Redis connected"));
redis.on("error", (err) => console.error("[Redis] Error:", err.message));

/** TTL for portfolio cache in seconds */
export const CACHE_TTL_SECONDS = 60;

/** Namespace-prefix helper */
export const cacheKey = {
  portfolio: (userId: string) => `portfolio:holdings:${userId}`,
  user: (userId: string) => `user:${userId}`,
};
