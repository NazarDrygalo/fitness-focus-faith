import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Percent, Calendar } from "lucide-react";
import { subDays, format } from "date-fns";

interface WorkoutLog {
  workout_date: string;
}

interface ConsistencyStatsProps {
  logs: WorkoutLog[];
}

export function ConsistencyStats({ logs }: ConsistencyStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const last30Start = format(subDays(today, 29), "yyyy-MM-dd");
    const last7Start = format(subDays(today, 6), "yyyy-MM-dd");
    const todayStr = format(today, "yyyy-MM-dd");

    const last30 = logs.filter(l => l.workout_date >= last30Start && l.workout_date <= todayStr).length;
    const last7 = logs.filter(l => l.workout_date >= last7Start && l.workout_date <= todayStr).length;
    const pct30 = Math.round((last30 / 30) * 100);
    const pct7 = Math.round((last7 / 7) * 100);

    // Average workouts per week (all time)
    if (!logs.length) return { last7, last30, pct7, pct30, avgPerWeek: 0 };
    const sorted = [...logs].sort((a, b) => a.workout_date.localeCompare(b.workout_date));
    const firstDate = new Date(sorted[0].workout_date + "T00:00:00");
    const weeks = Math.max(1, Math.ceil((today.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const avgPerWeek = Math.round((logs.length / weeks) * 10) / 10;

    return { last7, last30, pct7, pct30, avgPerWeek };
  }, [logs]);

  const items = [
    { icon: Calendar, label: "This Week", value: `${stats.last7}/7`, sub: `${stats.pct7}%`, color: stats.pct7 >= 70 ? "text-success" : stats.pct7 >= 40 ? "text-foreground" : "text-destructive" },
    { icon: Percent, label: "30-Day Rate", value: `${stats.pct30}%`, sub: `${stats.last30} days`, color: stats.pct30 >= 70 ? "text-success" : stats.pct30 >= 40 ? "text-foreground" : "text-destructive" },
    { icon: BarChart3, label: "Avg/Week", value: `${stats.avgPerWeek}`, sub: "all time", color: "text-foreground" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground mb-3">Consistency</p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-secondary/50">
              <item.icon className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
