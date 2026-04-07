import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SAMPLE_STOCKS } from "@/lib/sampleData";
import { Star, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Watchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: string; symbol: string; name: string | null }[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setItems(data);
        setLoading(false);
      });
  }, [user]);

  const addStock = async () => {
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

    const { data, error } = await supabase
      .from("watchlist")
      .insert({ user_id: user.id, symbol: sym, name: SAMPLE_STOCKS[sym].name })
      .select()
      .single();

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else if (data) {
      setItems([...items, data]);
      setNewSymbol("");
    }
  };

  const removeStock = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" /> Watchlist
        </h1>
        <p className="text-muted-foreground text-sm">Track your favorite stocks</p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Add symbol (e.g. AAPL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStock()}
        />
        <Button onClick={addStock}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">Your watchlist is empty. Add stocks to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const stock = SAMPLE_STOCKS[item.symbol];
            const lastPrice = stock?.data[stock.data.length - 1].close ?? 0;
            const prevPrice = stock?.data[stock.data.length - 2].close ?? 0;
            const change = ((lastPrice - prevPrice) / prevPrice) * 100;

            return (
              <Card key={item.id} className="group">
                <CardContent className="p-4 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/analysis?symbol=${item.symbol}`)}
                    className="text-left"
                  >
                    <p className="font-mono font-bold">{item.symbol}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">${lastPrice.toFixed(2)}</span>
                      <Badge variant="outline" className={`text-xs ${change >= 0 ? "text-gain border-gain/30" : "text-loss border-loss/30"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </Badge>
                    </div>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeStock(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
