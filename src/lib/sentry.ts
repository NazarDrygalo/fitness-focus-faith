import * as Sentry from "@sentry/react";
import { supabase } from "@/integrations/supabase/client";

let initialized = false;

export async function initSentry() {
  if (initialized || !import.meta.env.PROD) return;
  initialized = true;
  try {
    const { data } = await supabase.functions.invoke("public-config");
    const dsn = (data as { sentryDsn?: string } | null)?.sentryDsn;
    // A valid DSN looks like https://<key>@<org>.ingest.sentry.io/<project>.
    // Anything else (e.g. a bare public key) would make Sentry.init throw.
    if (!dsn || !/^https?:\/\/.+@.+\/\d+$/.test(dsn)) {
      if (!dsn) return;
      console.warn("[sentry] SENTRY_DSN is not a full DSN URL — error reporting disabled.");
      return;
    }

    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      environment: window.location.hostname,
    });
  } catch {
    /* silent */
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    /* noop */
  }
}
