import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MARKET_INDICES, getTopGainers, getTopLosers, SAMPLE_STOCKS } from "@/lib/sampleData";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const gainers = getTopGainers();
  const losers = getTopLosers();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = search.toUpperCase().trim();
    if (symbol && SAMPLE_STOCKS[symbol]) {
      navigate(`/analysis?symbol=${symbol}`);
    }
  };

  const allSymbols = Object.keys(SAMPLE_STOCKS);
  const filtered = search
    ? allSymbols.filter(
        (s) =>
          s.includes(search.toUpperCase()) ||
          SAMPLE_STOCKS[s].name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time market data and analysis</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks (AAPL, RELIANCE, TCS...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        {filtered.length > 0 && search && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSearch(""); navigate(`/analysis?symbol=${s}`); }}
                className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex justify-between"
              >
                <span className="font-mono font-medium">{s}</span>
                <span className="text-muted-foreground">{SAMPLE_STOCKS[s].name}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Market Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MARKET_INDICES.map((idx) => (
          <Card key={idx.symbol}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{idx.name}</p>
              <p className="text-xl font-bold font-mono mt-1">{idx.value.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${idx.change >= 0 ? "text-gain" : "text-loss"}`}>
                {idx.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-gain" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {gainers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => navigate(`/analysis?symbol=${s.symbol}`)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-left">
                  <p className="font-mono font-medium text-sm">{s.symbol}</p>
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">${s.price.toFixed(2)}</p>
                  <Badge variant="outline" className="text-gain border-gain/30 text-xs">
                    +{s.change.toFixed(2)}%
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-loss" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {losers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => navigate(`/analysis?symbol=${s.symbol}`)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-left">
                  <p className="font-mono font-medium text-sm">{s.symbol}</p>
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">${s.price.toFixed(2)}</p>
                  <Badge variant="outline" className="text-loss border-loss/30 text-xs">
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
