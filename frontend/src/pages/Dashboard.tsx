import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { DashboardData } from "../lib/types";

function formatAmount(value: string): string {
  return "₹" + parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <p className="text-base font-medium text-slate-900">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-500 font-medium"
          >
            Log out
          </button>
        </div>

        {/* Balance card */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <p className="text-sm text-slate-300">Current Balance</p>
          <p className="text-3xl font-bold mt-1">
            {data ? formatAmount(data.balance) : "—"}
          </p>
        </div>

        {/* Income / Expenses row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Income</p>
            <p className="text-lg font-semibold text-emerald-600 mt-1">
              {data ? formatAmount(data.total_income) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Expenses</p>
            <p className="text-lg font-semibold text-red-500 mt-1">
              {data ? formatAmount(data.total_expenses) : "—"}
            </p>
          </div>
        </div>

        {/* Monthly summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900 mb-3">This Month</p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-slate-500">Income</p>
              <p className="font-medium text-emerald-600">
                {data ? formatAmount(data.monthly_income) : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Expenses</p>
              <p className="font-medium text-red-500">
                {data ? formatAmount(data.monthly_expenses) : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Savings</p>
              <p className="font-medium text-slate-900">
                {data
                  ? formatAmount(
                      (parseFloat(data.monthly_income) - parseFloat(data.monthly_expenses)).toString()
                    )
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 pb-2">
            <p className="text-sm font-medium text-slate-900">Recent Transactions</p>
          </div>

          {data?.recent_transactions.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No transactions yet. Add your first one!
            </p>
          )}

          <div className="divide-y divide-slate-100">
            {data?.recent_transactions.map((tx) => (
              <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.type === "income"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "↓" : "↑"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {tx.merchant || tx.category}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tx.category} · {tx.account}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`text-sm font-medium ${
                      tx.type === "income" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}{formatAmount(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}