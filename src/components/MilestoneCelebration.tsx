import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { bigCelebrate } from "@/lib/celebrate";
import { haptic } from "@/lib/haptics";
import { computeBadges, getSeenBadges, markBadgesSeen, type BadgeStats, type ComputedBadge } from "@/lib/badges";

interface Props extends BadgeStats {
  userId: string | undefined;
  ready: boolean;
}

/**
 * Watches badge progress and shows a full-screen celebration the first time
 * each milestone is earned. Existing milestones are silently marked as seen
 * on the very first run so returning users aren't spammed.
 */
export function MilestoneCelebration({ userId, ready, streak, totalPushups, totalSitups, totalWorkouts }: Props) {
  const [queue, setQueue] = useState<ComputedBadge[]>([]);

  useEffect(() => {
    if (!userId || !ready) return;
    const earned = computeBadges({ streak, totalPushups, totalSitups, totalWorkouts }).filter((b) => b.earned);
    const firstRun = localStorage.getItem(`grindfaith.badges.${userId}`) === null;
    if (firstRun) {
      markBadgesSeen(userId, earned.map((b) => b.id));
      return;
    }
    const seen = getSeenBadges(userId);
    const fresh = earned.filter((b) => !seen.includes(b.id));
    if (fresh.length) {
      markBadgesSeen(userId, fresh.map((b) => b.id));
      setQueue((q) => [...q, ...fresh]);
    }
  }, [userId, ready, streak, totalPushups, totalSitups, totalWorkouts]);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    bigCelebrate();
    haptic("success");
  }, [current]);

  const dismiss = () => {
    haptic("light");
    setQueue((q) => q.slice(1));
  };

  const Icon = current?.icon;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl px-6 text-center"
          role="dialog"
          aria-label={`${current.label} unlocked`}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative mb-8"
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-success/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <div className="relative h-28 w-28 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
              {Icon && <Icon className="h-12 w-12 text-success" strokeWidth={1.5} />}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3"
          >
            Milestone unlocked
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            {current.label}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground max-w-xs mb-10"
          >
            {current.blurb}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Button onClick={dismiss} className="h-12 px-10 tap">
              {queue.length > 1 ? "Next" : "Keep going"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
