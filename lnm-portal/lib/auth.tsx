"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { merchants, aggregators } from "./data";

export type UserRole = "admin" | "aggregator" | "merchant";

export type AuthUser =
  | { role: "admin";      name: string; email: string }
  | { role: "aggregator"; name: string; email: string; aggregatorId: string; aggregatorName: string }
  | { role: "merchant";   name: string; email: string; merchantId: string };

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const ACCOUNTS = [
  // Admin
  { email: "admin@safaricom.co.ke",      password: "password",    role: "admin"      as const },
  // Aggregators
  { email: "ops@cellulant.co.ke",        password: "agg123",      role: "aggregator" as const, aggregatorId: "AGG001" },
  { email: "ops@dpogroup.co.ke",         password: "agg123",      role: "aggregator" as const, aggregatorId: "AGG002" },
  { email: "ops@pesapal.co.ke",          password: "agg123",      role: "aggregator" as const, aggregatorId: "AGG003" },
  // Merchants
  { email: "naivas@merchant.co.ke",      password: "merchant123", role: "merchant"   as const, merchantId: "M001" },
  { email: "java@merchant.co.ke",        password: "merchant123", role: "merchant"   as const, merchantId: "M002" },
  { email: "quickmart@merchant.co.ke",   password: "merchant123", role: "merchant"   as const, merchantId: "M003" },
  { email: "carrefour@merchant.co.ke",   password: "merchant123", role: "merchant"   as const, merchantId: "M004" },
  { email: "kfc@merchant.co.ke",         password: "merchant123", role: "merchant"   as const, merchantId: "M005" },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string): boolean => {
    const match = ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!match) return false;

    if (match.role === "admin") {
      setUser({ role: "admin", name: "Safaricom Admin", email });
    } else if (match.role === "aggregator") {
      const agg = aggregators.find((a) => a.id === match.aggregatorId)!;
      setUser({ role: "aggregator", name: agg.name, email, aggregatorId: agg.id, aggregatorName: agg.name });
    } else {
      const merchant = merchants.find((m) => m.id === match.merchantId)!;
      setUser({ role: "merchant", name: merchant.name, email, merchantId: match.merchantId });
    }
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
