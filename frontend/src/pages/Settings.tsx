import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../lib/types";

const navy = "#0f1b2d";
const gold = "#d4a574";
const border = "#f0efe9";

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase())
    : "there";

  async function toggleDigest() {
    if (!user) return;
    const next = !user.email_notifications;
    setSaving(true);
    try {
      await api.patch<User>("/me", { email_notifications: next });
      await refreshUser();
      toast.success(next ? "Daily digest enabled" : "Daily digest disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) logout();
  }

  return (
    <div style={{ padding: "24px 20px", color: navy }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Profile</h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Done
        </button>
      </div>

      {/* Identity */}
      <div
        style={{
          background: "#fff", border: `1px solid ${border}`, borderRadius: 14, padding: 16,
          display: "flex", alignItems: "center", gap: 14, marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: gold, color: navy, fontWeight: 800, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {displayName.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{displayName}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div
        style={{
          background: "#fff", border: `1px solid ${border}`, borderRadius: 14, padding: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Daily email digest</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Get an email each day with what you spent today and your budget status.
          </p>
        </div>
        <button
          onClick={toggleDigest}
          disabled={saving}
          aria-label="Toggle daily email digest"
          style={{
            width: 46, height: 26, borderRadius: 999, border: "none", cursor: "pointer",
            background: user?.email_notifications ? navy : "#e2e2df",
            position: "relative", flexShrink: 0, opacity: saving ? 0.6 : 1, padding: 0,
          }}
        >
          <span
            style={{
              position: "absolute", top: 3, left: user?.email_notifications ? 23 : 3,
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s ease",
            }}
          />
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#c4c4b8", margin: "12px 4px 20px" }}>
        Sent to {user?.email}. You can turn this off anytime.
      </p>

      <button
        onClick={handleLogout}
        style={{
          width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${border}`,
          background: "#fff", color: "#dc2626", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}
