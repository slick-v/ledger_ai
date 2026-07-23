import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navy = "#0f1b2d";
const gold = "#d4a574";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f7f7f5" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: navy }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
              <rect x="3" y="9" width="18" height="10" rx="2" />
              <circle cx="16" cy="14" r="1" fill={gold} stroke="none" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: navy }}>Create account</h1>
          <p className="text-sm text-slate-400 mt-1">Start tracking your expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger-500 bg-danger-50 px-4 py-2 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl text-white py-3.5 font-semibold disabled:opacity-50 shadow-sm active:scale-[0.98] transition-transform"
            style={{ background: navy }}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#9a6b3f" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
