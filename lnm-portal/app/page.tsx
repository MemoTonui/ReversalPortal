"use client";
import { useAuth } from "@/lib/auth";
import LoginPage from "@/components/LoginPage";
import AppShell from "@/components/AppShell";
import AggregatorShell from "@/components/AggregatorShell";
import MerchantShell from "@/components/MerchantShell";

export default function Home() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === "aggregator") return <AggregatorShell />;
  if (user.role === "merchant")   return <MerchantShell />;
  return <AppShell />;
}
