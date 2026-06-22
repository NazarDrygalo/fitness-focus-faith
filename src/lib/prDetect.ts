// Detect personal records on a newly-saved workout.
export interface PRLog {
  workout_date: string;
  pushups: number;
  situps: number;
  squat_count: number;
  plank_seconds?: number;
  deadhang_seconds?: number;
  ladder_percent?: number;
}

export interface PRHit {
  label: string;
  value: string;
}

export function detectPRs(priorLogs: PRLog[], today: PRLog): PRHit[] {
  const hits: PRHit[] = [];
  const max = (key: keyof PRLog) =>
    priorLogs.reduce((m, l) => Math.max(m, (l[key] as number) || 0), 0);

  const checks: { key: keyof PRLog; label: string; unit?: string }[] = [
    { key: "pushups", label: "Pushups" },
    { key: "situps", label: "Situps" },
    { key: "squat_count", label: "Squats" },
    { key: "plank_seconds", label: "Plank", unit: "s" },
    { key: "deadhang_seconds", label: "Dead Hang", unit: "s" },
    { key: "ladder_percent", label: "Ladder", unit: "%" },
  ];

  for (const c of checks) {
    const cur = (today[c.key] as number) || 0;
    const prev = max(c.key);
    if (cur > 0 && cur > prev && prev > 0) {
      hits.push({ label: c.label, value: `${cur}${c.unit || ""}` });
    }
  }
  return hits;
}
