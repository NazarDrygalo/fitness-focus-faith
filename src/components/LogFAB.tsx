import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { haptic } from "@/lib/haptics";

const HIDDEN_ROUTES = ["/workout", "/auth", "/reset-password"];

/**
 * Persistent bottom-right Log Workout button. Hidden on the workout
 * tracker itself, auth screens, and public legal pages. Positioned
 * above the mobile bottom nav.
 */
export function LogFAB() {
  const navigate = useNavigate();
  const location = useLocation();

  const hidden =
    HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r)) ||
    location.pathname === "/terms" ||
    location.pathname === "/privacy";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          key="log-fab"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            haptic("light");
            navigate("/workout");
          }}
          aria-label="Log workout"
          className="fixed right-4 z-40 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center gap-2 pl-4 pr-5 font-medium active:shadow-md tap"
          style={{
            // Sits above the mobile bottom nav (≈64px) on phones,
            // and above the safe-area inset on iOS.
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          }}
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-sm">Log</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
