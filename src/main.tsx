import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { reportError } from "./lib/analytics";

window.addEventListener("error", (e) => {
  reportError(e.error ?? e.message, { source: "window.onerror" });
});
window.addEventListener("unhandledrejection", (e) => {
  reportError(e.reason, { source: "unhandledrejection" });
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
