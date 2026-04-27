const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, symbol, name, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { symbol, name } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO watchlist (user_id, symbol, name) VALUES (?, ?, ?)",
      [req.userId, symbol, name]
    );
    const [rows] = await db.query("SELECT * FROM watchlist WHERE id = ?", [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Already in watchlist" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM watchlist WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

