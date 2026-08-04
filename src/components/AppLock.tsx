import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { App as CapApp } from "@capacitor/app";
import { Button } from "@/components/ui/button";
import { Lock, Fingerprint } from "lucide-react";
import { isNative } from "@/lib/native";
import { appLockEnabled, authenticate, biometricsAvailable } from "@/lib/appLock";

const GRACE_MS = 60_000;

export function AppLock() {
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    let backgroundedAt = 0;

    const tryUnlock = async () => {
      setChecking(true);
      const ok = await authenticate();
      setChecking(false);
      if (ok) setLocked(false);
    };

    const lockIfEnabled = async () => {
      if (!appLockEnabled()) return;
      if (!(await biometricsAvailable())) return;
      setLocked(true);
      tryUnlock();
    };

    lockIfEnabled();

    const handle = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        backgroundedAt = Date.now();
        return;
      }
      if (backgroundedAt && Date.now() - backgroundedAt > GRACE_MS) lockIfEnabled();
    });

    return () => { handle.then((h) => h.remove()); };
  }, []);

  const retry = async () => {
    setChecking(true);
    const ok = await authenticate();
    setChecking(false);
    if (ok) setLocked(false);
  };

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-6 px-8"
        >
          <div className="rounded-2xl bg-secondary p-5">
            <Lock className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold tracking-tight">GRIND is locked</p>
            <p className="text-sm text-muted-foreground mt-1">Confirm it's you to continue.</p>
          </div>
          <Button onClick={retry} disabled={checking} className="h-12 w-full max-w-xs gap-2">
            <Fingerprint className="h-4 w-4" />
            {checking ? "Waiting…" : "Unlock"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
