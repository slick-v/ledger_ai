import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

function ErrorFallback() {
  return (
    <div style={{ padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
      <p style={{ fontSize: 32, margin: "0 0 8px" }}>⚠️</p>
      <p style={{ color: "#0f1b2d", fontWeight: 600, margin: 0 }}>Something went wrong.</p>
      <p style={{ color: "#94a3b8", fontSize: 13, margin: "8px 0 0" }}>
        Please refresh the page.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
