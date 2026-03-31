import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Admin Stats
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dauResult = await pool.query("SELECT count(*) FROM users WHERE last_login >= $1", [today]);
    const sessionsResult = await pool.query("SELECT count(*) FROM sessions WHERE session_time >= $1", [today]);
    const newUsersResult = await pool.query("SELECT count(*) FROM users WHERE register_date >= $1", [today]);
    const premiumResult = await pool.query("SELECT count(*) FROM users WHERE subscription_status = 'active'");

    res.json({
      dau: parseInt(dauResult.rows[0].count),
      dailySessions: parseInt(sessionsResult.rows[0].count),
      newUsers: parseInt(newUsersResult.rows[0].count),
      premiumSubscriptions: parseInt(premiumResult.rows[0].count)
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Management
router.get("/users", async (req, res) => {
  const limit = req.query.limit || 50;
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY register_date DESC LIMIT $1", [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Session Management
router.get("/sessions", async (req, res) => {
  const limit = req.query.limit || 50;
  try {
    const result = await pool.query("SELECT * FROM sessions ORDER BY session_time DESC LIMIT $1", [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all sessions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sessions/drafts", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM sessions WHERE pairs = '[]' OR pairs IS NULL"
    );
    res.json({ success: true, count: result.rowCount });
  } catch (err) {
    console.error("Error deleting session drafts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Card Management
router.post("/cards/image", async (req, res) => {
  const { id, image_url, description, elements, locale, name_en, name } = req.body;
  try {
    await pool.query(
      `INSERT INTO cards_image (id, image_url, description, elements, locale, name_en, name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (id) DO UPDATE SET 
         image_url = EXCLUDED.image_url, 
         description = EXCLUDED.description, 
         elements = EXCLUDED.elements,
         locale = EXCLUDED.locale,
         name_en = EXCLUDED.name_en,
         name = EXCLUDED.name`,
      [id, image_url, description, JSON.stringify(elements), locale || 'zh-TW', name_en, name]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving image card:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cards/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM cards_image WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting image card:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cards/word", async (req, res) => {
  const { id, text, image_url, description, elements, locale, name_en, name } = req.body;
  try {
    await pool.query(
      `INSERT INTO cards_word (id, text, image_url, description, elements, locale, name_en, name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (id) DO UPDATE SET 
         text = EXCLUDED.text, 
         image_url = EXCLUDED.image_url, 
         description = EXCLUDED.description, 
         elements = EXCLUDED.elements,
         locale = EXCLUDED.locale,
         name_en = EXCLUDED.name_en,
         name = EXCLUDED.name`,
      [id, text, image_url, description, JSON.stringify(elements), locale || 'zh-TW', name_en, name]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving word card:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cards/word/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM cards_word WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting word card:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Subscription Management
router.get("/subscriptions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE subscription_status != 'none' ORDER BY subscription_status, register_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Report Management
router.get("/reports", async (req, res) => {
  const { email, limit = 50, offset = 0 } = req.query;
  try {
    let query = `
      SELECT r.*, u.email as user_email, u.display_name as user_name 
      FROM energy_reports r
      LEFT JOIN users u ON r.user_id = u.uid
    `;
    const values: any[] = [];
    
    if (email) {
      query += " WHERE u.email ILIKE $1";
      values.push(`%${email}%`);
    }
    
    const countQuery = `SELECT count(*) FROM (${query}) as total`;
    const totalResult = await pool.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count);

    query += ` ORDER BY r.timestamp DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    res.json({ reports: result.rows, total });
  } catch (err) {
    console.error("Error fetching admin reports:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/reports/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM energy_reports WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting admin report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/reports", async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid IDs" });
  }
  try {
    await pool.query("DELETE FROM energy_reports WHERE id = ANY($1)", [ids]);
    res.status(204).send();
  } catch (err) {
    console.error("Error batch deleting admin reports:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Prompt Management
router.get("/prompts", async (req, res) => {
  const { report_type } = req.query;
  try {
    let query = "SELECT * FROM ai_prompts";
    const params = [];
    if (report_type) {
      params.push(report_type);
      query += " WHERE report_type = $1";
    }
    query += " ORDER BY report_type ASC, section_key ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching prompts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/prompts", async (req, res) => {
  const { id, report_type, section_key, prompt_zh, prompt_ja, is_enabled } = req.body;
  try {
    if (id) {
      await pool.query(
        "UPDATE ai_prompts SET report_type = $1, section_key = $2, prompt_zh = $3, prompt_ja = $4, is_enabled = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6",
        [report_type, section_key, prompt_zh, prompt_ja, is_enabled, id]
      );
    } else {
      await pool.query(
        "INSERT INTO ai_prompts (report_type, section_key, prompt_zh, prompt_ja, is_enabled) VALUES ($1, $2, $3, $4, $5)",
        [report_type, section_key, prompt_zh, prompt_ja, is_enabled]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/prompts/sync-defaults", async (req, res) => {
  const { mode, report_type } = req.body; // mode: 'sync' or 'reset'
  try {
    const defaultPrompts = [
      // Daily Calibration
      { type: 'daily', key: 'system_instruction', zh: '妳是一位優雅、溫暖且專業的能量分析師，擅長透過五行能量與牌陣為使用者提供每日指引。', ja: 'あなたは優雅で温かく、プロフェッショナルなエネルギーアナリストです。五行エネルギーとカードスプレッドを通じて、ユーザーに毎日のガイダンスを提供することに長けています。' },
      { type: 'daily', key: 'today_theme', zh: '請根據五行分數與牌陣，總結今日的核心能量主題。', ja: '五行スコアとカードスプレッドに基づき、今日の核心的なエネルギーテーマを要約してください。' },
      { type: 'daily', key: 'psych_insight', zh: '透過牌面意象分析使用者潛意識的現狀與心理狀態。', ja: 'カードのイメージを通じて、ユーザーの潜在意識の現状と心理状態を分析してください。' },
      { type: 'daily', key: 'card_detail', zh: '針對三組配對（Pair）進行細部能量解讀與關聯分析。', ja: '3つのペア（Pair）に対して、詳細なエネルギー解読と関連分析を行ってください。' },
      { type: 'daily', key: 'five_elements', zh: '解釋木火土金水的強弱對生活、情緒的具體影響。', ja: '木火土金水の強弱が生活や情緒に与える具体的な影響を説明してください。' },
      { type: 'daily', key: 'inner_dialogue', zh: '提供一個反思問題，引導使用者與內在自我進行對話。', ja: 'ユーザーが内なる自己と対話できるよう、リフレクションのための質問を1つ提供してください。' },
      { type: 'daily', key: 'action_guide', zh: '給予具體、溫暖且可執行的生活小建議。', ja: '具体的で温かく、実行可能な生活上のアドバイスを提供してください。' },
      
      // Inner Relief (Wish)
      { type: 'wish', key: 'system_instruction', zh: '妳是一位溫柔的靈魂擺渡人，擅長使用隱喻與情感支持來引導使用者面對內心的困境與願望。', ja: 'あなたは優しい魂の渡し守です。隠喩と感情的なサポートを用いて、ユーザーが内面の困難や願いに向き合えるよう導くことに長けています。' },
      { type: 'wish', key: 'soul_mirror', zh: '針對使用者的煩惱或願望，反映其內在真實的渴求與靈魂狀態。', ja: 'ユーザーの悩みや願いに対し、その内面に秘められた真の渇望と魂の状態を映し出してください。' },
      { type: 'wish', key: 'destiny_whisper', zh: '使用詩意且充滿隱喻的語言，描述當前困境中潛藏的轉機。', ja: '詩的で隠喩に満ちた言葉を使い、現在の困難の中に潜む転機を描写してください。' },
      { type: 'wish', key: 'transform_path', zh: '提供一個具體的心理轉向建議，幫助使用者放下執著或找到新方向。', ja: '執着を手放したり、新しい方向性を見つけたりするための、具体的な心理的転換のアドバイスを提供してください。' },
      { type: 'wish', key: 'healing_ritual', zh: '建議一個簡單且具象徵意義的療癒儀式，釋放負能量。', ja: 'ネガティブなエネルギーを解放するための、シンプルで象徴的なヒーリング儀式を提案してください。' },
      { type: 'wish', key: 'plain_summary', zh: '用最直白、溫暖且充滿力量的語言總結核心建議。', ja: '最も率直で温かく、力強い言葉で核心的なアドバイスを要約してください。' }
    ];

    if (mode === 'reset') {
      if (report_type) {
        await pool.query("DELETE FROM ai_prompts WHERE report_type = $1", [report_type]);
      } else {
        await pool.query("DELETE FROM ai_prompts");
      }
    }

    for (const p of defaultPrompts) {
      if (report_type && p.type !== report_type) continue;

      const existing = await pool.query(
        "SELECT * FROM ai_prompts WHERE report_type = $1 AND section_key = $2",
        [p.type, p.key]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          "INSERT INTO ai_prompts (report_type, section_key, prompt_zh, prompt_ja) VALUES ($1, $2, $3, $4)",
          [p.type, p.key, p.zh, p.ja]
        );
      } else if (mode === 'sync') {
        const row = existing.rows[0];
        const updateZh = !row.prompt_zh || row.prompt_zh.trim() === '';
        const updateJa = !row.prompt_ja || row.prompt_ja.trim() === '';
        
        if (updateZh || updateJa) {
          await pool.query(
            "UPDATE ai_prompts SET prompt_zh = CASE WHEN $1 THEN $2 ELSE prompt_zh END, prompt_ja = CASE WHEN $3 THEN $4 ELSE prompt_ja END WHERE id = $5",
            [updateZh, p.zh, updateJa, p.ja, row.id]
          );
        }
      } else if (mode === 'reset') {
         await pool.query(
           "UPDATE ai_prompts SET prompt_zh = $1, prompt_ja = $2 WHERE id = $3",
           [p.zh, p.ja, existing.rows[0].id]
         );
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error syncing default prompts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/prompts/test", async (req, res) => {
  res.status(400).json({ 
    error: "AI prompt testing must be performed from the frontend client to ensure correct API key usage." 
  });
});

router.delete("/prompts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM ai_prompts WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/prompts/:id/activate", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE ai_prompts SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error activating prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Music Management
router.get("/music", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM music_tracks ORDER BY sort_order ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin music:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/music", async (req, res) => {
  const { name, title, artist, category, element, url, is_active, sort_order } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  const safeSortOrder = parseInt(sort_order) || 0;
  try {
    const result = await pool.query(
      `INSERT INTO music_tracks (name, title, artist, category, element, url, is_active, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (url) DO UPDATE SET 
         name = EXCLUDED.name, 
         title = EXCLUDED.title, 
         artist = EXCLUDED.artist, 
         category = EXCLUDED.category, 
         element = EXCLUDED.element, 
         is_active = EXCLUDED.is_active, 
         sort_order = EXCLUDED.sort_order
       RETURNING *`,
      [name, title, artist, category, element, url, is_active, safeSortOrder]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving music track:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/music/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM music_tracks WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting music track:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Analytics Management
router.get("/analytics", async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const usersResult = await pool.query("SELECT * FROM users");
    const sessionsResult = await pool.query("SELECT * FROM sessions WHERE session_time >= $1", [thirtyDaysAgo]);
    const journalsResult = await pool.query("SELECT * FROM energy_journal");

    const allUsers = usersResult.rows;
    const allSessions = sessionsResult.rows;
    const allJournals = journalsResult.rows;

    const groupByDate = (data: any[], dateField: string, days: number) => {
      const result: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        result[dateStr] = 0;
      }
      data.forEach(item => {
        const date = new Date(item[dateField]);
        const dateStr = date.toISOString().split('T')[0];
        if (result[dateStr] !== undefined) result[dateStr]++;
      });
      return Object.entries(result)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    const dauTrend30 = groupByDate(allUsers.filter(u => u.last_login), 'last_login', 30);
    const sessionsTrend30 = groupByDate(allSessions, 'session_time', 30);

    const emotionCounts: Record<string, number> = {};
    allJournals.forEach(j => {
      const emotion = j.emotion_tag || 'unknown';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const totalUsers = allUsers.length;
    const premiumUsers = allUsers.filter(u => u.subscription_status === 'active').length;
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    const sessionStarted = new Set(allSessions.map(s => s.user_id)).size;
    const sessionCompleted = new Set(allSessions.filter(s => s.pairs && s.pairs.length > 0).map(s => s.user_id)).size;

    res.json({
      metrics: {
        dau: allUsers.filter(u => new Date(u.last_login).toDateString() === now.toDateString()).length,
        totalSessions: allSessions.length,
        premiumConversion: conversionRate.toFixed(1) + '%',
        totalUsers
      },
      trends: {
        sevenDays: dauTrend30.slice(-7).map((d, i) => ({
          date: d.date,
          dau: d.value,
          sessions: sessionsTrend30.slice(-7)[i].value
        })),
        thirtyDays: dauTrend30.map((d, i) => ({
          date: d.date,
          dau: d.value,
          sessions: sessionsTrend30[i].value
        }))
      },
      emotionDistribution: Object.entries(emotionCounts).map(([name, value]) => ({ name, value })),
      funnelData: [
        { name: '註冊用戶', value: totalUsers, fill: '#8BA889' },
        { name: '開始抽卡', value: sessionStarted, fill: '#C4B08B' },
        { name: '完成抽卡', value: sessionCompleted, fill: '#D98B73' },
        { name: '付費會員', value: premiumUsers, fill: '#6B7B8C' },
      ]
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Site Settings Management
router.post("/settings/:key", async (req, res) => {
  const { key } = req.params;
  const value = req.body;
  try {
    await pool.query(
      "INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP",
      [key, JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Error saving settings ${key}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bottles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bottles WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting bottle:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bottles/tags", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM bottle_tags 
      WHERE (zh IS NOT NULL AND zh != '') OR (ja IS NOT NULL AND ja != '')
      ORDER BY sort_order ASC, created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin bottle tags:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bottles/tags", async (req, res) => {
  const { id, zh, ja, color, category, sort_order } = req.body;
  if ((!zh || zh.trim() === '') && (!ja || ja.trim() === '')) {
    return res.status(400).json({ error: "At least one translation (ZH or JA) must be provided" });
  }
  try {
    if (id) {
      await pool.query(
        "UPDATE bottle_tags SET zh = $1, ja = $2, color = $3, category = $4, sort_order = $5 WHERE id = $6",
        [zh, ja, color, category || 'blessing', sort_order || 0, id]
      );
    } else {
      await pool.query(
        "INSERT INTO bottle_tags (zh, ja, color, category, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [zh, ja, color, category || 'blessing', sort_order || 0]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving bottle tag:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bottles/tags/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bottle_tags WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting bottle tag:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sensitive Words Management
router.get("/sensitive-words", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sensitive_words ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sensitive words:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sensitive-words", async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "Word is required" });
  try {
    await pool.query("INSERT INTO sensitive_words (word) VALUES ($1) ON CONFLICT DO NOTHING", [word]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding sensitive word:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sensitive-words/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM sensitive_words WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting sensitive word:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
