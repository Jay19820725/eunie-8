import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Manifestations API
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM manifestations WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching manifestations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { user_id, wish_title, deadline, deadline_option } = req.body;
  try {
    // Check limit
    const countResult = await pool.query(
      "SELECT count(*) FROM manifestations WHERE user_id = $1 AND status = 'active'",
      [user_id]
    );
    if (parseInt(countResult.rows[0].count) >= 3) {
      return res.status(400).json({ error: "Maximum 3 active wishes allowed" });
    }

    const result = await pool.query(
      "INSERT INTO manifestations (user_id, wish_title, deadline, deadline_option) VALUES ($1, $2, $3, $4) RETURNING id",
      [user_id, wish_title, deadline, deadline_option]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating manifestation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Whitelist allowed columns to prevent SQL injection via keys
  const allowedFields = ["wish_title", "deadline", "deadline_option", "status", "reminder_sent"];
  const fields = Object.keys(updates).filter(f => allowedFields.includes(f));

  if (fields.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = [id, ...fields.map(f => updates[f])];

  try {
    await pool.query(`UPDATE manifestations SET ${setClause} WHERE id = $1`, values);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating manifestation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
