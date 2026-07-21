import { useState, useEffect} from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { Income, IncomeCategory, AccountType } from "../lib/types";

const categories: IncomeCategory[] = ["Salary", "Investment", "Other"];
const accounts: AccountType[] = ["Cash", "UPI", "Bank"];

const categoryIcons: Record<string, string> = {
  Salary: "💵",
  Investment: "📈",
  Other: "📌",
};

export default function IncomeForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("Salary");
  const [account, setAccount] = useState<AccountType>("Bank");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    api
      .get<Income>(`/income/${id}`)
      .then((income) => {
        setAmount(income.amount);
        setCategory(income.category);
        setAccount(income.account);
        setNotes(income.notes || "");
        setDate(income.date);
      })
      .catch(() => navigate("/income"))
      .finally(() => setLoading(false));
  }, [id, isEditing, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      amount: parseFloat(amount),
      category,
      account,
      notes: notes || null,
      date,
    };

    try {
      if (isEditing) {
        await api.put(`/income/${id}`, payload);
        toast.success("Income updated");
      } else {
        await api.post("/income", payload);
        toast.success("Income added");
      }
      navigate("/income");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? "Edit Income" : "Add Income"}
          </h1>
          <button
            onClick={() => navigate("/income")}
            className="text-sm text-slate-400 font-medium"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl text-sm transition-all ${
                    category === c
                      ? "bg-success-50 ring-2 ring-success-500 font-semibold"
                      : "bg-slate-50"
                  }`}
                >
                  <span className="text-lg mb-0.5">{categoryIcons[c]}</span>
                  <span className="text-xs">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Account</label>
            <div className="flex gap-2">
              {accounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccount(a)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    account === a
                      ? "bg-success-600 text-white border-success-600"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-sm text-danger-500 bg-danger-50 px-4 py-2 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-success-600 text-white py-3.5 font-semibold disabled:opacity-50 shadow-sm active:scale-[0.98] transition-transform"
          >
            {isSubmitting
              ? isEditing ? "Saving..." : "Adding..."
              : isEditing ? "Save Changes" : "Add Income"
            }
          </button>
        </form>
      </div>
    </div>
  );
}