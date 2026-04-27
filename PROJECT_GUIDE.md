# FinDash — Project Guide for Presentation

**Prepared by Kunj Rami**

This guide explains how every feature of FinDash works, what algorithms and technologies are used, and what you can say to your professor during the project presentation.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Authentication & Security](#2-authentication--security)
3. [Dashboard](#3-dashboard)
4. [Technical Analysis](#4-technical-analysis)
5. [Price Prediction](#5-price-prediction)
6. [Backtesting](#6-backtesting)
7. [Trading Signals](#7-trading-signals)
8. [Watchlist](#8-watchlist)
9. [Profile & Export](#9-profile--export)
10. [Database Design](#10-database-design)

---

## 1. System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)   │
│  http://localhost:8080                  │
│  - User Interface                       │
│  - Charts & Visualizations              │
│  - State Management (Context API)       │
└─────────────────────┬───────────────────┘
                      │ HTTP (REST API)
                      ▼
┌─────────────────────────────────────────┐
│  Backend (Node.js + Express)            │
│  http://localhost:5000                  │
│  - Authentication (JWT)                 │
│  - Business Logic                       │
│  - API Endpoints                        │
└─────────────────────┬───────────────────┘
                      │ SQL Queries
                      ▼
┌─────────────────────────────────────────┐
│  Database (MySQL)                       │
│  localhost:3306                         │
│  - Persistent Data Storage              │
│  - User Data, Watchlist, Predictions    │
└─────────────────────────────────────────┘
```

### Why This Architecture?

- **Frontend** handles all visual rendering and user interactions
- **Backend** handles authentication, data validation, and database operations
- **Database** ensures data persists across sessions and browser refreshes

---

## 2. Authentication & Security

### How It Works

1. **Registration**: User fills email/password → Frontend sends POST to `/api/auth/register` → Backend hashes password with bcrypt → Stores in MySQL
2. **Login**: User submits credentials → Backend checks password hash → Generates JWT (JSON Web Token) → Sends token back
3. **Protected Routes**: After login, every API request includes `Authorization: Bearer <token>` header → Backend verifies token → Allows or denies access

### JWT (JSON Web Token)

```
┌────────────────────────────────────┐
│  Header (algorithm: HS256)         │
├────────────────────────────────────┤
│  Payload (user_id, email)          │
├────────────────────────────────────┤
│  Signature (HMAC-SHA256 secret)    │
└────────────────────────────────────┘
```

- Token is stored in browser's localStorage
- Token expires after 7 days (configurable)
- On logout, token is removed from localStorage

### bcrypt Password Hashing

- Plain text passwords are NEVER stored
- bcrypt adds a "salt" (random string) before hashing
- Even if database is compromised, passwords remain secure
- Verification: bcrypt compares hash of submitted password with stored hash

---

## 3. Dashboard

### Market Overview

Shows real-time market data using **sample data** (simulated stock prices). In a production app, this would connect to real-time APIs like Alpha Vantage or Yahoo Finance.

### Top Gainers & Losers

**Algorithm**: For each stock, calculate:

```
Change% = ((Today's Close - Yesterday's Close) / Yesterday's Close) × 100
```

- Sort all stocks by Change% descending → Top 5 = Gainers
- Sort all stocks by Change% ascending → Top 5 = Losers

### Market Indices

Benchmark indices (NIFTY 50, SENSEX, S&P 500, DOW JONES) with current value and percentage change.

### Search

- Real-time filtering on stock symbol and name
- Clicking a result navigates to the Analysis page for that stock

---

## 4. Technical Analysis

### Available Indicators

#### a) Simple Moving Average (SMA)

**Formula**: Average of last N closing prices

```
SMA(N) = (Price[t] + Price[t-1] + ... + Price[t-N+1]) / N
```

- **SMA 50**: Medium-term trend indicator
- **SMA 200**: Long-term trend indicator
- When SMA 50 crosses above SMA 200 = "Golden Cross" (bullish signal)
- When SMA 50 crosses below SMA 200 = "Death Cross" (bearish signal)

#### b) RSI (Relative Strength Index)

**Formula**:

```
RSI = 100 - (100 / (1 + RS))
where RS = Average Gain / Average Loss over 14 periods
```

- **RSI < 30**: Oversold (potential BUY)
- **RSI > 70**: Overbought (potential SELL)
- **RSI 30-70**: Neutral

#### c) MACD (Moving Average Convergence Divergence)

**Components**:

- MACD Line = EMA(12) - EMA(26)
- Signal Line = EMA(9) of MACD Line
- Histogram = MACD Line - Signal Line

**Signals**:

- MACD crosses above Signal = Bullish
- MACD crosses below Signal = Bearish

#### d) Bollinger Bands

**Formula**:

- Middle Band = 20-period SMA
- Upper Band = SMA + (2 × Standard Deviation)
- Lower Band = SMA - (2 × Standard Deviation)

- Price touches Upper Band = Potentially overbought
- Price touches Lower Band = Potentially oversold

### Trend Detection

Simple trend detection by comparing last price to earlier price:

- If last price > price 20 days ago → Uptrend
- If last price < price 20 days ago → Downtrend
- Otherwise → Sideways

---

## 5. Price Prediction

### Algorithm: Linear Regression

Uses the `regression` npm library to fit a straight line through historical closing prices.

**Formula**:

```
y = mx + b
where:
- y = predicted price
- x = day number
- m = slope (trend direction)
- b = y-intercept
```

**How it works**:

1. Take last N days of closing prices
2. Convert to coordinate pairs: [(0, price0), (1, price1), ...]
3. Fit linear regression line
4. Extend line to future days to predict prices

### R² Score (Coefficient of Determination)

Measures how well the regression line fits the data:

- **R² = 1**: Perfect fit (perfect prediction)
- **R² = 0**: No correlation
- **R² < 0**: Worse than random guess

### Model Accuracy

Displayed as: `accuracy = max(0, min(100, R² × 100))`

### Saving Predictions

After generating a prediction, you can save it to the database. This allows:

- Tracking prediction performance over time
- Comparing predicted vs actual prices later

### Limitations to Mention

- Linear regression assumes price moves in a straight line
- Real markets are influenced by news, sentiment, macroeconomics
- This is a basic model; production systems use ML (LSTM, Random Forest, etc.)

---

## 6. Backtesting

### What is Backtesting?

Testing a trading strategy on historical data to see how it would have performed.

### Available Strategies

#### a) MA Crossover Strategy

**Rules**:

- BUY when Short MA (20) crosses above Long MA (50)
- SELL when Short MA (20) crosses below Long MA (50)

**Logic**:

```
If MA20[t] > MA50[t] and MA20[t-1] <= MA50[t-1] → BUY
If MA20[t] < MA50[t] and MA20[t-1] >= MA50[t-1] → SELL
```

#### b) RSI Strategy

**Rules**:

- BUY when RSI drops below 30 (oversold bounce)
- SELL when RSI rises above 70 (overbought pullback)

### Metrics Calculated

| Metric         | Formula                               |
| -------------- | ------------------------------------- |
| Total Trades   | Count of all buy/sell executed        |
| Winning Trades | Trades with positive profit           |
| Losing Trades  | Trades with negative profit           |
| Win Rate       | (Winning Trades / Total Trades) × 100 |
| Profit/Loss    | Final Equity - Initial Equity         |
| Equity Curve   | Portfolio value over time             |

### Equity Curve

A line chart showing how portfolio value changed with each trade. Starting equity is set to $10,000.

### Why Backtesting Matters

- Validates strategy before risking real money
- Identifies weaknesses in strategy
- Helps optimize parameters (MA period, RSI threshold)

---

## 7. Trading Signals

### Signal Generation Logic

Signals are generated using a combination of indicators:

#### Buy Signals

- RSI drops below 30 (oversold)
- Price touches lower Bollinger Band
- MACD crosses above Signal line
- Price crosses above SMA 50

#### Sell Signals

- RSI rises above 70 (overbought)
- Price touches upper Bollinger Band
- MACD crosses below Signal line
- Price crosses below SMA 50

#### Signal Strength

- **Weak**: Single indicator triggered
- **Medium**: Two indicators aligned
- **Strong**: Three or more indicators aligned

### Implementation

The `generateSignals()` function in `src/lib/indicators.ts`:

1. Calculates all indicators for a stock
2. Checks each condition
3. Returns array of signals with type, indicator, and strength

---

## 8. Watchlist

### Purpose

Track favorite stocks for quick access and monitoring.

### Features

- Add stocks by symbol (AAPL, TCS, RELIANCE, etc.)
- Remove stocks from watchlist
- Click to navigate directly to Analysis page
- Persists across sessions (stored in MySQL)

### Database Schema

```
watchlist (id, user_id, symbol, name, added_at)
```

Each user has their own watchlist. Data is isolated per user via JWT.

---

## 9. Profile & Export

### Profile Features

- View registered email
- Update display name
- Changes saved to database

### Export Data (CSV)

Generates a CSV file with all available stocks:

```
Symbol, Name, Last Price, Change %
AAPL, Apple Inc., 175.50, +1.23
GOOGL, Alphabet Inc., 140.20, -0.45
...
```

Useful for offline analysis or reports.

### Implementation

Uses browser's Blob API to create downloadable file:

```javascript
const csv = rows.join("\n");
const blob = new Blob([csv], { type: "text/csv" });
```

---

## 10. Database Design

### Entity Relationship Diagram

```
┌─────────────┐      ┌─────────────┐
│    users    │──┬──▶│   profiles  │
│  (auth)     │  │    │ (info)      │
└──────┬──────┘  │    └─────────────┘
       │         │
       │    ┌────┴────┬────────────┬─────────────┐
       │    │         │            │             │
       ▼    ▼         ▼            ▼             ▼
    ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐
    │watchlist│  │predictions│  │  signals  │  │backtesting_results│
    └─────────┘  └──────────┘  └───────────┘  └──────────────────┘
```

### Table Details

#### users

| Column        | Type         | Description            |
| ------------- | ------------ | ---------------------- |
| id            | CHAR(36)     | UUID primary key       |
| email         | VARCHAR(255) | Unique email address   |
| password_hash | VARCHAR(255) | bcrypt hashed password |
| created_at    | DATETIME     | Registration timestamp |

#### profiles

| Column           | Type         | Description           |
| ---------------- | ------------ | --------------------- |
| id               | CHAR(36)     | UUID primary key      |
| user_id          | CHAR(36)     | FK to users.id        |
| display_name     | VARCHAR(100) | User's display name   |
| theme_preference | VARCHAR(20)  | 'dark' or 'light'     |
| created_at       | DATETIME     | Profile creation time |
| updated_at       | DATETIME     | Last updated time     |

#### watchlist

| Column   | Type         | Description               |
| -------- | ------------ | ------------------------- |
| id       | CHAR(36)     | UUID primary key          |
| user_id  | CHAR(36)     | FK to users.id            |
| symbol   | VARCHAR(20)  | Stock symbol (AAPL, etc.) |
| name     | VARCHAR(100) | Company name              |
| added_at | DATETIME     | When added                |

#### predictions

| Column          | Type        | Description              |
| --------------- | ----------- | ------------------------ |
| id              | CHAR(36)    | UUID primary key         |
| user_id         | CHAR(36)    | FK to users.id           |
| symbol          | VARCHAR(20) | Stock symbol             |
| predicted_price | DECIMAL     | ML model output          |
| actual_price    | DECIMAL     | Real price (if known)    |
| prediction_date | DATE        | When prediction was made |
| target_date     | DATE        | Date being predicted     |
| accuracy        | DECIMAL     | R² score × 100           |
| created_at      | DATETIME    | Creation timestamp       |

#### backtesting_results

| Column         | Type        | Description             |
| -------------- | ----------- | ----------------------- |
| id             | CHAR(36)    | UUID primary key        |
| user_id        | CHAR(36)    | FK to users.id          |
| symbol         | VARCHAR(20) | Stock tested            |
| strategy       | VARCHAR(50) | 'ma_crossover' or 'rsi' |
| total_trades   | INT         | Number of trades        |
| winning_trades | INT         | Profitable trades       |
| profit_loss    | DECIMAL     | Net P&L                 |
| win_rate       | DECIMAL     | Win percentage          |
| equity_curve   | JSON        | Array of equity values  |
| created_at     | DATETIME    | Creation timestamp      |

---

## Key Points to Mention to Professor

### Technical Highlights

1. **JWT Authentication** — Secure, stateless authentication
2. **MVC Architecture** — Clean separation of concerns
3. **RESTful API** — Standard HTTP methods for CRUD operations
4. **MySQL Relational Database** — ACID compliance, data integrity
5. **React Context API** — Global state management without Redux
6. **Responsive Design** — Works on desktop, tablet, and mobile
7. **Type Safety** — TypeScript prevents runtime errors

### Algorithms Used

1. **Linear Regression** for price prediction
2. **Simple Moving Average** for trend analysis
3. **RSI** for momentum measurement
4. **MACD** for trend-following
5. **Bollinger Bands** for volatility measurement
6. **Backtesting Engine** for strategy validation

### Real-World Relevance

- Technical indicators are used by professional traders
- Backtesting is mandatory before deploying trading algorithms
- This project demonstrates full-stack development skills
- Database design follows normalization principles

---

## Sample Stocks Available

| Symbol   | Name                | Base Price |
| -------- | ------------------- | ---------- |
| AAPL     | Apple Inc.          | $175       |
| GOOGL    | Alphabet Inc.       | $140       |
| MSFT     | Microsoft Corp.     | $380       |
| TSLA     | Tesla Inc.          | $250       |
| AMZN     | Amazon.com Inc.     | $150       |
| META     | Meta Platforms      | $350       |
| NVDA     | NVIDIA Corp.        | $500       |
| RELIANCE | Reliance Industries | ₹2500      |
| TCS      | Tata Consultancy    | ₹3500      |
| INFY     | Infosys Ltd.        | ₹1500      |

> These are simulated with random walk data for demonstration. Real implementation would use live market data APIs.

---

**End of Guide**

Good luck with your presentation, Kunj!
