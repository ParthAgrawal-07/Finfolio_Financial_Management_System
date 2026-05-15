/**
 * Revenue Chart Component
 * ─────────────────────────────────────────────────────────────
 * Visualizes corporate quarterly revenue with:
 *   - Area chart for revenue trend lines (per company)
 *   - Bar chart for running revenue totals
 *   - Company filter tabs
 *
 * Data comes from FastAPI /analytics/revenue-running-total
 * which uses SQL window functions (SUM OVER, LAG OVER).
 */

import { useState, useMemo } from "react";
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { RevenueDataPoint, formatCurrency } from "../hooks/useMockData";
import { BarChart3, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading: boolean;
}

const COMPANY_COLORS: Record<string, string> = {
  "Apple Inc.":      "#6366f1",
  "Microsoft Corp.": "#06b6d4",
  "Alphabet Inc.":   "#f59e0b",
  "NVIDIA Corp.":    "#10b981",
  "Amazon.com":      "#f43f5e",
  "Tesla Inc.":      "#8b5cf6",
};

const CHART_MODES = ["Revenue Trend", "Running Total"] as const;
type ChartMode = typeof CHART_MODES[number];

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 min-w-[200px] !border-white/15">
      <p className="text-slate-300 text-xs font-semibold mb-2">
        Q ending {new Date(label).toLocaleDateString("en-US", { year:"numeric", month:"short" })}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300">{p.name}</span>
          </span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>
            {formatCurrency(p.value, true)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const [mode, setMode] = useState<ChartMode>("Revenue Trend");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  const companies = useMemo(() => [...new Set(data.map((d) => d.company_name))], [data]);
  const quarters  = useMemo(() => [...new Set(data.map((d) => d.quarter_end_date))].sort(), [data]);

  // Pivot data by quarter for Recharts (one object per quarter, keyed by company)
  const chartData = useMemo(() => {
    return quarters.map((q) => {
      const row: Record<string, any> = { quarter: q };
      companies.forEach((co) => {
        const point = data.find((d) => d.quarter_end_date === q && d.company_name === co);
        if (point) {
          row[co] = mode === "Revenue Trend" ? point.revenue : point.running_revenue_total;
        }
      });
      return row;
    });
  }, [data, quarters, companies, mode]);

  const visibleCompanies = selectedCompany === "all" ? companies : [selectedCompany];

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="skeleton h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div id="revenue-chart" className="glass-card p-6 animate-fade-in-up stagger-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <BarChart3 size={18} className="text-brand-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">Corporate Revenue Analytics</h2>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <TrendingUp size={11} />
              Powered by FastAPI window functions (SUM OVER, LAG OVER)
            </p>
          </div>
        </div>

        {/* Chart mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {CHART_MODES.map((m) => (
            <button
              key={m}
              id={`chart-mode-${m.replace(" ", "-").toLowerCase()}`}
              onClick={() => setMode(m)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                mode === m
                  ? "bg-brand-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Company filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          id="filter-all"
          onClick={() => setSelectedCompany("all")}
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium transition-all",
            selectedCompany === "all"
              ? "bg-brand-500/30 text-brand-300 border border-brand-500/40"
              : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
          )}
        >
          All Companies
        </button>
        {companies.map((co) => (
          <button
            key={co}
            id={`filter-${co.replace(/\s/g, "-").toLowerCase()}`}
            onClick={() => setSelectedCompany(co === selectedCompany ? "all" : co)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              selectedCompany === co
                ? "text-white border-white/30"
                : "bg-white/5 text-slate-400 hover:text-white border-white/10"
            )}
            style={selectedCompany === co
              ? { backgroundColor: COMPANY_COLORS[co] + "33", borderColor: COMPANY_COLORS[co] + "66", color: COMPANY_COLORS[co] }
              : {}
            }
          >
            {co.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <defs>
            {visibleCompanies.map((co) => (
              <linearGradient key={co} id={`grad-${co}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COMPANY_COLORS[co]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COMPANY_COLORS[co]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

          <XAxis
            dataKey="quarter"
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("en-US", { month:"short", year:"2-digit" })
            }
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px", color: "#94a3b8" }}
            formatter={(value) => <span style={{ color: COMPANY_COLORS[value] ?? "#94a3b8" }}>{value}</span>}
          />

          {mode === "Revenue Trend"
            ? visibleCompanies.map((co) => (
                <Area
                  key={co}
                  type="monotone"
                  dataKey={co}
                  name={co}
                  stroke={COMPANY_COLORS[co]}
                  strokeWidth={2}
                  fill={`url(#grad-${co})`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))
            : visibleCompanies.map((co) => (
                <Bar
                  key={co}
                  dataKey={co}
                  name={co}
                  fill={COMPANY_COLORS[co]}
                  opacity={0.8}
                  radius={[3, 3, 0, 0]}
                />
              ))
          }
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
