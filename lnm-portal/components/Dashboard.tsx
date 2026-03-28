"use client";
import { merchants, stageColors, type TicketStage } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { tickets } = useStore();

  const stageCounts: Record<string, number> = {};
  tickets.forEach((t) => { stageCounts[t.stage] = (stageCounts[t.stage] || 0) + 1; });

  const totalAmount = tickets.reduce((s, t) => s + t.amount, 0);
  const activeCount = tickets.filter((t) => !["Resolved", "Rejected"].includes(t.stage)).length;
  const resolvedCount = tickets.filter((t) => t.stage === "Resolved").length;

  const stats = [
    { label: "Total Tickets", value: tickets.length, sub: "All time", color: "#1b5e20", bg: "#e8f5e9" },
    { label: "Active Tickets", value: activeCount, sub: "Pending action", color: "#e65100", bg: "#fff3e0" },
    { label: "Resolved", value: resolvedCount, sub: "Successfully reversed", color: "#1565c0", bg: "#e3f2fd" },
    { label: "Amount at Stake", value: `KES ${totalAmount.toLocaleString()}`, sub: "Across all tickets", color: "#6a1b9a", bg: "#f3e5f5" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Lipa na M-PESA reversal ticket summary</p>
        <br/>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3" style={{ background: s.bg, color: s.color }}>
              {typeof s.value === "number" ? s.value : "K"}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Tickets by Stage</h2>
          <div className="space-y-3">
            {Object.entries(stageCounts).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stageColors[stage as TicketStage]}`}>{stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / tickets.length) * 100}%`, background: "#4caf50" }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Merchants by Active Tickets</h2>
          <div className="space-y-3">
            {merchants.map((m) => {
              const count = tickets.filter((t) => t.merchantId === m.id && !["Resolved", "Rejected"].includes(t.stage)).length;
              if (count === 0) return null;
              return (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800 leading-tight">{m.name.split(" - ")[0]}</div>
                    <div className="text-xs text-gray-400">{m.aggregator}</div>
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#e8f5e9", color: "#2e7d32" }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.stage === "Resolved" ? "#4caf50" : t.stage === "Rejected" ? "#ef4444" : "#f59e0b" }} />
                <div>
                  <div className="text-xs font-medium text-gray-800">{t.id}</div>
                  <div className="text-xs text-gray-500 truncate">{t.merchantName.split(" - ")[0]}</div>
                  <div className="text-xs text-gray-400">KES {t.amount.toLocaleString()}</div>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stageColors[t.stage]}`}>{t.stage.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
