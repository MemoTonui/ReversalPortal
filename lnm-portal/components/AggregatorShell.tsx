"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { merchants, aggregators, stageColors, stageOrder, stageActor, type Ticket, type TicketStage } from "@/lib/data";
import TicketDrawer from "./TicketDrawer";
import NotificationsPanel from "./NotificationsPanel";

export default function AggregatorShell() {
  const { user, logout } = useAuth();
  const { tickets, unreadCount } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [stageFilter, setStageFilter] = useState<TicketStage | "All">("All");
  const [showNotifs, setShowNotifs] = useState(false);

  if (!user || user.role !== "aggregator") return null;

  const agg = aggregators.find((a) => a.id === user.aggregatorId)!;
  const myMerchants = merchants.filter((m) => agg.merchantIds.includes(m.id));
  const myTickets = tickets.filter((t) => t.aggregator === user.aggregatorName);

  const pendingAction = myTickets.filter((t) =>
    stageActor[t.stage] === "aggregator" && !["Resolved", "Rejected"].includes(t.stage)
  ).length;

  const bellCount = unreadCount({ aggregatorId: user.aggregatorId });

  const filtered = myTickets.filter((t) =>
    stageFilter === "All" || t.stage === stageFilter
  );

  const liveSelected = selectedTicket
    ? tickets.find((t) => t.id === selectedTicket.id) ?? selectedTicket
    : null;

  const stats = [
    { label: "My Merchants",    value: myMerchants.length,                                                               color: "#1b5e20", bg: "#e8f5e9" },
    { label: "Active Tickets",  value: myTickets.filter((t) => !["Resolved","Rejected"].includes(t.stage)).length,      color: "#e65100", bg: "#fff3e0" },
    { label: "Pending My Action", value: pendingAction,                                                                  color: "#3949ab", bg: "#e8eaf6" },
    { label: "Resolved",        value: myTickets.filter((t) => t.stage === "Resolved").length,                          color: "#00695c", bg: "#e0f2f1" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#3949ab" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="white" opacity=".8"/>
                <rect x="14" y="3" width="7" height="7" rx="1" fill="white"/>
                <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity=".6"/>
                <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity=".4"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{user.aggregatorName} Portal</div>
              <div className="text-xs text-gray-400">LNM Reversal Management</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotifs(true)} className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {bellCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white font-bold flex items-center justify-center" style={{ background: "#ef4444", fontSize: 9 }}>{bellCount}</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#e8eaf6", color: "#3949ab" }}>
                {user.aggregatorName.substring(0,2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user.aggregatorName}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1a237e, #3949ab)" }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-indigo-200 text-sm mb-1">Aggregator Dashboard</div>
              <div className="text-2xl font-bold">{user.aggregatorName}</div>
              <div className="text-indigo-200 text-sm mt-1">
                Managing {myMerchants.length} merchant{myMerchants.length !== 1 ? "s" : ""} · {myTickets.length} total tickets
              </div>
            </div>
            {pendingAction > 0 && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
                ⚡ {pendingAction} ticket{pendingAction > 1 ? "s" : ""} need your action
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold mb-3" style={{ background: s.bg, color: s.color }}>
                {s.value}
              </div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Merchants */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Merchants</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Merchant", "Till / Paybill", "Category", "Active Tickets"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myMerchants.map((m) => {
                const active = myTickets.filter((t) => t.merchantId === m.id && !["Resolved","Rejected"].includes(t.stage)).length;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.location}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-700">
                      {m.tillNumber}
                      {m.paybillNumber && <div className="text-gray-400">{m.paybillNumber}</div>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">{m.category}</td>
                    <td className="px-5 py-4">
                      {active > 0
                        ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" style={{ background: "#fff3e0", color: "#e65100" }}>{active}</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-gray-900 text-lg">Reversal Tickets</h2>
            <div className="flex gap-2 flex-wrap">
              {(["All", ...stageOrder] as const).map((s) => (
                <button key={s} onClick={() => setStageFilter(s as TicketStage | "All")}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                  style={{ background: stageFilter === s ? "#3949ab" : "white", color: stageFilter === s ? "white" : "#374151", borderColor: stageFilter === s ? "#3949ab" : "#e5e7eb" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((t) => {
              const myAction = stageActor[t.stage] === "aggregator" && !["Resolved","Rejected"].includes(t.stage);
              return (
                <div key={t.id} onClick={() => setSelectedTicket(t)}
                  className="bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: myAction ? "#7986cb" : "#f3f4f6" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-900">{t.id}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${stageColors[t.stage]}`}>{t.stage}</span>
                        {myAction && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">Your action</span>}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{t.merchantName}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">{t.description}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-gray-900">KES {t.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.raisedDate}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {stageOrder.filter((s) => s !== "Rejected").map((s) => {
                      const done = t.stage !== "Rejected" && stageOrder.indexOf(s) <= stageOrder.indexOf(t.stage);
                      return <div key={s} className="flex-1 h-1 rounded-full" style={{ background: done ? "#3949ab" : "#e5e7eb" }} />;
                    })}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No tickets found</div>
            )}
          </div>
        </div>
      </main>

      {liveSelected && <TicketDrawer ticket={liveSelected} onClose={() => setSelectedTicket(null)} />}
      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} aggregatorId={user.aggregatorId} />}
    </div>
  );
}
