/**
 * Analytics Proxy Route
 * ─────────────────────────────────────────────────────────────
 * The Node.js gateway acts as a reverse proxy for the FastAPI
 * analytics microservice. This keeps the frontend from needing
 * to know about the analytics service's host/port.
 *
 * Requests to /api/v1/analytics/** are forwarded to:
 *   http://analytics:8000/**
 */

import { Router, Request, Response, NextFunction } from "express";

const router = Router();
const ANALYTICS_URL = process.env.ANALYTICS_URL ?? "http://localhost:8000";

/**
 * Generic proxy handler — forwards any sub-path to FastAPI
 */
async function proxyToAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const targetUrl = `${ANALYTICS_URL}${req.path}${
    Object.keys(req.query).length ? "?" + new URLSearchParams(req.query as Record<string, string>).toString() : ""
  }`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": req.ip ?? "",
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
}

// Forward all analytics sub-paths
router.get("/revenue-running-total", proxyToAnalytics);
router.get("/profit-ranking", proxyToAnalytics);
router.get("/pnl-summary/:userId", proxyToAnalytics);

export default router;
