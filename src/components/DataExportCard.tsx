import { useState } from "react";
import JSZip from "jszip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const TABLES = [
  "workout_logs",
  "workout_goals",
  "weight_logs",
  "body_measurements",
  "custom_exercises",
  "custom_exercise_logs",
  "routines",
  "routine_progress",
  "bible_highlights",
  "bible_reflections",
  "reading_plan_progress",
  "progress_photos",
] as const;

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export function DataExportCard() {
  const { user } = useAuth();
  const [includePhotos, setIncludePhotos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const buildBundle = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      const all: Record<string, unknown[]> = {};

      for (const table of TABLES) {
        setStatus(`Exporting ${table.replace(/_/g, " ")}…`);
        const { data, error } = await supabase.from(table as any).select("*");
        if (error) continue;
        const rows = ((data ?? []) as unknown) as Record<string, unknown>[];
        all[table] = rows;
        if (rows.length) zip.file(`csv/${table}.csv`, toCsv(rows));
      }

      zip.file(
        "grind-data.json",
        JSON.stringify({ exported_at: new Date().toISOString(), user_id: user.id, data: all }, null, 2),
      );

      if (includePhotos) {
        const photos = (all["progress_photos"] ?? []) as { storage_path?: string; photo_date?: string }[];
        let i = 0;
        for (const p of photos) {
          if (!p.storage_path) continue;
          i++;
          setStatus(`Downloading photo ${i}/${photos.length}…`);
          const { data: blob } = await supabase.storage.from("progress-photos").download(p.storage_path);
          if (blob) {
            const ext = p.storage_path.split(".").pop() || "jpg";
            zip.file(`photos/${p.photo_date ?? "photo"}-${i}.${ext}`, blob);
          }
        }
      }

      setStatus("Packaging…");
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grind-export-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setStatus("");
      setBusy(false);
    }
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" /> Export your data
        </CardTitle>
        <CardDescription>A single zip with every log as CSV + JSON, and your progress photos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <div className="min-w-0">
            <Label className="text-sm font-medium">Include progress photos</Label>
            <p className="text-xs text-muted-foreground">Larger file, slower download.</p>
          </div>
          <Switch checked={includePhotos} onCheckedChange={setIncludePhotos} disabled={busy} />
        </div>
        <Button onClick={buildBundle} disabled={busy} className="w-full h-12 gap-2 text-base tap">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? status || "Preparing…" : "Download data bundle"}
        </Button>
      </CardContent>
    </Card>
  );
}
