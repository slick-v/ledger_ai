import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type UserInfo = {
  id: number;
  email: string;
  created_at: string;
  expense_count: number;
  income_count: number;
  total_spent: number;
};

type AdminStats = {
  total_users: number;
  total_expenses: number;
  total_income_entries: number;
};

function formatAmount(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>("/admin/stats"),
      api.get<{ users: UserInfo[] }>("/admin/users"),
    ])
      .then(([statsData, usersData]) => {
        setStats(statsData);
        setUsers(usersData.users);
      })
      .catch((err) => {
        if (err.message.includes("403") || err.message.includes("Admin")) {
          navigate("/dashboard");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="text-danger-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-primary-700">{stats?.total_users}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Users</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-danger-500">{stats?.total_expenses}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Expenses</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-success-600">{stats?.total_income_entries}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Income</p>
          </div>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">All Users</p>
          </div>
          <div className="divide-y divide-slate-50">
            {users.map((user) => (
              <div key={user.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Joined {new Date(user.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {user.expense_count} exp · {user.income_count} inc
                    </p>
                    <p className="text-xs font-medium text-danger-500 mt-0.5">
                      {formatAmount(user.total_spent)} spent
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}