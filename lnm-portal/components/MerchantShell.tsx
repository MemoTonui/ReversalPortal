"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { merchants } from "@/lib/data";
import TicketsPage from "./TicketsPage";
import NotificationsPanel from "./NotificationsPanel";

export default function MerchantShell() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!user || user.role !== "merchant") return null;

  const merchant = merchants.find((m) => m.id === user.merchantId);
  const bellCount = unreadCount({ merchantId: user.merchantId });
  const myNotifs = notifications.filter((n) => n.merchantId === user.merchantId);
  const actionRequired = myNotifs.filter((n) => n.type === "action" && !n.read).length;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Top navbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2e7d32" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" fill="#2e7d32" />
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">LNM Reversal Portal</div>
              <div className="text-xs text-gray-400">Merchant View</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => setShowNotifs(true)}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {bellCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white font-bold flex items-center justify-center" style={{ background: "#ef4444", fontSize: 9 }}>
                  {bellCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 leading-tight">{merchant?.name.split(" - ")[0]}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Merchant info banner */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1b5e20, #388e3c)" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-green-200 text-sm mb-1">Welcome back</div>
              <div className="text-2xl font-bold">{merchant?.name}</div>
              <div className="text-green-200 text-sm mt-1">
                Till: <span className="font-mono font-semibold text-white">{merchant?.tillNumber}</span>
                {merchant?.paybillNumber && (
                  <> · Paybill: <span className="font-mono font-semibold text-white">{merchant?.paybillNumber}</span></>
                )}
                {" "}· {merchant?.aggregator}
              </div>
            </div>
            {actionRequired > 0 && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
                ⚡ {actionRequired} ticket{actionRequired > 1 ? "s" : ""} need your attention
              </div>
            )}
          </div>
        </div>

        {/* Tickets */}
        <TicketsPage filterMerchantId={user.merchantId} merchantMode={true} />
      </main>

      {showNotifs && (
        <NotificationsPanel
          onClose={() => setShowNotifs(false)}
          merchantId={user.merchantId}
        />
      )}
    </div>
  );
}
