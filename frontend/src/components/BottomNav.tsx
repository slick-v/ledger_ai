import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/expenses", label: "Expenses", icon: "💸" },
  { to: "/income", label: "Income", icon: "💰" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 text-xs ${
                isActive ? "text-slate-900 font-semibold" : "text-slate-400"
              }`
            }
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}