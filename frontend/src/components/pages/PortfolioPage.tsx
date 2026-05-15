/**
 * PortfolioPage — Full portfolio breakdown with sector pie, P&L summary,
 * and the complete holdings table.
 */
import { PnLCard } from "../PnLCard";
import { HoldingsTable } from "../HoldingsTable";
import { usePortfolioData, formatCurrency } from "../../hooks/useMockData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const SECTOR_COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6","#ec4899"];

const TOOLTIP_STYLE = {
  backgroundColor: "#0f1929",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export function PortfolioPage({ userId }: { userId: string }) {
  const { data: portfolio, loading } = usePortfolioData(userId);

  const holdings = portfolio?.holdings ?? [];

  const sectorMap = holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.sector] = (acc[h.sector] ?? 0) + h.market_value;
    return acc;
  }, {});
  const pieData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

  const barData = holdings
    .slice(0, 8)
    .map(h => ({ name: h.ticker_symbol, pnl: h.unrealised_pnl, fill: h.unrealised_pnl >= 0 ? "#10b981" : "#f43f5e" }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Your complete position breakdown and sector distribution</p>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PnLCard
          totalPnL={portfolio?.total_unrealised_pnl ?? 0}
          totalMarketValue={portfolio?.total_market_value ?? 0}
          cached={portfolio?.cached ?? false}
          loading={loading}
        />
      </section>

      {/* ── Charts Row ───────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector Pie */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-base mb-1">Sector Allocation</h2>
          <p className="text-slate-400 text-xs mb-4">Portfolio distribution by sector</p>
          {loading ? <div className="skeleton h-52 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => <Cell key={idx} fill={SECTOR_COLORS[idx % SECTOR_COLORS.length]} opacity={0.85} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [formatCurrency(v, true), "Value"]} contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PnL Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-base mb-1">Unrealized P&L by Stock</h2>
          <p className="text-slate-400 text-xs mb-4">Green = profit, Red = loss</p>
          {loading ? <div className="skeleton h-52 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), "P&L"]} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="pnl" radius={[4,4,0,0]}>
                  {barData.map((entry, idx) => <Cell key={idx} fill={entry.fill} opacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Full Holdings Table ───────────────────────────── */}
      <section>
        <HoldingsTable holdings={holdings} loading={loading} />
      </section>
    </div>
  );
}
