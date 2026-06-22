import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { differenceInDays } from "date-fns";

interface ComebackBannerProps {
  /** Last logged workout date (yyyy-MM-dd) or null. */
  lastWorkoutDate: string | null;
  onStart?: () => void;
}

export function ComebackBanner({ lastWorkoutDate, onStart }: ComebackBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const gap = useMemo(() => {
    if (!lastWorkoutDate) return 0;
    const last = new Date(lastWorkoutDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(today, last);
  }, [lastWorkoutDate]);

  // Show only after 2+ rest days, and only if user has a history.
  if (dismissed || !lastWorkoutDate || gap < 2 || gap > 30) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        <Card className="bg-streak/10 border-streak/30 relative overflow-hidden">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-streak/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--streak))" }} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-semibold text-foreground">
                Welcome back — {gap} days off.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start small today. A 5-minute set rebuilds momentum faster than perfect plans.
              </p>
              {onStart && (
                <Button size="sm" variant="outline" className="mt-3 h-9 tap" onClick={onStart}>
                  Start a quick set
                </Button>
              )}
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary tap"
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
