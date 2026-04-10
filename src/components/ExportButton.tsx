import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

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

interface ExportButtonProps {
  logs: WorkoutLog[];
}

export function ExportButton({ logs }: ExportButtonProps) {
  const handleExport = () => {
    if (!logs.length) {
      toast.error("No data to export.");
      return;
    }

    const headers = ["Date", "Pushups", "Situps", "Ladder %", "Plank (s)", "Dead Hang (s)", "Squats", "Squat Weight", "Unit"];
    const rows = [...logs]
      .sort((a, b) => a.workout_date.localeCompare(b.workout_date))
      .map((l) => [
        l.workout_date,
        l.pushups,
        l.situps,
        l.ladder_percent,
        l.plank_seconds,
        l.deadhang_seconds,
        l.squat_count,
        l.squat_weight,
        l.squat_unit,
      ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workout-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="active-scale">
      <Download className="h-4 w-4 mr-2" /> Export CSV
    </Button>
  );
}
