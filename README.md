<div align="center">

<img src="https://img.shields.io/badge/FinFolio-Wealth%20Management-6366f1?style=for-the-badge&logo=trending-up&logoColor=white" alt="FinFolio" />

# 💼 FinFolio — Wealth Management Platform

### *A full-stack, containerized wealth management system with real-time analytics, Redis caching, and a stunning glassmorphism UI*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

<br/>

</div>

---

## ✨ What is FinFolio?

**FinFolio** is a production-grade wealth management dashboard built as a **DBMS course project**. It demonstrates advanced database concepts — window functions, indexing, caching, and normalized schemas — wrapped in a beautiful, fully containerized microservices application.

> 🎓 **Academic Focus:** Advanced SQL window functions (`RANK()`, `SUM() OVER`, `ROW_NUMBER()`), Redis read-through caching, PostgreSQL normalized schema design, and multi-container Docker orchestration.

---

## 🖥️ Live Features

| Tab | What it shows |
|-----|---------------|
| 📊 **Dashboard** | Total Portfolio Value, Unrealized P&L, Revenue Trend Chart, Sector Allocation Pie, Holdings Table, Transaction Feed |
| 💼 **Portfolio** | Full holdings breakdown with sector pie chart & P&L bar chart per stock |
| 📈 **Analytics** | Window function data — quarterly revenue, running totals, QoQ growth %, multi-company trend comparison |
| 💸 **Transactions** | Filterable transaction history with net cash flow summary |
| 🌍 **Markets** | Stock screener with top gainers/losers and live price table |
| 🏦 **Accounts** | Bank accounts overview + Fixed Deposit tracker with net worth summary |
| 🔐 **Login** | Glassmorphism login page with 3 demo user accounts |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Port 5173)                    │
│              React + Vite + TypeScript + Tailwind           │
└────────────────────────┬────────────────────────────────────┘
                         │  Vite Proxy
          ┌──────────────┴──────────────────┐
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│  Node.js Gateway │              │  FastAPI Analytics│
│  Express + TS    │              │  Python + uvicorn │
│  Port 3001       │              │  Port 8000        │
└────────┬─────────┘              └────────┬──────────┘
         │                                 │
         ▼          ┌──────────┐           │
    ┌─────────┐     │  Redis   │           │
    │  Cache  │◄────│  Layer   │           │
    │  Hit?   │     │  Port 6379│          │
    └────┬────┘     └──────────┘           │
         │                                 │
         └──────────────┬──────────────────┘
                        ▼
              ┌──────────────────┐
              │   PostgreSQL 16  │
              │   Port 5432      │
              │   Fully seeded   │
              └──────────────────┘
```

### ⚡ Redis Caching Strategy

```
portfolio:holdings:<userId>          →  TTL: 60s   (per-user)
analytics:revenue_running_total      →  TTL: 300s
analytics:profit_ranking             →  TTL: 300s
```
Cache invalidated on `DELETE /api/v1/portfolio/:userId/cache`

---

## 🚀 Quick Start (Docker — Recommended)

> **One command spins up all 5 services.**

### Prerequisites
- [Docker Desktop](https://docker.com/products/docker-desktop) installed and running

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ParthAgrawal-07/Finfolio_Financial_Management_System.git
cd Finfolio_Financial_Management_System

# 2. Copy environment variables
cp .env.example .env

# 3. Launch all services
docker compose up --build
```

🎉 That's it! Open your browser:

| Service | URL |
|---------|-----|
| 🌐 **Frontend Dashboard** | http://localhost:5173 |
| ⚙️ **API Gateway** | http://localhost:3001 |
| 📊 **FastAPI Docs (Swagger)** | http://localhost:8000/docs |
| 🗄️ **PostgreSQL** | localhost:5432 |

### 🔑 Demo Login Credentials

| User | Email | Password |
|------|-------|----------|
| John Doe | john@finfolio.com | `demo123` |
| Rahul Mehta | rahul@finfolio.com | `demo123` |
| Ananya Singh | ananya@finfolio.com | `demo123` |

---

## 💻 Local Development (Without Docker)

<details>
<summary><b>▶ Backend (Node.js)</b></summary>

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```
</details>

<details>
<summary><b>▶ Analytics Microservice (FastAPI)</b></summary>

```bash
cd analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Swagger UI at http://localhost:8000/docs
```
</details>

<details>
<summary><b>▶ Frontend (React + Vite)</b></summary>

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```
</details>

---

## 📡 API Reference

### Node.js Backend — `/api/v1`

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| `GET` | `/portfolio/:userId/holdings` | Holdings + Unrealized P&L | ✅ Redis 60s |
| `DELETE` | `/portfolio/:userId/cache` | Invalidate portfolio cache | — |
| `GET` | `/transactions/:userId` | Paginated transactions | — |
| `POST` | `/transactions` | Create new transaction | — |
| `GET` | `/users/:userId` | User profile | — |

### FastAPI Analytics — `/analytics`

| Method | Endpoint | SQL Concept Used |
|--------|----------|-----------------|
| `GET` | `/analytics/revenue-running-total` | `SUM() OVER (PARTITION BY ... ORDER BY ...)` |
| `GET` | `/analytics/profit-ranking` | `RANK() OVER (PARTITION BY quarter ...)` |
| `GET` | `/analytics/pnl-summary/:userId` | `ROW_NUMBER()` + latest market prices |

---

## 🗄️ Database Schema

The PostgreSQL schema is fully normalized across **22 tables**:

```
User · Account · Transaction · Portfolio · Portfolio_Holding
Security · Market_Price · Executed_Trade · Financial_Result
Company · Fixed_Deposit · Review · Nominee · KYC_Document
Insurance_Policy · Loan · Tax_Filing · Notification
Budget · Goal · Advisory_Service · Watchlist
```

> Schema and seed data are auto-applied on first Docker startup via `db/init.sql`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| **API Gateway** | Node.js 20, Express, TypeScript, pg (node-postgres) |
| **Analytics Service** | Python 3.12, FastAPI, asyncpg, databases |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Project Structure

```
finfolio/
├── 🎨 frontend/          React + Vite app
│   └── src/
│       ├── components/   UI components + 6 page views
│       └── hooks/        Data hooks (mock & real API)
├── ⚙️  backend/           Node.js API Gateway
│   └── src/
│       ├── controllers/  Business logic + Redis caching
│       └── routes/       Express routers
├── 📊 analytics/         FastAPI microservice
│   └── routers/          Window function endpoints
├── 🗄️  db/
│   └── init.sql          Full schema + seed data (22 tables)
├── 🐳 docker-compose.yml  5-service orchestration
├── 📋 .env.example        Environment template
└── 📝 README.md
```

---

## 👨‍💻 Author

**Parth Agrawal**  
DBMS Course Project · 2026

[![GitHub](https://img.shields.io/badge/GitHub-ParthAgrawal--07-181717?style=flat-square&logo=github)](https://github.com/ParthAgrawal-07)

---

<div align="center">
  <sub>Built with ❤️ using React · Node.js · FastAPI · PostgreSQL · Redis · Docker</sub>
</div>
