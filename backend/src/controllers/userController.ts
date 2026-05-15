/**
 * User Controller — basic CRUD for User management
 */

import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT u.User_ID, u.First_name, u.Last_Name, u.User_role,
              ARRAY_AGG(DISTINCT ue.Email)        AS emails,
              ARRAY_AGG(DISTINCT up.phone_number) AS phones,
              COUNT(DISTINCT p.Portfolio_ID)      AS portfolio_count,
              COUNT(DISTINCT a.Account_ID)        AS account_count
       FROM "User" u
       LEFT JOIN User_Email   ue ON u.User_ID = ue.User_ID
       LEFT JOIN User_Phone   up ON u.User_ID = up.User_ID
       LEFT JOIN Portfolio     p ON u.User_ID = p.User_ID
       LEFT JOIN Account       a ON u.User_ID = a.User_ID
       WHERE u.User_ID = $1
       GROUP BY u.User_ID`,
      [userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT User_ID, First_name, Last_Name, User_role FROM "User" ORDER BY Last_Name`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}
