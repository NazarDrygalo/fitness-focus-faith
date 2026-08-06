import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Printer } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

interface WorkoutLog {
  workout_date: string;
  pushups: number;
  situps: number;
  ladder_percent: number;
  plank_seconds: number;
  deadhang_seconds: number;
  squat_count: number;
}

export function MonthlyReport({ logs }: { logs: WorkoutLog[] }) {
  const [busy, setBusy] = useState(false);
  const now = new Date();
  const start = format(startOfMonth(now), "yyyy-MM-dd");
  const end = format(endOfMonth(now), "yyyy-MM-dd");
  const month = logs.filter((l) => l.workout_date >= start && l.workout_date <= end);

  const totals = month.reduce(
    (a, l) => ({
      pushups: a.pushups + (l.pushups || 0),
      situps: a.situps + (l.situps || 0),
      squats: a.squats + (l.squat_count || 0),
      plank: a.plank + (l.plank_seconds || 0),
      deadhang: a.deadhang + (l.deadhang_seconds || 0),
      ladder: a.ladder + (l.ladder_percent || 0),
    }),
    { pushups: 0, situps: 0, squats: 0, plank: 0, deadhang: 0, ladder: 0 },
  );
  const avgLadder = month.length ? Math.round(totals.ladder / month.length) : 0;
  const daysInMonth = endOfMonth(now).getDate();

  const rows = [
    ["Active days", `${month.length} / ${daysInMonth}`],
    ["Pushups", `${totals.pushups}`],
    ["Situps", `${totals.situps}`],
    ["Squats", `${totals.squats}`],
    ["Plank", `${Math.floor(totals.plank / 60)}m ${totals.plank % 60}s`],
    ["Dead hang", `${Math.floor(totals.deadhang / 60)}m ${totals.deadhang % 60}s`],
    ["Avg ladder", `${avgLadder}%`],
  ];

  const title = `GRIND — ${format(now, "MMMM yyyy")} Report`;

  const buildHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;margin:48px;color:#161a22}
h1{font-size:24px;margin:0 0 4px}p.sub{color:#6b7280;margin:0 0 28px;font-size:13px}
table{width:100%;border-collapse:collapse}td{padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px}
td:last-child{text-align:right;font-weight:600}
footer{margin-top:32px;font-size:11px;color:#9ca3af}
</style></head><body>
<h1>${title}</h1><p class="sub">Consistency, volume, and endurance summary</p>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>
<footer>Generated ${format(now, "MMM d, yyyy")} · grindfaith.lovable.app</footer>
</body></html>`;

  const handlePrint = () => {
    if (!month.length) {
      toast.error("No workouts logged this month yet.");
      return;
    }
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Allow pop-ups to save the PDF.");
      return;
    }
    w.document.write(buildHtml());
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleShare = async () => {
    if (!month.length) {
      toast.error("No workouts logged this month yet.");
      return;
    }
    setBusy(true);
    const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Report copied to clipboard!");
      }
    } catch {
      /* user cancelled */
    }
    setBusy(false);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} /> Monthly Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {format(now, "MMMM yyyy")} · {month.length} active {month.length === 1 ? "day" : "days"}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {rows.slice(0, 4).map(([k, v]) => (
            <div key={k} className="p-2 rounded-lg bg-secondary/50 text-center">
              <p className="text-[10px] text-muted-foreground">{k}</p>
              <p className="text-lg font-bold text-foreground">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-12 active-scale" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Save PDF
          </Button>
          <Button className="flex-1 h-12 active-scale" onClick={handleShare} disabled={busy}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
