"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

type Props = {
  onClose: () => void;
  merchantId?: string;
  aggregatorId?: string;
};

export default function NotificationsPanel({ onClose, merchantId, aggregatorId }: Props) {
  const { notifications, markNotificationsRead } = useStore();

  const filtered = notifications.filter((n) => {
    if (merchantId && n.merchantId !== merchantId) return false;
    if (aggregatorId && n.aggregatorId !== aggregatorId) return false;
    return true;
  });

  useEffect(() => {
    const t = setTimeout(() => markNotificationsRead({ merchantId, aggregatorId }), 1500);
    return () => clearTimeout(t);
  }, [merchantId, aggregatorId, markNotificationsRead]);

  const typeStyles: Record<string, { bg: string; icon: string; color: string }> = {
    action:   { bg: "#fff3e0", icon: "⚡", color: "#e65100" },
    resolved: { bg: "#e8f5e9", icon: "✓",  color: "#2e7d32" },
    rejected: { bg: "#fef2f2", icon: "✕",  color: "#dc2626" },
    info:     { bg: "#e3f2fd", icon: "ℹ",  color: "#1565c0" },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-sm bg-white shadow-2xl h-full flex flex-col" style={{ animation: "slideIn 0.2s ease", borderLeft: "1px solid #e5e7eb" }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Notifications</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.filter((n) => !n.read).length} unread</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && <div className="py-20 text-center text-gray-400 text-sm">No notifications</div>}
          {filtered.map((n) => {
            const s = typeStyles[n.type] || typeStyles.info;
            return (
              <div key={n.id} className="px-5 py-4 flex gap-3" style={{ background: n.read ? "white" : "#fafffe" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-xs text-gray-400">{n.ticketId}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{n.timestamp}</span>
                    {!n.read && <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#4caf50" }} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
