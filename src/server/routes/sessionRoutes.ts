import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Sessions API
router.post("/", async (req, res) => {
  const { user_id, image_cards, word_cards } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO sessions (user_id, image_cards, word_cards) VALUES ($1, $2, $3) RETURNING id",
      [user_id, JSON.stringify(image_cards), JSON.stringify(word_cards)]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const { pairs, association_text } = req.body;
  try {
    await pool.query(
      "UPDATE sessions SET pairs = $1, association_text = $2 WHERE id = $3",
      [JSON.stringify(pairs), JSON.stringify(association_text), id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
