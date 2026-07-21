import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          fontSize: "14px",
          borderRadius: "12px",
          padding: "12px 16px",
        },
      }}
    />
  );
}