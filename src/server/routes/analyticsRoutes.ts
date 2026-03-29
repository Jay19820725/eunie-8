import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Analytics API
router.get("/user-stats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM energy_reports WHERE user_id = $1) as total_reports,
        (SELECT COUNT(*) FROM energy_journal WHERE user_id = $1) as total_journals,
        (SELECT COUNT(*) FROM manifestations WHERE user_id = $1) as total_manifestations,
        (SELECT COUNT(*) FROM bottles WHERE user_id = $1) as total_bottles`,
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
