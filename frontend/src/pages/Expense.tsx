import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import { TransactionSkeleton } from "../components/Skeleton";
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
      toast.success("Expense deleted");
    });
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
          <Link
            to="/expenses/new"
            className="bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-sm"
          >
            + Add
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-slate-400 text-sm">No expenses recorded yet</p>
            <Link to="/expenses/new" className="inline-block mt-3 text-sm text-primary-600 font-medium">
              Add your first expense
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const cat = getCategoryConfig(expense.category);
              return (
                <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {expense.merchant || expense.category}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {expense.category} · {expense.account} · {expense.date}
                      </p>
                      {expense.notes && (
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">{expense.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-danger-500">
                        -{formatAmount(expense.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-2 border-t border-slate-50">
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className="text-xs text-slate-400 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-xs text-danger-400 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}