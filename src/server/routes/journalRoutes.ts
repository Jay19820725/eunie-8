import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Journal API
router.post("/", async (req, res) => {
  const { user_id, emotion_tag, insight, intention } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO energy_journal (user_id, emotion_tag, insight, intention) VALUES ($1, $2, $3, $4) RETURNING id",
      [user_id, emotion_tag, insight, intention]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Error adding journal entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 50;
  try {
    const result = await pool.query(
      "SELECT * FROM energy_journal WHERE user_id = $1 ORDER BY date DESC LIMIT $2",
      [userId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching journal entries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM energy_journal WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting journal entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
