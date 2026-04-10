import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Zap, Target, Timer, Hand, Dumbbell } from "lucide-react";

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

interface PersonalRecordsProps {
  logs: WorkoutLog[];
}

const formatSecs = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export function PersonalRecords({ logs }: PersonalRecordsProps) {
  const records = useMemo(() => {
    if (!logs.length) return null;

    const maxPushups = Math.max(...logs.map((l) => l.pushups));
    const maxSitups = Math.max(...logs.map((l) => l.situps));
    const maxLadder = Math.max(...logs.map((l) => l.ladder_percent));
    const maxPlank = Math.max(...logs.map((l) => l.plank_seconds));
    const maxDeadhang = Math.max(...logs.map((l) => l.deadhang_seconds));
    const maxSquats = Math.max(...logs.map((l) => l.squat_count));
    const maxSquatWeight = Math.max(...logs.map((l) => l.squat_weight));
    const squatWeightLog = logs.find((l) => l.squat_weight === maxSquatWeight);

    return [
      { icon: TrendingUp, label: "Best Pushups", value: maxPushups, color: "hsl(220, 70%, 55%)", show: maxPushups > 0 },
      { icon: Zap, label: "Best Situps", value: maxSitups, color: "hsl(280, 60%, 55%)", show: maxSitups > 0 },
      { icon: Target, label: "Best Ladder", value: `${maxLadder}%`, color: "hsl(142, 50%, 45%)", show: maxLadder > 0 },
      { icon: Timer, label: "Longest Plank", value: formatSecs(maxPlank), color: "hsl(40, 70%, 50%)", show: maxPlank > 0 },
      { icon: Hand, label: "Longest Hang", value: formatSecs(maxDeadhang), color: "hsl(190, 60%, 50%)", show: maxDeadhang > 0 },
      { icon: Dumbbell, label: "Most Squats", value: maxSquats, color: "hsl(350, 60%, 55%)", show: maxSquats > 0 },
      {
        icon: Dumbbell,
        label: "Heaviest Squat",
        value: maxSquatWeight > 0 ? `${maxSquatWeight} ${squatWeightLog?.squat_unit || "lb"}` : 0,
        color: "hsl(20, 70%, 50%)",
        show: maxSquatWeight > 0,
      },
    ].filter((r) => r.show);
  }, [logs]);

  if (!records || records.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">Personal Records</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {records.map((record, i) => (
          <motion.div
            key={record.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card border-border hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <record.icon className="h-4 w-4" style={{ color: record.color }} />
                  <span className="text-xs text-muted-foreground">{record.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{record.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
