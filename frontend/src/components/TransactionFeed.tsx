/**
 * Transaction Feed Component
 * Real-time feed of recent deposit/withdrawal transactions.
 */

import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { Transaction, formatCurrency } from "../hooks/useMockData";
import { clsx } from "clsx";

interface TransactionFeedProps {
  transactions: Transaction[];
  loading: boolean;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today, " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransactionFeed({ transactions, loading }: TransactionFeedProps) {
  if (loading) {
    return (
      <div id="transaction-feed" className="glass-card p-6">
        <div className="skeleton h-5 w-40 mb-5" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="transaction-feed" className="glass-card p-6 animate-fade-in-up stagger-3">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold text-base">Recent Transactions</h2>
        <button id="txn-view-all" className="text-brand-400 text-xs hover:text-brand-300 font-medium">
          View All →
        </button>
      </div>

      <div className="space-y-1">
        {transactions.map((txn, i) => {
          const isDeposit = txn.txn_type === "Deposit";
          return (
            <div
              key={txn.transaction_id}
              id={`txn-${txn.transaction_id}`}
              className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Icon */}
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  isDeposit ? "bg-accent-green/15" : "bg-accent-red/15"
                )}
              >
                {isDeposit
                  ? <ArrowDownLeft size={18} className="text-accent-green" />
                  : <ArrowUpRight  size={18} className="text-accent-red" />
                }
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{txn.txn_type}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {formatTimestamp(txn.timestamp)}
                  <span className="text-slate-600">·</span>
                  <span className="badge-neutral !py-0 !text-[10px]">{txn.account_type}</span>
                </p>
              </div>

              {/* Amount */}
              <span
                className={clsx(
                  "font-mono font-semibold text-sm flex-shrink-0",
                  isDeposit ? "text-accent-green" : "text-accent-red"
                )}
              >
                {isDeposit ? "+" : "-"}{formatCurrency(txn.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
