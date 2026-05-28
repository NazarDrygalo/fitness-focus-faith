import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface Props {
  streak: number;
  /** Pixel scroll-Y after which the compact header should appear. */
  showAfter?: number;
}

export function StickyHeader({ streak, showAfter = 180 }: Props) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/85 backdrop-blur-xl sm:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="h-14 flex items-center justify-between px-4">
            <span className="text-sm font-semibold tracking-tight text-foreground">GRIND</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Flame className="h-4 w-4" style={{ color: "hsl(var(--streak))" }} strokeWidth={2} />
              <span className="text-foreground font-medium">{streak}</span>
              <span className="text-xs">day{streak === 1 ? "" : "s"}</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
