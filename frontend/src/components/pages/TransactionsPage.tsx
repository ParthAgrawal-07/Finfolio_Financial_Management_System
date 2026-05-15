/**
 * TransactionsPage — Full transaction history with filter,
 * summary stats, and detailed table.
 */
import { useState } from "react";
import { useTransactions, formatCurrency } from "../../hooks/useMockData";
import { ArrowDownLeft, ArrowUpRight, Clock, Filter } from "lucide-react";
import { clsx } from "clsx";

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function TransactionsPage({ userId }: { userId: string }) {
  const { data: txns, loading } = useTransactions(userId);
  const [filter, setFilter] = useState<"All" | "Deposit" | "Withdrawal">("All");
  const [accountFilter, setAccountFilter] = useState("All");

  const accounts = ["All", ...new Set(txns.map(t => t.account_type))];
  const filtered = txns.filter(t =>
    (filter === "All" || t.txn_type === filter) &&
    (accountFilter === "All" || t.account_type === accountFilter)
  );

  const totalDeposits    = txns.filter(t => t.txn_type === "Deposit").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = txns.filter(t => t.txn_type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const netFlow          = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transaction History</h1>
        <p className="text-slate-400 text-sm mt-1">Complete log of all deposits and withdrawals</p>
      </div>

      {/* ── Summary KPIs ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deposits</span>
            <span className="w-8 h-8 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center"><ArrowDownLeft size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-accent-green font-mono">{formatCurrency(totalDeposits)}</p>
          <p className="text-slate-400 text-sm mt-1">{txns.filter(t => t.txn_type === "Deposit").length} transactions</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Withdrawals</span>
            <span className="w-8 h-8 rounded-xl bg-accent-red/15 text-accent-red flex items-center justify-center"><ArrowUpRight size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-accent-red font-mono">{formatCurrency(totalWithdrawals)}</p>
          <p className="text-slate-400 text-sm mt-1">{txns.filter(t => t.txn_type === "Withdrawal").length} transactions</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
            <span className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", netFlow >= 0 ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red")}>
              {netFlow >= 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            </span>
          </div>
          <p className={clsx("text-2xl font-bold font-mono", netFlow >= 0 ? "text-accent-green" : "text-accent-red")}>
            {netFlow >= 0 ? "+" : ""}{formatCurrency(netFlow)}
          </p>
          <p className="text-slate-400 text-sm mt-1">Net inflow this period</p>
        </div>
      </div>

      {/* ── Filters & Table ───────────────────────────── */}
      <div className="glass-card p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Filter size={14} className="text-slate-400" />
          <div className="flex gap-2">
            {(["All","Deposit","Withdrawal"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === f
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}
              className="bg-surface-800 border border-white/10 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500/50">
              {accounts.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-lg">Type</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(txn => {
                  const isDeposit = txn.txn_type === "Deposit";
                  return (
                    <tr key={txn.transaction_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", isDeposit ? "bg-accent-green/15" : "bg-accent-red/15")}>
                            {isDeposit ? <ArrowDownLeft size={15} className="text-accent-green" /> : <ArrowUpRight size={15} className="text-accent-red" />}
                          </div>
                          <span className="text-sm font-medium text-white">{txn.txn_type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 font-mono whitespace-nowrap">{txn.transaction_id}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="badge-neutral">{txn.account_type}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock size={13} />{formatTimestamp(txn.timestamp)}</div>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className={clsx("font-mono font-semibold text-sm", isDeposit ? "text-accent-green" : "text-accent-red")}>
                          {isDeposit ? "+" : "-"}{formatCurrency(txn.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-500 py-10">No transactions match your filter.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
