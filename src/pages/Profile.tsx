import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_STOCKS } from "@/lib/sampleData";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated!" });
  };

  const exportCSV = () => {
    const rows = ["Symbol,Name,Last Price,Change %"];
    Object.entries(SAMPLE_STOCKS).forEach(([symbol, { name, data }]) => {
      const last = data[data.length - 1].close;
      const prev = data[data.length - 2].close;
      const change = ((last - prev) / prev * 100).toFixed(2);
      rows.push(`${symbol},${name},${last.toFixed(2)},${change}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "findash-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Profile
        </h1>
        <p className="text-muted-foreground text-sm">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Export Data</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export Market Report (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
