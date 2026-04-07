import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import { generateSignals } from "@/lib/indicators";
import { Zap } from "lucide-react";

export default function Signals() {
  const allSignals = useMemo(() => {
    const signals: { symbol: string; name: string; price: number; type: string; indicator: string; strength: string }[] = [];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" /> Trading Signals
        </h1>
        <p className="text-muted-foreground text-sm">Auto-generated signals based on technical indicators</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">BUY Signals</p>
            <p className="text-3xl font-bold text-gain font-mono">{buySignals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">SELL Signals</p>
            <p className="text-3xl font-bold text-loss font-mono">{sellSignals.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {allSignals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No signals generated.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Indicator</TableHead>
                    <TableHead>Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSignals.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono font-medium">{s.symbol}</TableCell>
                      <TableCell className="font-mono">${s.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={s.type === "BUY" ? "default" : "destructive"}>{s.type}</Badge>
                      </TableCell>
                      <TableCell>{s.indicator}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{s.strength}</Badge>
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
