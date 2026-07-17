import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
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
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading income...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-900">Income</h1>
          <Link
            to="/income/new"
            className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Add
          </Link>
        </div>

        {incomeList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No income recorded yet</p>
            <Link to="/income/new" className="text-sm text-slate-900 font-medium mt-2 inline-block">
              Add your first income
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {incomeList.map((income) => (
            <div key={income.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{income.category}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {income.account} · {income.date}
                  </p>
                  {income.notes && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{income.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-emerald-600">
                    +{formatAmount(income.amount)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Link
                      to={`/income/${income.id}/edit`}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(income.id)}
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