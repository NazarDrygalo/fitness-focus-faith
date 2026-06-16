import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { reportError } from "./lib/analytics";
import { initSentry } from "./lib/sentry";

window.addEventListener("error", (e) => {
  reportError(e.error ?? e.message, { source: "window.onerror" });
});
window.addEventListener("unhandledrejection", (e) => {
  reportError(e.reason, { source: "unhandledrejection" });
});

// Fire-and-forget; resolves DSN from the public-config edge function.
initSentry();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
