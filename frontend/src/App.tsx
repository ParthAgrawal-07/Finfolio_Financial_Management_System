/**
 * App Component — Root
 * Handles auth state, layout, and client-side routing.
 */

import { useState, useCallback } from "react";
import { Sidebar }          from "./components/Sidebar";
import { Header }           from "./components/Header";
import { Dashboard }        from "./components/Dashboard";
import { LoginPage }        from "./components/pages/LoginPage";
import { PortfolioPage }    from "./components/pages/PortfolioPage";
import { AnalyticsPage }    from "./components/pages/AnalyticsPage";
import { TransactionsPage } from "./components/pages/TransactionsPage";
import { MarketsPage }      from "./components/pages/MarketsPage";
import { AccountsPage }     from "./components/pages/AccountsPage";

const DEMO_USER_ID = "U001";

interface AuthUser { name: string; email: string; }

export default function App() {
  const [user, setUser]             = useState<AuthUser | null>(null);
  const [activeNav, setActiveNav]   = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // ── Not logged in → show Login ──────────────────────
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // ── Logged in → full dashboard layout ───────────────
  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} user={user} onLogout={() => setUser(null)} />

      <div className="flex-1 flex flex-col" style={{ marginLeft: "var(--sidebar-width)" }}>
        <Header onRefresh={handleRefresh} loading={isRefreshing} user={user} />

        <div className="flex-1 p-6 overflow-auto" style={{ paddingTop: "calc(var(--header-height) + 24px)" }}>
          {activeNav === "dashboard"    && <Dashboard      refreshKey={refreshKey} />}
          {activeNav === "portfolio"   && <PortfolioPage   userId={DEMO_USER_ID} />}
          {activeNav === "analytics"   && <AnalyticsPage />}
          {activeNav === "transactions"&& <TransactionsPage userId={DEMO_USER_ID} />}
          {activeNav === "markets"     && <MarketsPage />}
          {activeNav === "accounts"    && <AccountsPage    userId={DEMO_USER_ID} />}
        </div>
      </div>
    </div>
  );
}
