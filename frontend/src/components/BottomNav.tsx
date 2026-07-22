import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navy = "#0f1b2d";
const navyLight = "#1a2942";
const inactive = "#b2bec3";

type Item = { name: string; to: string; icon: React.ReactNode };

const items: Item[] = [
  {
    name: "Home",
    to: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Expenses",
    to: "/expenses",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    name: "Income",
    to: "/income",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

const logoutIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (to: string) => location.pathname.startsWith(to);

  const renderTab = (name: string, active: boolean, icon: React.ReactNode, onClick: () => void) => (
    <button
      key={name}
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px",
        color: active ? navy : inactive,
      }}
    >
      <span style={{ display: "flex", stroke: "currentColor" }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{name}</span>
    </button>
  );

  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #f0efe9",
        display: "flex", justifyContent: "space-around", alignItems: "center", padding: "6px 0 14px",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.03)", zIndex: 50,
      }}
    >
      {renderTab(items[0].name, isActive(items[0].to), items[0].icon, () => navigate(items[0].to))}
      {renderTab(items[1].name, isActive(items[1].to), items[1].icon, () => navigate(items[1].to))}

      {/* Center FAB — add expense */}
      <button
        onClick={() => navigate("/expenses/new")}
        aria-label="Add expense"
        style={{
          width: 48, height: 48, borderRadius: 16,
          background: `linear-gradient(135deg, ${navy}, ${navyLight})`,
          border: "none", color: "#fff", fontSize: 24, cursor: "pointer", marginTop: -20,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(15,27,45,0.3)",
        }}
      >
        +
      </button>

      {renderTab(items[2].name, isActive(items[2].to), items[2].icon, () => navigate(items[2].to))}
      {renderTab("Logout", false, logoutIcon, () => {
        if (confirm("Log out?")) logout();
      })}
    </nav>
  );
}
