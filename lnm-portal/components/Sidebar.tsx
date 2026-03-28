"use client";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

type View = "dashboard" | "aggregators" | "merchants" | "tickets";



type Props = {
  activeView: View;
  setView: (v: View) => void;
  onBellClick: () => void;
};

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
  id: "aggregators",
  label: "Aggregators",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6" />
    </svg>
  ),
},
  {
    id: "merchants",
    label: "Merchants",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 9l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: "tickets",
    label: "Reversal Tickets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeView, setView, onBellClick }: Props) {
  const { logout } = useAuth();
  const { tickets, unreadCount } = useStore();
  const activeCount = tickets.filter((t) => !["Resolved", "Rejected"].includes(t.stage)).length;
  const bellCount = unreadCount();

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-30"
      style={{ width: "var(--sidebar-w, 260px)", background: "#1b5e20", borderRight: "1px solid #2e7d32" }}
    >
      {/* Logo + bell */}
      <div className="px-6 py-6 border-b border-green-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" fill="#2e7d32" />
              <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Safaricom</div>
            <div className="text-green-300 text-xs">LNM Reversal Portal</div>
          </div>
        </div>
        <button onClick={onBellClick} className="relative text-green-300 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {bellCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "#ef4444", fontSize: 9 }}>
              {bellCount}
            </span>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{ background: isActive ? "rgba(255,255,255,0.15)" : "transparent", color: isActive ? "#ffffff" : "#a5d6a7" }}
            >
              {item.icon}
              {item.label}
              {item.id === "tickets" && activeCount > 0 && (
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#4caf50", color: "white" }}>
                  {activeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-green-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#4caf50", color: "white" }}>
            SA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">Safaricom Admin</div>
            <div className="text-green-400 text-xs truncate">admin@safaricom.co.ke</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-green-300 text-xs hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
