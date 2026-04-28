import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import { generateSignals } from "@/lib/indicators";
import { Zap, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Signals() {
  const allSignals = useMemo(() => {
    const signals: {
      symbol: string;
      name: string;
      price: number;
      type: string;
      indicator: string;
      strength: string;
    }[] = [];
    Object.entries(SAMPLE_STOCKS).forEach(([symbol, { name, data }]) => {
      const closes = data.map((d) => d.close);
      const lastPrice = closes[closes.length - 1];
      const sigs = generateSignals(closes);
      sigs.forEach((s) => {
        signals.push({ symbol, name, price: lastPrice, ...s });
      });
    });
    return signals;
  }, []);

  const buySignals = allSignals.filter((s) => s.type === "BUY");
  const sellSignals = allSignals.filter((s) => s.type === "SELL");

  const strengthColor = (strength: string, type: string) => {
    if (strength === "strong")
      return type === "BUY"
        ? "bg-gain/20 text-gain border-gain/30"
        : "bg-loss/20 text-loss border-loss/30";
    if (strength === "medium")
      return type === "BUY"
        ? "bg-success/20 text-success border-success/30"
        : "bg-warning/20 text-warning border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" /> Trading Signals
        </h1>
        <p className="text-muted-foreground text-sm">
          Auto-generated signals based on technical indicators
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="card-hover border-l-4 border-l-gain bg-gradient-to-br from-gain-muted/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-gain/20">
                <TrendingUp className="h-4 w-4 text-gain" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                BUY Signals
              </p>
            </div>
            <p className="text-4xl font-bold text-gain font-mono">
              {buySignals.length}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-loss bg-gradient-to-br from-loss-muted/50 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-loss/20">
                <TrendingDown className="h-4 w-4 text-loss" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                SELL Signals
              </p>
            </div>
            <p className="text-4xl font-bold text-loss font-mono">
              {sellSignals.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            All Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allSignals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No signals generated.
            </p>
          ) : (
            <div className="overflow-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Symbol</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Signal</TableHead>
                    <TableHead className="font-semibold">Indicator</TableHead>
                    <TableHead className="font-semibold">Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSignals.map((s, i) => (
                    <TableRow
                      key={i}
                      className="transition-colors hover:bg-primary/5"
                    >
                      <TableCell className="font-mono font-semibold">
                        {s.symbol}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        ${s.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`font-semibold border-0 ${s.type === "BUY" ? "bg-gain/15 text-gain hover:bg-gain/25" : "bg-loss/15 text-loss hover:bg-loss/25"}`}
                        >
                          {s.type === "BUY" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.indicator}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize font-semibold ${strengthColor(s.strength, s.type)}`}
                        >
                          {s.strength}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
