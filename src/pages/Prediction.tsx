import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import regression from "regression";
import {
  BrainCircuit,
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import apiClient from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Prediction() {
  const [symbol, setSymbol] = useState("AAPL");
  const [days, setDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const stock = SAMPLE_STOCKS[symbol];
  if (!stock) return null;

  const predictionData = useMemo(() => {
    const closes = stock.data.map((d) => d.close);
    const points: [number, number][] = closes.map((c, i) => [i, c]);
    const result = regression.linear(points);

    const predictions: {
      date: string;
      actual: number | null;
      predicted: number;
    }[] = [];

    const last30 = stock.data.slice(-30);
    const offset = closes.length - 30;
    last30.forEach((d, i) => {
      predictions.push({
        date: d.date,
        actual: d.close,
        predicted: +result.predict(offset + i)[1].toFixed(2),
      });
    });

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(stock.data[stock.data.length - 1].date);
      futureDate.setDate(futureDate.getDate() + i);
      if (futureDate.getDay() === 0)
        futureDate.setDate(futureDate.getDate() + 1);
      if (futureDate.getDay() === 6)
        futureDate.setDate(futureDate.getDate() + 2);
      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        actual: null,
        predicted: +result.predict(closes.length + i - 1)[1].toFixed(2),
      });
    }

    const r2 = result.r2;
    const accuracy = Math.max(0, Math.min(100, r2 * 100));
    const nextDayPrediction = result.predict(closes.length)[1];
    const lastPrice = closes[closes.length - 1];
    const priceChange = ((nextDayPrediction - lastPrice) / lastPrice) * 100;

    return {
      predictions,
      r2,
      accuracy,
      nextDayPrediction,
      lastPrice,
      priceChange,
    };
  }, [stock, days, symbol]);

  const {
    predictions,
    r2,
    accuracy,
    nextDayPrediction,
    lastPrice,
    priceChange,
  } = predictionData;
  const isPredictedGain = priceChange >= 0;

  const handleSave = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const targetDate = predictions[predictions.length - 1].date;

    try {
      await apiClient.post("/predictions", {
        symbol,
        predicted_price: nextDayPrediction,
        prediction_date: today,
        target_date: targetDate,
        accuracy,
      });
      toast({ title: "Prediction saved!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to save",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [user, symbol, nextDayPrediction, accuracy, predictions, toast]);

  const accuracyColor =
    accuracy >= 70
      ? "text-gain"
      : accuracy >= 40
        ? "text-warning"
        : "text-loss";
  const accuracyBg =
    accuracy >= 70
      ? "bg-gain-muted"
      : accuracy >= 40
        ? "bg-warning-muted"
        : "bg-loss-muted";
  const accuracyBorder =
    accuracy >= 70
      ? "border-l-gain"
      : accuracy >= 40
        ? "border-l-warning"
        : "border-l-loss";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" /> Price Prediction
          </h1>
          <p className="text-muted-foreground text-sm">
            Linear regression-based forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-40 glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SAMPLE_STOCKS).map(([s]) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-28 glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 3, 5, 7, 10].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} day{d > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={`card-hover border-l-4 ${isPredictedGain ? "border-l-gain" : "border-l-loss"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Next Day Prediction
              </p>
            </div>
            <p className="text-2xl font-bold font-mono">
              ${nextDayPrediction.toFixed(2)}
            </p>
            <p
              className={`text-xs font-semibold mt-1 ${isPredictedGain ? "text-gain" : "text-loss"}`}
            >
              {isPredictedGain ? (
                <TrendingUp className="h-3 w-3 inline mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 inline mr-0.5" />
              )}
              {isPredictedGain ? "+" : ""}
              {priceChange.toFixed(2)}% vs current
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-info">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              R² Score
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{r2.toFixed(4)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coefficient of determination
            </p>
          </CardContent>
        </Card>
        <Card className={`card-hover border-l-4 ${accuracyBorder}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Model Accuracy
            </p>
            <p className={`text-2xl font-bold font-mono mt-1 ${accuracyColor}`}>
              {accuracy.toFixed(1)}%
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${accuracy >= 70 ? "bg-gain" : accuracy >= 40 ? "bg-warning" : "bg-loss"}`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Predicted vs Actual — {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <LineChart data={predictions}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="shadow-lg shadow-primary/20"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Prediction
      </Button>
    </div>
  );
}
