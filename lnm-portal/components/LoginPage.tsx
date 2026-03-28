"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

type Tab = "admin" | "aggregator" | "merchant";

const HINTS: Record<Tab, { email: string; password: string; label: string }> = {
  admin:      { email: "admin@safaricom.co.ke",    password: "password",    label: "Safaricom Ops" },
  aggregator: { email: "ops@cellulant.co.ke",      password: "agg123",      label: "Aggregator (e.g. Cellulant)" },
  merchant:   { email: "naivas@merchant.co.ke",    password: "merchant123", label: "Merchant (e.g. Naivas)" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintTab, setHintTab] = useState<Tab>("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 500));
    const ok = login(email, password);
    if (!ok) setError("Invalid credentials. Use the demo hints below.");
    setLoading(false);
  };

  const fillHint = () => {
    setEmail(HINTS[hintTab].email);
    setPassword(HINTS[hintTab].password);
    setError("");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" fill="#2e7d32"/>
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Safaricom</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            LNM Reversal<br /><span style={{ color: "#a5d6a7" }}>Management Portal</span>
          </h1>
          <p className="text-green-100 text-lg leading-relaxed max-w-sm">
            End-to-end reversal tracking across Safaricom, aggregators, and merchants — from 456# to resolution.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="space-y-3">
          {[
            { role: "Safaricom Ops", color: "#a5d6a7", desc: "Reviews & escalates" },
            { role: "Aggregator",    color: "#90caf9", desc: "Queries settlement, forwards to merchant" },
            { role: "Merchant",      color: "#ffcc80", desc: "Confirms or disputes" },
            { role: "Aggregator",    color: "#90caf9", desc: "Processes & resolves" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{i + 1}</div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.15)", color: step.color }}>{step.role}</span>
              <span className="text-green-200 text-xs">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-gray-500 text-sm mb-8">Access your portal</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all"
                  onFocus={(e) => (e.target.style.borderColor = "#4caf50")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all"
                  onFocus={(e) => (e.target.style.borderColor = "#4caf50")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {error && <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg, #2e7d32, #4caf50)", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium">Demo credentials</p>
              <div className="flex gap-1 mb-3">
                {(["admin","aggregator","merchant"] as Tab[]).map((t) => (
                  <button key={t} onClick={() => setHintTab(t)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                    style={{ background: hintTab === t ? "#2e7d32" : "#f3f4f6", color: hintTab === t ? "white" : "#6b7280" }}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <div className="text-xs text-gray-500">{HINTS[hintTab].label}</div>
                <div className="font-mono text-xs text-gray-700">{HINTS[hintTab].email}</div>
                <div className="font-mono text-xs text-gray-400">{HINTS[hintTab].password}</div>
                <button onClick={fillHint} className="mt-2 text-xs font-medium px-3 py-1 rounded-lg w-full transition-colors"
                  style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                  Fill credentials →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
