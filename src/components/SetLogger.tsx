import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ListOrdered, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type ExerciseKey = "pushups" | "situps" | "squats";
const EXERCISES: { key: ExerciseKey; label: string }[] = [
  { key: "pushups", label: "Pushups" },
  { key: "situps", label: "Situps" },
  { key: "squats", label: "Squats" },
];

interface SetRow {
  id?: string;
  set_index: number;
  reps: number;
  weight: number | null;
}

export function SetLogger() {
  const { user } = useAuth();
  const [exercise, setExercise] = useState<ExerciseKey>("pushups");
  const [sets, setSets] = useState<SetRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const weighted = exercise === "squats";

  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    setLoaded(false);
    supabase
      .from("workout_sets")
      .select("id, set_index, reps, weight")
      .eq("workout_date", today)
      .eq("exercise", exercise)
      .order("set_index")
      .then(({ data, error }) => {
        if (!error && data) setSets(data as SetRow[]);
        setLoaded(true);
      });
  }, [user, exercise, today]);

  const addSet = () => {
    haptic("light");
    const last = sets[sets.length - 1];
    setSets((s) => [...s, { set_index: s.length + 1, reps: last?.reps ?? 10, weight: weighted ? last?.weight ?? 0 : null }]);
  };

  const updateSet = (i: number, patch: Partial<SetRow>) =>
    setSets((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const removeSet = (i: number) => {
    haptic("light");
    setSets((s) => s.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, set_index: idx + 1 })));
  };

  const total = sets.reduce((a, s) => a + (s.reps || 0), 0);

  const save = async () => {
    if (!user) { toast.error("Please sign in first."); return; }
    if (sets.length === 0) { toast.error("Add at least one set."); return; }
    setSaving(true);
    haptic("medium");

    // Replace today's sets for this exercise
    await supabase.from("workout_sets").delete().eq("workout_date", today).eq("exercise", exercise);
    const rows = sets.map((s, i) => ({
      user_id: user.id,
      workout_date: today,
      exercise,
      set_index: i + 1,
      reps: s.reps || 0,
      weight: weighted ? s.weight : null,
      unit: weighted ? "lb" : null,
    }));
    const { error } = await supabase.from("workout_sets").insert(rows);

    if (error) {
      setSaving(false);
      toast.error("Failed to save sets.");
      return;
    }

    // Roll the total into the main workout log so dashboard/progress stay in sync
    const field = exercise === "squats" ? "squat_count" : exercise;
    const { data: existing } = await supabase
      .from("workout_logs")
      .select("pushups, situps, squat_count")
      .eq("workout_date", today)
      .maybeSingle();
    const current = (existing as any)?.[field] || 0;
    const { error: logError } = await supabase.from("workout_logs").upsert(
      { workout_date: today, user_id: user.id, [field]: current + total },
      { onConflict: "workout_date,user_id" }
    );
    setSaving(false);
    if (logError) {
      toast.error("Sets saved, but daily total failed to update.");
      return;
    }
    haptic("success");
    toast.success(`${sets.length} sets saved — ${total} ${EXERCISES.find((e) => e.key === exercise)?.label.toLowerCase()} total`);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><ListOrdered className="h-5 w-5" /> Per-Set Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          {EXERCISES.map((e) => (
            <button key={e.key} onClick={() => { haptic("light"); setExercise(e.key); }}
              className={cn("flex-1 h-10 rounded-full text-sm font-medium tap",
                exercise === e.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              {e.label}
            </button>
          ))}
        </div>

        {!loaded ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading sets…</p>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {sets.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground w-8 tabular-nums">#{i + 1}</span>
                    <Input
                      type="number" inputMode="numeric" min={0} value={s.reps || ""}
                      placeholder="reps"
                      onChange={(e) => updateSet(i, { reps: parseInt(e.target.value) || 0 })}
                      className="flex-1 h-11 text-center bg-secondary border-border no-spinners"
                    />
                    {weighted && (
                      <Input
                        type="number" inputMode="decimal" min={0} value={s.weight ?? ""}
                        placeholder="lb"
                        onChange={(e) => updateSet(i, { weight: parseFloat(e.target.value) || 0 })}
                        className="flex-1 h-11 text-center bg-secondary border-border no-spinners"
                      />
                    )}
                    <button onClick={() => removeSet(i)} className="p-2 text-muted-foreground hover:text-destructive tap" aria-label="Remove set">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button variant="outline" size="sm" onClick={addSet} className="w-full h-11 tap gap-2 mb-3">
              <Plus className="h-4 w-4" /> Add set
            </Button>

            {sets.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground text-center mb-3">
                  {sets.length} set{sets.length !== 1 ? "s" : ""} · {total} total reps
                </p>
                <Button onClick={save} disabled={saving} className="w-full h-12 text-base tap">
                  {saving ? "Saving..." : "Save sets"}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
