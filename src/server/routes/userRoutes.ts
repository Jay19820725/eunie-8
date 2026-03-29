import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// User API
router.get("/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE uid = $1", [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { uid, email, displayName, photoURL, role, subscription_status, points, subscription_tier, is_first_purchase, language, loop_stage } = req.body;
  console.log("POST /api/users - Body:", req.body);
  try {
    const result = await pool.query(
      `INSERT INTO users (uid, email, display_name, photo_url, role, subscription_status, points, subscription_tier, is_first_purchase, language, loop_stage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       ON CONFLICT (uid) DO UPDATE SET 
         email = EXCLUDED.email, 
         display_name = COALESCE(EXCLUDED.display_name, users.display_name),
         photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
         last_login = CURRENT_TIMESTAMP 
       RETURNING *`,
      [
        uid, 
        email, 
        displayName, 
        photoURL, 
        role || 'free_member', 
        subscription_status || 'none',
        points !== undefined ? points : 1,
        subscription_tier || 'none',
        is_first_purchase !== undefined ? is_first_purchase : true,
        language || 'zh',
        loop_stage || 'calibration'
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating/updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:uid/points", async (req, res) => {
  const { uid } = req.params;
  try {
    const result = await pool.query(
      "SELECT points, subscription_status, subscription_tier, subscription_expiry, is_first_purchase FROM users WHERE uid = $1",
      [uid]
    );
    if (result.rows.length === 0) {
      return res.json({ points: 0, subscription_status: 'none', is_first_purchase: true });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user points:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:uid", async (req, res) => {
  const { uid } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  
  console.log(`PATCH /api/users/${uid} - Updates:`, updates);
  
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

  const setClause = fields.map((f, i) => {
    const colName = f === 'displayName' ? 'display_name' : f === 'photoURL' ? 'photo_url' : f;
    return `${colName} = $${i + 2}`;
  }).join(", ");
  
  const values = [uid, ...Object.values(updates)];

  try {
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE uid = $1 RETURNING *`, 
      values
    );
    
    if (result.rowCount === 0) {
      console.warn(`User with uid ${uid} not found for update`);
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`User ${uid} updated successfully:`, result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:uid/daily-status", async (req, res) => {
  const { uid } = req.params;
  try {
    // 1. Check if completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayResult = await pool.query(
      "SELECT id, today_theme FROM energy_reports WHERE user_id = $1 AND timestamp >= $2 ORDER BY timestamp DESC LIMIT 1",
      [uid, today]
    );
    
    const isCompletedToday = todayResult.rows.length > 0 && !!todayResult.rows[0].today_theme;
    
    // 2. Calculate streak
    const reportsResult = await pool.query(
      "SELECT DISTINCT DATE(timestamp) as report_date FROM energy_reports WHERE user_id = $1 ORDER BY report_date DESC",
      [uid]
    );
    
    let streak = 0;
    if (reportsResult.rows.length > 0) {
      const dates = reportsResult.rows.map(r => {
        const d = new Date(r.report_date);
        d.setHours(0, 0, 0, 0);
        return d;
      });
      
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      // If today is not in the list, check if yesterday is
      const todayStr = checkDate.toISOString().split('T')[0];
      const hasToday = dates.some(d => d.toISOString().split('T')[0] === todayStr);
      
      if (!hasToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i].toISOString().split('T')[0];
        const checkStr = checkDate.toISOString().split('T')[0];
        
        if (dateStr === checkStr) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Check if we skipped a day
          if (dateStr < checkStr) break;
        }
      }
    }
    
    const userResult = await pool.query(
      "SELECT loop_stage FROM users WHERE uid = $1",
      [uid]
    );
    const loopStage = userResult.rows[0]?.loop_stage || 'calibration';

    res.json({
      isCompletedToday,
      streak,
      loopStage,
      lastReportId: todayResult.rows[0]?.id || null
    });
  } catch (err) {
    console.error("Error fetching daily status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
