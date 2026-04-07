import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import regression from "regression";
import { BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  const closes = stock.data.map((d) => d.close);
  const points: [number, number][] = closes.map((c, i) => [i, c]);
  const result = regression.linear(points);
  
  const predictions: { date: string; actual: number | null; predicted: number }[] = [];
  
  // Last 30 actual + predicted overlay
  const last30 = stock.data.slice(-30);
  const offset = closes.length - 30;
  last30.forEach((d, i) => {
    predictions.push({
      date: d.date,
      actual: d.close,
      predicted: +result.predict(offset + i)[1].toFixed(2),
    });
  });

  // Future predictions
  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(stock.data[stock.data.length - 1].date);
    futureDate.setDate(futureDate.getDate() + i);
    if (futureDate.getDay() === 0) futureDate.setDate(futureDate.getDate() + 1);
    if (futureDate.getDay() === 6) futureDate.setDate(futureDate.getDate() + 2);
    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      actual: null,
      predicted: +result.predict(closes.length + i - 1)[1].toFixed(2),
    });
  }

  const r2 = result.r2;
  const accuracy = Math.max(0, Math.min(100, r2 * 100));
  const nextDayPrediction = result.predict(closes.length)[1];

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const targetDate = predictions[predictions.length - 1].date;

    const { error } = await supabase.from("predictions").insert({
      user_id: user.id,
      symbol,
      predicted_price: nextDayPrediction,
      prediction_date: today,
      target_date: targetDate,
      accuracy,
    });

    setLoading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Prediction saved!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" /> Price Prediction
          </h1>
          <p className="text-muted-foreground text-sm">Linear regression-based forecasting</p>
        </div>
        <div className="flex gap-2">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SAMPLE_STOCKS).map(([s, { name }]) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 3, 5, 7, 10].map((d) => (
                <SelectItem key={d} value={String(d)}>{d} day{d > 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Day Prediction</p>
            <p className="text-2xl font-bold font-mono">${nextDayPrediction.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">R² Score</p>
            <p className="text-2xl font-bold font-mono">{r2.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Model Accuracy</p>
            <p className="text-2xl font-bold font-mono">{accuracy.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Predicted vs Actual — {symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Prediction
      </Button>
    </div>
  );
}
