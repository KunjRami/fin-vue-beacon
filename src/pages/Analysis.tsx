import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import {
  calculateSMA,
  calculateRSISimple,
  calculateMACD,
  calculateBollingerBands,
  generateSignals,
  detectTrend,
} from "@/lib/indicators";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar,
  ReferenceLine, ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Analysis() {
  const [params] = useSearchParams();
  const [symbol, setSymbol] = useState(params.get("symbol") || "AAPL");
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(true);
  const [showBB, setShowBB] = useState(false);

  const stock = SAMPLE_STOCKS[symbol];
  if (!stock) return <p className="text-muted-foreground">Stock not found.</p>;

  const closes = stock.data.map((d) => d.close);
  const ma50 = calculateSMA(closes, 50);
  const ma200 = calculateSMA(closes, 200);
  const rsi = calculateRSISimple(closes);
  const macd = calculateMACD(closes);
  const bb = calculateBollingerBands(closes);
  const signals = generateSignals(closes);
  const trend = detectTrend(closes);

  const chartData = stock.data.map((d, i) => ({
    date: d.date,
    price: d.close,
    ma50: ma50[i],
    ma200: ma200[i],
    bbUpper: bb.upper[i],
    bbMiddle: bb.middle[i],
    bbLower: bb.lower[i],
    rsi: rsi[i],
    macd: macd.macd[i],
    signal: macd.signal[i],
    histogram: macd.histogram[i],
    volume: d.volume,
  }));

  const lastPrice = closes[closes.length - 1];
  const prevPrice = closes[closes.length - 2];
  const changePercent = ((lastPrice - prevPrice) / prevPrice) * 100;
  const lastRsi = rsi[rsi.length - 1];

  const TrendIcon = trend === "Uptrend" ? TrendingUp : trend === "Downtrend" ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Analysis</h1>
          <p className="text-muted-foreground text-sm">Technical indicators & signals</p>
        </div>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SAMPLE_STOCKS).map(([s, { name }]) => (
              <SelectItem key={s} value={s}>{s} — {name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-xl font-bold font-mono">${lastPrice.toFixed(2)}</p>
            <p className={`text-xs font-medium ${changePercent >= 0 ? "text-gain" : "text-loss"}`}>
              {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Trend</p>
            <div className="flex items-center gap-2 mt-1">
              <TrendIcon className={`h-5 w-5 ${trend === "Uptrend" ? "text-gain" : trend === "Downtrend" ? "text-loss" : "text-muted-foreground"}`} />
              <span className="font-medium">{trend}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">RSI (14)</p>
            <p className={`text-xl font-bold font-mono ${lastRsi && lastRsi < 30 ? "text-gain" : lastRsi && lastRsi > 70 ? "text-loss" : ""}`}>
              {lastRsi?.toFixed(1) ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lastRsi && lastRsi < 30 ? "Oversold" : lastRsi && lastRsi > 70 ? "Overbought" : "Neutral"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Signals</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {signals.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
              {signals.map((s, i) => (
                <Badge key={i} variant={s.type === "BUY" ? "default" : "destructive"} className="text-xs">
                  {s.type} ({s.indicator})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicator Toggles */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={showMA50 ? "default" : "outline"} onClick={() => setShowMA50(!showMA50)}>MA 50</Button>
        <Button size="sm" variant={showMA200 ? "default" : "outline"} onClick={() => setShowMA200(!showMA200)}>MA 200</Button>
        <Button size="sm" variant={showBB ? "default" : "outline"} onClick={() => setShowBB(!showBB)}>Bollinger</Button>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Price Chart — {symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <ComposedChart data={chartData.slice(-120)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                {showBB && (
                  <>
                    <Area type="monotone" dataKey="bbUpper" stroke="none" fill="hsl(var(--primary) / 0.08)" />
                    <Area type="monotone" dataKey="bbLower" stroke="none" fill="hsl(var(--primary) / 0.08)" />
                    <Line type="monotone" dataKey="bbUpper" stroke="hsl(var(--chart-5))" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="bbLower" stroke="hsl(var(--chart-5))" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                  </>
                )}
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                {showMA50 && <Line type="monotone" dataKey="ma50" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />}
                {showMA200 && <Line type="monotone" dataKey="ma200" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RSI & MACD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">RSI (14)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <LineChart data={chartData.slice(-120)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <ReferenceLine y={70} stroke="hsl(var(--loss))" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="hsl(var(--gain))" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="hsl(var(--chart-5))" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">MACD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <ComposedChart data={chartData.slice(-120)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="histogram" fill="hsl(var(--chart-2))" />
                  <Line type="monotone" dataKey="macd" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="signal" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
