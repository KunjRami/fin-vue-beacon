# FinDash — Financial Market Analytics Dashboard

**Built by Kunj Rami**

FinDash is a comprehensive, interactive financial market analytics dashboard built with React, TypeScript, Tailwind CSS, and shadcn/ui. It provides real-time stock analysis, technical indicators, price prediction using linear regression, backtesting capabilities, watchlist management, and auto-generated trading signals.

## Features

- **Market Overview Dashboard** — Top gainers, losers, and major market indices
- **Technical Analysis** — Interactive charts with SMA, RSI, MACD, and Bollinger Bands
- **Price Prediction** — Linear regression-based forecasting with save capability
- **Backtesting Engine** — Test MA Crossover and RSI strategies on historical data
- **Watchlist** — Track your favorite stocks with persistent storage
- **Trading Signals** — Auto-generated BUY/SELL signals based on technical indicators
- **Profile Management** — Update display name and export market reports (CSV)
- **Dark/Light Mode** — Fully themed UI with persistent preference storage
- **REST API Backend** — Node.js + Express + MySQL database

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Recharts (charts)
- React Router (routing)
- Axios (HTTP client)

### Backend

- Node.js + Express
- MySQL (mysql2 driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors
- dotenv

## Project Structure

```
fin-vue-beacon/
├── server/                 # Node.js + Express + MySQL backend
│   ├── database/schema.sql # MySQL schema
│   ├── middleware/auth.js  # JWT verification
│   ├── routes/             # API route handlers
│   ├── db.js               # MySQL connection
│   ├── index.js            # Server entry point
│   ├── .env                # Backend env variables
│   └── package.json
├── src/
│   ├── api/client.ts       # Axios HTTP client with JWT
│   ├── components/         # React components (shadcn/ui)
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, sample data, indicators, backtesting
│   └── pages/              # Route pages
├── .env                    # Frontend env variables
├── index.html
├── package.json
└── vite.config.ts
```

---

## Prerequisites

| Requirement | Version | How to Check      |
| ----------- | ------- | ----------------- |
| Node.js     | >= 18   | `node -v`         |
| MySQL       | >= 8.0  | `mysql --version` |
| npm         | >= 9    | `npm -v`          |

### Install Node.js

Download from: https://nodejs.org/ (LTS version recommended)

### Install MySQL

Download from: https://dev.mysql.com/downloads/installer/

- Set a **root password** during setup and remember it
- Ensure MySQL service is running (check Services app or `services.msc`)

---

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd fin-vue-beacon
npm install
cd server
npm install
cd ..
```

### Step 2: Create Environment Files

**Backend env** (`fin-vue-beacon/server/.env`):

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=findash
JWT_SECRET=your_super_secret_jwt_key_change_this
```

**Frontend env** (`fin-vue-beacon/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

> Replace `YOUR_MYSQL_ROOT_PASSWORD` with your actual MySQL root password.

### Step 3: Create Database and Run Schema

**Option A — Using MySQL CLI:**

```bash
cd fin-vue-beacon/server
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS findash;"
mysql -u root -p findash < database/schema.sql
```

**Option B — Using Node.js (if MySQL CLI not available):**

```bash
cd fin-vue-beacon/server
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.execute('CREATE DATABASE IF NOT EXISTS findash');
  await conn.end();

  const db = require('./db');
  const fs = require('fs');
  const sql = fs.readFileSync('./database/schema.sql', 'utf8');
  const stmts = sql.split(';').filter(s => s.trim());
  for (const stmt of stmts) {
    try { await db.query(stmt); } catch(e) { }
  }
  console.log('Schema applied!');
  process.exit(0);
})();
"
```

**Verify:**

```bash
cd fin-vue-beacon/server
node -e "const db=require('./db'); db.query('SHOW TABLES').then(r=>console.log('Tables:', r[0].map(t=>Object.values(t)[0]))).catch(e=>console.error(e.message))"
```

Expected output: `users`, `profiles`, `watchlist`, `predictions`, `backtesting_results`

---

## How to Start the Application

You need **TWO** terminals open.

### Terminal 1 — Start Backend

```bash
cd fin-vue-beacon/server
npm start
```

Expected output:

```
Connected to MySQL database: findash
FinDash server running on http://localhost:5000
```

> Keep this terminal open.

### Terminal 2 — Start Frontend

```bash
cd fin-vue-beacon
npm run dev
```

Expected output:

```
  VITE v5.4.21  ready in X ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.x.x:8080/
```

> Keep this terminal open.

### Open in Browser

Navigate to: **http://localhost:8080/**

---

## How to Stop the Application

| Component | How to Stop                                 |
| --------- | ------------------------------------------- |
| Frontend  | Terminal 2 → Press `Ctrl + C` → Confirm `Y` |
| Backend   | Terminal 1 → Press `Ctrl + C` → Confirm `Y` |
| MySQL     | Optional — `services.msc` → MySQL → Stop    |

---

## Default Ports

| Service           | Port | URL                   |
| ----------------- | ---- | --------------------- |
| Frontend (Vite)   | 8080 | http://localhost:8080 |
| Backend (Express) | 5000 | http://localhost:5000 |
| MySQL             | 3306 | localhost:3306        |

If port 8080 is busy, Vite will auto-switch to 8081, 8082, etc.

---

## Troubleshooting

### "ECONNREFUSED" on frontend

- Backend server is not running. Start it in Terminal 1.

### "JWT_SECRET is not defined"

- `server/.env` is missing or `JWT_SECRET` is not set. Add it and restart backend.

### "Unknown database 'findash'"

- Database not created. Run Step 3 (Database Setup) again.

### "Port 5000 already in use"

- Another backend instance is running. Kill it or change `PORT` in `server/.env`.

---

## MySQL Schema Tables

| Table                 | Purpose                         |
| --------------------- | ------------------------------- |
| `users`               | User accounts (email, password) |
| `profiles`            | User profiles (display name)    |
| `watchlist`           | Saved stock watchlist items     |
| `predictions`         | Saved price predictions         |
| `backtesting_results` | Saved backtest results          |

---

## Author

**Kunj Rami**  
Final-year Computer Engineering student

---

This project was built as part of an academic final-year project submission.
