/**
 * Mock Data Hooks — 100% mock, no real API calls
 * All data is generated deterministically from seeded random functions.
 */

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────
export interface Holding {
  security_id: string;
  ticker_symbol: string;
  security_name: string;
  sector: string;
  quantity_owned: number;
  average_buy_price: number;
  current_price: number;
  market_value: number;
  unrealised_pnl: number;
  pnl_percentage: number;
}

export interface PortfolioData {
  user_id: string;
  total_unrealised_pnl: number;
  total_market_value: number;
  holdings: Holding[];
  cached: boolean;
}

export interface RevenueDataPoint {
  company_name: string;
  quarter_end_date: string;
  revenue: number;
  net_profit: number;
  running_revenue_total: number;
  qoq_revenue_growth_pct: number | null;
}

export interface Transaction {
  transaction_id: string;
  txn_type: "Deposit" | "Withdrawal";
  amount: number;
  timestamp: string;
  account_type: string;
}

export interface Account {
  account_id: string;
  account_type: string;
  balance: number;
  interest_rate: number;
  opened_date: string;
  status: "Active" | "Inactive";
}

export interface FixedDeposit {
  fd_id: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  status: "Active" | "Matured";
}

export interface MarketStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: string;
  market_cap: string;
  sector: string;
}

// ─── Mock Holdings Data ───────────────────────────────────────
const MOCK_HOLDINGS: Holding[] = [
  { security_id:"SEC001", ticker_symbol:"AAPL",  security_name:"Apple Inc.",          sector:"Technology",    quantity_owned:50,  average_buy_price:145.20, current_price:189.50, market_value:9475.00,  unrealised_pnl:2215.00, pnl_percentage:30.51 },
  { security_id:"SEC002", ticker_symbol:"MSFT",  security_name:"Microsoft Corp.",     sector:"Technology",    quantity_owned:30,  average_buy_price:280.00, current_price:415.20, market_value:12456.00, unrealised_pnl:4056.00, pnl_percentage:48.29 },
  { security_id:"SEC003", ticker_symbol:"GOOGL", security_name:"Alphabet Inc.",       sector:"Technology",    quantity_owned:15,  average_buy_price:120.40, current_price:175.80, market_value:2637.00,  unrealised_pnl:831.00,  pnl_percentage:46.01 },
  { security_id:"SEC004", ticker_symbol:"JPM",   security_name:"JPMorgan Chase",      sector:"Financials",    quantity_owned:40,  average_buy_price:150.00, current_price:198.30, market_value:7932.00,  unrealised_pnl:1932.00, pnl_percentage:32.20 },
  { security_id:"SEC005", ticker_symbol:"NVDA",  security_name:"NVIDIA Corp.",        sector:"Technology",    quantity_owned:20,  average_buy_price:220.00, current_price:875.40, market_value:17508.00, unrealised_pnl:13108.00,pnl_percentage:297.91},
  { security_id:"SEC006", ticker_symbol:"AMZN",  security_name:"Amazon.com Inc.",     sector:"Consumer Disc.",quantity_owned:25,  average_buy_price:102.50, current_price:180.20, market_value:4505.00,  unrealised_pnl:1942.50, pnl_percentage:75.80 },
  { security_id:"SEC007", ticker_symbol:"TSLA",  security_name:"Tesla Inc.",          sector:"Consumer Disc.",quantity_owned:35,  average_buy_price:250.00, current_price:178.50, market_value:6247.50,  unrealised_pnl:-2502.50,pnl_percentage:-28.60},
  { security_id:"SEC008", ticker_symbol:"V",     security_name:"Visa Inc.",           sector:"Financials",    quantity_owned:45,  average_buy_price:210.00, current_price:278.40, market_value:12528.00, unrealised_pnl:3078.00, pnl_percentage:32.57 },
  { security_id:"SEC009", ticker_symbol:"JNJ",   security_name:"Johnson & Johnson",   sector:"Healthcare",    quantity_owned:20,  average_buy_price:168.00, current_price:152.10, market_value:3042.00,  unrealised_pnl:-318.00, pnl_percentage:-9.46 },
  { security_id:"SEC010", ticker_symbol:"XOM",   security_name:"Exxon Mobil Corp.",   sector:"Energy",        quantity_owned:60,  average_buy_price:85.00,  current_price:118.70, market_value:7122.00,  unrealised_pnl:2022.00, pnl_percentage:39.65 },
];

