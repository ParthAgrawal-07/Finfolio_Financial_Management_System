/**
 * Portfolio Controller
 * ─────────────────────────────────────────────────────────────
 * GET /api/v1/portfolio/:userId/holdings
 *
 * Cache Strategy (Read-Through with Redis):
 *  1. Check Redis for cached key "portfolio:holdings:<userId>"
 *  2. Cache HIT  → return JSON immediately (sub-millisecond)
 *  3. Cache MISS → query PostgreSQL, write result to Redis (TTL 60 s)
 *
 * The PnL for each holding is calculated in SQL:
 *   unrealised_pnl = (current_price - avg_buy_price) * qty_owned
 *
 * This avoids N+1 queries by joining Market_Price in one query.
 */

import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { redis, cacheKey, CACHE_TTL_SECONDS } from "../config/redis";

// ─── Types ────────────────────────────────────────────────────
interface PortfolioHolding {
  portfolio_id: string;
  portfolio_name: string;
  security_id: string;
  ticker_symbol: string;
  security_name: string;
  sector: string;
  quantity_owned: number;
  average_buy_price: number;
  current_price: number;
  market_value: number;
  unrealised_pnl: number;
  pnl_percentage: number;
}

interface HoldingsResponse {
  user_id: string;
  total_unrealised_pnl: number;
  total_market_value: number;
  holdings: PortfolioHolding[];
  cached: boolean;
  cache_ttl_seconds: number;
}

// ─── SQL Query ────────────────────────────────────────────────
/**
 * Fetches all portfolio holdings with live PnL calculations.
 * Uses a LATERAL join to get the LATEST market price per security,
 * avoiding slow correlated subqueries.
 */
const HOLDINGS_QUERY = `
  SELECT
    p.Portfolio_ID                                          AS portfolio_id,
    p.portfolio_name,
    s.Security_ID                                           AS security_id,
    s.ticker_symbol,
    s.name                                                  AS security_name,
    COALESCE(s.sector, 'N/A')                              AS sector,
    ph.quantity_owned,
    ph.average_buy_price::FLOAT,
    COALESCE(mp.close_price, ph.average_buy_price)::FLOAT  AS current_price,
    (ph.quantity_owned * COALESCE(mp.close_price, ph.average_buy_price))::FLOAT
                                                            AS market_value,
    ((COALESCE(mp.close_price, ph.average_buy_price) - ph.average_buy_price)
      * ph.quantity_owned)::FLOAT                           AS unrealised_pnl,
    CASE
      WHEN ph.average_buy_price > 0 THEN
        ROUND(
          ((COALESCE(mp.close_price, ph.average_buy_price) - ph.average_buy_price)
           / ph.average_buy_price * 100)::NUMERIC, 2
        )::FLOAT
      ELSE 0
    END                                                     AS pnl_percentage
  FROM Portfolio p
  JOIN Portfolio_Holding ph ON p.Portfolio_ID = ph.Portfolio_ID
  JOIN Security s            ON ph.Security_ID = s.Security_ID
  -- LATERAL: picks the most recent trade_date price per security
  LEFT JOIN LATERAL (
    SELECT close_price
    FROM Market_Price mp2
    WHERE mp2.Security_ID = s.Security_ID
    ORDER BY mp2.trade_date DESC
    LIMIT 1
  ) mp ON TRUE
  WHERE p.User_ID = $1
  ORDER BY unrealised_pnl DESC;
`;

// ─── Controller ───────────────────────────────────────────────
export async function getPortfolioHoldings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  const key = cacheKey.portfolio(userId);

  try {
    // ── Step 1: Check Redis cache ──────────────────────────
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Cache HIT]  ${key}`);
      const data: HoldingsResponse = JSON.parse(cached);
      res.json({ ...data, cached: true });
      return;
    }

    // ── Step 2: Cache MISS → hit PostgreSQL ───────────────
    console.log(`[Cache MISS] ${key} → querying PostgreSQL`);
    const { rows } = await pool.query<PortfolioHolding>(HOLDINGS_QUERY, [userId]);

    // ── Step 3: Aggregate totals ───────────────────────────
    const total_unrealised_pnl = rows.reduce((acc, h) => acc + h.unrealised_pnl, 0);
    const total_market_value   = rows.reduce((acc, h) => acc + h.market_value, 0);

    const response: HoldingsResponse = {
      user_id: userId,
      total_unrealised_pnl: parseFloat(total_unrealised_pnl.toFixed(2)),
      total_market_value:   parseFloat(total_market_value.toFixed(2)),
      holdings: rows,
      cached: false,
      cache_ttl_seconds: CACHE_TTL_SECONDS,
    };

    // ── Step 4: Write to Redis with TTL ───────────────────
    // SETEX: atomic set + expiry — prevents race conditions
    await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(response));
    console.log(`[Cache SET]  ${key} (TTL ${CACHE_TTL_SECONDS}s)`);

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Invalidate a user's portfolio cache.
 * Call this after any trade execution or holding update.
 */
export async function invalidatePortfolioCache(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  try {
    const deleted = await redis.del(cacheKey.portfolio(userId));
    res.json({ invalidated: deleted > 0, key: cacheKey.portfolio(userId) });
  } catch (err) {
    next(err);
  }
}
