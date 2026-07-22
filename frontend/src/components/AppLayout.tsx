import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Toast from "./Toast";

export default function AppLayout() {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f7f7f5",
        paddingBottom: 96,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Outlet />
      <BottomNav />
      <Toast />
    </div>
  );
}