// ─── Mock Revenue Data (6 companies × 8 quarters) ─────────────
const COMPANIES = [
  { id: "AAPL",  name: "Apple Inc.",     baseRev: 89400, baseProfit: 23630 },
  { id: "MSFT",  name: "Microsoft Corp.",baseRev: 52900, baseProfit: 18300 },
  { id: "GOOGL", name: "Alphabet Inc.",  baseRev: 58100, baseProfit: 15400 },
  { id: "NVDA",  name: "NVIDIA Corp.",   baseRev: 22100, baseProfit: 12285 },
  { id: "AMZN",  name: "Amazon.com",     baseRev: 127400,baseProfit: 6749  },
  { id: "TSLA",  name: "Tesla Inc.",     baseRev: 23350, baseProfit: 2513  },
];

const QUARTERS = [
  "2022-03-31","2022-06-30","2022-09-30","2022-12-31",
  "2023-03-31","2023-06-30","2023-09-30","2023-12-31",
];

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MOCK_REVENUE_DATA: RevenueDataPoint[] = COMPANIES.flatMap((co, ci) => {
  let runningTotal = 0;
  return QUARTERS.map((q, qi) => {
    const growthFactor = 1 + (seededRand(ci * 13 + qi) - 0.4) * 0.15;
    const rev    = Math.round(co.baseRev    * growthFactor * (1 + qi * 0.02));
    const profit = Math.round(co.baseProfit * growthFactor * (1 + qi * 0.025));
    const prevRev = qi > 0
      ? Math.round(co.baseRev * (1 + (seededRand(ci * 13 + qi - 1) - 0.4) * 0.15) * (1 + (qi - 1) * 0.02))
      : null;
    const qoq = prevRev != null ? parseFloat(((rev - prevRev) / Math.abs(prevRev) * 100).toFixed(2)) : null;
    runningTotal += rev;
    return {
      company_name: co.name,
      quarter_end_date: q,
      revenue: rev,
      net_profit: profit,
      running_revenue_total: runningTotal,
      qoq_revenue_growth_pct: qoq,
    };
  });
});

// ─── Mock Transactions ────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  { transaction_id:"T001", txn_type:"Deposit",    amount:15000.00, timestamp:"2024-05-15T09:23:11Z", account_type:"Brokerage" },
  { transaction_id:"T002", txn_type:"Withdrawal", amount:2500.00,  timestamp:"2024-05-14T14:05:42Z", account_type:"Savings"   },
  { transaction_id:"T003", txn_type:"Deposit",    amount:8750.00,  timestamp:"2024-05-13T11:30:00Z", account_type:"Brokerage" },
  { transaction_id:"T004", txn_type:"Deposit",    amount:3200.00,  timestamp:"2024-05-12T16:45:22Z", account_type:"Retirement"},
  { transaction_id:"T005", txn_type:"Withdrawal", amount:1800.00,  timestamp:"2024-05-11T08:12:55Z", account_type:"Savings"   },
  { transaction_id:"T006", txn_type:"Deposit",    amount:22000.00, timestamp:"2024-05-10T13:20:30Z", account_type:"Brokerage" },
  { transaction_id:"T007", txn_type:"Withdrawal", amount:4100.00,  timestamp:"2024-05-09T17:55:18Z", account_type:"Retirement"},
  { transaction_id:"T008", txn_type:"Deposit",    amount:500.00,   timestamp:"2024-05-08T10:04:01Z", account_type:"Savings"   },
  { transaction_id:"T009", txn_type:"Deposit",    amount:9000.00,  timestamp:"2024-05-07T12:10:00Z", account_type:"Brokerage" },
  { transaction_id:"T010", txn_type:"Withdrawal", amount:3300.00,  timestamp:"2024-05-06T15:40:22Z", account_type:"Savings"   },
  { transaction_id:"T011", txn_type:"Deposit",    amount:45000.00, timestamp:"2024-05-05T09:00:00Z", account_type:"Retirement"},
  { transaction_id:"T012", txn_type:"Withdrawal", amount:12000.00, timestamp:"2024-05-04T10:30:00Z", account_type:"Brokerage" },
];

// ─── Mock Accounts ────────────────────────────────────────────
export const MOCK_ACCOUNTS: Account[] = [
  { account_id:"ACC01", account_type:"Trading",    balance:125000.00, interest_rate:0,    opened_date:"2021-01-15", status:"Active" },
  { account_id:"ACC02", account_type:"Savings",    balance:48500.00,  interest_rate:4.5,  opened_date:"2020-06-20", status:"Active" },
  { account_id:"ACC03", account_type:"Retirement", balance:220000.00, interest_rate:7.0,  opened_date:"2019-03-10", status:"Active" },
  { account_id:"ACC04", account_type:"NRI",        balance:15000.00,  interest_rate:5.25, opened_date:"2022-09-01", status:"Active" },
];

