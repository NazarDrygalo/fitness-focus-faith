import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Check, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type Unit = "reps" | "seconds" | "weight";

type CustomExercise = {
  id: string;
  name: string;
  unit: string;
  target: number;
};

const UNIT_LABEL: Record<string, string> = { reps: "reps", seconds: "sec", weight: "lb" };

export function CustomExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [todayValues, setTodayValues] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("reps");
  const [target, setTarget] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  const load = async () => {
    if (!user) return;
    const [{ data: ex }, { data: logs }] = await Promise.all([
      supabase.from("custom_exercises").select("id, name, unit, target").order("created_at"),
      supabase.from("custom_exercise_logs").select("exercise_id, value").eq("log_date", today),
    ]);
    setExercises((ex as CustomExercise[]) || []);
    const map: Record<string, number> = {};
    (logs || []).forEach((l) => { map[l.exercise_id] = Number(l.value); });
    setTodayValues(map);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id, today]);

  const addExercise = async () => {
    if (!name.trim() || !user) { toast.error("Give the exercise a name."); return; }
    const { error } = await supabase.from("custom_exercises").insert({
      user_id: user.id,
      name: name.trim(),
      unit,
      target: parseInt(target) || 0,
    });
    if (error) { toast.error("Could not add exercise."); return; }
    haptic("success");
    toast.success(`${name.trim()} added.`);
    setName(""); setTarget(""); setUnit("reps"); setAdding(false);
    void load();
  };

  const removeExercise = async (id: string, label: string) => {
    const { error } = await supabase.from("custom_exercises").delete().eq("id", id);
    if (error) { toast.error("Could not delete."); return; }
    haptic("medium");
    toast.success(`${label} removed.`);
    void load();
  };

  const logValue = async (ex: CustomExercise) => {
    const raw = drafts[ex.id];
    const value = parseFloat(raw || "");
    if (!value || value <= 0 || !user) { toast.error("Enter a value first."); return; }
    const next = (todayValues[ex.id] || 0) + value;
    const { error } = await supabase
      .from("custom_exercise_logs")
      .upsert({ user_id: user.id, exercise_id: ex.id, log_date: today, value: next }, { onConflict: "exercise_id,log_date" });
    if (error) { toast.error("Could not save."); return; }
    haptic("success");
    setTodayValues((v) => ({ ...v, [ex.id]: next }));
    setDrafts((d) => ({ ...d, [ex.id]: "" }));
    toast.success(`${ex.name}: ${next} ${UNIT_LABEL[ex.unit] || ""} today`);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5" strokeWidth={1.75} /> My Exercises
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground tap"
          onClick={() => { haptic("light"); setAdding((a) => !a); }}
        >
          <Plus className={cn("h-4 w-4 mr-1.5 transition-transform", adding && "rotate-45")} strokeWidth={1.75} />
          {adding ? "Cancel" : "New"}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence initial={false}>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg bg-secondary/60 p-3 mb-4 space-y-3">
                <div>
                  <Label htmlFor="ce-name" className="text-sm text-muted-foreground">Name</Label>
                  <Input id="ce-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Burpees" className="mt-1 h-12 text-base bg-background border-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Measured in</Label>
                    <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                      <SelectTrigger className="mt-1 h-12 text-base bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reps">Reps</SelectItem>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ce-target" className="text-sm text-muted-foreground">Daily target</Label>
                    <Input id="ce-target" type="number" inputMode="numeric" min="0" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" className="mt-1 h-12 text-base bg-background border-border no-spinners" />
                  </div>
                </div>
                <Button onClick={addExercise} className="w-full h-12 text-base tap">Add exercise</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-sm text-muted-foreground py-2">Loading…</p>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 leading-relaxed">
            Build your own movements — name it, pick reps, seconds, or weight, and set a daily target.
          </p>
        ) : (
          <ul className="space-y-2">
            {exercises.map((ex) => {
              const done = todayValues[ex.id] || 0;
              const pct = ex.target > 0 ? Math.min(100, Math.round((done / ex.target) * 100)) : 0;
              const hit = ex.target > 0 && done >= ex.target;
              return (
                <motion.li
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-secondary/60 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate flex items-center gap-1.5">
                        {ex.name}
                        {hit && <Check className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {done} {UNIT_LABEL[ex.unit] || ""}{ex.target > 0 ? ` / ${ex.target}` : ""} today
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground shrink-0 tap" onClick={() => removeExercise(ex.id, ex.name)} aria-label={`Delete ${ex.name}`}>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                  {ex.target > 0 && (
                    <div className="h-1.5 rounded-full bg-background overflow-hidden mb-2">
                      <motion.div className="h-full bg-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="0"
                      value={drafts[ex.id] || ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [ex.id]: e.target.value }))}
                      className="h-11 text-base bg-background border-border no-spinners"
                    />
                    <Button className="h-11 px-4 tap" onClick={() => logValue(ex)}>Log</Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
