const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, display_name } = req.body;
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    await db.query("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [userId, email, hash]);
    await db.query(
      "INSERT INTO profiles (user_id, display_name) VALUES (?, ?)",
      [userId, display_name || email.split("@")[0]]
    );

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: userId, email, display_name: display_name || email.split("@")[0] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query("SELECT id, email, password_hash FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query("SELECT id, email FROM users WHERE id = ?", [decoded.userId]);
    if (users.length === 0) return res.status(401).json({ error: "User not found" });
    res.json({ user: users[0] });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;

