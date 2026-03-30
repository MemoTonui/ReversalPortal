"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { tickets as initialTickets, stageOrder, type Ticket, type TicketStage } from "./data";

export type Notification = {
  id: string;
  ticketId: string;
  merchantId: string;
  aggregatorId: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "action" | "resolved" | "rejected";
};

type StoreContextType = {
  tickets: Ticket[];
  notifications: Notification[];
  advanceStage: (ticketId: string, note: string, actor: string) => void;
  rejectTicket: (ticketId: string, note: string, actor: string) => void;
  markNotificationsRead: (filter?: { merchantId?: string; aggregatorId?: string }) => void;
  unreadCount: (filter?: { merchantId?: string; aggregatorId?: string }) => number;
};

const StoreContext = createContext<StoreContextType | null>(null);

function now() {
  return new Date().toISOString().replace("T", " ").substring(0, 16);
}

// Aggregator id lookup by name
const AGG_ID: Record<string, string> = {
  Cellulant: "AGG001",
  "DPO Group": "AGG002",
  Pesapal: "AGG003",
};

// Merchant id lookup by name (for notifications)
const MERCHANT_AGG: Record<string, string> = {
  M001: "AGG001", M004: "AGG001",
  M002: "AGG002", M005: "AGG002",
  M003: "AGG003",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "N001", ticketId: "TKT-2026-0891",
      merchantId: "M001", aggregatorId: "AGG001",
      message: "Action required: TKT-2026-0891 has been escalated to you — please review settlement records (KES 3,450)",
      timestamp: "2026-03-20 13:01", read: false, type: "action",
    },
    {
      id: "N002", ticketId: "TKT-2026-0887",
      merchantId: "M001", aggregatorId: "AGG001",
      message: "Action required: Please confirm reversal for TKT-2026-0887 (KES 1,200) — forwarded by Cellulant",
      timestamp: "2026-03-20 08:01", read: false, type: "action",
    },
    {
      id: "N003", ticketId: "TKT-2026-0871",
      merchantId: "M003", aggregatorId: "AGG003",
      message: "Update: Quickmart confirmed TKT-2026-0871. Please proceed with processing (KES 5,780)",
      timestamp: "2026-03-20 07:31", read: false, type: "action",
    },
    {
      id: "N004", ticketId: "TKT-2026-0855",
      merchantId: "M002", aggregatorId: "AGG002",
      message: "Resolved: TKT-2026-0855 has been successfully reversed. KES 850 returned to customer.",
      timestamp: "2026-03-18 08:01", read: true, type: "resolved",
    },
  ]);

  const pushNotif = useCallback((n: Omit<Notification, "id">) => {
    setNotifications((prev) => [{ ...n, id: `N${Date.now()}` }, ...prev]);
  }, []);

  const advanceStage = useCallback((ticketId: string, note: string, actor: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const currentIdx = stageOrder.indexOf(t.stage);
        const nextStage = stageOrder[currentIdx + 1] as TicketStage;
        if (!nextStage || t.stage === "Resolved" || t.stage === "Rejected") return t;

        const updated: Ticket = {
          ...t,
          stage: nextStage,
          timeline: [...t.timeline, { stage: nextStage, timestamp: now(), note, actor }],
        };

        const aggId = AGG_ID[t.aggregator] ?? "";
        const notifType: Notification["type"] =
          nextStage === "Resolved" ? "resolved" :
          ["Escalated to Aggregator", "Merchant Confirmed", "Aggregator Processing", "Sent to Merchant"].includes(nextStage)
            ? "action" : "info";

        const msg =
          nextStage === "Escalated to Aggregator"
            ? `Action required: TKT-${ticketId.split("-").slice(-1)} escalated to you for settlement review (KES ${t.amount.toLocaleString()})`
            : nextStage === "Sent to Merchant"
            ? `Action required: Please confirm reversal for ${ticketId} (KES ${t.amount.toLocaleString()}) — forwarded by ${t.aggregator}`
            : nextStage === "Merchant Confirmed"
            ? `Update: Merchant confirmed ${ticketId}. Please proceed with processing (KES ${t.amount.toLocaleString()})`
            : nextStage === "Aggregator Processing"
            ? `Update: ${t.aggregator} is processing reversal for ${ticketId}`
            : nextStage === "Resolved"
            ? `Resolved: ${ticketId} — KES ${t.amount.toLocaleString()} reversed to customer wallet`
            : `Update: ${ticketId} moved to "${nextStage}"`;

        pushNotif({ ticketId, merchantId: t.merchantId, aggregatorId: aggId, message: msg, timestamp: now(), read: false, type: notifType });
        return updated;
      })
    );
  }, [pushNotif]);

  const rejectTicket = useCallback((ticketId: string, note: string, actor: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const updated: Ticket = {
          ...t,
          stage: "Rejected",
          timeline: [...t.timeline, { stage: "Rejected", timestamp: now(), note, actor }],
        };
        const aggId = AGG_ID[t.aggregator] ?? "";
        pushNotif({
          ticketId, merchantId: t.merchantId, aggregatorId: aggId,
          message: `Rejected: ${ticketId} — ${note}`,
          timestamp: now(), read: false, type: "rejected",
        });
        return updated;
      })
    );
  }, [pushNotif]);

  const markNotificationsRead = useCallback((filter?: { merchantId?: string; aggregatorId?: string }) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!filter) return { ...n, read: true };
        const matchM = filter.merchantId ? n.merchantId === filter.merchantId : true;
        const matchA = filter.aggregatorId ? n.aggregatorId === filter.aggregatorId : true;
        return matchM && matchA ? { ...n, read: true } : n;
      })
    );
  }, []);

  const unreadCount = useCallback((filter?: { merchantId?: string; aggregatorId?: string }) => {
    return notifications.filter((n) => {
      if (n.read) return false;
      if (!filter) return true;
      const matchM = filter.merchantId ? n.merchantId === filter.merchantId : true;
      const matchA = filter.aggregatorId ? n.aggregatorId === filter.aggregatorId : true;
      return matchM && matchA;
    }).length;
  }, [notifications]);

  return (
    <StoreContext.Provider value={{ tickets, notifications, advanceStage, rejectTicket, markNotificationsRead, unreadCount }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
