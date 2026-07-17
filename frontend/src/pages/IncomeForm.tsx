import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Income, IncomeCategory, AccountType } from "../lib/types";

const categories: IncomeCategory[] = ["Salary", "Investment", "Other"];
const accounts: AccountType[] = ["Cash", "UPI", "Bank"];

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
      } else {
        await api.post("/income", payload);
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
          <h1 className="text-xl font-semibold text-slate-900">
            {isEditing ? "Edit Income" : "Add Income"}
          </h1>
          <button
            onClick={() => navigate("/income")}
            className="text-sm text-slate-500"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    category === c
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
            <div className="flex gap-2">
              {accounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccount(a)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    account === a
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 text-white py-3 font-medium disabled:opacity-50"
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