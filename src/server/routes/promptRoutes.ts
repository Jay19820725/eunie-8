import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

router.get("/active", async (req, res) => {
  const { lang, report_type } = req.query;
  const language = lang === 'ja' ? 'ja' : 'zh';
  const type = report_type === 'wish' ? 'wish' : 'daily';
  
  try {
    const result = await pool.query(
      "SELECT prompt_zh, prompt_ja FROM ai_prompts WHERE is_enabled = TRUE AND report_type = $1 ORDER BY section_key ASC",
      [type]
    );
    
    if (result.rows.length > 0) {
      const fullPrompt = result.rows.map(row => {
        return language === 'ja' ? row.prompt_ja : row.prompt_zh;
      }).join("\n\n");
      
      res.json({ content: fullPrompt });
    } else {
      res.json({ content: "" });
    }
  } catch (err) {
    console.error("Error fetching active prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
