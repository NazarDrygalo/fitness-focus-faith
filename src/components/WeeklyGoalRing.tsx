import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { subDays, format, startOfWeek } from "date-fns";

interface WeeklyGoalRingProps {
  logs: { workout_date: string }[];
  /** Workouts per week target. Defaults to 5. */
  target?: number;
}

export function WeeklyGoalRing({ logs, target = 5 }: WeeklyGoalRingProps) {
  const { count, pct, label } = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const startStr = format(weekStart, "yyyy-MM-dd");
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const dates = new Set(
      logs
        .filter((l) => l.workout_date >= startStr && l.workout_date <= todayStr)
        .map((l) => l.workout_date)
    );
    const c = dates.size;
    return {
      count: c,
      pct: Math.min(1, c / target),
      label: c >= target ? "Goal hit · keep stacking" : `${target - c} to hit your weekly goal`,
    };
  }, [logs, target]);

  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - pct);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth={stroke}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="hsl(var(--streak))"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground tabular-nums">
              {count}/{target}
            </span>
            <span className="text-[10px] text-muted-foreground">this week</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4" style={{ color: "hsl(var(--streak))" }} />
            <p className="text-sm font-medium text-foreground">Weekly Goal</p>
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
