import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import { TransactionSkeleton } from "../components/Skeleton";
import type { Income as IncomeType } from "../lib/types";

function formatAmount(value: string): string {
  return "₹" + parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Income() {
  const [incomeList, setIncomeList] = useState<IncomeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<IncomeType[]>("/income")
      .then(setIncomeList)
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: number) {
    if (!confirm("Delete this income?")) return;
    api.delete(`/income/${id}`).then(() => {
      setIncomeList((prev) => prev.filter((i) => i.id !== id));
      toast.success("Income deleted");
    });
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Income</h1>
          <Link
            to="/income/new"
            className="bg-success-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-sm"
          >
            + Add
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </div>
        ) : incomeList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-slate-400 text-sm">No income recorded yet</p>
            <Link to="/income/new" className="inline-block mt-3 text-sm text-primary-600 font-medium">
              Add your first income
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {incomeList.map((income) => {
              const cat = getCategoryConfig(income.category);
              return (
                <div key={income.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{income.category}</p>
                      <p className="text-[11px] text-slate-400">
                        {income.account} · {income.date}
                      </p>
                      {income.notes && (
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">{income.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-success-600">
                        +{formatAmount(income.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-2 border-t border-slate-50">
                    <Link
                      to={`/income/${income.id}/edit`}
                      className="text-xs text-slate-400 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(income.id)}
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