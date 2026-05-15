/**
 * PostgreSQL Pool Configuration
 * Uses the `pg` library's connection pool.
 * In production, DATABASE_URL should point to the primary;
 * the FastAPI microservice uses a READ_REPLICA_URL.
 */

import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,               // max connections in pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("connect", () => console.log("✅  PostgreSQL pool connected"));
pool.on("error", (err) => console.error("[PG Pool] Error:", err.message));
