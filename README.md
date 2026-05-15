# FinFolio 💼

> A comprehensive wealth management and portfolio tracking application built with a modern microservices architecture.

## Architecture

```
finfolio/
├── frontend/      React + Vite + TypeScript + Tailwind CSS   (port 5173)
├── backend/       Node.js + Express + TypeScript             (port 3001)
├── analytics/     FastAPI + Python                           (port 8000)
├── db/            PostgreSQL init scripts
└── docker-compose.yml
```

### Service Communication
```
Browser → Vite Proxy → Node.js API Gateway (3001)
                      ├── Redis (cache hit) → response
                      ├── PostgreSQL (cache miss) → Redis → response
                      └── FastAPI Analytics (8000) → PostgreSQL window queries
```

## Quick Start

### 1. Prerequisites
- Docker Desktop
- Node.js 20+ (for local dev without Docker)
- Python 3.12+ (for local analytics dev)

### 2. Setup
```bash
# Clone and navigate
cd finfolio

# Copy env file
cp .env.example .env

# Add your DDL + seed data to db/init.sql

# Spin up all services
docker compose up --build
```

Access:
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3001
- **FastAPI Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### 3. Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Analytics:**
```bash
cd analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Reference

### Node.js Backend (`/api/v1`)
| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/portfolio/:userId/holdings` | Portfolio holdings + PnL | Redis 60s |
| DELETE | `/portfolio/:userId/cache` | Invalidate cache | — |
| GET | `/transactions/:userId` | Paginated transactions | — |
| POST | `/transactions` | Create transaction | — |
| GET | `/users/:userId` | User profile | — |

### FastAPI Analytics (`/analytics`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/revenue-running-total` | Quarterly revenue + SUM OVER window |
| GET | `/analytics/profit-ranking` | RANK() per quarter |
| GET | `/analytics/pnl-summary/:userId` | ROW_NUMBER() latest prices + running PnL |

## Redis Caching Strategy

```
Portfolio holdings → key: "portfolio:holdings:<userId>"  TTL: 60s
Analytics revenue  → key: "analytics:revenue_running_total"  TTL: 300s
Analytics ranking  → key: "analytics:profit_ranking"  TTL: 300s
```

Cache is invalidated on `DELETE /api/v1/portfolio/:userId/cache`.

## Database Tables Used
`User` · `Account` · `Transaction` · `Portfolio` · `Portfolio_Holding` · `Security` · `Market_Price` · `Financial_Result` · `Company`
