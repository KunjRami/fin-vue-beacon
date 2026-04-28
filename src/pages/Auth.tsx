import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Loader2,
  ArrowRight,
  UserPlus,
  LogIn,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEATURES = [
  { icon: BarChart3, title: "Real-time Analysis", desc: "Deep market insights with technical indicators" },
  { icon: Zap, title: "AI Predictions", desc: "ML powered price forecasts" },
  { icon: Shield, title: "Backtesting Engine", desc: "Test strategies on historical data" },
  { icon: Globe, title: "Watchlist & Signals", desc: "Track assets and get alerts" },
];

export default function Auth() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, displayName);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (!isLogin) {
      toast({ title: "Account created!", description: "Check your email to confirm your account." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-background">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 bg-gradient-to-br from-blue-50/50 via-slate-50 to-purple-50/50 dark:from-card dark:via-background dark:to-card border-r border-border/50">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <span className="text-3xl font-bold gradient-text">FinDash</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight mb-6">
            Smart Financial
            <br />
            <span className="text-primary">Analytics Dashboard</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Track stocks, analyze trends, run backtests, and get AI-powered predictions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-card/60 backdrop-blur-sm border border-border/50">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 relative overflow-hidden">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-chart-5/5 blur-3xl" />
        <Card className="w-full max-w-md glass-strong relative z-10 border shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-3 lg:hidden">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <span className="text-2xl font-bold gradient-text">FinDash</span>
            </div>
            <CardTitle className="text-xl">{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to access your dashboard" : "Start your financial analytics journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                  <Input placeholder="Enter your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="glass" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="glass" />
              </div>
              <Button type="submit" className="w-full shadow-lg shadow-primary/20 mt-2" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? <><LogIn className="mr-2 h-4 w-4" /> Sign In</> : <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-5">
              {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1 transition-colors">
                {isLogin ? "Sign up" : "Sign in"} <ArrowRight className="h-3 w-3" />
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}