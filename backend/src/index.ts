/**
 * FinFolio Backend — Entry Point
 * Express API Gateway: handles CRUD, portfolio caching, and
 * proxies complex analytics queries to the FastAPI microservice.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import portfolioRoutes from "./routes/portfolio";
import transactionRoutes from "./routes/transactions";
import userRoutes from "./routes/users";
import analyticsProxyRoutes from "./routes/analyticsProxy";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "finfolio-backend", timestamp: new Date() });
});

// ── Routes ─────────────────────────────────────────────────
// All routes are prefixed with /api/v1
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/users", userRoutes);
// Proxy analytics (window functions, revenue totals) → FastAPI
app.use("/api/v1/analytics", analyticsProxyRoutes);

// ── Global error handler ───────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err.stack);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`✅  FinFolio backend running on http://localhost:${PORT}`);
});

export default app;
