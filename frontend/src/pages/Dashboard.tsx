import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import QuickAdd from "../components/QuickAdd";
import BudgetCard from "../components/BudgetCard";
import type { DashboardData, BudgetSummary } from "../lib/types";

const navy = "#0f1b2d";
const navyLight = "#1a2942";
const navyMuted = "#2d4a6f";
const gold = "#d4a574";

const fmt = (n: number | string) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  border: "1px solid #f0efe9",
};

function DailySpend({ spent, allowance }: { spent: number; allowance: number }) {
  // No budgets set → just show today's spend, no bar.
  if (allowance <= 0) {
    return (
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>Spent today </span>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{fmt(spent)}</span>
      </div>
    );
  }

  const pct = Math.min((spent / allowance) * 100, 100);
  const over = spent > allowance;
  const fill = over ? "#f87171" : spent / allowance >= 0.8 ? "#f59e0b" : gold;
  const remaining = allowance - spent;

  return (
    <div
      style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "10px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ color: "#94a3b8", fontSize: 11 }}>Spent today</span>
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
          {fmt(spent)} <span style={{ color: "#7b8fa3", fontWeight: 400 }}>/ {fmt(allowance)}</span>
        </span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 999, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: fill, borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 10, color: over ? "#f87171" : "#7b8fa3", textAlign: "right" }}>
        {over ? `${fmt(-remaining)} over today's pace` : `${fmt(remaining)} left today`}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [budgets, setBudgets] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    return Promise.all([
      api.get<DashboardData>("/dashboard").then(setData),
      api.get<BudgetSummary>("/budgets").then(setBudgets),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase())
    : "there";

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
            <button
              onClick={() => {
                if (confirm("Log out?")) logout();
              }}
              title="Log out"
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Balance */}
        <div style={{ textAlign: "center" }}>
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

        {/* Today's spend vs derived daily allowance */}
        {!loading && data && <DailySpend spent={Number(data.spent_today)} allowance={Number(data.daily_budget)} />}
      </div>

      <div style={{ padding: "28px 20px 24px", position: "relative", zIndex: 0 }}>
        {/* Quick add + AI natural-language entry */}
        <QuickAdd onSaved={fetchAll} />

        {/* Budgets */}
        <BudgetCard summary={budgets} loading={loading} />

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
