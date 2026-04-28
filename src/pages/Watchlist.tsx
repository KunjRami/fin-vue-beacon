import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import {
  Star,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Watchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState(
    [] as { id: string; symbol: string; name: string | null }[],
  );
  const [newSymbol, setNewSymbol] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get("/watchlist")
      .then((res) => {
        if (res.data) setItems(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addStock = useCallback(async () => {
    if (!user) return;
    const sym = newSymbol.toUpperCase().trim();
    if (!sym || !SAMPLE_STOCKS[sym]) {
      toast({ title: "Invalid symbol", variant: "destructive" });
      return;
    }
    if (items.some((i) => i.symbol === sym)) {
      toast({ title: "Already in watchlist" });
      return;
    }

    try {
      const { data } = await apiClient.post("/watchlist", {
        symbol: sym,
        name: SAMPLE_STOCKS[sym].name,
      });
      if (data) {
        setItems((prev) => [...prev, data]);
        setNewSymbol("");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to add",
        variant: "destructive",
      });
    }
  }, [user, newSymbol, items, toast]);

  const removeStock = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/watchlist/${id}`);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch {
        toast({ title: "Error", variant: "destructive" });
      }
    },
    [toast],
  );

  const stockCards = useMemo(() => {
    return items.map((item) => {
      const stock = SAMPLE_STOCKS[item.symbol];
      const lastPrice = stock?.data[stock.data.length - 1].close ?? 0;
      const prevPrice = stock?.data[stock.data.length - 2].close ?? 0;
      const change = ((lastPrice - prevPrice) / prevPrice) * 100;
      const isGain = change >= 0;

      return {
        item,
        lastPrice,
        change,
        isGain,
      };
    });
  }, [items]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" /> Watchlist
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your favorite stocks
        </p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Add symbol (e.g. AAPL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStock()}
          className="glass transition-all focus:ring-2 focus:ring-primary/30"
        />
        <Button onClick={addStock}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          Your watchlist is empty. Add stocks to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stockCards.map(({ item, lastPrice, change, isGain }, index) => (
            <Card
              key={item.id}
              className={`group card-hover border-l-4 ${isGain ? "border-l-gain" : "border-l-loss"} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/analysis?symbol=${item.symbol}`)}
                  className="text-left flex-1"
                >
                  <p className="font-mono font-bold text-base">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-sm font-semibold">
                      ${lastPrice.toFixed(2)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold border-0 ${
                        isGain
                          ? "bg-gain/15 text-gain hover:bg-gain/25"
                          : "bg-loss/15 text-loss hover:bg-loss/25"
                      }`}
                    >
                      {isGain ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {change >= 0 ? "+" : ""}
                      {change.toFixed(2)}%
                    </Badge>
                  </div>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeStock(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all text-loss hover:bg-loss-muted ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
