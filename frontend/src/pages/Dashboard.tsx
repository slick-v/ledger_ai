import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-slate-500 font-medium"
          >
            Log out
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Logged in as</p>
          <p className="text-base font-medium text-slate-900">{user?.email}</p>
        </div>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Balance, totals, and transactions coming next.
        </p>
      </div>
    </div>
  );
}