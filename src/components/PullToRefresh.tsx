import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  disabled?: boolean;
}

/**
 * Mobile-only pull-to-refresh wrapper. Renders an animated spinner
 * at the top and translates its children while pulling.
 */
export function PullToRefresh({ onRefresh, children, disabled }: PullToRefreshProps) {
  const { pull, refreshing } = usePullToRefresh({ onRefresh, disabled });

  return (
    <>
      <motion.div
        aria-hidden
        className="sm:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ height: pull }}
        animate={{ opacity: pull > 16 || refreshing ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <Loader2
          className="h-5 w-5 text-muted-foreground"
          style={{
            animation: refreshing ? "spin 1s linear infinite" : undefined,
            transform: refreshing ? undefined : `rotate(${Math.min(360, pull * 4)}deg)`,
          }}
        />
      </motion.div>
      <div
        style={{
          transform: pull ? `translateY(${pull * 0.5}px)` : undefined,
          transition: refreshing ? "transform 0.2s" : undefined,
        }}
      >
        {children}
      </div>
    </>
  );
}
