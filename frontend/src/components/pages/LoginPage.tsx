/**
 * LoginPage — Premium glassmorphism login with demo credentials.
 */
import { useState } from "react";
import { TrendingUp, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

const DEMO_USERS = [
  { name: "John Doe",    email: "john@finfolio.com",  password: "demo123", initials: "JD" },
  { name: "Rahul Mehta", email: "rahul@finfolio.com", password: "demo123", initials: "RM" },
  { name: "Ananya Singh",email: "ananya@finfolio.com",password: "demo123", initials: "AS" },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin({ name: user.name, email: user.email });
      } else {
        setError("Invalid credentials. Use a demo account below.");
      }
      setLoading(false);
    }, 900);
  }

  function quickLogin(u: typeof DEMO_USERS[0]) {
    setEmail(u.email);
    setPassword(u.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/8 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-brand-500/6 blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand mb-4">
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinFolio</h1>
          <p className="text-slate-400 text-sm mt-1">Wealth Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your portfolio dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@finfolio.com"
                  required
                  className="w-full bg-surface-800 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-500/60 focus:bg-surface-800/80 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-800 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-brand-500/60 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button id="login-submit" type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-500">Demo Accounts</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Demo user chips */}
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => quickLogin(u)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-brand-500/30 transition-all group">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                  {u.initials}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors text-center leading-tight">{u.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">Password for all demo accounts: <span className="text-slate-400 font-mono">demo123</span></p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 FinFolio Wealth Management · All rights reserved
        </p>
      </div>
    </div>
  );
}
