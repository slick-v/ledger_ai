import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import type { DashboardData } from "../lib/types";

const navy = "#0f1b2d";
const navyLight = "#1a2942";
const navyMuted = "#2d4a6f";
const gold = "#d4a574";

const fmt = (n: number | string) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const accountIcon: Record<string, string> = { Bank: "🏦", Cash: "💵", UPI: "📱" };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase())
    : "there";
  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long" });
  const saved = data ? Number(data.monthly_income) - Number(data.monthly_expenses) : 0;

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    border: "1px solid #f0efe9",
  };

  return (
    <div style={{ color: navy }}>
      {/* Hero — navy */}
      <div
        style={{
          background: `linear-gradient(180deg, ${navy} 0%, ${navyLight} 100%)`,
          borderRadius: "0 0 32px 32px",
          padding: "20px 20px 32px",
          marginBottom: -16,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <p style={{ color: "#7b8fa3", fontSize: 12, margin: 0 }}>Welcome back,</p>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "2px 0 0" }}>{displayName}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {user?.is_admin && (
              <button
                onClick={() => navigate("/admin")}
                title="Admin"
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}
              >
                🛡️
              </button>
            )}
            <div
              title={user?.email}
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: gold, color: navy, fontWeight: 800, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {displayName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ color: "#7b8fa3", fontSize: 12, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
            Available Balance
          </p>
          {loading ? (
            <div
              className="animate-pulse"
              style={{ height: 40, width: 200, borderRadius: 10, background: "rgba(255,255,255,0.12)", margin: "12px auto 10px" }}
            />
          ) : (
            <p style={{ color: "#fff", fontSize: 40, fontWeight: 800, margin: "8px 0 6px", letterSpacing: -1.5 }}>
              {fmt(data!.balance)}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <span style={{ color: "#4ade80", fontSize: 12 }}>▲ {fmt(data?.total_income ?? 0)} in</span>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>|</span>
            <span style={{ color: "#f87171", fontSize: 12 }}>▼ {fmt(data?.total_expenses ?? 0)} out</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {[
            { label: "Add Expense", icon: "−", color: "#f87171", bg: "rgba(248,113,113,0.15)", onClick: () => navigate("/expenses/new") },
            { label: "Add Income", icon: "+", color: "#4ade80", bg: "rgba(74,222,128,0.15)", onClick: () => navigate("/income/new") },
            { label: "Transfer", icon: "⇄", color: gold, bg: "rgba(212,165,116,0.15)", onClick: () => toast("Transfers are coming soon 🚧") },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              style={{
                background: action.bg, border: "none", borderRadius: 14,
                padding: "14px 0", flex: 1, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: action.color, fontSize: 18, fontWeight: 700,
                }}
              >
                {action.icon}
              </div>
              <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 500 }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 20px 24px", position: "relative", zIndex: 0 }}>
        {/* Accounts */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>My Accounts</p>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {(data?.accounts ?? []).map((acc) => (
              <div key={acc.type} style={{ ...cardStyle, borderRadius: 16, padding: 16, minWidth: 150, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{accountIcon[acc.type] ?? "💳"}</span>
                  <div>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Account</p>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{acc.type}</p>
                  </div>
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: Number(acc.balance) < 0 ? "#f87171" : navy }}>
                  {fmt(acc.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly summary */}
        <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>{monthLabel} Summary</p>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#4ade80" }}>{fmt(data?.monthly_income ?? 0)}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Income</p>
            </div>
            <div style={{ width: 1, background: "#f0efe9" }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#f87171" }}>{fmt(data?.monthly_expenses ?? 0)}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Expenses</p>
            </div>
            <div style={{ width: 1, background: "#f0efe9" }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: gold }}>{fmt(saved)}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>Saved</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Transactions</p>
            <span
              onClick={() => navigate("/expenses")}
              style={{ fontSize: 12, color: navyMuted, cursor: "pointer", fontWeight: 600 }}
            >
              See all
            </span>
          </div>
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderTop: i > 0 ? "1px solid #f7f7f5" : "none" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "#f0efe9" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: "50%", background: "#f0efe9", borderRadius: 6 }} />
                    <div style={{ height: 10, width: "30%", background: "#f4f3ee", borderRadius: 6, marginTop: 8 }} />
                  </div>
                </div>
              ))
            ) : data!.recent_transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 32, margin: 0 }}>🧾</p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: "8px 0 0" }}>No transactions yet</p>
              </div>
            ) : (
              data!.recent_transactions.map((tx, i) => (
                <div
                  key={`${tx.type}-${tx.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderTop: i > 0 ? "1px solid #f7f7f5" : "none" }}
                >
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: tx.type === "income" ? "rgba(74,222,128,0.1)" : "#f7f7f5",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                    }}
                  >
                    {getCategoryConfig(tx.category).icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.merchant || tx.category}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>
                      {tx.account} · {fmtDate(tx.date)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: tx.type === "income" ? "#4ade80" : navy }}>
                      {tx.type === "income" ? "+" : "−"}
                      {fmt(tx.amount)}
                    </p>
                    <p style={{ fontSize: 10, color: "#c4c4b8", margin: "2px 0 0" }}>{tx.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
