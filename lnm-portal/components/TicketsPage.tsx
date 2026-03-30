"use client";
import { useState } from "react";
import { stageColors, stageOrder, type TicketStage, type Ticket } from "@/lib/data";
import { useStore } from "@/lib/store";
import TicketDrawer from "./TicketDrawer";

type Props = { filterMerchantId?: string; merchantMode?: boolean };

const merchantStageLabel: Record<string, string> = {
  "Submitted": "Under Review",
  "Under Review": "Under Review",
  "Escalated to Aggregator": "Under Review",
  "Sent to Merchant": "Action Required",
  "Merchant Confirmed": "Processing",
  "Aggregator Processing": "Processing",
  "Resolved": "Resolved",
  "Rejected": "Rejected",
};

const merchantStageFilters = ["All", "Under Review", "Action Required", "Processing", "Resolved", "Rejected"];

export default function TicketsPage({ filterMerchantId, merchantMode = false }: Props) {
  const { tickets } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [stageFilter, setStageFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = tickets.filter((t) => {
    const matchMerchant = filterMerchantId ? t.merchantId === filterMerchantId : true;
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.merchantName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerPhone.includes(search);

    if (!matchMerchant || !matchSearch) return false;

    if (merchantMode && stageFilter !== "All") {
      return merchantStageLabel[t.stage] === stageFilter;
    }

    return stageFilter === "All" || t.stage === stageFilter;
  });

  const liveSelectedTicket = selectedTicket
    ? tickets.find((t) => t.id === selectedTicket.id) ?? selectedTicket
    : null;

  const filterOptions = merchantMode ? merchantStageFilters : ["All", ...stageOrder];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reversal Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          {filterMerchantId ? " for this merchant" : " across all merchants"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            onFocus={(e) => (e.target.style.borderColor = "#30B54A")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: stageFilter === s ? "#006633" : "white",
                color: stageFilter === s ? "white" : "#374151",
                borderColor: stageFilter === s ? "#006633" : "#e5e7eb",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((t) => {
          const needsMerchantAction = merchantMode && t.stage === "Sent to Merchant";
          const displayStage = merchantMode ? (merchantStageLabel[t.stage] ?? t.stage) : t.stage;

          const merchantProgressStages = ["Under Review", "Sent to Merchant", "Merchant Confirmed", "Resolved"];

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md"
              style={{ borderColor: needsMerchantAction ? "#f59e0b" : "#f3f4f6" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-gray-900">{t.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${stageColors[t.stage]}`}>
                      {displayStage}
                    </span>
                    {needsMerchantAction && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                        Action required
                      </span>
                    )}
                  </div>
                  {!filterMerchantId && (
                    <div className="text-sm text-gray-700 font-medium">{t.merchantName}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1">{t.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-900">KES {t.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.raisedDate}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                {!merchantMode && (
                  <span className="px-2 py-0.5 rounded-md font-medium" style={{ background: "#e6f7ec", color: "#006633" }}>
                    {t.aggregator}
                  </span>
                )}
                <span className="font-mono">{t.tillNumber}</span>
                <span>{t.customerPhone}</span>
                <span className="ml-auto text-gray-400">{t.timeline.length} updates →</span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 flex gap-1">
                {(merchantMode ? merchantProgressStages : stageOrder.filter((s) => s !== "Rejected")).map((s) => {
                  const done =
                    t.stage !== "Rejected" &&
                    stageOrder.indexOf(s as TicketStage) <= stageOrder.indexOf(t.stage);
                  return (
                    <div
                      key={s}
                      className="flex-1 h-1 rounded-full"
                      style={{ background: done ? "#30B54A" : "#e5e7eb" }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-20 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            No tickets found
          </div>
        )}
      </div>

      {liveSelectedTicket && (
        <TicketDrawer
          ticket={liveSelectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}