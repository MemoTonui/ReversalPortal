"use client";
import { useState } from "react";
import { merchants, aggregators } from "@/lib/data";
import { useStore } from "@/lib/store";

type Props = { onSelectMerchant: (id: string) => void };

export default function MerchantsPage({ onSelectMerchant }: Props) {
  const { tickets } = useStore();
  const [search, setSearch] = useState("");
  const [filterAggregator, setFilterAggregator] = useState("All");

  const aggNames = ["All", ...aggregators.map((a) => a.name)];

  const filtered = merchants.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.tillNumber.includes(search) ||
      (m.paybillNumber || "").includes(search);
    const matchAgg = filterAggregator === "All" || m.aggregator === filterAggregator;
    return matchSearch && matchAgg;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
        <p className="text-gray-500 text-sm mt-1">All registered Lipa na M-PESA aggregator merchants</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, till or paybill..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            onFocus={(e) => (e.target.style.borderColor = "#4caf50")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {aggNames.map((a) => (
            <button key={a} onClick={() => setFilterAggregator(a)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{ background: filterAggregator === a ? "#2e7d32" : "white", color: filterAggregator === a ? "white" : "#374151", borderColor: filterAggregator === a ? "#2e7d32" : "#e5e7eb" }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Merchant", "Till / Paybill", "Aggregator", "Category", "Active Tickets", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((m) => {
              const active = tickets.filter((t) => t.merchantId === m.id && !["Resolved","Rejected"].includes(t.stage)).length;
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.location}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs text-gray-700">{m.tillNumber}</div>
                    {m.paybillNumber && <div className="font-mono text-xs text-gray-400 mt-0.5">{m.paybillNumber}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#e8f5e9", color: "#2e7d32" }}>{m.aggregator}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{m.category}</td>
                  <td className="px-5 py-4">
                    {active > 0
                      ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" style={{ background: "#fff3e0", color: "#e65100" }}>{active}</span>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => onSelectMerchant(m.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                      View Tickets →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">No merchants found</div>}
      </div>
    </div>
  );
}
