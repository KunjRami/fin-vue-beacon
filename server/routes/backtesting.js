const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM backtesting_results WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { symbol, strategy, total_trades, winning_trades, profit_loss, win_rate, equity_curve, params } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO backtesting_results (user_id, symbol, strategy, total_trades, winning_trades, profit_loss, win_rate, equity_curve, params) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.userId, symbol, strategy, total_trades, winning_trades, profit_loss, win_rate, JSON.stringify(equity_curve), JSON.stringify(params)]
    );
    const [rows] = await db.query("SELECT * FROM backtesting_results WHERE id = ?", [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM backtesting_results WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

