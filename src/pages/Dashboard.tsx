import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MARKET_INDICES,
  getTopGainers,
  getTopLosers,
  SAMPLE_STOCKS,
} from "@/lib/sampleData";
import {
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const gainers = useMemo(() => getTopGainers(), []);
  const losers = useMemo(() => getTopLosers(), []);

  const allSymbols = Object.keys(SAMPLE_STOCKS);
  const filtered = useMemo(() => {
    if (!search) return [];
    return allSymbols.filter(
      (s) =>
        s.includes(search.toUpperCase()) ||
        SAMPLE_STOCKS[s].name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, allSymbols]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const symbol = search.toUpperCase().trim();
      if (symbol && SAMPLE_STOCKS[symbol]) {
        navigate(`/analysis?symbol=${symbol}`);
      }
    },
    [search, navigate],
  );

  const handleSelectStock = useCallback(
    (symbol: string) => {
      setSearch("");
      navigate(`/analysis?symbol=${symbol}`);
    },
    [navigate],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Market Overview
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time market data and analysis
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks (AAPL, RELIANCE, TCS...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 glass transition-all focus:ring-2 focus:ring-primary/30"
        />
        {filtered.length > 0 && search && (
          <div className="absolute z-10 w-full mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl max-h-48 overflow-auto">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSelectStock(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-sm flex justify-between transition-colors"
              >
                <span className="font-mono font-medium text-primary">{s}</span>
                <span className="text-muted-foreground">
                  {SAMPLE_STOCKS[s].name}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Market Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MARKET_INDICES.map((idx, i) => {
          const isGain = idx.change >= 0;
          return (
            <Card
              key={idx.symbol}
              className={`card-hover border-l-4 ${isGain ? "border-l-gain" : "border-l-loss"} animate-fade-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {idx.name}
                  </p>
                  {isGain ? (
                    <TrendingUp className="h-4 w-4 text-gain" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-loss" />
                  )}
                </div>
                <p className="text-xl font-bold font-mono mt-1">
                  {idx.value.toLocaleString()}
                </p>
                <div
                  className={`flex items-center gap-1 mt-1 text-sm font-semibold ${isGain ? "text-gain" : "text-loss"}`}
                >
                  {isGain ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {isGain ? "+" : ""}
                  {idx.change.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="card-hover animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-md bg-gain-muted">
                <TrendingUp className="h-5 w-5 text-gain" />
              </div>
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {gainers.map((s, i) => (
              <button
                key={s.symbol}
                onClick={() => navigate(`/analysis?symbol=${s.symbol}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gain-muted/50 transition-all group"
              >
                <div className="text-left">
                  <p className="font-mono font-semibold text-sm">{s.symbol}</p>
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">
                    ${s.price.toFixed(2)}
                  </p>
                  <Badge className="bg-gain/15 text-gain hover:bg-gain/25 border-0 text-xs font-semibold">
                    +{s.change.toFixed(2)}%
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card
          className="card-hover animate-fade-in"
          style={{ animationDelay: "0.25s" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-md bg-loss-muted">
                <TrendingDown className="h-5 w-5 text-loss" />
              </div>
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {losers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => navigate(`/analysis?symbol=${s.symbol}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-loss-muted/50 transition-all group"
              >
                <div className="text-left">
                  <p className="font-mono font-semibold text-sm">{s.symbol}</p>
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">
                    ${s.price.toFixed(2)}
                  </p>
                  <Badge className="bg-loss/15 text-loss hover:bg-loss/25 border-0 text-xs font-semibold">
                    {s.change.toFixed(2)}%
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
