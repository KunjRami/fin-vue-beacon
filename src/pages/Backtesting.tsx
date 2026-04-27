import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import { backtestMACrossover, backtestRSI } from "@/lib/backtesting";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TestTube2, Loader2 } from "lucide-react";
import apiClient from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Backtesting() {
  const [symbol, setSymbol] = useState("AAPL");
  const [strategy, setStrategy] = useState<"ma_crossover" | "rsi">(
    "ma_crossover",
  );
  const [result, setResult] = useState<ReturnType<
    typeof backtestMACrossover
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const runBacktest = () => {
    const stock = SAMPLE_STOCKS[symbol];
    if (!stock) return;
    const r =
      strategy === "ma_crossover"
        ? backtestMACrossover(stock.data)
        : backtestRSI(stock.data);
    setResult(r);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    setLoading(true);
    try {
      await apiClient.post("/backtesting", {
        symbol,
        strategy,
        total_trades: result.totalTrades,
        winning_trades: result.winningTrades,
        profit_loss: result.profitLoss,
        win_rate: result.winRate,
        equity_curve: result.equityCurve,
      });
      toast({ title: "Backtest saved!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to save",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TestTube2 className="h-6 w-6 text-primary" /> Backtesting
        </h1>
        <p className="text-muted-foreground text-sm">
          Test trading strategies on historical data
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(SAMPLE_STOCKS).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={strategy}
          onValueChange={(v) => setStrategy(v as "ma_crossover" | "rsi")}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ma_crossover">MA Crossover (20/50)</SelectItem>
            <SelectItem value="rsi">RSI Strategy</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={runBacktest}>Run Backtest</Button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold font-mono">
                  {result.totalTrades}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold font-mono">
                  {result.winRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Profit / Loss</p>
                <p
                  className={`text-2xl font-bold font-mono ${result.profitLoss >= 0 ? "text-gain" : "text-loss"}`}
                >
                  ${result.profitLoss.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Winning Trades</p>
                <p className="text-2xl font-bold font-mono">
                  {result.winningTrades}/{result.totalTrades}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <LineChart data={result.equityCurve}>
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
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Result
          </Button>
        </>
      )}
    </div>
  );
}
