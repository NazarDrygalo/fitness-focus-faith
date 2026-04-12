import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WorkoutLog {
  workout_date: string;
  pushups: number;
  situps: number;
  ladder_percent: number;
  plank_seconds: number;
  deadhang_seconds: number;
  squat_count: number;
  squat_weight: number;
  squat_unit: string;
}

interface WeeklyRecapProps {
  logs: WorkoutLog[];
}

function getWeekRange(weeksAgo: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek - weeksAgo * 7);
  startOfThisWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfThisWeek);
  endOfWeek.setDate(startOfThisWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { start: startOfThisWeek, end: endOfWeek };
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function WeeklyRecap({ logs }: WeeklyRecapProps) {
  const recap = useMemo(() => {
    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(1);

    const thisWeekLogs = logs.filter(l => l.workout_date >= formatDate(thisWeek.start) && l.workout_date <= formatDate(thisWeek.end));
    const lastWeekLogs = logs.filter(l => l.workout_date >= formatDate(lastWeek.start) && l.workout_date <= formatDate(lastWeek.end));

    const sum = (arr: WorkoutLog[], key: keyof WorkoutLog) => arr.reduce((s, l) => s + (Number(l[key]) || 0), 0);

    return [
      { label: "Workouts", thisWeek: thisWeekLogs.length, lastWeek: lastWeekLogs.length },
      { label: "Pushups", thisWeek: sum(thisWeekLogs, "pushups"), lastWeek: sum(lastWeekLogs, "pushups") },
      { label: "Situps", thisWeek: sum(thisWeekLogs, "situps"), lastWeek: sum(lastWeekLogs, "situps") },
      { label: "Squats", thisWeek: sum(thisWeekLogs, "squat_count"), lastWeek: sum(lastWeekLogs, "squat_count") },
    ];
  }, [logs]);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground mb-3">This Week vs Last Week</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {recap.map((item) => {
            const diff = item.lastWeek > 0
              ? Math.round(((item.thisWeek - item.lastWeek) / item.lastWeek) * 100)
              : item.thisWeek > 0 ? 100 : 0;
            const isUp = diff > 0;
            const isDown = diff < 0;

            return (
              <div key={item.label} className="p-2 rounded-lg bg-secondary/50 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">{item.label}</p>
                <p className="text-lg font-bold text-foreground">{item.thisWeek}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  {isUp ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : isDown ? (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={`text-[10px] font-medium ${isUp ? "text-success" : isDown ? "text-destructive" : "text-muted-foreground"}`}>
                    {diff > 0 ? "+" : ""}{diff}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
