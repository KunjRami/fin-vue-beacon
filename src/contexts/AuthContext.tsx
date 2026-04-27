import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import apiClient from "@/api/client";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("findash_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("findash_token"))
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    try {
      const res = await apiClient.post("/auth/register", {
        email,
        password,
        display_name: displayName,
      });
      localStorage.setItem("findash_token", res.data.token);
      setUser(res.data.user);
      return { error: null };
    } catch (err: any) {
      return {
        error: new Error(err.response?.data?.error || "Registration failed"),
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("findash_token", res.data.token);
      setUser(res.data.user);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.response?.data?.error || "Login failed") };
    }
  };

  const signOut = () => {
    localStorage.removeItem("findash_token");
    setUser(null);
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
