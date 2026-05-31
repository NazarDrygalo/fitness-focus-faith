import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  show: boolean;
  children: ReactNode;
}

/**
 * Fixed bottom action bar that sits ABOVE the MobileNav (which is z-50, ~68px tall).
 * Mobile only. Slides up with a spring when `show` flips true.
 */
export function StickyActionBar({ show, children }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed left-0 right-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl sm:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
        >
          <div className="px-3 py-2.5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
