
# FinDash – Smart Financial Analytics and Stock Prediction Dashboard

## Overview
A full-stack stock technical analysis dashboard built with React + Supabase, featuring real-time stock data via Yahoo Finance (RapidAPI), technical indicators, ML predictions, backtesting, and personalized watchlists.

## Phase 1: Foundation & Auth
- **Supabase Cloud setup** with database tables: `profiles`, `watchlist`, `signals`, `predictions`, `backtesting_results`
- **Supabase Auth** with email/password registration and login
- **App shell**: Sidebar navigation (Dashboard | Analysis | Prediction | Backtesting | Watchlist | Signals | Profile), dark/light theme toggle, responsive layout
- **Brand**: Dark financial theme with accent colors (green for gains, red for losses), clean card-based UI

## Phase 2: Dashboard Page
- Market overview cards (NIFTY 50, SENSEX, S&P 500 with sample/cached data)
- Stock search bar (enter symbol like AAPL, RELIANCE, TCS)
- Summary cards: Top gainers, top losers, market trend indicator
- Loading states and error handling throughout

## Phase 3: Stock Data Integration
- **Edge Function**: `fetch-stock-data` — proxies requests to Yahoo Finance via RapidAPI, returns OHLCV data + quote info
- Store RapidAPI key as a Supabase secret
- Client-side caching to minimize API calls

## Phase 4: Stock Analysis Module
- Interactive price chart using Recharts (candlestick/line chart)
- Technical indicators calculated client-side:
  - Moving Averages (MA 50, MA 200)
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - Bollinger Bands
- Overlay indicators on chart with toggles
- BUY/SELL signal display based on indicator confluence
- Trend detection (Uptrend/Downtrend)

## Phase 5: Prediction Module
- Client-side Linear Regression using `regression-js`
- Predict next 1-5 days stock price
- Predicted vs actual price comparison chart
- Prediction accuracy percentage display
- Save predictions to database per user

## Phase 6: Backtesting Module
- Strategy testing engine (client-side):
  - Moving Average Crossover strategy
  - RSI strategy
- Results display: Total trades, Profit/Loss, Win rate %
- Equity curve chart
- Save backtesting results to database

## Phase 7: Watchlist Module
- Add/remove stocks (stored per user in Supabase)
- Display current prices fetched from API
- Quick navigation to analysis page for each stock

## Phase 8: Signals Module
- Generate trading signals based on:
  - RSI thresholds (oversold < 30 = BUY, overbought > 70 = SELL)
  - MA crossover (golden cross / death cross)
  - MACD crossover
- Display signals in sortable/filterable table
- Store signals in database

## Phase 9: Profile & Extra Features
- User profile page with settings
- Export analysis report as CSV
- Loading indicators on all API calls
- Comprehensive error handling with toast notifications
- Dark/light theme persisted per user

## Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts
- **Backend**: Supabase Edge Functions (TypeScript)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (email/password)
- **Data**: Yahoo Finance via RapidAPI
- **ML**: regression-js (client-side linear regression)
