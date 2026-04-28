import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import apiClient from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader2, Download, Mail, Save } from "lucide-react";
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
    apiClient
      .get("/profile")
      .then((res) => {
        if (res.data?.display_name) setDisplayName(res.data.display_name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await apiClient.put("/profile", { display_name: displayName });
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to update",
        variant: "destructive",
      });
    }
    setSaving(false);
  }, [user, displayName, toast]);

  const exportCSV = useCallback(() => {
    const rows = ["Symbol,Name,Last Price,Change %"];
    Object.entries(SAMPLE_STOCKS).forEach(([symbol, { name, data }]) => {
      const last = data[data.length - 1].close;
      const prev = data[data.length - 2].close;
      const change = (((last - prev) / prev) * 100).toFixed(2);
      rows.push(`${symbol},${name},${last.toFixed(2)},${change}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "findash-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const initials =
    displayName?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U";

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings
        </p>
      </div>

      <Card className="card-hover overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-chart-5/20" />
        <CardContent className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mb-1">
              <p className="font-semibold text-lg">{displayName || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground font-medium">
              Email
            </label>
            <Input
              value={user?.email ?? ""}
              disabled
              className="mt-1 bg-muted/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground font-medium">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1"
              placeholder="Enter your display name"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="shadow-lg shadow-primary/20"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Export Market Report (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
