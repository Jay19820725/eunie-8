import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Reports API
router.post("/consume-points", async (req, res) => {
  const { userId } = req.body;
  try {
    const userResult = await pool.query("SELECT points FROM users WHERE uid = $1", [userId]);
    if (userResult.rows.length === 0 || userResult.rows[0].points <= 0) {
      return res.status(403).json({ error: "Insufficient points" });
    }
    await pool.query("UPDATE users SET points = points - 1 WHERE uid = $1", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error consuming points:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const result = await pool.query(
      "SELECT report_data->'totalScores' as total_scores, report_type, report_data->'psychologicalInsight' as psychological_insight, dominant_element, weak_element, balance_score, timestamp FROM energy_reports WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2",
      [userId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching report history:", err);
    res.status(500).json({ error: "Failed to fetch report history" });
  }
});

router.get("/weekly-wishes/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM energy_reports 
       WHERE user_id = $1 
       AND report_type = 'wish'
       AND timestamp >= date_trunc('week', NOW())`,
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Error fetching weekly wishes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { lang } = req.query;
  console.log(`[API] GET /api/reports/${userId} (lang: ${lang})`);
  try {
    // 1. Fetch reports for the requested language
    let query = "SELECT * FROM energy_reports WHERE user_id = $1";
    const params = [userId];
    
    if (typeof lang === 'string') {
      params.push(lang);
      query += ` AND lang = $${params.length}`;
    }
    
    query += " ORDER BY timestamp DESC";
    
    const result = await pool.query(query, params);
    
    const mappedReports = result.rows.map(row => {
      const data = row.report_data || {};
      return {
        id: row.id,
        userId: row.user_id,
        reportType: row.report_type,
        timestamp: new Date(row.timestamp).getTime(),
        isAiComplete: row.is_ai_complete,
        dominantElement: row.dominant_element,
        weakElement: row.weak_element,
        balanceScore: row.balance_score,
        todayTheme: row.today_theme,
        shareThumbnail: row.share_thumbnail,
        ...data
      };
    });

    // 2. Check if reports in other languages exist
    let otherLangCount = 0;
    if (lang) {
      const otherLangResult = await pool.query(
        "SELECT count(*) FROM energy_reports WHERE user_id = $1 AND lang != $2",
        [userId, lang]
      );
      otherLangCount = parseInt(otherLangResult.rows[0].count);
    }
    
    res.json({
      reports: mappedReports,
      hasOtherLang: otherLangCount > 0,
      otherLangCount
    });
  } catch (err) {
    console.error("Error fetching energy reports:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { 
    id, 
    userId, 
    lang,
    reportType,
    dominantElement, 
    weakElement, 
    balanceScore, 
    todayTheme,
    shareThumbnail,
    isAiComplete,
    ...otherData 
  } = req.body;

  console.log(`[API] POST /api/reports - Saving report: ${id || 'NEW'} for: ${userId || 'GUEST'} (lang: ${lang}, type: ${reportType})`);

  try {
    // 1. Ensure user exists if userId is provided (Auto-Sync)
    if (userId) {
      await pool.query(
        "INSERT INTO users (uid, last_login) VALUES ($1, CURRENT_TIMESTAMP) ON CONFLICT (uid) DO UPDATE SET last_login = CURRENT_TIMESTAMP",
        [userId]
      );
    }

    // 2. UPSERT logic: Insert or Update if ID exists
    let result;
    if (id) {
      result = await pool.query(
        `INSERT INTO energy_reports (
          id, user_id, lang, report_type, dominant_element, weak_element, balance_score, 
          today_theme, share_thumbnail, is_ai_complete, report_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          user_id = COALESCE(EXCLUDED.user_id, energy_reports.user_id),
          lang = COALESCE(EXCLUDED.lang, energy_reports.lang),
          report_type = COALESCE(EXCLUDED.report_type, energy_reports.report_type),
          dominant_element = COALESCE(EXCLUDED.dominant_element, energy_reports.dominant_element),
          weak_element = COALESCE(EXCLUDED.weak_element, energy_reports.weak_element),
          balance_score = COALESCE(EXCLUDED.balance_score, energy_reports.balance_score),
          today_theme = COALESCE(EXCLUDED.today_theme, energy_reports.today_theme),
          share_thumbnail = COALESCE(EXCLUDED.share_thumbnail, energy_reports.share_thumbnail),
          is_ai_complete = COALESCE(EXCLUDED.is_ai_complete, energy_reports.is_ai_complete),
          report_data = EXCLUDED.report_data
        RETURNING *`,
        [id, userId, lang || 'zh', reportType || 'daily', dominantElement, weakElement, balanceScore, todayTheme, shareThumbnail, isAiComplete || false, JSON.stringify(otherData)]
      );
    } else {
      result = await pool.query(
        `INSERT INTO energy_reports (
          user_id, lang, report_type, dominant_element, weak_element, balance_score, 
          today_theme, share_thumbnail, is_ai_complete, report_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [userId, lang || 'zh', reportType || 'daily', dominantElement, weakElement, balanceScore, todayTheme, shareThumbnail, isAiComplete || false, JSON.stringify(otherData)]
      );
    }
    
    if (result.rows.length === 0) {
      throw new Error("Failed to save or update report - no rows returned");
    }

    const row = result.rows[0];
    const data = row.report_data || {};
    res.json({
      id: row.id,
      userId: row.user_id,
      reportType: row.report_type,
      timestamp: new Date(row.timestamp).getTime(),
      isAiComplete: row.is_ai_complete,
      dominantElement: row.dominant_element,
      weakElement: row.weak_element,
      balanceScore: row.balance_score,
      todayTheme: row.today_theme,
      shareThumbnail: row.share_thumbnail,
      ...data
    });
  } catch (err) {
    console.error("[API] Error saving energy report:", err);
    res.status(500).json({ 
      error: "Internal server error", 
      details: String(err),
      message: "Failed to save energy report. Please check server logs."
    });
  }
});

router.post("/:id/share", async (req, res) => {
  const { id } = req.params;
  const { shareThumbnail } = req.body;
  try {
    await pool.query(
      "UPDATE energy_reports SET share_thumbnail = $1 WHERE id = $2",
      [shareThumbnail, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating share thumbnail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Single report fetch (moved from /api/report/:id to /api/reports/single/:id to keep consistent prefix)
router.get("/single/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[API] GET /api/reports/single/${id}`);
  try {
    const result = await pool.query("SELECT * FROM energy_reports WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    
    const row = result.rows[0];
    const data = row.report_data || {};
    
    const mappedReport = {
      id: row.id,
      userId: row.user_id,
      reportType: row.report_type,
      timestamp: new Date(row.timestamp).getTime(),
      isAiComplete: row.is_ai_complete,
      dominantElement: row.dominant_element,
      weakElement: row.weak_element,
      balanceScore: row.balance_score,
      todayTheme: row.today_theme,
      shareThumbnail: row.share_thumbnail,
      multilingualContent: data.multilingualContent || {},
      ...data
    };
    
    res.json(mappedReport);
  } catch (err) {
    console.error("Error fetching single report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
