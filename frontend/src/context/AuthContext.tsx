import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import type { User, Token } from "../lib/types";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<User>("/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("access_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const tokenResponse = await api.post<Token>("/login", { email, password });
    localStorage.setItem("access_token", tokenResponse.access_token);
    const currentUser = await api.get<User>("/me");
    setUser(currentUser);
  }

  async function register(email: string, password: string) {
    await api.post<User>("/register", { email, password });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  async function refreshUser() {
    const currentUser = await api.get<User>("/me");
    setUser(currentUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}