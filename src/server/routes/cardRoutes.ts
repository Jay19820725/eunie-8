import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Cards API
router.get("/image", async (req, res) => {
  const { locale } = req.query;
  try {
    let query = "SELECT * FROM cards_image";
    const params = [];
    if (locale) {
      query += " WHERE locale = $1";
      params.push(locale);
    }
    query += " ORDER BY id ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching image cards:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/word", async (req, res) => {
  const { locale } = req.query;
  try {
    let query = "SELECT * FROM cards_word";
    const params = [];
    if (locale) {
      query += " WHERE locale = $1";
      params.push(locale);
    }
    query += " ORDER BY id ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching word cards:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
