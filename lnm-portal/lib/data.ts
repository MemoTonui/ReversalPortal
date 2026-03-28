// ─── Stage pipeline ───────────────────────────────────────────────────────────
// Submitted → Under Review (Safaricom ops)
//   → Escalated to Aggregator (Safaricom sends to Cellulant/Pesapal/DPO)
//     → Sent to Merchant (Aggregator forwards to merchant)
//       → Merchant Confirmed (Merchant verifies)
//         → Aggregator Processing (Aggregator executes reversal)
//           → Resolved
// At any stage: Rejected

export type TicketStage =
  | "Submitted"
  | "Under Review"
  | "Escalated to Aggregator"
  | "Sent to Merchant"
  | "Merchant Confirmed"
  | "Aggregator Processing"
  | "Resolved"
  | "Rejected";

export type Merchant = {
  id: string;
  name: string;
  tillNumber: string;
  paybillNumber?: string;
  aggregator: string; // aggregator name key
  category: string;
  location: string;
  joinedDate: string;
};

export type Aggregator = {
  id: string;
  name: string;
  email: string;
  merchantIds: string[];
};

export type Ticket = {
  id: string;
  merchantId: string;
  merchantName: string;
  customerPhone: string;
  amount: number;
  transactionDate: string;
  raisedDate: string;
  stage: TicketStage;
  aggregator: string;
  tillNumber: string;
  description: string;
  timeline: { stage: TicketStage; timestamp: string; note: string; actor: string }[];
};

// ─── Aggregators ──────────────────────────────────────────────────────────────
export const aggregators: Aggregator[] = [
  { id: "AGG001", name: "Cellulant",  email: "ops@cellulant.co.ke",  merchantIds: ["M001", "M004"] },
  { id: "AGG002", name: "DPO Group",  email: "ops@dpogroup.co.ke",   merchantIds: ["M002", "M005"] },
  { id: "AGG003", name: "Pesapal",    email: "ops@pesapal.co.ke",    merchantIds: ["M003"] },
];

