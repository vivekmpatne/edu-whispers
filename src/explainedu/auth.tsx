import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getStoredToken, setStoredToken, type User } from "./api";

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }
    api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        setToken(null);
        setStoredToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setStoredToken(null);
    delete api.defaults.headers.common.Authorization;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading application…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
