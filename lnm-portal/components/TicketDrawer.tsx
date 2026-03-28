"use client";
import { useState } from "react";
import { type Ticket, stageColors, stageOrder, stageActor, type TicketStage } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

type Props = { ticket: Ticket; onClose: () => void };

export default function TicketDrawer({ ticket, onClose }: Props) {
  const { advanceStage, rejectTicket } = useStore();
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isTerminal = ticket.stage === "Resolved" || ticket.stage === "Rejected";
  const currentIdx = stageOrder.indexOf(ticket.stage);
  const nextStage = !isTerminal ? stageOrder[currentIdx + 1] as TicketStage : null;

  // Who should act at the current stage?
  const requiredActor = stageActor[ticket.stage];
  const myRole = user?.role ?? "admin";
  const canAct = !isTerminal && requiredActor === myRole;

  const actorLabel =
    user?.role === "admin" ? "Safaricom Ops" :
    user?.role === "aggregator" && "aggregatorName" in user! ? user.aggregatorName :
    user?.role === "merchant" && "merchantId" in user! ? ticket.merchantName.split(" - ")[0] :
    "System";

  const roleBadgeStyle =
    myRole === "admin"      ? { bg: "#e8f5e9", color: "#2e7d32", label: "Safaricom Ops" } :
    myRole === "aggregator" ? { bg: "#e8eaf6", color: "#3949ab", label: "aggregatorName" in user! ? user.aggregatorName : "Aggregator" } :
                              { bg: "#fff3e0", color: "#e65100", label: "Merchant" };

  const handleAdvance = () => {
    if (!note.trim()) return;
    advanceStage(ticket.id, note.trim(), actorLabel);
    setSubmitted(true);
    setTimeout(onClose, 700);
  };

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    rejectTicket(ticket.id, rejectNote.trim(), actorLabel);
    setSubmitted(true);
    setTimeout(onClose, 700);
  };

  const actionLabel =
    ticket.stage === "Under Review"          ? `Escalate to ${ticket.aggregator}` :
    ticket.stage === "Escalated to Aggregator" ? `Forward to Merchant` :
    ticket.stage === "Sent to Merchant"      ? `Confirm & Return to Aggregator` :
    ticket.stage === "Merchant Confirmed"    ? `Begin Processing` :
    ticket.stage === "Aggregator Processing" ? `Mark as Resolved` :
    nextStage ? `Advance → ${nextStage}` : "";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden" style={{ animation: "slideIn 0.25s ease" }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm font-semibold text-gray-900">{ticket.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[ticket.stage]}`}>{ticket.stage}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: roleBadgeStyle.bg, color: roleBadgeStyle.color }}>
                {roleBadgeStyle.label}
              </span>
            </div>
            <div className="text-sm text-gray-500">{ticket.merchantName}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Amount",           value: `KES ${ticket.amount.toLocaleString()}` },
                { label: "Customer",         value: ticket.customerPhone },
                { label: "Transaction Date", value: ticket.transactionDate },
                { label: "Raised Date",      value: ticket.raisedDate },
                { label: "Aggregator",       value: ticket.aggregator },
                { label: "Till Number",      value: ticket.tillNumber },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="text-sm font-medium text-gray-900 font-mono">{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Description</div>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{ticket.description}</div>
            </div>
          </div>

          {/* Stage pipeline */}
          <div className="px-6 py-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resolution Pipeline</h3>
            <div className="space-y-1">
              {stageOrder.filter((s) => s !== "Rejected").map((stage, idx) => {
                const isRejected = ticket.stage === "Rejected";
                const isDone = !isRejected && stageOrder.indexOf(stage) <= currentIdx;
                const isCurrent = stage === ticket.stage;
                const actor = stageActor[stage];
                const actorTag =
                  actor === "admin"      ? { label: "Safaricom", color: "#2e7d32", bg: "#e8f5e9" } :
                  actor === "aggregator" ? { label: "Aggregator", color: "#3949ab", bg: "#e8eaf6" } :
                  actor === "merchant"   ? { label: "Merchant",   color: "#e65100", bg: "#fff3e0" } :
                  null;

                return (
                  <div key={stage} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
                        style={{ background: isCurrent ? "#4caf50" : isDone ? "#a5d6a7" : "#e5e7eb", color: isDone ? "#1b5e20" : "#9ca3af" }}>
                        {isDone ? "✓" : idx + 1}
                      </div>
                      {idx < stageOrder.filter(s => s !== "Rejected").length - 1 && (
                        <div className="w-0.5 h-5" style={{ background: isDone ? "#a5d6a7" : "#e5e7eb" }} />
                      )}
                    </div>
                    <div className="pb-1 flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: isCurrent ? "#1b5e20" : isDone ? "#374151" : "#9ca3af" }}>{stage}</span>
                      {actorTag && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: actorTag.bg, color: actorTag.color }}>
                          {actorTag.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {ticket.stage === "Rejected" && (
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>✕</div>
                  <span className="text-sm font-medium text-red-600">Rejected</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {ticket.timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4caf50" }} />
                    {i < ticket.timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "#e5e7eb", minHeight: 20 }} />}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[entry.stage]}`}>{entry.stage}</span>
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                      <span className="text-xs font-medium text-gray-500">· {entry.actor}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{entry.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isTerminal && !submitted && (
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            {canAct ? (
              <>
                <textarea
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder={`Add a note for "${actionLabel}"...`}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none resize-none"
                  onFocus={(e) => (e.target.style.borderColor = "#4caf50")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <div className="flex gap-2">
                  <button onClick={handleAdvance} disabled={!note.trim()}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #2e7d32, #4caf50)" }}>
                    {actionLabel}
                  </button>
                  <button onClick={() => setShowReject(!showReject)}
                    className="px-4 py-2.5 rounded-xl text-red-600 text-sm font-medium border border-red-200 bg-red-50">
                    Reject
                  </button>
                </div>
                {showReject && (
                  <div className="space-y-2">
                    <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Reason for rejection..." rows={2}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-red-200 outline-none resize-none" />
                    <button onClick={handleReject} disabled={!rejectNote.trim()}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 bg-red-500">
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-sm text-gray-400 py-2 bg-gray-50 rounded-xl">
                {requiredActor === "admin"      && "Awaiting Safaricom ops action"}
                {requiredActor === "aggregator" && `Awaiting ${ticket.aggregator} action`}
                {requiredActor === "merchant"   && "Awaiting merchant confirmation"}
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div className="px-6 py-4 border-t border-gray-100 text-center text-sm font-medium text-green-700">✓ Updated successfully</div>
        )}
      </div>
    </div>
  );
}
