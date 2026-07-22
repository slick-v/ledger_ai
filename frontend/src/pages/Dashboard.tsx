import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { getCategoryConfig } from "../lib/categories";
import { CardSkeleton, TransactionSkeleton } from "../components/Skeleton";
import type { DashboardData } from "../lib/types";

import { useNavigate } from "react-router-dom";

function formatAmount(value: string): string {
  return "₹" + parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function AnimatedBalance({ value }: { value: string }) {
  const [display, setDisplay] = useState(0);
  const target = parseFloat(value);
  // const navigate = useNavigate();

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target]);

  return (
    <span>₹{display.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Welcome back</p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
  <button
    onClick={() => navigate("/admin")}
    className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-full"
  >
    Admin
  </button>
  <button
    onClick={logout}
    className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-full"
  >
    Log out
  </button>
</div>
        </div>

        {/* Balance card */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white shadow-lg shadow-primary-900/20">
            <p className="text-sm text-primary-200">Current Balance</p>
            <p className="text-3xl font-bold mt-1">
              {data ? <AnimatedBalance value={data.balance} /> : "—"}
            </p>
          </div>
        )}

        {/* Income / Expenses */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-success-50 flex items-center justify-center">
                  <span className="text-success-500 text-sm">↓</span>
                </div>
                <p className="text-xs text-slate-400">Income</p>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {data ? formatAmount(data.total_income) : "—"}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-danger-50 flex items-center justify-center">
                  <span className="text-danger-500 text-sm">↑</span>
                </div>
                <p className="text-xs text-slate-400">Expenses</p>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {data ? formatAmount(data.total_expenses) : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Monthly summary */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">This Month</p>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-lg font-bold text-success-600">
                  {data ? formatAmount(data.monthly_income) : "—"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Income</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-lg font-bold text-danger-500">
                  {data ? formatAmount(data.monthly_expenses) : "—"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Expenses</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-lg font-bold text-primary-700">
                  {data
                    ? formatAmount(
                        (parseFloat(data.monthly_income) - parseFloat(data.monthly_expenses)).toString()
                      )
                    : "—"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Saved</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Recent Transactions</p>
            <Link to="/expenses" className="text-xs text-primary-600 font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div>
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </div>
          ) : data?.recent_transactions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-slate-400">No transactions yet</p>
              <Link
                to="/expenses/new"
                className="inline-block mt-3 text-sm text-primary-600 font-medium"
              >
                Add your first expense
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {data?.recent_transactions.map((tx) => {
                const cat = getCategoryConfig(tx.category);
                return (
                  <div key={`${tx.type}-${tx.id}`} className="flex items-center gap-3 px-4 py-3">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {tx.merchant || tx.category}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {tx.category} · {tx.account}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${
                        tx.type === "income" ? "text-success-600" : "text-danger-500"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{formatAmount(tx.amount)}
                      </p>
                      <p className="text-[10px] text-slate-300">{tx.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick add FAB */}
        <Link
          to="/expenses/new"
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary-700 text-white rounded-full shadow-lg shadow-primary-700/30 flex items-center justify-center text-2xl z-40 active:scale-95 transition-transform"
        >
          +
        </Link>
      </div>
    </div>
  );
}