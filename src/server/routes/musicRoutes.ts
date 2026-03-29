import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Music Management APIs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM music_tracks WHERE is_active = TRUE ORDER BY sort_order ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching music:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
