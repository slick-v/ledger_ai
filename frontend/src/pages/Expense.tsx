import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Expense } from "../lib/types";

function formatAmount(value: string): string {
  return "₹" + parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Expense[]>("/expenses")
      .then(setExpenses)
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: number) {
    if (!confirm("Delete this expense?")) return;
    api.delete(`/expenses/${id}`).then(() => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-900">Expenses</h1>
          <Link
            to="/expenses/new"
            className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Add
          </Link>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No expenses yet</p>
            <Link to="/expenses/new" className="text-sm text-slate-900 font-medium mt-2 inline-block">
              Add your first expense
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {expense.merchant || expense.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {expense.category} · {expense.account} · {expense.date}
                  </p>
                  {expense.notes && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{expense.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-red-500">
                    -{formatAmount(expense.amount)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}