import { Router } from "express";
import {
  getPortfolioHoldings,
  invalidatePortfolioCache,
} from "../controllers/portfolioController";

const router = Router();

/**
 * GET /api/v1/portfolio/:userId/holdings
 * Returns portfolio holdings with live PnL. Cached in Redis for 60 s.
 */
router.get("/:userId/holdings", getPortfolioHoldings);

/**
 * DELETE /api/v1/portfolio/:userId/cache
 * Invalidate cached holdings for a user (e.g. after a trade executes).
 */
router.delete("/:userId/cache", invalidatePortfolioCache);

export default router;
