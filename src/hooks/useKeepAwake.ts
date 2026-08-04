import { useEffect } from "react";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { isNative } from "@/lib/native";

/**
 * Keeps the screen (and therefore the JS timer loop) alive while `active`.
 * Native: uses the OS wake lock. Web: uses the Screen Wake Lock API when available.
 * All timers in the app compute elapsed time from Date.now() deltas, so even if
 * the lock fails the displayed time stays correct once the app resumes.
 */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let sentinel: { release: () => Promise<void> } | null = null;

    const acquire = async () => {
      try {
        if (isNative()) {
          await KeepAwake.keepAwake();
          return;
        }
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
        }).wakeLock;
        if (!wl) return;
        const s = await wl.request("screen");
        if (cancelled) { await s.release().catch(() => {}); return; }
        sentinel = s;
      } catch {
        /* wake lock unavailable — timers still recover via Date.now() */
      }
    };

    acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
      if (isNative()) KeepAwake.allowSleep().catch(() => {});
    };
  }, [active]);
}
