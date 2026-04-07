export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const sma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(sma);
    } else {
      const prev = result[i - 1]!;
      result.push(data[i] * k + prev * (1 - k));
    }
  }
  return result;
}

export function calculateRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) { result.push(null); continue; }
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);

    if (i < period) { result.push(null); continue; }

    if (i === period) {
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    } else {
      const prevRsi = result[i - 1]!;
      const prevAvgGain = (100 / (100 - prevRsi) - 1) > 0
        ? gains.slice(-period).reduce((a, b) => a + b, 0) / period
        : 0;
      const avgGain = (prevAvgGain * (period - 1) + gains[gains.length - 1]) / period;
      const avgLoss = (((period - 1) * (losses.slice(-period - 1, -1).reduce((a, b) => a + b, 0) / period)) + losses[losses.length - 1]) / period;
      result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    }
  }
  return result;
}

export function calculateRSISimple(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return result;

  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += -change;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

export function calculateMACD(closes: number[]): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12.map((v, i) => (v !== null && ema26[i] !== null ? v - ema26[i]! : null));
  const macdValues = macd.filter((v): v is number => v !== null);
  const signalRaw = calculateEMA(macdValues, 9);
  
  const signal: (number | null)[] = new Array(macd.length).fill(null);
  const histogram: (number | null)[] = new Array(macd.length).fill(null);
  let idx = 0;
  for (let i = 0; i < macd.length; i++) {
    if (macd[i] !== null) {
      signal[i] = signalRaw[idx] ?? null;
      histogram[i] = macd[i] !== null && signal[i] !== null ? macd[i]! - signal[i]! : null;
      idx++;
    }
  }
  return { macd, signal, histogram };
}

export function calculateBollingerBands(closes: number[], period = 20, stdDev = 2): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null) { upper.push(null); lower.push(null); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance = slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(mean + stdDev * sd);
    lower.push(mean - stdDev * sd);
  }
  return { upper, middle, lower };
}

export function generateSignals(closes: number[]): { type: 'BUY' | 'SELL'; indicator: string; strength: string }[] {
  const signals: { type: 'BUY' | 'SELL'; indicator: string; strength: string }[] = [];
  const rsi = calculateRSISimple(closes);
  const lastRsi = rsi[rsi.length - 1];
  
  if (lastRsi !== null) {
    if (lastRsi < 30) signals.push({ type: 'BUY', indicator: 'RSI', strength: lastRsi < 20 ? 'strong' : 'medium' });
    if (lastRsi > 70) signals.push({ type: 'SELL', indicator: 'RSI', strength: lastRsi > 80 ? 'strong' : 'medium' });
  }

  const ma50 = calculateSMA(closes, 50);
  const ma200 = calculateSMA(closes, 200);
  const last50 = ma50[ma50.length - 1];
  const prev50 = ma50[ma50.length - 2];
  const last200 = ma200[ma200.length - 1];
  const prev200 = ma200[ma200.length - 2];

  if (last50 !== null && last200 !== null && prev50 !== null && prev200 !== null) {
    if (prev50 < prev200 && last50 > last200) signals.push({ type: 'BUY', indicator: 'MA Crossover', strength: 'strong' });
    if (prev50 > prev200 && last50 < last200) signals.push({ type: 'SELL', indicator: 'MA Crossover', strength: 'strong' });
  }

  const { macd, signal } = calculateMACD(closes);
  const lastMacd = macd[macd.length - 1];
  const prevMacd = macd[macd.length - 2];
  const lastSignal = signal[signal.length - 1];
  const prevSignal = signal[signal.length - 2];

  if (lastMacd !== null && lastSignal !== null && prevMacd !== null && prevSignal !== null) {
    if (prevMacd < prevSignal && lastMacd > lastSignal) signals.push({ type: 'BUY', indicator: 'MACD', strength: 'medium' });
    if (prevMacd > prevSignal && lastMacd < lastSignal) signals.push({ type: 'SELL', indicator: 'MACD', strength: 'medium' });
  }

  return signals;
}

export function detectTrend(closes: number[]): 'Uptrend' | 'Downtrend' | 'Sideways' {
  if (closes.length < 50) return 'Sideways';
  const ma20 = calculateSMA(closes, 20);
  const ma50 = calculateSMA(closes, 50);
  const last20 = ma20[ma20.length - 1];
  const last50 = ma50[ma50.length - 1];
  const lastClose = closes[closes.length - 1];
  
  if (last20 !== null && last50 !== null) {
    if (lastClose > last20 && last20 > last50) return 'Uptrend';
    if (lastClose < last20 && last20 < last50) return 'Downtrend';
  }
  return 'Sideways';
}
