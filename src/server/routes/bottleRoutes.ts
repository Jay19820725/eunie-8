import { Router } from "express";
import { pool } from "../db.ts";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Ocean of Resonance API
router.get("/tags", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bottle_tags WHERE is_active = TRUE ORDER BY sort_order ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching bottle tags:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { userId, content, element, lang, originLocale, cardId, quote, reportId, nickname, cardImageUrl, cardName, tagId } = req.body;
  
  try {
    // 1. Check if user has at least one report
    const reportsCount = await pool.query("SELECT COUNT(*) FROM energy_reports WHERE user_id = $1", [userId]);
    if (parseInt(reportsCount.rows[0].count) === 0) {
      return res.status(403).json({ error: "You must complete at least one energy test to create a bottle mail." });
    }

    // 1.1 Check if this report has already been used for a bottle
    if (reportId) {
      const existingBottle = await pool.query("SELECT id FROM bottles WHERE report_id = $1", [reportId]);
      if (existingBottle.rows.length > 0) {
        return res.status(400).json({ 
          error: "This energy report has already been used to cast a bottle.",
          code: "REPORT_ALREADY_USED"
        });
      }
    }

    // 2. Check Premium Status
    const userResult = await pool.query("SELECT role, subscription_status FROM users WHERE uid = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];
    const isPremium = user.role === 'admin' || user.role === 'premium_member' || user.subscription_status === 'active';
    
    if (!isPremium) {
      return res.status(403).json({ error: "Premium membership required to cast a bottle." });
    }

    // 3. Update default nickname if provided
    if (nickname) {
      await pool.query("UPDATE users SET default_bottle_nickname = $1 WHERE uid = $2", [nickname, userId]);
    }

    // 4. Sensitive Word Filter (Direct Rejection)
    const sensitiveWordsResult = await pool.query("SELECT word FROM sensitive_words");
    const sensitiveWords = sensitiveWordsResult.rows.map(r => r.word);
    
    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        return res.status(400).json({ 
          error: "Content contains sensitive words.", 
          code: "SENSITIVE_CONTENT" 
        });
      }
    }

    // 4.1 AI Content Moderation (Gemini)
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        const moderationPrompt = `You are a content moderator for a meditation and emotional resonance app. 
        Analyze the following message for hate speech, extreme negativity, harassment, or inappropriate content.
        Respond ONLY with "PASS" if the content is safe and warm, or "FAIL" if it is inappropriate.
        Message: ${content}`;
        
        const moderationResponse = await ai.models.generateContent({
          model,
          contents: [{ parts: [{ text: moderationPrompt }] }]
        });
        
        const moderationResult = moderationResponse.text?.trim().toUpperCase();
        if (moderationResult === "FAIL") {
          return res.status(400).json({ 
            error: "The ocean currents are too turbulent for this message right now. Please try to calm your heart and try again.", 
            code: "AI_MODERATION_FAILED" 
          });
        }
      } catch (aiErr) {
        console.error("AI Moderation error:", aiErr);
        // If AI fails, we fall back to the manual sensitive word filter (already passed)
      }
    }

    // 5. Save Bottle
    const { energyColorTag } = req.body;
    const result = await pool.query(
      "INSERT INTO bottles (user_id, content, element, lang, origin_locale, card_id, quote, report_id, sender_nickname, card_image_url, card_name_saved, energy_color_tag, tag_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [userId, content, element, lang, originLocale, cardId, quote, reportId, nickname, cardImageUrl, cardName, energyColorTag, tagId]
    );
    
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Error casting bottle:", err);
    if (err.code === '23505' && err.detail?.includes('report_id')) {
      return res.status(400).json({ 
        error: "This energy report has already been cast into the ocean.", 
        code: "REPORT_ALREADY_USED" 
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/random", async (req, res) => {
  const { userId } = req.query;
  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) 
       FROM bottles b 
       WHERE b.is_active = TRUE 
         AND b.user_id != $1 
         AND b.created_at > NOW() - INTERVAL '30 days'
         AND b.id NOT IN (
           SELECT bottle_id FROM saved_bottles WHERE user_id = $1
           UNION
           SELECT bottle_id FROM bottle_blessings WHERE user_id = $1
         )`,
      [userId || '']
    );
    
    const count = parseInt(countResult.rows[0].count);
    if (count === 0) {
      return res.status(404).json({ error: "No bottles found in the ocean." });
    }
    
    const randomOffset = Math.floor(Math.random() * count);
    
    const result = await pool.query(
      `SELECT b.*, 
              COALESCE(b.sender_nickname, u.display_name) as sender_name,
              COALESCE(b.card_image_url, ci.image_url, cw.image_url) as card_image,
              COALESCE(b.card_name_saved, ci.name, cw.name) as card_name,
              er.report_data,
              bt.zh as tag_zh,
              bt.ja as tag_ja,
              COUNT(bb.id) as blessing_count
       FROM bottles b 
       JOIN users u ON b.user_id = u.uid 
       LEFT JOIN cards_image ci ON b.card_id = ci.id
       LEFT JOIN cards_word cw ON b.card_id = cw.id
       LEFT JOIN energy_reports er ON b.report_id = er.id
       LEFT JOIN bottle_tags bt ON b.tag_id = bt.id
       LEFT JOIN bottle_blessings bb ON b.id = bb.bottle_id
       WHERE b.is_active = TRUE 
         AND b.user_id != $1 
         AND b.created_at > NOW() - INTERVAL '30 days'
         AND b.id NOT IN (
           SELECT bottle_id FROM saved_bottles WHERE user_id = $1
           UNION
           SELECT bottle_id FROM bottle_blessings WHERE user_id = $1
         )
       GROUP BY b.id, u.display_name, ci.image_url, ci.name, cw.image_url, cw.name, er.report_data, bt.zh, bt.ja
       OFFSET $2 LIMIT 1`,
      [userId || '', randomOffset]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No bottles found in the ocean." });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching random bottle:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/bless", async (req, res) => {
  const { id } = req.params;
  const { userId, content } = req.body;
  try {
    await pool.query(
      "INSERT INTO bottle_blessings (bottle_id, user_id, content) VALUES ($1, $2, $3)",
      [id, userId, content]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error blessing bottle:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/save", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await pool.query(
      "INSERT INTO saved_bottles (bottle_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving bottle:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/saved/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.*, sb.saved_at, 
              COALESCE(b.sender_nickname, u.display_name) as sender_name,
              COALESCE(b.card_image_url, ci.image_url, cw.image_url) as card_image,
              COALESCE(b.card_name_saved, ci.name, cw.name) as card_name,
              bt.zh as tag_zh,
              bt.ja as tag_ja
       FROM saved_bottles sb
       JOIN bottles b ON sb.bottle_id = b.id
       JOIN users u ON b.user_id = u.uid
       LEFT JOIN cards_image ci ON b.card_id = ci.id
       LEFT JOIN cards_word cw ON b.card_id = cw.id
       LEFT JOIN bottle_tags bt ON b.tag_id = bt.id
       WHERE sb.user_id = $1
       ORDER BY sb.saved_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching saved bottles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.*, 
              bt.zh as tag_zh,
              bt.ja as tag_ja,
              COUNT(bb.id) as blessing_count
       FROM bottles b
       LEFT JOIN bottle_tags bt ON b.tag_id = bt.id
       LEFT JOIN bottle_blessings bb ON b.id = bb.bottle_id
       WHERE b.user_id = $1
       GROUP BY b.id, bt.zh, bt.ja
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching my bottles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/blessings", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT bb.*, u.display_name, u.photo_url 
       FROM bottle_blessings bb
       JOIN users u ON bb.user_id = u.uid
       WHERE bb.bottle_id = $1
       ORDER BY bb.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching bottle blessings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
