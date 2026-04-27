require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const watchlistRoutes = require("./routes/watchlist");
const predictionsRoutes = require("./routes/predictions");
const backtestingRoutes = require("./routes/backtesting");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/backtesting", backtestingRoutes);

app.listen(PORT, () => {
  console.log(`FinDash server running on http://localhost:${PORT}`);
});

