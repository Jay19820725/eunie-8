import { Router } from "express";
import { pool } from "../db.ts";

const router = Router();

// Payments Simulation
router.post("/simulate", async (req, res) => {
  const { userId, type, amount, currency } = req.body;
  try {
    if (type === 'subscription') {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      await pool.query(
        `UPDATE users SET 
          subscription_status = 'active', 
          subscription_tier = 'premium', 
          subscription_expiry = $1, 
          points = 15,
          is_first_purchase = FALSE
         WHERE uid = $2`,
        [expiry, userId]
      );
    } else if (type === 'points_pack') {
      await pool.query(
        "UPDATE users SET points = points + 15, is_first_purchase = FALSE WHERE uid = $1",
        [userId]
      );
    } else if (type === 'trial_point') {
      await pool.query(
        "UPDATE users SET points = points + 1, is_first_purchase = FALSE WHERE uid = $1",
        [userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error simulating payment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Subscription API
router.post("/trial", async (req, res) => {
  const { userId } = req.body;
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days trial
    
    const result = await pool.query(
      `UPDATE users SET 
        subscription_status = 'trialing',
        subscription_tier = 'premium',
        subscription_type = 'monthly',
        subscription_expiry = $1,
        trial_start_date = CURRENT_TIMESTAMP
       WHERE uid = $2 RETURNING *`,
      [expiryDate.toISOString(), userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error starting trial:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update", async (req, res) => {
  const { userId, tier, type, status, durationMonths } = req.body;
  try {
    let expiryDate = null;
    if (status === 'active') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (durationMonths || 1));
    }
    
    const result = await pool.query(
      `UPDATE users SET 
        subscription_status = $1,
        subscription_tier = $2,
        subscription_type = $3,
        subscription_expiry = $4
       WHERE uid = $5 RETURNING *`,
      [status, tier, type, expiryDate ? expiryDate.toISOString() : null, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating subscription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
