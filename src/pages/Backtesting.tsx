import { useState, useCallback } from "react";
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
import { backtestMACrossover, backtestRSI } from "@/lib/backtesting";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TestTube2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
} from "lucide-react";
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

  const runBacktest = useCallback(() => {
    const stock = SAMPLE_STOCKS[symbol];
    if (!stock) return;
    const r =
      strategy === "ma_crossover"
        ? backtestMACrossover(stock.data)
        : backtestRSI(stock.data);
    setResult(r);
  }, [symbol, strategy]);

  const handleSave = useCallback(async () => {
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
  }, [user, result, symbol, strategy, toast]);

  const winRateColor =
    result && result.winRate >= 50 ? "text-gain" : "text-loss";
  const pnlColor = result && result.profitLoss >= 0 ? "text-gain" : "text-loss";
  const pnlBorder =
    result && result.profitLoss >= 0 ? "border-l-gain" : "border-l-loss";

  return (
    <div className="space-y-6 animate-fade-in">
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
          <SelectTrigger className="w-40 glass">
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
          <SelectTrigger className="w-52 glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ma_crossover">MA Crossover (20/50)</SelectItem>
            <SelectItem value="rsi">RSI Strategy</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={runBacktest} className="shadow-lg shadow-primary/20">
          <Target className="h-4 w-4 mr-1.5" /> Run Backtest
        </Button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
            <Card className="card-hover border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Total Trades
                  </p>
                </div>
                <p className="text-2xl font-bold font-mono">
                  {result.totalTrades}
                </p>
              </CardContent>
            </Card>
            <Card
              className={`card-hover border-l-4 ${result.winRate >= 50 ? "border-l-gain" : "border-l-loss"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Win Rate
                  </p>
                </div>
                <p className={`text-2xl font-bold font-mono ${winRateColor}`}>
                  {result.winRate.toFixed(1)}%
                </p>
                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${result.winRate >= 50 ? "bg-gain" : "bg-loss"}`}
                    style={{ width: `${Math.min(result.winRate, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className={`card-hover border-l-4 ${pnlBorder}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {result.profitLoss >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Profit / Loss
                  </p>
                </div>
                <p className={`text-2xl font-bold font-mono ${pnlColor}`}>
                  ${result.profitLoss.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover border-l-4 border-l-info">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Winning Trades
                  </p>
                </div>
                <p className="text-2xl font-bold font-mono">
                  {result.winningTrades}/{result.totalTrades}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <AreaChart data={result.equityCurve}>
                    <defs>
                      <linearGradient
                        id="equityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#equityGradient)"
                      dot={false}
                    />
                  </AreaChart>
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
            Save Result
          </Button>
        </>
      )}
    </div>
  );
}
