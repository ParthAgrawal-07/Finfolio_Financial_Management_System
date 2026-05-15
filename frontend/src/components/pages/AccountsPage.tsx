/**
 * AccountsPage — Bank accounts overview, fixed deposit tracker,
 * and total wealth summary.
 */
import { useAccounts, useFixedDeposits, formatCurrency } from "../../hooks/useMockData";
import { Wallet, Lock, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { clsx } from "clsx";

const ACCOUNT_ICONS: Record<string, string> = {
  Trading: "💹", Savings: "🏦", Retirement: "🔒", NRI: "🌍",
};

const ACCOUNT_COLORS: Record<string, string> = {
  Trading: "brand", Savings: "accent-cyan", Retirement: "accent-green", NRI: "accent-amber",
};

export function AccountsPage({ userId }: { userId: string }) {
  const { data: accounts, loading: aLoading } = useAccounts(userId);
  const { data: fds,      loading: fLoading } = useFixedDeposits(userId);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalFD      = fds.filter(f => f.status === "Active").reduce((s, f) => s + f.amount, 0);
  const netWorth     = totalBalance + totalFD;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Accounts & Deposits</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your bank accounts and fixed deposits</p>
      </div>

      {/* ── Net Worth Summary ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Account Balance", value: formatCurrency(totalBalance), icon: <Wallet size={16}/>, color: "text-brand-400", bg: "bg-brand-500/15" },
          { label: "Active Fixed Deposits", value: formatCurrency(totalFD),      icon: <Lock size={16}/>,   color: "text-accent-green", bg: "bg-accent-green/15" },
          { label: "Total Net Worth",       value: formatCurrency(netWorth),     icon: <TrendingUp size={16}/>, color: "text-accent-cyan", bg: "bg-accent-cyan/15" },
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

      {/* ── Accounts Grid ─────────────────────────────── */}
      <div>
        <h2 className="text-white font-semibold text-base mb-4">Bank Accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aLoading ? [...Array(4)].map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl" />) :
            accounts.map(acc => (
              <div key={acc.account_id} className="glass-card p-5 hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{ACCOUNT_ICONS[acc.account_type] ?? "💳"}</span>
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", acc.status === "Active" ? "bg-accent-green/15 text-accent-green" : "bg-slate-500/15 text-slate-400")}>
                    {acc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{acc.account_type} Account</p>
                <p className="text-xl font-bold text-white font-mono">{formatCurrency(acc.balance)}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
                  <span className="text-xs text-slate-500">{acc.account_id}</span>
                  {acc.interest_rate > 0 && (
                    <span className="text-xs text-accent-green">{acc.interest_rate}% p.a.</span>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Fixed Deposits Table ──────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-base mb-1">Fixed Deposits</h2>
        <p className="text-xs text-slate-400 mb-5">Active and matured fixed deposit investments</p>
        {fLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-lg">FD ID</th>
                  <th className="py-3 px-4 text-right">Principal</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Maturity Date</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fds.map(fd => (
                  <tr key={fd.fd_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-white whitespace-nowrap">{fd.fd_id}</td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-white text-sm whitespace-nowrap">{formatCurrency(fd.amount)}</td>
                    <td className="py-4 px-4 text-right text-sm text-accent-green font-mono whitespace-nowrap">{fd.interest_rate}%</td>
                    <td className="py-4 px-4 text-sm text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Clock size={12}/>{fd.start_date}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400 whitespace-nowrap">{fd.maturity_date}</td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit mx-auto",
                        fd.status === "Active" ? "bg-accent-green/15 text-accent-green" : "bg-slate-500/20 text-slate-400"
                      )}>
                        {fd.status === "Active" ? <><CheckCircle2 size={10}/> Active</> : "Matured"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
