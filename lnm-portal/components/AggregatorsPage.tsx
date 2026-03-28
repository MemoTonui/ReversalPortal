"use client";
import { useState } from "react";
import { aggregators, merchants } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function AggregatorsPage() {
  const { tickets } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = aggregators.find((a) => a.id === selectedId);
  const selectedMerchants = selected
    ? merchants.filter((m) => selected.merchantIds.includes(m.id))
    : [];
  const selectedTickets = selected
    ? tickets.filter((t) => t.aggregator === selected.name)
    : [];

  const aggColors: Record<string, { bg: string; color: string; border: string }> = {
    AGG001: { bg: "#ede7f6", color: "#4527a0", border: "#b39ddb" },
    AGG002: { bg: "#e3f2fd", color: "#0d47a1", border: "#90caf9" },
    AGG003: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aggregators</h1>
        <p className="text-gray-500 text-sm mt-1">
          Payment aggregators connected to Lipa na M-PESA
        </p>
      </div>

      {/* Aggregator cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {aggregators.map((agg) => {
          const aggTickets = tickets.filter((t) => t.aggregator === agg.name);
          const active = aggTickets.filter(
            (t) => !["Resolved", "Rejected"].includes(t.stage)
          ).length;
          const resolved = aggTickets.filter((t) => t.stage === "Resolved").length;
          const pendingAction = aggTickets.filter(
            (t) =>
              (t.stage === "Escalated to Aggregator" ||
                t.stage === "Merchant Confirmed" ||
                t.stage === "Aggregator Processing") &&
              !["Resolved", "Rejected"].includes(t.stage)
          ).length;
          const style = aggColors[agg.id] ?? aggColors.AGG001;
          const isSelected = selectedId === agg.id;

          return (
            <button
              key={agg.id}
              onClick={() => setSelectedId(isSelected ? null : agg.id)}
              className="text-left rounded-2xl border-2 p-5 transition-all shadow-sm hover:shadow-md"
              style={{
                background: isSelected ? style.bg : "white",
                borderColor: isSelected ? style.border : "#f3f4f6",
              }}
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold mb-4"
                style={{ background: style.bg, color: style.color }}
              >
                {agg.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="font-semibold text-gray-900 text-base">{agg.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-4">{agg.email}</div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Merchants", value: agg.merchantIds.length },
                  { label: "Active", value: active },
                  { label: "Resolved", value: resolved },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg py-2" style={{ background: "rgba(0,0,0,0.04)" }}>
                    <div className="text-base font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {pendingAction > 0 && (
                <div
                  className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg text-center"
                  style={{ background: "#fff3e0", color: "#e65100" }}
                >
                  ⚡ {pendingAction} ticket{pendingAction > 1 ? "s" : ""} need action
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selected.name} — Detail
            </h2>
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100"
            >
              Close ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Merchants under this aggregator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Merchants</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Merchant", "Till", "Active"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedMerchants.map((m) => {
                    const active = tickets.filter(
                      (t) =>
                        t.merchantId === m.id &&
                        !["Resolved", "Rejected"].includes(t.stage)
                    ).length;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900 text-xs">
                            {m.name.split(" - ")[0]}
                          </div>
                          <div className="text-xs text-gray-400">{m.location}</div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">
                          {m.tillNumber}
                        </td>
                        <td className="px-5 py-3">
                          {active > 0 ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                              style={{ background: "#fff3e0", color: "#e65100" }}
                            >
                              {active}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tickets for this aggregator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Tickets ({selectedTickets.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {selectedTickets.length === 0 && (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    No tickets
                  </div>
                )}
                {selectedTickets.map((t) => {
                  const stageColor: Record<string, string> = {
                    Submitted: "#1d4ed8",
                    "Under Review": "#b45309",
                    "Escalated to Aggregator": "#4338ca",
                    "Sent to Merchant": "#c2410c",
                    "Merchant Confirmed": "#0f766e",
                    "Aggregator Processing": "#7e22ce",
                    Resolved: "#15803d",
                    Rejected: "#b91c1c",
                  };
                  return (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs font-semibold text-gray-900">
                          {t.id}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {t.merchantName.split(" - ")[0]}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-xs font-semibold"
                          style={{ color: stageColor[t.stage] ?? "#374151" }}
                        >
                          {t.stage}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          KES {t.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}