import { Router } from "express";
import { getTransactions, createTransaction } from "../controllers/transactionController";

const router = Router();

/** GET /api/v1/transactions/:userId  — paginated transaction feed */
router.get("/:userId", getTransactions);

/** POST /api/v1/transactions  — create deposit/withdrawal */
router.post("/", createTransaction);

export default router;
