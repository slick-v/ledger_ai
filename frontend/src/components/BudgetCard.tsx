import { useNavigate } from "react-router-dom";
import { getCategoryConfig } from "../lib/categories";
import type { BudgetSummary } from "../lib/types";

const navy = "#0f1b2d";
const gold = "#d4a574";
const green = "#4ade80";
const red = "#f87171";
const amber = "#f59e0b";
const border = "#f0efe9";

const fmt = (n: number | string) =>
  "₹" + Math.abs(Number(n)).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function barColor(pct: number, over: boolean) {
  if (over) return red;
  if (pct >= 80) return amber;
  return gold;
}

export default function BudgetCard({ summary, loading }: { summary: BudgetSummary | null; loading: boolean }) {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 20, padding: 20,
    border: `1px solid ${border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div className="animate-pulse" style={{ height: 14, width: 80, background: "#f0efe9", borderRadius: 6, marginBottom: 16 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse" style={{ height: 10, background: "#f4f3ee", borderRadius: 6, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  const empty = !summary || summary.budgets.length === 0;

  if (empty) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "28px 20px" }}>
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: navy }}>Budgets</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 14px" }}>Set monthly limits to track your spending.</p>
        <button
          onClick={() => navigate("/budgets")}
          style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: navy, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Set budgets
        </button>
      </div>
    );
  }

  const pct = summary.pct;
  const ringColor = pct > 90 ? red : pct > 70 ? amber : green;
  const circumference = 2 * Math.PI * 18;
  const overShoot = summary.budgets.find((b) => b.over);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: navy }}>Budget</p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
            {fmt(summary.total_spent)} of {fmt(summary.total_budget)} · {summary.over_count > 0 ? `${summary.over_count} over limit` : "On track"}
          </p>
        </div>
        <div style={{ width: 46, height: 46, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="46" height="46" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#f0efe9" strokeWidth="4" />
            <circle
              cx="22" cy="22" r="18" fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${Math.min(pct, 100) / 100 * circumference} ${circumference}`}
            />
          </svg>
          <span style={{ position: "absolute", fontSize: 10, fontWeight: 800, color: navy }}>{pct}%</span>
        </div>
      </div>

      {overShoot && (
        <div style={{ background: "#fff5f5", borderRadius: 10, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>
            {overShoot.category} exceeded by {fmt(Number(overShoot.spent) - Number(overShoot.amount))}
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {summary.budgets.map((b) => (
          <div key={b.category}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{getCategoryConfig(b.category).icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: navy }}>{b.category}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: b.over ? red : b.pct >= 80 ? amber : "#94a3b8" }}>
                {fmt(b.spent)}/{fmt(b.amount)}
              </span>
            </div>
            <div style={{ background: "#f0efe9", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(b.pct, 100)}%`, height: "100%", borderRadius: 4, background: barColor(b.pct, b.over), transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/budgets")}
        style={{ width: "100%", marginTop: 14, padding: 10, borderRadius: 12, border: `1px solid ${border}`, background: "transparent", color: navy, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        Manage budgets
      </button>
    </div>
  );
}
