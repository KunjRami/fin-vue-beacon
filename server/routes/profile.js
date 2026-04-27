const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT display_name, avatar_url, theme_preference FROM profiles WHERE user_id = ?",
      [req.userId]
    );
    if (rows.length === 0) {
      await db.query(
        "INSERT INTO profiles (user_id, display_name) VALUES (?, ?)",
        [req.userId, req.email.split("@")[0]]
      );
      return res.json({ display_name: req.email.split("@")[0], avatar_url: null, theme_preference: "dark" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  const { display_name, theme_preference } = req.body;
  try {
    await db.query(
      "UPDATE profiles SET display_name = COALESCE(?, display_name), theme_preference = COALESCE(?, theme_preference) WHERE user_id = ?",
      [display_name, theme_preference, req.userId]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

