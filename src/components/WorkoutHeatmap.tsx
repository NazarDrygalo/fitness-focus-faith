import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, startOfWeek, subDays, addDays } from "date-fns";

interface WorkoutLog {
  workout_date: string;
  pushups: number;
  situps: number;
  squat_count: number;
  plank_seconds: number;
  deadhang_seconds: number;
  ladder_percent: number;
}

interface Props {
  logs: WorkoutLog[];
  weeks?: number;
}

/** GitHub-style intensity heatmap of workout volume. */
export function WorkoutHeatmap({ logs, weeks = 18 }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const { columns, max } = useMemo(() => {
    const score = new Map<string, number>();
    logs.forEach((l) => {
      const s =
        (l.pushups || 0) +
        (l.situps || 0) +
        (l.squat_count || 0) +
        Math.round((l.plank_seconds || 0) / 3) +
        Math.round((l.deadhang_seconds || 0) / 3) +
        Math.round((l.ladder_percent || 0) / 2);
      score.set(l.workout_date, (score.get(l.workout_date) || 0) + s);
    });

    const today = new Date();
    const start = startOfWeek(subDays(today, (weeks - 1) * 7), { weekStartsOn: 0 });
    const cols: { date: Date; key: string; value: number; future: boolean }[][] = [];
    let m = 0;
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, w * 7 + d);
        const key = format(date, "yyyy-MM-dd");
        const value = score.get(key) || 0;
        if (value > m) m = value;
        col.push({ date, key, value, future: date > today });
      }
      cols.push(col);
    }
    return { columns: cols, max: m };
  }, [logs, weeks]);

  const level = (v: number) => {
    if (!v) return 0;
    if (!max) return 1;
    const r = v / max;
    if (r > 0.66) return 4;
    if (r > 0.4) return 3;
    if (r > 0.15) return 2;
    return 1;
  };

  const shades = [
    "bg-secondary/60",
    "bg-primary/25",
    "bg-primary/45",
    "bg-primary/70",
    "bg-primary",
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} /> Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex gap-[3px] min-w-max">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell, ri) => (
                  <Tooltip key={cell.key}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-3 w-3 rounded-[3px] transition-all duration-300 ${
                          cell.future ? "bg-transparent" : shades[level(cell.value)]
                        }`}
                        style={{
                          opacity: ready ? 1 : 0,
                          transitionDelay: `${(ci * 7 + ri) * 2}ms`,
                        }}
                      />
                    </TooltipTrigger>
                    {!cell.future && (
                      <TooltipContent side="top">
                        <p className="text-xs">
                          {format(cell.date, "MMM d")} ·{" "}
                          {cell.value ? `${cell.value} intensity` : "rest"}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {shades.map((s) => (
            <span key={s} className={`h-2.5 w-2.5 rounded-[3px] ${s}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
