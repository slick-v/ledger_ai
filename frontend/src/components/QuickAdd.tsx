import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import type { ParsedExpense, ExpenseCategory, AccountType } from "../lib/types";

const navy = "#0f1b2d";
const gold = "#d4a574";
const green = "#4ade80";
const border = "#f0efe9";

const categories: ExpenseCategory[] = [
  "Food", "Grocery", "Fuel", "Shopping", "Bills",
  "Health", "Entertainment", "Travel", "Education", "Other",
];
const accounts: AccountType[] = ["Cash", "UPI", "Bank"];

const examples = [
  "Spent 250 on lunch at Swiggy",
  "Paid ₹2100 for petrol",
  "700 groceries BigBasket",
  "Auto ₹150 to office",
  "Netflix subscription 649",
];

const today = () => new Date().toISOString().split("T")[0];

type Mode = "quick" | "ai";
type Phase = "idle" | "thinking" | "preview" | "saved";

export default function QuickAdd({ onSaved }: { onSaved: () => void }) {
  const [mode, setMode] = useState<Mode>("quick");

  // Quick mode
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [account, setAccount] = useState<AccountType>("UPI");
  const [adding, setAdding] = useState(false);

  // AI mode
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsed, setParsed] = useState<ParsedExpense | null>(null);
  const [placeholder, setPlaceholder] = useState(examples[0]);

  useEffect(() => {
    if (mode !== "ai" || phase !== "idle") return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % examples.length;
      setPlaceholder(examples[i]);
    }, 3000);
    return () => clearInterval(t);
  }, [mode, phase]);

  async function handleQuickAdd() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setAdding(true);
    try {
      await api.post("/expenses", {
        amount: amt, category, account, merchant: null, notes: null, date: today(),
      });
      toast.success("Expense added");
      setAmount("");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add");
    } finally {
      setAdding(false);
    }
  }

  async function handleParse() {
    if (!input.trim()) return;
    setPhase("thinking");
    try {
      const result = await api.post<ParsedExpense>("/ai/parse-expense", { text: input });
      setParsed(result);
      setPhase("preview");
    } catch (err) {
      setPhase("idle");
      const msg =
        err instanceof ApiError && err.status === 503
          ? "AI isn't set up yet — add your Groq key on the server"
          : err instanceof Error ? err.message : "Couldn't parse that";
      toast.error(msg);
    }
  }

  async function handleAISave() {
    if (!parsed) return;
    try {
      await api.post("/expenses", {
        amount: parsed.amount, category: parsed.category, account: parsed.account,
        merchant: parsed.merchant || null, notes: null, date: parsed.date,
      });
      setPhase("saved");
      setTimeout(() => {
        setPhase("idle"); setInput(""); setParsed(null); onSaved();
      }, 1400);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  function updateParsed<K extends keyof ParsedExpense>(key: K, value: ParsedExpense[K]) {
    setParsed((p) => (p ? { ...p, [key]: value } : p));
  }

  const selectStyle: React.CSSProperties = {
    border: `1px solid ${border}`, borderRadius: 11, padding: "8px 8px",
    fontSize: 12, fontWeight: 600, color: navy, background: "#fff",
    fontFamily: "inherit", outline: "none", cursor: "pointer",
  };
  const fieldStyle: React.CSSProperties = { flex: 1, background: "#f7f7f5", borderRadius: 12, padding: "8px 12px" };
  const fieldLabel: React.CSSProperties = { fontSize: 9, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: 1 };
  const editInput: React.CSSProperties = { border: "none", background: "transparent", outline: "none", width: "100%", fontFamily: "inherit", color: navy, padding: 0 };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: 12,
          border: `1px solid ${phase === "preview" ? gold : border}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "border-color 0.3s",
        }}
      >
        {/* Mode toggle */}
        <div style={{ display: "inline-flex", background: "#f7f7f5", borderRadius: 999, padding: 3, marginBottom: 12 }}>
          <button
            onClick={() => setMode("quick")}
            style={{ border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 999, background: mode === "quick" ? navy : "transparent", color: mode === "quick" ? "#fff" : "#94a3b8" }}
          >
            Quick
          </button>
          <button
            onClick={() => setMode("ai")}
            style={{ border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 999, background: mode === "ai" ? navy : "transparent", color: mode === "ai" ? "#fff" : "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            ✨ Say it
          </button>
        </div>

        {mode === "quick" ? (
          <>
            {/* Category chips */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
              {categories.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    title={c}
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer",
                      background: active ? "rgba(212,165,116,0.15)" : "#f7f7f5",
                      border: active ? `1.5px solid ${gold}` : "1.5px solid transparent",
                    }}
                  >
                    {getCategoryConfig(c).icon}
                  </button>
                );
              })}
            </div>

            {/* Amount + account + add */}
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, border: `1px solid ${border}`, borderRadius: 11, padding: "8px 11px" }}>
                <span style={{ color: "#94a3b8", fontSize: 16 }}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                  placeholder="0"
                  style={{ border: "none", outline: "none", flex: 1, fontSize: 18, fontWeight: 600, color: navy, background: "transparent", fontFamily: "inherit", width: "100%" }}
                />
              </div>
              <select value={account} onChange={(e) => setAccount(e.target.value as AccountType)} style={selectStyle}>
                {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <button
                onClick={handleQuickAdd}
                disabled={!parseFloat(amount) || adding}
                style={{ background: navy, color: "#fff", border: "none", borderRadius: 11, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !parseFloat(amount) || adding ? 0.5 : 1 }}
              >
                Add
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#b2bec3", margin: "8px 0 0", paddingLeft: 2 }}>
              Pick a category · type amount · Add. More detail? Use the ＋ button.
            </p>
          </>
        ) : (
          <>
            {/* AI input row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, opacity: 0.5 }}>✨</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleParse()}
                placeholder={placeholder}
                disabled={phase !== "idle"}
                style={{ border: "none", outline: "none", flex: 1, fontSize: 14, color: navy, background: "transparent", fontFamily: "inherit", padding: "10px 0" }}
              />
              {phase === "idle" && input.trim() && (
                <button onClick={handleParse} style={{ background: navy, color: "#fff", border: "none", borderRadius: 11, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Parse</button>
              )}
            </div>

            {phase === "thinking" && (
              <div style={{ padding: "12px 4px 4px", display: "flex", alignItems: "center", gap: 10 }}>
                <div className="animate-spin" style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #eee", borderTopColor: gold }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Understanding your expense…</span>
              </div>
            )}

            {phase === "preview" && parsed && (
              <div style={{ paddingTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, background: "rgba(212,165,116,0.15)", color: "#9a6b3f", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>AI PARSED</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Review and edit before saving</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={fieldStyle}>
                    <p style={fieldLabel}>Amount (₹)</p>
                    <input type="number" value={parsed.amount} onChange={(e) => updateParsed("amount", parseFloat(e.target.value) || 0)} style={{ ...editInput, fontSize: 20, fontWeight: 800, marginTop: 2 }} />
                  </div>
                  <div style={fieldStyle}>
                    <p style={fieldLabel}>Category</p>
                    <select value={parsed.category} onChange={(e) => updateParsed("category", e.target.value)} style={{ ...editInput, fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                      {categories.map((c) => <option key={c} value={c}>{getCategoryConfig(c).icon} {c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={fieldStyle}>
                    <p style={fieldLabel}>Merchant</p>
                    <input type="text" value={parsed.merchant || ""} placeholder="—" onChange={(e) => updateParsed("merchant", e.target.value || null)} style={{ ...editInput, fontSize: 14, fontWeight: 600, marginTop: 4 }} />
                  </div>
                  <div style={fieldStyle}>
                    <p style={fieldLabel}>Account</p>
                    <select value={parsed.account} onChange={(e) => updateParsed("account", e.target.value)} style={{ ...editInput, fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                      {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ ...fieldStyle, marginBottom: 14 }}>
                  <p style={fieldLabel}>Date</p>
                  <input type="date" value={parsed.date} onChange={(e) => updateParsed("date", e.target.value)} style={{ ...editInput, fontSize: 13, fontWeight: 600, marginTop: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setPhase("idle"); setInput(""); setParsed(null); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: "#fff", fontSize: 13, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>Discard</button>
                  <button onClick={handleAISave} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: navy, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✓ Save expense</button>
                </div>
              </div>
            )}

            {phase === "saved" && (
              <div style={{ paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: green, fontSize: 14 }}>✓</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2f9e5e" }}>Expense saved</span>
              </div>
            )}

            {phase === "idle" && (
              <p style={{ fontSize: 10, color: "#b2bec3", margin: "6px 0 0", paddingLeft: 2 }}>
                Try: "Spent 250 on lunch" · "Netflix 649"
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
