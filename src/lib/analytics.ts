// Lightweight analytics wrapper. No external deps required.
// Swap window.plausible / window.gtag in later if desired.

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const isProd = import.meta.env.PROD;

export function trackPageView(path: string) {
  if (!isProd) return;
  try {
    window.plausible?.("pageview", { props: { path } });
    window.gtag?.("event", "page_view", { page_path: path });
  } catch {
    /* noop */
  }
}

export function trackEvent(name: string, props?: Props) {
  if (!isProd) {
    // Helpful during development
    console.debug("[analytics]", name, props);
    return;
  }
  try {
    window.plausible?.(name, props ? { props } : undefined);
    window.gtag?.("event", name, props);
  } catch {
    /* noop */
  }
}

export function reportError(error: unknown, context?: Props) {
  try {
    console.error("[error]", error, context);
    // Lazy import to avoid pulling Sentry into the boot critical path.
    import("./sentry").then(({ captureError }) => captureError(error, context));
    trackEvent("client_error", {
      message: error instanceof Error ? error.message : String(error),
      ...context,
    });
  } catch {
    /* noop */
  }
}
