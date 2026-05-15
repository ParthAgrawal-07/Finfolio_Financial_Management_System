/**
 * Header Component
 * Top bar with greeting, date, refresh, and notifications
 */

import { RefreshCw, Bell, Search } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
  user?: { name: string; email: string } | null;
}

export function Header({ onRefresh, loading, user }: HeaderProps) {
  const [searching, setSearching] = useState(false);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <header
      className="fixed right-0 top-0 z-40 flex items-center justify-between px-8 py-0 border-b border-white/8 bg-surface-950/80 backdrop-blur-xl"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--header-height)",
      }}
    >
      {/* Left: Greeting */}
      <div>
        <h1 className="text-white font-semibold text-base">
          {greeting}, <span className="text-brand-400">{user?.name.split(" ")[0] ?? "John"}</span> 👋
        </h1>
        <p className="text-slate-500 text-xs">
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <button
            id="header-search-btn"
            onClick={() => setSearching(!searching)}
            className="btn-ghost flex items-center gap-2"
          >
            <Search size={16} />
            <span className="hidden sm:inline text-sm text-slate-500">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-400">⌘K</kbd>
          </button>
        </div>

        {/* Refresh */}
        <button
          id="header-refresh-btn"
          onClick={onRefresh}
          className="btn-ghost flex items-center gap-2"
          title="Refresh data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-brand-400" : ""} />
        </button>

        {/* Notifications */}
        <button id="header-notifications-btn" className="btn-ghost relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-red" />
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-accent-green text-xs font-medium">Live</span>
        </div>
      </div>
    </header>
  );
}