// ─── Merchants ────────────────────────────────────────────────────────────────
export const merchants: Merchant[] = [
  { id: "M001", name: "Naivas Supermarket - Westlands", tillNumber: "5243001", paybillNumber: "400200", aggregator: "Cellulant", category: "Retail",          location: "Westlands, Nairobi", joinedDate: "2022-03-15" },
  { id: "M002", name: "Java House - The Hub",           tillNumber: "5312045",                          aggregator: "DPO Group", category: "Food & Beverage", location: "Karen, Nairobi",     joinedDate: "2021-11-02" },
  { id: "M003", name: "Quickmart - Ruaka",              tillNumber: "5198234", paybillNumber: "522522", aggregator: "Pesapal",   category: "Retail",          location: "Ruaka, Kiambu",      joinedDate: "2020-07-19" },
  { id: "M004", name: "Carrefour - Two Rivers",         tillNumber: "5401112",                          aggregator: "Cellulant", category: "Retail",          location: "Runda, Nairobi",     joinedDate: "2023-01-08" },
  { id: "M005", name: "KFC - Sarit Centre",             tillNumber: "5089001",                          aggregator: "DPO Group", category: "Food & Beverage", location: "Westlands, Nairobi", joinedDate: "2022-09-30" },
];

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const tickets: Ticket[] = [
  {
    id: "TKT-2024-0891",
    merchantId: "M001", merchantName: "Naivas Supermarket - Westlands",
    customerPhone: "0712***456", amount: 3450,
    transactionDate: "2024-03-20", raisedDate: "2024-03-20",
    stage: "Escalated to Aggregator",
    aggregator: "Cellulant", tillNumber: "5243001",
    description: "Customer paid for groceries but received duplicate charge",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-20 09:14", note: "Ticket raised via 456# USSD flow",              actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-20 11:32", note: "Assigned to LNM ops team",                     actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-20 13:00", note: "Forwarded to Cellulant for settlement query",  actor: "Safaricom Ops" },
    ],
  },
  {
    id: "TKT-2024-0887",
    merchantId: "M001", merchantName: "Naivas Supermarket - Westlands",
    customerPhone: "0723***789", amount: 1200,
    transactionDate: "2024-03-19", raisedDate: "2024-03-19",
    stage: "Sent to Merchant",
    aggregator: "Cellulant", tillNumber: "5243001",
    description: "Wrong till selected, payment went to adjacent merchant",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-19 14:05", note: "Ticket raised via 456# USSD flow",              actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-19 15:20", note: "Transaction verified by LNM ops",               actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-19 16:00", note: "Sent to Cellulant for settlement records",     actor: "Safaricom Ops" },
      { stage: "Sent to Merchant",        timestamp: "2024-03-20 08:00", note: "Cellulant has requested merchant confirmation", actor: "Cellulant" },
    ],
  },
  {
    id: "TKT-2024-0871",
    merchantId: "M003", merchantName: "Quickmart - Ruaka",
    customerPhone: "0745***123", amount: 5780,
    transactionDate: "2024-03-18", raisedDate: "2024-03-18",
    stage: "Merchant Confirmed",
    aggregator: "Pesapal", tillNumber: "5198234",
    description: "Transaction processed twice for same basket",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-18 10:00", note: "Ticket raised via 456# USSD flow",             actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-18 11:45", note: "Flagged for aggregator review",                actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-18 13:00", note: "Sent to Pesapal ops desk",                    actor: "Safaricom Ops" },
      { stage: "Sent to Merchant",        timestamp: "2024-03-19 09:00", note: "Pesapal requested merchant to verify",        actor: "Pesapal" },
      { stage: "Merchant Confirmed",      timestamp: "2024-03-20 07:30", note: "Merchant confirmed duplicate — reversal approved", actor: "Quickmart" },
    ],
  },
  {
    id: "TKT-2024-0855",
    merchantId: "M002", merchantName: "Java House - The Hub",
    customerPhone: "0768***001", amount: 850,
    transactionDate: "2024-03-15", raisedDate: "2024-03-15",
    stage: "Resolved",
    aggregator: "DPO Group", tillNumber: "5312045",
    description: "Customer cancelled order but payment had already gone through",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-15 13:10", note: "Ticket raised via 456# USSD flow",            actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-15 14:00", note: "Transaction confirmed valid reversal",        actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-15 15:00", note: "DPO Group notified",                         actor: "Safaricom Ops" },
      { stage: "Sent to Merchant",        timestamp: "2024-03-16 09:00", note: "DPO Group sent to Java House for confirmation", actor: "DPO Group" },
      { stage: "Merchant Confirmed",      timestamp: "2024-03-17 10:15", note: "Java House confirmed cancellation",          actor: "Java House" },
      { stage: "Aggregator Processing",   timestamp: "2024-03-17 14:00", note: "DPO Group processing reversal payment",      actor: "DPO Group" },
      { stage: "Resolved",                timestamp: "2024-03-18 08:00", note: "KES 850 reversed to customer wallet",        actor: "DPO Group" },
    ],
  },
  {
    id: "TKT-2024-0843",
    merchantId: "M003", merchantName: "Quickmart - Ruaka",
    customerPhone: "0711***344", amount: 2100,
    transactionDate: "2024-03-14", raisedDate: "2024-03-14",
    stage: "Rejected",
    aggregator: "Pesapal", tillNumber: "5198234",
    description: "Customer claims non-receipt of goods, merchant disputes",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-14 16:00", note: "Ticket raised via 456# USSD flow",            actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-14 17:10", note: "Evidence requested from both parties",        actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-14 18:00", note: "Sent to Pesapal for review",                 actor: "Safaricom Ops" },
      { stage: "Sent to Merchant",        timestamp: "2024-03-15 09:00", note: "Pesapal asked merchant to provide evidence", actor: "Pesapal" },
      { stage: "Rejected",                timestamp: "2024-03-16 14:00", note: "Merchant provided CCTV proof of goods delivered — reversal denied", actor: "Pesapal" },
    ],
  },
  {
    id: "TKT-2024-0899",
    merchantId: "M004", merchantName: "Carrefour - Two Rivers",
    customerPhone: "0790***567", amount: 12500,
    transactionDate: "2024-03-21", raisedDate: "2024-03-21",
    stage: "Submitted",
    aggregator: "Cellulant", tillNumber: "5401112",
    description: "High-value transaction error — paid into wrong paybill",
    timeline: [
      { stage: "Submitted", timestamp: "2024-03-21 10:45", note: "Ticket raised via 456# USSD flow", actor: "Customer" },
    ],
  },
  {
    id: "TKT-2024-0902",
    merchantId: "M003", merchantName: "Quickmart - Ruaka",
    customerPhone: "0733***210", amount: 980,
    transactionDate: "2024-03-21", raisedDate: "2024-03-21",
    stage: "Aggregator Processing",
    aggregator: "Pesapal", tillNumber: "5198234",
    description: "Customer sent to wrong paybill number during checkout",
    timeline: [
      { stage: "Submitted",               timestamp: "2024-03-21 07:00", note: "Ticket raised via 456# USSD flow",            actor: "Customer" },
      { stage: "Under Review",            timestamp: "2024-03-21 08:30", note: "Confirmed valid misdirected payment",         actor: "Safaricom Ops" },
      { stage: "Escalated to Aggregator", timestamp: "2024-03-21 09:00", note: "Sent to Pesapal",                            actor: "Safaricom Ops" },
      { stage: "Sent to Merchant",        timestamp: "2024-03-21 10:00", note: "Pesapal asked Quickmart to confirm",         actor: "Pesapal" },
      { stage: "Merchant Confirmed",      timestamp: "2024-03-21 11:00", note: "Quickmart confirmed — customer did not receive goods", actor: "Quickmart" },
      { stage: "Aggregator Processing",   timestamp: "2024-03-21 12:00", note: "Pesapal executing reversal",                 actor: "Pesapal" },
    ],
  },
];

// ─── Stage order & meta ───────────────────────────────────────────────────────
export const stageOrder: TicketStage[] = [
  "Submitted",
  "Under Review",
  "Escalated to Aggregator",
  "Sent to Merchant",
  "Merchant Confirmed",
  "Aggregator Processing",
  "Resolved",
  "Rejected",
];

export const stageColors: Record<TicketStage, string> = {
  "Submitted":               "bg-blue-100 text-blue-700",
  "Under Review":            "bg-yellow-100 text-yellow-700",
  "Escalated to Aggregator": "bg-indigo-100 text-indigo-700",
  "Sent to Merchant":        "bg-orange-100 text-orange-700",
  "Merchant Confirmed":      "bg-teal-100 text-teal-700",
  "Aggregator Processing":   "bg-purple-100 text-purple-700",
  "Resolved":                "bg-green-100 text-green-700",
  "Rejected":                "bg-red-100 text-red-700",
};

// Who acts at each stage
export const stageActor: Record<TicketStage, "admin" | "aggregator" | "merchant" | "none"> = {
  "Submitted":               "admin",
  "Under Review":            "admin",
  "Escalated to Aggregator": "aggregator",
  "Sent to Merchant":        "merchant",
  "Merchant Confirmed":      "aggregator",
  "Aggregator Processing":   "aggregator",
  "Resolved":                "none",
  "Rejected":                "none",
};
