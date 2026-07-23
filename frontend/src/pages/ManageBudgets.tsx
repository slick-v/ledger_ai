import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import type { BudgetSummary, ExpenseCategory } from "../lib/types";

const navy = "#0f1b2d";
const border = "#f0efe9";

const categories: ExpenseCategory[] = [
  "Food", "Grocery", "Fuel", "Shopping", "Bills",
  "Health", "Entertainment", "Travel", "Education", "Other",
];

export default function ManageBudgets() {
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<BudgetSummary>("/budgets")
      .then((s) => {
        const map: Record<string, string> = {};
        s.budgets.forEach((b) => {
          map[b.category] = String(Math.round(Number(b.amount)));
        });
        setAmounts(map);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        categories.map((c) =>
          api.put("/budgets", { category: c, amount: parseFloat(amounts[c] || "0") || 0 })
        )
      );
      toast.success("Budgets saved");
      navigate("/dashboard");
    } catch {
      toast.error("Could not save budgets");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "24px 20px", color: navy }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Monthly budgets</h1>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>Set a monthly cap per category. Leave blank or 0 to remove.</p>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.map((c) => (
            <div
              key={c}
              style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${border}`, borderRadius: 14, padding: "12px 14px" }}
            >
              <span style={{ fontSize: 18 }}>{getCategoryConfig(c).icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{c}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amounts[c] ?? ""}
                  onChange={(e) => setAmounts((a) => ({ ...a, [c]: e.target.value }))}
                  style={{ width: 90, textAlign: "right", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 10px", fontSize: 14, fontWeight: 600, color: navy, outline: "none", fontFamily: "inherit" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 14, border: "none", background: navy, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "Saving…" : "Save budgets"}
      </button>
    </div>
  );
}
