const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { symbol, predicted_price, prediction_date, target_date, accuracy } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO predictions (user_id, symbol, predicted_price, prediction_date, target_date, accuracy) VALUES (?, ?, ?, ?, ?, ?)",
      [req.userId, symbol, predicted_price, prediction_date, target_date, accuracy]
    );
    const [rows] = await db.query("SELECT * FROM predictions WHERE id = ?", [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