export const MOCK_FIXED_DEPOSITS: FixedDeposit[] = [
  { fd_id:"FD01", amount:100000, interest_rate:6.5,  start_date:"2023-01-10", maturity_date:"2024-01-10", status:"Matured" },
  { fd_id:"FD02", amount:250000, interest_rate:7.0,  start_date:"2023-06-15", maturity_date:"2025-06-15", status:"Active"  },
  { fd_id:"FD03", amount:50000,  interest_rate:5.5,  start_date:"2022-11-01", maturity_date:"2023-11-01", status:"Matured" },
  { fd_id:"FD04", amount:500000, interest_rate:7.25, start_date:"2024-01-20", maturity_date:"2027-01-20", status:"Active"  },
];

export const MOCK_MARKET_STOCKS: MarketStock[] = [
  { ticker:"AAPL",  name:"Apple Inc.",      price:189.50, change:+2.30,  change_pct:+1.23, volume:"48.2M",  market_cap:"2.93T", sector:"Technology"    },
  { ticker:"MSFT",  name:"Microsoft Corp.", price:415.20, change:+5.80,  change_pct:+1.42, volume:"22.1M",  market_cap:"3.08T", sector:"Technology"    },
  { ticker:"GOOGL", name:"Alphabet Inc.",   price:175.80, change:-1.10,  change_pct:-0.62, volume:"18.5M",  market_cap:"2.19T", sector:"Technology"    },
  { ticker:"AMZN",  name:"Amazon.com",      price:180.20, change:+3.45,  change_pct:+1.95, volume:"33.4M",  market_cap:"1.87T", sector:"Consumer Disc." },
  { ticker:"NVDA",  name:"NVIDIA Corp.",    price:875.40, change:+22.10, change_pct:+2.59, volume:"41.6M",  market_cap:"2.15T", sector:"Technology"    },
  { ticker:"TSLA",  name:"Tesla Inc.",      price:178.50, change:-4.20,  change_pct:-2.30, volume:"96.3M",  market_cap:"568B",  sector:"Consumer Disc." },
  { ticker:"JPM",   name:"JPMorgan Chase",  price:198.30, change:+1.70,  change_pct:+0.86, volume:"9.8M",   market_cap:"573B",  sector:"Financials"    },
  { ticker:"V",     name:"Visa Inc.",       price:278.40, change:+0.90,  change_pct:+0.32, volume:"6.5M",   market_cap:"557B",  sector:"Financials"    },
  { ticker:"JNJ",   name:"J&J",            price:152.10, change:-0.80,  change_pct:-0.52, volume:"7.2M",   market_cap:"366B",  sector:"Healthcare"    },
  { ticker:"XOM",   name:"Exxon Mobil",    price:118.70, change:+1.40,  change_pct:+1.19, volume:"14.3M",  market_cap:"473B",  sector:"Energy"        },
  { ticker:"WMT",   name:"Walmart Inc.",   price:67.80,  change:+0.55,  change_pct:+0.82, volume:"11.1M",  market_cap:"547B",  sector:"Consumer Stapl."},
  { ticker:"BRK",   name:"Berkshire Hath.",price:412.30, change:+3.10,  change_pct:+0.76, volume:"3.2M",   market_cap:"898B",  sector:"Financials"    },
];

// ─── Hook: Portfolio Holdings ─────────────────────────────────
export function usePortfolioData(_userId: string) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const total_unrealised_pnl = MOCK_HOLDINGS.reduce((acc, h) => acc + h.unrealised_pnl, 0);
      const total_market_value   = MOCK_HOLDINGS.reduce((acc, h) => acc + h.market_value, 0);
      setData({ user_id: _userId, total_unrealised_pnl, total_market_value, holdings: MOCK_HOLDINGS, cached: true });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { data, loading, error: null };
}

// ─── Hook: Revenue Running Total ──────────────────────────────
export function useRevenueData() {
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setData(MOCK_REVENUE_DATA); setLoading(false); }, 600);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading, error: null };
}

// ─── Hook: Transactions ───────────────────────────────────────
export function useTransactions(_userId: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setData(MOCK_TRANSACTIONS); setLoading(false); }, 500);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { data, loading, error: null };
}

// ─── Hook: Accounts ───────────────────────────────────────────
export function useAccounts(_userId: string) {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setData(MOCK_ACCOUNTS); setLoading(false); }, 700);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { data, loading };
}

// ─── Hook: Fixed Deposits ─────────────────────────────────────
export function useFixedDeposits(_userId: string) {
  const [data, setData] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setData(MOCK_FIXED_DEPOSITS); setLoading(false); }, 700);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { data, loading };
}

// ─── Hook: Market Stocks ──────────────────────────────────────
export function useMarketData() {
  const [data, setData] = useState<MarketStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setData(MOCK_MARKET_STOCKS); setLoading(false); }, 900);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}

// ─── Utility: Format currency ─────────────────────────────────
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
}
