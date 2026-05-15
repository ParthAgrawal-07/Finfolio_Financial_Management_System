/**
 * Dashboard Component — Main View
 * ─────────────────────────────────────────────────────────────
 * Orchestrates all dashboard sub-components:
 *   1. PnL Cards (Node.js API + Redis cache)
 *   2. Revenue Trend Chart (FastAPI analytics microservice)
 *   3. Holdings Table (Node.js API + Redis cache)
 *   4. Transaction Feed (Node.js API)
 *
 * Data flows:
 *   Frontend → Node.js Gateway → Redis (cache hit) → response
 *                              → PostgreSQL (cache miss) → Redis → response
 *   Frontend → Node.js Gateway → FastAPI → PostgreSQL (window queries)
 */

import { useState, useCallback } from "react";
import { PnLCard }          from "./PnLCard";
import { RevenueChart }     from "./RevenueChart";
import { TransactionFeed }  from "./TransactionFeed";
import { HoldingsTable }    from "./HoldingsTable";
import { usePortfolioData, useRevenueData, useTransactions } from "../hooks/useMockData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "../hooks/useMockData";

// Demo user ID — would come from auth context in production
const DEMO_USER_ID = "U001";

// Sector allocation pie chart
const SECTOR_COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6"];

interface DashboardProps {
  refreshKey?: number;
}

export function Dashboard({ refreshKey = 0 }: DashboardProps) {
  const { data: portfolio, loading: pLoading } = usePortfolioData(DEMO_USER_ID);
  const { data: revenue,   loading: rLoading } = useRevenueData();
  const { data: txns,      loading: tLoading } = useTransactions(DEMO_USER_ID);

  // Compute sector allocation from holdings
  const sectorData = portfolio?.holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.sector] = (acc[h.sector] ?? 0) + h.market_value;
    return acc;
  }, {}) ?? {};

  const pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value }));

  return (
    <main className="hero-gradient min-h-screen">
      {/* ── Section: KPI Cards ──────────────────────────────── */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <PnLCard
          totalPnL={portfolio?.total_unrealised_pnl ?? 0}
          totalMarketValue={portfolio?.total_market_value ?? 0}
          cached={portfolio?.cached ?? false}
          loading={pLoading}
        />
      </section>

      {/* ── Section: Charts Row ─────────────────────────────── */}
      <section aria-label="Analytics Charts" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart: spans 2/3 width */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} loading={rLoading} />
        </div>

        {/* Sector Allocation Pie: spans 1/3 */}
        <div id="sector-allocation-chart" className="glass-card p-6 animate-fade-in-up stagger-3">
          <h2 className="text-white font-semibold text-base mb-1">Sector Allocation</h2>
          <p className="text-slate-400 text-xs mb-5">Portfolio distribution by sector</p>
          {pLoading ? (
            <div className="skeleton h-48 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={SECTOR_COLORS[idx % SECTOR_COLORS.length]}
                      opacity={0.85}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value, true), "Value"]}
                  contentStyle={{
                    backgroundColor: "#172033",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Section: Table + Feed ───────────────────────────── */}
      <section aria-label="Holdings and Transactions" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Holdings Table: 2/3 */}
        <div className="lg:col-span-2">
          <HoldingsTable holdings={portfolio?.holdings ?? []} loading={pLoading} />
        </div>

        {/* Transaction Feed: 1/3 */}
        <div className="lg:col-span-1">
          <TransactionFeed transactions={txns ?? []} loading={tLoading} />
        </div>
      </section>
    </main>
  );
}
