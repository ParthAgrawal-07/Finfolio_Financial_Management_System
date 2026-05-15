/**
 * Transaction Controller
 * ─────────────────────────────────────────────────────────────
 * GET  /api/v1/transactions/:userId        — paginated feed
 * POST /api/v1/transactions                — create deposit/withdrawal
 */

import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// ─── Validation Schema ────────────────────────────────────────
const CreateTransactionSchema = z.object({
  account_id:  z.string().min(1),
  fd_id:       z.string().min(1),
  txn_type:    z.enum(["Deposit", "Withdrawal"]),
  amount:      z.number().positive(),
});

// ─── GET: Paginated recent transactions ───────────────────────
export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit  as string) || 20, 100);
  const offset =            parseInt(req.query.offset as string) || 0;

  const query = `
    SELECT
      t.Transaction_ID   AS transaction_id,
      t.txn_type,
      t.Amount           AS amount,
      t.Timestamp        AS timestamp,
      a.Account_type     AS account_type,
      a.Account_ID       AS account_id
    FROM "Transaction" t
    JOIN Account a ON t.Account_ID = a.Account_ID
    WHERE a.User_ID = $1
    ORDER BY t.Timestamp DESC
    LIMIT $2 OFFSET $3;
  `;

  try {
    const { rows } = await pool.query(query, [userId, limit, offset]);
    res.json({ data: rows, limit, offset });
  } catch (err) {
    next(err);
  }
}

// ─── POST: Create a new transaction ───────────────────────────
export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const parsed = CreateTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { account_id, fd_id, txn_type, amount } = parsed.data;
  const txnId = uuidv4();

  try {
    const { rows } = await pool.query(
      `INSERT INTO "Transaction" (Transaction_ID, Account_ID, FD_ID, txn_type, Amount, Timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [txnId, account_id, fd_id, txn_type, amount]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}
