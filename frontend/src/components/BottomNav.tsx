import { useLocation, useNavigate } from "react-router-dom";

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
  {
    name: "Profile",
    to: "/settings",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to: string) => location.pathname.startsWith(to);

  const renderTab = (item: Item) => (
    <button
      key={item.name}
      onClick={() => navigate(item.to)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px",
        color: isActive(item.to) ? navy : inactive,
      }}
    >
      <span style={{ display: "flex", stroke: "currentColor" }}>{item.icon}</span>
      <span style={{ fontSize: 10, fontWeight: isActive(item.to) ? 700 : 500 }}>{item.name}</span>
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
      {renderTab(items[0])}
      {renderTab(items[1])}

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

      {renderTab(items[2])}
      {renderTab(items[3])}
    </nav>
  );
}
