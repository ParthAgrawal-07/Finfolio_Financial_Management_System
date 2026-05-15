"""
FinFolio Analytics Microservice
================================
FastAPI service dedicated to heavy analytical queries using
PostgreSQL window functions.

Connects to a read-replica in production (same DB in dev) to
avoid putting analytical load on the primary write DB.

Endpoints:
  GET /analytics/revenue-running-total  — quarterly revenue + running total per company
  GET /analytics/profit-ranking         — rank companies by net_profit per quarter
  GET /health                           — health check
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

import databases
import redis.asyncio as aioredis
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import financial

load_dotenv()

# ── Database (asyncpg via `databases`) ────────────────────────
DATABASE_URL = os.environ["DATABASE_URL"]
database = databases.Database(DATABASE_URL)

# ── Redis (async) ─────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client: aioredis.Redis | None = None

CACHE_TTL = 300   # 5-minute cache for analytics (heavier queries)

# ── App lifespan (startup / shutdown) ─────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    global redis_client
    await database.connect()
    redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
    print("✅  Analytics: DB + Redis connected")
    # Inject shared resources via app state
    app.state.db = database
    app.state.redis = redis_client
    app.state.cache_ttl = CACHE_TTL
    yield
    await database.disconnect()
    await redis_client.aclose()
    print("🛑  Analytics: DB + Redis disconnected")


app = FastAPI(
    title="FinFolio Analytics Microservice",
    version="1.0.0",
    description="Window function analytics on Financial_Result and Portfolio data",
    lifespan=lifespan,
)

# ── CORS (allow Node.js gateway + dev frontend) ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Node.js gateway
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(financial.router, prefix="/analytics", tags=["Financial Analytics"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "finfolio-analytics"}
