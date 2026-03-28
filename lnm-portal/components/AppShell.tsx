"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import MerchantsPage from "./MerchantsPage";
import TicketsPage from "./TicketsPage";
import NotificationsPanel from "./NotificationsPanel";
import AggregatorsPage from "./AggregatorsPage";



type View = "dashboard" | "aggregators" | "merchants" | "tickets";



export default function AppShell() {
  const [view, setView] = useState<View>("dashboard");
  const [merchantFilter, setMerchantFilter] = useState<string | undefined>(undefined);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleSelectMerchant = (id: string) => {
    setMerchantFilter(id);
    setView("tickets");
  };

  const handleSetView = (v: View) => {
    if (v !== "tickets") setMerchantFilter(undefined);
    setView(v);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={view} setView={handleSetView} onBellClick={() => setShowNotifs(true)} />
      <main className="flex-1 p-4 overflow-y-auto" style={{ marginLeft: "var(--sidebar-w, 260px)", minHeight: "100vh" }}>
        <div className="w-full mx-auto">
          {view === "dashboard" && <Dashboard />}
          {view === "aggregators" && <AggregatorsPage />}
          {view === "merchants" && <MerchantsPage onSelectMerchant={handleSelectMerchant} />}
          {view === "tickets" && <TicketsPage filterMerchantId={merchantFilter} />}
        </div>
      </main>
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
