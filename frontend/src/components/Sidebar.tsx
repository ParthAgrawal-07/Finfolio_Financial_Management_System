/**
 * Sidebar Component — Premium dark glassmorphism sidebar with user-aware navigation
 */

import { useState } from "react";
import {
  LayoutDashboard, TrendingUp, ArrowLeftRight,
  BarChart3, Briefcase, Settings, LogOut,
  ChevronRight, Wallet,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard",    id: "dashboard" },
  { icon: <Briefcase       size={18} />, label: "Portfolio",    id: "portfolio" },
  { icon: <TrendingUp      size={18} />, label: "Analytics",    id: "analytics", badge: "LIVE" },
  { icon: <ArrowLeftRight  size={18} />, label: "Transactions", id: "transactions" },
  { icon: <BarChart3       size={18} />, label: "Markets",      id: "markets" },
  { icon: <Wallet          size={18} />, label: "Accounts",     id: "accounts" },
];

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export function Sidebar({ activeItem = "dashboard", onNavigate, user, onLogout }: SidebarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const initials = user ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "JD";

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl border-r border-white/8" />

      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">FinFolio</span>
            <p className="text-slate-500 text-xs">Wealth Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate?.(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className={clsx("nav-item w-full group relative", activeItem === item.id && "active")}
            >
              <span className={clsx("transition-colors duration-200",
                activeItem === item.id ? "text-brand-400" : "text-slate-400 group-hover:text-white"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-green/20 text-accent-green">
                  {item.badge}
                </span>
              )}
              {hovered === item.id && activeItem !== item.id && (
                <ChevronRight size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/8 p-4 space-y-2">
          <button className="nav-item w-full">
            <Settings size={16} className="text-slate-400" />
            <span>Settings</span>
          </button>
          <button
            id="logout-btn"
            onClick={onLogout}
            className="nav-item w-full text-accent-red/70 hover:text-accent-red hover:bg-accent-red/10"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          {/* User chip */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? "Guest"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email ?? "demo@finfolio.com"}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-accent-green flex-shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
}
