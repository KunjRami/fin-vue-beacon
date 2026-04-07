
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'SELL')),
  indicator TEXT NOT NULL,
  price NUMERIC NOT NULL,
  strength TEXT DEFAULT 'medium' CHECK (strength IN ('weak', 'medium', 'strong')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own signals" ON public.signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own signals" ON public.signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own signals" ON public.signals FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  predicted_price NUMERIC NOT NULL,
  actual_price NUMERIC,
  prediction_date DATE NOT NULL,
  target_date DATE NOT NULL,
  accuracy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.backtesting_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  strategy TEXT NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  equity_curve JSONB,
  params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.backtesting_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own backtesting" ON public.backtesting_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own backtesting" ON public.backtesting_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own backtesting" ON public.backtesting_results FOR DELETE USING (auth.uid() = user_id);
