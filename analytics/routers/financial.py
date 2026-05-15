"""
Financial Analytics Router
===========================
All routes perform read-heavy analytical queries using PostgreSQL
WINDOW FUNCTIONS. Results are cached in Redis for CACHE_TTL seconds
to prevent repeated full-table scans.

Window functions used:
  - SUM() OVER (PARTITION BY ... ORDER BY ...)  → running totals
  - RANK() OVER (PARTITION BY ... ORDER BY ...) → profit ranking
  - LAG()  OVER (PARTITION BY ... ORDER BY ...) → quarter-over-quarter growth
"""

import json
from typing import Any

from fastapi import APIRouter, Request

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# Helper: Redis cache wrapper
# ─────────────────────────────────────────────────────────────
async def cached_query(
    request: Request,
    cache_key: str,
    query: str,
    values: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Read-through cache pattern:
      1. Try Redis GET → parse and return if found
      2. On miss: execute SQL, write to Redis with TTL, return result
    """
    redis = request.app.state.redis
    db    = request.app.state.db
    ttl   = request.app.state.cache_ttl

    # ── Cache HIT ─────────────────────────────────────────
    raw = await redis.get(cache_key)
    if raw:
        return {"data": json.loads(raw), "cached": True}

    # ── Cache MISS → Query DB ─────────────────────────────
    rows = await db.fetch_all(query=query, values=values or {})
    data = [dict(row) for row in rows]

    # Serialize decimals to strings before caching
    json_safe = json.dumps(data, default=str)
    await redis.setex(cache_key, ttl, json_safe)

    return {"data": data, "cached": False}


# ─────────────────────────────────────────────────────────────
# 1. Revenue Running Total
#    Calculates cumulative (running) revenue per company,
#    ordered by quarter_end_date ascending.
#    Also computes quarter-over-quarter % growth via LAG().
# ─────────────────────────────────────────────────────────────
REVENUE_RUNNING_TOTAL_SQL = """
SELECT
    c.company_name,
    fr.Company_ID,
    fr.quarter_end_date,
    fr.revenue,
    fr.net_profit,
    fr.eps,

    -- Running total of revenue within each company (ordered by quarter)
    SUM(fr.revenue) OVER (
        PARTITION BY fr.Company_ID
        ORDER BY fr.quarter_end_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_revenue_total,

    -- Running total of net_profit within each company
    SUM(fr.net_profit) OVER (
        PARTITION BY fr.Company_ID
        ORDER BY fr.quarter_end_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_profit_total,

    -- Quarter-over-quarter revenue growth % using LAG
    ROUND(
        CASE
            WHEN LAG(fr.revenue) OVER (
                PARTITION BY fr.Company_ID
                ORDER BY fr.quarter_end_date
            ) IS NULL OR
            LAG(fr.revenue) OVER (
                PARTITION BY fr.Company_ID
                ORDER BY fr.quarter_end_date
            ) = 0 THEN NULL
            ELSE
                (fr.revenue - LAG(fr.revenue) OVER (
                    PARTITION BY fr.Company_ID
                    ORDER BY fr.quarter_end_date
                )) / ABS(LAG(fr.revenue) OVER (
                    PARTITION BY fr.Company_ID
                    ORDER BY fr.quarter_end_date
                )) * 100
        END, 2
    ) AS qoq_revenue_growth_pct,

    -- Row number within company (useful for pagination)
    ROW_NUMBER() OVER (
        PARTITION BY fr.Company_ID
        ORDER BY fr.quarter_end_date
    ) AS quarter_index

FROM Financial_Result fr
JOIN Company c ON fr.Company_ID = c.Company_ID
ORDER BY c.company_name, fr.quarter_end_date;
"""


@router.get("/revenue-running-total")
async def get_revenue_running_total(request: Request):
    """
    Returns quarterly revenue with:
    - Running cumulative revenue per company
    - Running cumulative net profit per company
    - Quarter-over-quarter growth percentage (LAG window function)
    """
    result = await cached_query(
        request,
        cache_key="analytics:revenue_running_total",
        query=REVENUE_RUNNING_TOTAL_SQL,
    )
    return {
        **result,
        "description": "Quarterly revenue + running totals (window functions)",
    }


# ─────────────────────────────────────────────────────────────
# 2. Profit Ranking
#    Ranks companies by net_profit within each quarter using
#    RANK() and DENSE_RANK() window functions.
# ─────────────────────────────────────────────────────────────
PROFIT_RANKING_SQL = """
SELECT
    c.company_name,
    fr.Company_ID,
    fr.quarter_end_date,
    fr.net_profit,
    fr.revenue,
    fr.eps,

    -- RANK: gaps in ranking when tied (1,1,3,4...)
    RANK() OVER (
        PARTITION BY fr.quarter_end_date
        ORDER BY fr.net_profit DESC
    ) AS profit_rank,

    -- DENSE_RANK: no gaps (1,1,2,3...)
    DENSE_RANK() OVER (
        PARTITION BY fr.quarter_end_date
        ORDER BY fr.net_profit DESC
    ) AS profit_dense_rank,

    -- Percentile rank (0 = lowest, 1 = highest)
    ROUND(
        PERCENT_RANK() OVER (
            PARTITION BY fr.quarter_end_date
            ORDER BY fr.net_profit
        )::NUMERIC, 4
    ) AS profit_percentile,

    -- Revenue rank within the same quarter
    RANK() OVER (
        PARTITION BY fr.quarter_end_date
        ORDER BY fr.revenue DESC
    ) AS revenue_rank

FROM Financial_Result fr
JOIN Company c ON fr.Company_ID = c.Company_ID
ORDER BY fr.quarter_end_date DESC, profit_rank;
"""


@router.get("/profit-ranking")
async def get_profit_ranking(request: Request):
    """
    Ranks all companies by net profit within each quarter.
    Uses RANK(), DENSE_RANK(), and PERCENT_RANK() window functions.
    """
    result = await cached_query(
        request,
        cache_key="analytics:profit_ranking",
        query=PROFIT_RANKING_SQL,
    )
    return {
        **result,
        "description": "Per-quarter company profit ranking using RANK() window function",
    }


# ─────────────────────────────────────────────────────────────
# 3. PnL Summary for a specific user's portfolio
#    Aggregates unrealised PnL across all holdings using
#    the latest Market_Price via a window function.
# ─────────────────────────────────────────────────────────────
PNL_SUMMARY_SQL = """
WITH latest_prices AS (
    SELECT
        Security_ID,
        close_price,
        trade_date,
        -- Pick only the most recent price per security
        ROW_NUMBER() OVER (
            PARTITION BY Security_ID
            ORDER BY trade_date DESC
        ) AS rn
    FROM Market_Price
),
holdings_with_pnl AS (
    SELECT
        p.User_ID,
        s.ticker_symbol,
        s.name                             AS security_name,
        s.sector,
        ph.quantity_owned,
        ph.average_buy_price,
        COALESCE(lp.close_price, ph.average_buy_price) AS current_price,
        (ph.quantity_owned * COALESCE(lp.close_price, ph.average_buy_price)) AS market_value,
        ((COALESCE(lp.close_price, ph.average_buy_price) - ph.average_buy_price)
            * ph.quantity_owned) AS unrealised_pnl,
        lp.trade_date AS price_date
    FROM Portfolio_Holding ph
    JOIN Portfolio   p  ON ph.Portfolio_ID = p.Portfolio_ID
    JOIN Security    s  ON ph.Security_ID  = s.Security_ID
    LEFT JOIN latest_prices lp ON lp.Security_ID = s.Security_ID AND lp.rn = 1
    WHERE p.User_ID = :user_id
)
SELECT
    ticker_symbol,
    security_name,
    sector,
    quantity_owned,
    average_buy_price,
    current_price,
    market_value,
    unrealised_pnl,
    price_date,
    -- Running PnL across holdings (ordered by market_value desc)
    SUM(unrealised_pnl) OVER (
        ORDER BY market_value DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_pnl_total,
    SUM(market_value) OVER () AS total_market_value,
    SUM(unrealised_pnl) OVER () AS total_unrealised_pnl
FROM holdings_with_pnl
ORDER BY unrealised_pnl DESC;
"""


@router.get("/pnl-summary/{user_id}")
async def get_pnl_summary(user_id: str, request: Request):
    """
    Per-user PnL summary using:
    - ROW_NUMBER() OVER (...) to get latest market prices
    - SUM() OVER (...) for running PnL totals and grand totals
    """
    result = await cached_query(
        request,
        cache_key=f"analytics:pnl_summary:{user_id}",
        query=PNL_SUMMARY_SQL,
        values={"user_id": user_id},
    )
    return {
        **result,
        "user_id": user_id,
        "description": "User portfolio PnL with running totals (window functions)",
    }
