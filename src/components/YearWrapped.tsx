import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface Log {
  workout_date: string;
  pushups: number;
  situps: number;
  squat_count: number;
  plank_seconds: number;
  deadhang_seconds: number;
}

interface Props {
  logs: Log[];
  year?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Year-in-review "wrapped" summary with a shareable card. */
export function YearWrapped({ logs, year = new Date().getFullYear() }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const yearLogs = logs.filter((l) => l.workout_date.startsWith(`${year}-`));
    const pushups = yearLogs.reduce((s, l) => s + (l.pushups || 0), 0);
    const situps = yearLogs.reduce((s, l) => s + (l.situps || 0), 0);
    const squats = yearLogs.reduce((s, l) => s + (l.squat_count || 0), 0);
    const holdMinutes = Math.round(
      yearLogs.reduce((s, l) => s + (l.plank_seconds || 0) + (l.deadhang_seconds || 0), 0) / 60
    );
    const perMonth = Array.from({ length: 12 }, (_, i) =>
      yearLogs.filter((l) => Number(l.workout_date.slice(5, 7)) === i + 1).length
    );
    const bestMonthIdx = perMonth.indexOf(Math.max(...perMonth));
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    yearLogs.forEach((l) => {
      dayCounts[new Date(l.workout_date + "T00:00:00").getDay()]++;
    });
    const bestDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
      dayCounts.indexOf(Math.max(...dayCounts))
    ];
    // Longest streak within the year
    const sorted = [...yearLogs].sort((a, b) => a.workout_date.localeCompare(b.workout_date));
    let longest = sorted.length ? 1 : 0;
    let run = sorted.length ? 1 : 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].workout_date + "T00:00:00").getTime();
      const cur = new Date(sorted[i].workout_date + "T00:00:00").getTime();
      if (Math.round((cur - prev) / 86400000) === 1) {
        run++;
        longest = Math.max(longest, run);
      } else run = 1;
    }
    return {
      count: yearLogs.length,
      pushups,
      situps,
      squats,
      holdMinutes,
      perMonth,
      bestMonth: MONTHS[bestMonthIdx],
      bestDay,
      longest,
      totalReps: pushups + situps + squats,
    };
  }, [logs, year]);

  const maxMonth = Math.max(1, ...stats.perMonth);

  const buildBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 1080, 1080);
    g.addColorStop(0, "#0a0a0a");
    g.addColorStop(1, "#101a12");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.fillStyle = "#f97316";
    ctx.font = "600 36px ui-sans-serif, system-ui, -apple-system";
    ctx.textAlign = "left";
    ctx.fillText("GRINDFAITH", 80, 130);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 120px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(`${year}`, 80, 270);
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "500 44px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText("Year in review", 80, 335);

    const rows: [string, string][] = [
      ["Workouts logged", `${stats.count}`],
      ["Total reps", stats.totalReps.toLocaleString()],
      ["Longest streak", `${stats.longest} days`],
      ["Time under tension", `${stats.holdMinutes} min`],
      ["Biggest month", stats.bestMonth],
      ["Favorite day", stats.bestDay],
    ];
    let y = 470;
    rows.forEach(([label, value]) => {
      ctx.fillStyle = "#737373";
      ctx.font = "400 34px ui-sans-serif, system-ui, -apple-system";
      ctx.fillText(label, 80, y);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.font = "600 40px ui-sans-serif, system-ui, -apple-system";
      ctx.fillText(value, 1000, y);
      ctx.textAlign = "left";
      y += 92;
    });

    ctx.fillStyle = "#525252";
    ctx.font = "400 30px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText("Daily strength & scripture", 80, 1010);

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  };

  const share = async () => {
    setBusy(true);
    haptic("light");
    try {
      const blob = await buildBlob();
      if (!blob) {
        toast.error("Couldn't generate card.");
        return;
      }
      const file = new File([blob], `grindfaith-${year}-wrapped.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${year} in review` });
        haptic("success");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grindfaith-${year}-wrapped.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Year in review saved!");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Sharing failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!stats.count) return null;

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} /> {year} in review
        </CardTitle>
        <CardDescription>Your year of showing up, wrapped.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="workouts" value={stats.count.toLocaleString()} />
          <Stat label="total reps" value={stats.totalReps.toLocaleString()} />
          <Stat label="longest streak" value={`${stats.longest}d`} />
          <Stat label="time under tension" value={`${stats.holdMinutes}m`} />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Workouts by month</p>
          <div className="flex items-end gap-1.5 h-20">
            {stats.perMonth.map((n, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (n / maxMonth) * 100)}%` }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 180, damping: 20 }}
                className="flex-1 rounded-sm bg-success/60"
                title={`${MONTHS[i]}: ${n}`}
              />
            ))}
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {MONTHS.map((m) => (
              <span key={m} className="flex-1 text-center text-[9px] text-muted-foreground">
                {m[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm rounded-lg bg-secondary/50 px-3 py-2.5">
          <span className="text-muted-foreground">Strongest month</span>
          <span className="font-medium">{stats.bestMonth}</span>
        </div>
        <div className="flex items-center justify-between text-sm rounded-lg bg-secondary/50 px-3 py-2.5">
          <span className="text-muted-foreground">Favorite training day</span>
          <span className="font-medium">{stats.bestDay}</span>
        </div>

        <Button onClick={share} disabled={busy} variant="outline" className="w-full h-12 gap-2 tap">
          {canNativeShare ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {busy ? "Preparing..." : canNativeShare ? "Share my year" : "Save my year"}
        </Button>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3 text-center">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
