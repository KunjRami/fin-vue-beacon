import { calculateSMA, calculateRSISimple, type OHLCV } from "./indicators";

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  profitLoss: number;
  winRate: number;
  equityCurve: { date: string; equity: number }[];
}

export function backtestMACrossover(
  data: OHLCV[],
  shortPeriod = 20,
  longPeriod = 50,
  initialCapital = 100000
): BacktestResult {
  const closes = data.map((d) => d.close);
  const shortMA = calculateSMA(closes, shortPeriod);
  const longMA = calculateSMA(closes, longPeriod);

  let capital = initialCapital;
  let shares = 0;
  let entryPrice = 0;
  let totalTrades = 0;
  let winningTrades = 0;
  const equityCurve: { date: string; equity: number }[] = [];

  for (let i = 1; i < data.length; i++) {
    const prevShort = shortMA[i - 1];
    const prevLong = longMA[i - 1];
    const currShort = shortMA[i];
    const currLong = longMA[i];

    if (prevShort !== null && prevLong !== null && currShort !== null && currLong !== null) {
      if (prevShort <= prevLong && currShort > currLong && shares === 0) {
        shares = Math.floor(capital / closes[i]);
        entryPrice = closes[i];
        capital -= shares * closes[i];
      } else if (prevShort >= prevLong && currShort < currLong && shares > 0) {
        capital += shares * closes[i];
        totalTrades++;
        if (closes[i] > entryPrice) winningTrades++;
        shares = 0;
      }
    }

    const equity = capital + shares * closes[i];
    equityCurve.push({ date: data[i].date, equity });
  }

  if (shares > 0) {
    capital += shares * closes[closes.length - 1];
    totalTrades++;
    if (closes[closes.length - 1] > entryPrice) winningTrades++;
  }

  return {
    totalTrades,
    winningTrades,
    profitLoss: capital - initialCapital,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
    equityCurve,
  };
}

export function backtestRSI(
  data: OHLCV[],
  period = 14,
  oversold = 30,
  overbought = 70,
  initialCapital = 100000
): BacktestResult {
  const closes = data.map((d) => d.close);
  const rsi = calculateRSISimple(closes, period);

  let capital = initialCapital;
  let shares = 0;
  let entryPrice = 0;
  let totalTrades = 0;
  let winningTrades = 0;
  const equityCurve: { date: string; equity: number }[] = [];

  for (let i = 1; i < data.length; i++) {
    const currRsi = rsi[i];

    if (currRsi !== null) {
      if (currRsi < oversold && shares === 0) {
        shares = Math.floor(capital / closes[i]);
        entryPrice = closes[i];
        capital -= shares * closes[i];
      } else if (currRsi > overbought && shares > 0) {
        capital += shares * closes[i];
        totalTrades++;
        if (closes[i] > entryPrice) winningTrades++;
        shares = 0;
      }
    }

    const equity = capital + shares * closes[i];
    equityCurve.push({ date: data[i].date, equity });
  }

  if (shares > 0) {
    capital += shares * closes[closes.length - 1];
    totalTrades++;
    if (closes[closes.length - 1] > entryPrice) winningTrades++;
  }

  return {
    totalTrades,
    winningTrades,
    profitLoss: capital - initialCapital,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
    equityCurve,
  };
}
