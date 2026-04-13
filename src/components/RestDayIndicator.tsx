import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Flame } from "lucide-react";

interface RestDayIndicatorProps {
  currentStreak: number;
}

export function RestDayIndicator({ currentStreak }: RestDayIndicatorProps) {
  const suggestion = useMemo(() => {
    if (currentStreak >= 7) return { show: true, message: "You've been grinding for 7+ days straight. Consider a rest day to recover!", urgency: "high" as const };
    if (currentStreak >= 5) return { show: true, message: "5 days in a row — impressive! A rest day soon could boost your next session.", urgency: "medium" as const };
    return { show: false, message: "", urgency: "low" as const };
  }, [currentStreak]);

  if (!suggestion.show) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={`border-border ${suggestion.urgency === "high" ? "bg-[hsl(var(--streak))]/10 border-[hsl(var(--streak))]/30" : "bg-secondary/50"}`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${suggestion.urgency === "high" ? "bg-[hsl(var(--streak))]/20" : "bg-secondary"}`}>
            <Moon className={`h-4 w-4 ${suggestion.urgency === "high" ? "text-[hsl(var(--streak))]" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-foreground">Rest Day Suggestion</p>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Flame className="h-3 w-3" /> {currentStreak} day streak
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{suggestion.message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
