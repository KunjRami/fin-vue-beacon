import type { OHLCV } from "./indicators";

function generateOHLCV(symbol: string, days: number, basePrice: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * basePrice * 0.03;
    price = Math.max(price + change, basePrice * 0.5);
    const open = price + (Math.random() - 0.5) * basePrice * 0.01;
    const high = Math.max(open, price) + Math.random() * basePrice * 0.015;
    const low = Math.min(open, price) - Math.random() * basePrice * 0.015;
    const volume = Math.floor(1000000 + Math.random() * 5000000);

    data.push({
      date: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +price.toFixed(2),
      volume,
    });
  }
  return data;
}

export const SAMPLE_STOCKS: Record<string, { name: string; data: OHLCV[] }> = {
  AAPL: { name: "Apple Inc.", data: generateOHLCV("AAPL", 365, 175) },
  GOOGL: { name: "Alphabet Inc.", data: generateOHLCV("GOOGL", 365, 140) },
  MSFT: { name: "Microsoft Corp.", data: generateOHLCV("MSFT", 365, 380) },
  TSLA: { name: "Tesla Inc.", data: generateOHLCV("TSLA", 365, 250) },
  AMZN: { name: "Amazon.com Inc.", data: generateOHLCV("AMZN", 365, 150) },
  META: { name: "Meta Platforms", data: generateOHLCV("META", 365, 350) },
  NVDA: { name: "NVIDIA Corp.", data: generateOHLCV("NVDA", 365, 500) },
  RELIANCE: { name: "Reliance Industries", data: generateOHLCV("RELIANCE", 365, 2500) },
  TCS: { name: "Tata Consultancy", data: generateOHLCV("TCS", 365, 3500) },
  INFY: { name: "Infosys Ltd.", data: generateOHLCV("INFY", 365, 1500) },
};

export const MARKET_INDICES = [
  { symbol: "^NSEI", name: "NIFTY 50", value: 22450.30, change: 1.24 },
  { symbol: "^BSESN", name: "SENSEX", value: 73890.45, change: 0.98 },
  { symbol: "^GSPC", name: "S&P 500", value: 5234.18, change: -0.32 },
  { symbol: "^DJI", name: "DOW JONES", value: 39127.80, change: -0.15 },
];

export function getTopGainers() {
  return Object.entries(SAMPLE_STOCKS)
    .map(([symbol, { name, data }]) => {
      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      const change = ((last.close - prev.close) / prev.close) * 100;
      return { symbol, name, price: last.close, change };
    })
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);
}

export function getTopLosers() {
  return Object.entries(SAMPLE_STOCKS)
    .map(([symbol, { name, data }]) => {
      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      const change = ((last.close - prev.close) / prev.close) * 100;
      return { symbol, name, price: last.close, change };
    })
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);
}
