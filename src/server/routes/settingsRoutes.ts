import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Settings API
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.json({
        notifications: true,
        language: 'zh',
        theme: 'light'
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user", async (req, res) => {
  const { userId, notifications, language, theme } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, notifications, language, theme) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id) DO UPDATE SET 
         notifications = EXCLUDED.notifications, 
         language = EXCLUDED.language, 
         theme = EXCLUDED.theme 
       RETURNING *`,
      [userId, notifications, language, theme]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const result = await pool.query("SELECT value FROM site_settings WHERE key = $1", [key]);
    if (result.rowCount === 0) {
      if (key === 'seo') {
        return res.json({
          title: "EUNIE 嶼妳 | 懂妳的能量，平衡妳的生活",
          description: "透過五行能量卡片，探索內在自我，獲得每日心靈指引與能量平衡。",
          keywords: "能量卡片, 五行, 心靈導引, 冥想, 自我探索",
          og_image: "https://picsum.photos/seed/lumina-og/1200/630",
          google_analytics_id: "",
          search_console_id: " ",
          index_enabled: true
        });
      }
      if (key === 'fonts') {
        return res.json({
          zh: {
            display: { url: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&display=swap", family: "\"Noto Serif TC\", serif" },
            body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap", family: "\"Noto Sans TC\", sans-serif" }
          },
          ja: {
            display: { url: "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap", family: "\"Shippori Mincho\", serif" },
            body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap", family: "\"Noto Sans JP\", sans-serif" }
          }
        });
      }
      return res.status(404).json({ error: "Settings not found" });
    }
    res.json(result.rows[0].value);
  } catch (err) {
    console.error(`Error fetching settings ${key}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
