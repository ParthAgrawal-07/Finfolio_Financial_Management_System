/**
 * AnalyticsPage — Revenue trends, window function data table,
 * and profit ranking from the FastAPI analytics service.
 */
import { useRevenueData, formatCurrency } from "../../hooks/useMockData";
import { RevenueChart } from "../RevenueChart";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const COMPANY_COLORS: Record<string, string> = {
  "Apple Inc.":     "#6366f1",
  "Microsoft Corp.":"#06b6d4",
  "Alphabet Inc.":  "#10b981",
  "NVIDIA Corp.":   "#f59e0b",
  "Amazon.com":     "#f43f5e",
  "Tesla Inc.":     "#8b5cf6",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#0f1929",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export function AnalyticsPage() {
  const { data: revenue, loading } = useRevenueData();

  // Build pivot for multi-line chart: { quarter: "Q1 2022", "Apple Inc.": 89000, ... }
  const companies = [...new Set(revenue.map(r => r.company_name))];
  const quarters  = [...new Set(revenue.map(r => r.quarter_end_date))].sort();
  const pivotData = quarters.map(q => {
    const row: Record<string, string | number> = { quarter: q.slice(0, 7) };
    companies.forEach(co => {
      const found = revenue.find(r => r.quarter_end_date === q && r.company_name === co);
      if (found) row[co] = Math.round(found.revenue / 1000); // in $K
    });
    return row;
  });

  // Summary stats
  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const totalProfit  = revenue.reduce((s, r) => s + r.net_profit, 0);
  const avgMargin    = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";
  const bestQuarter  = revenue.reduce((best, r) => r.revenue > (best?.revenue ?? 0) ? r : best, revenue[0]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Financial Analytics</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent-green/20 text-accent-green flex items-center gap-1">
              <Activity size={12} /> LIVE
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Window-function powered quarterly revenue and profit analysis</p>
        </div>
      </div>

      {/* ── KPI Summary ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue (All Periods)", value: formatCurrency(totalRevenue, true), icon: <TrendingUp size={16} />, color: "text-brand-400", bg: "bg-brand-500/15" },
          { label: "Total Net Profit", value: formatCurrency(totalProfit, true), icon: <TrendingUp size={16} />, color: "text-accent-green", bg: "bg-accent-green/15" },
          { label: "Avg. Profit Margin", value: `${avgMargin}%`, icon: <Activity size={16} />, color: "text-accent-cyan", bg: "bg-accent-cyan/15" },
        ].map(card => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <span className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", card.bg, card.color)}>{card.icon}</span>
            </div>
            <p className={clsx("text-2xl font-bold font-mono", card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue Trend Chart (existing component) ──── */}
      <RevenueChart data={revenue} loading={loading} />

      {/* ── Multi-company Revenue Comparison ─────────── */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-base mb-1">Revenue Comparison (All Companies)</h2>
        <p className="text-xs text-slate-400 mb-5">Quarterly revenue in $K — Powered by PostgreSQL Window Functions</p>
        {loading ? <div className="skeleton h-64 w-full rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={pivotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="quarter" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `$${v}K`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v}K`, ""]} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              {companies.map(co => (
                <Line key={co} type="monotone" dataKey={co} stroke={COMPANY_COLORS[co] ?? "#6366f1"}
                  strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Raw Data Table ───────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-base mb-1">Raw Analytical Data</h2>
        <p className="text-xs text-slate-400 mb-5">Quarterly data including running totals from SQL window functions</p>
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-10 w-full rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-lg">Company</th>
                  <th className="py-3 px-4">Quarter</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">QoQ Growth</th>
                  <th className="py-3 px-4 text-right rounded-tr-lg">Running Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {revenue.map((row) => {
                  const isPos = (row.qoq_revenue_growth_pct ?? 0) >= 0;
                  return (
                    <tr key={`${row.company_name}-${row.quarter_end_date}`} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-white whitespace-nowrap">{row.company_name}</td>
                      <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap">{row.quarter_end_date}</td>
                      <td className="py-3 px-4 text-sm text-right text-slate-200 font-mono whitespace-nowrap">{formatCurrency(row.revenue)}</td>
                      <td className="py-3 px-4 text-sm text-right text-accent-green font-mono whitespace-nowrap">{formatCurrency(row.net_profit)}</td>
                      <td className="py-3 px-4 text-sm text-right font-mono whitespace-nowrap">
                        {row.qoq_revenue_growth_pct !== null ? (
                          <span className={clsx("flex items-center justify-end gap-1", isPos ? "text-accent-green" : "text-accent-red")}>
                            {isPos ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                            {isPos ? "+" : ""}{row.qoq_revenue_growth_pct}%
                          </span>
                        ) : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-brand-400 whitespace-nowrap">{formatCurrency(row.running_revenue_total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
