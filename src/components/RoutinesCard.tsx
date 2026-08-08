import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarDays, Plus, Trash2, Check, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RoutineDay = { label: string; rest: boolean; notes: string };

type Routine = {
  id: string;
  name: string;
  description: string | null;
  days: RoutineDay[];
  is_active: boolean;
};

const TEMPLATES: { name: string; description: string; days: RoutineDay[] }[] = [
  {
    name: "Push / Pull / Rest",
    description: "3-day rotation, upper body focus",
    days: [
      { label: "Push", rest: false, notes: "Pushups, dips, plank" },
      { label: "Pull", rest: false, notes: "Pull-up ladder, dead hang" },
      { label: "Rest", rest: true, notes: "Walk + mobility" },
    ],
  },
  {
    name: "5-Day Grind",
    description: "Full week with two rest days",
    days: [
      { label: "Upper", rest: false, notes: "Pushups, pull-ups" },
      { label: "Lower", rest: false, notes: "Squats, lunges" },
      { label: "Rest", rest: true, notes: "Active recovery" },
      { label: "Core", rest: false, notes: "Situps, plank" },
      { label: "Full body", rest: false, notes: "Everything, lighter" },
      { label: "Conditioning", rest: false, notes: "Intervals" },
      { label: "Rest", rest: true, notes: "Stretch + reflect" },
    ],
  },
];

export function RoutinesCard() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completed, setCompleted] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState<RoutineDay[]>([{ label: "Day 1", rest: false, notes: "" }]);

  const today = format(new Date(), "yyyy-MM-dd");

  const load = async () => {
    if (!user) return;
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("routines").select("id, name, description, days, is_active").order("created_at"),
      supabase.from("routine_progress").select("routine_id, day_index").eq("completed_on", today),
    ]);
    setRoutines(((r as unknown as Routine[]) || []).map((x) => ({ ...x, days: (x.days as unknown as RoutineDay[]) || [] })));
    const map: Record<string, number[]> = {};
    (p || []).forEach((row) => {
      map[row.routine_id] = [...(map[row.routine_id] || []), row.day_index];
    });
    setCompleted(map);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id, today]);

  const saveRoutine = async (n: string, d: RoutineDay[], description?: string) => {
    if (!user) return;
    if (!n.trim()) { toast.error("Name your routine."); return; }
    const { error } = await supabase.from("routines").insert({
      user_id: user.id,
      name: n.trim(),
      description: description ?? null,
      days: d as unknown as never,
    });
    if (error) { toast.error("Could not save routine."); return; }
    haptic("success");
    toast.success(`${n.trim()} saved.`);
    setCreating(false);
    setName("");
    setDays([{ label: "Day 1", rest: false, notes: "" }]);
    void load();
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from("routines").delete().eq("id", id);
    if (error) { toast.error("Could not delete."); return; }
    haptic("medium");
    void load();
  };

  const toggleDay = async (routine: Routine, dayIndex: number) => {
    if (!user) return;
    const isDone = (completed[routine.id] || []).includes(dayIndex);
    if (isDone) {
      await supabase.from("routine_progress").delete()
        .eq("routine_id", routine.id).eq("day_index", dayIndex).eq("completed_on", today);
      setCompleted((c) => ({ ...c, [routine.id]: (c[routine.id] || []).filter((i) => i !== dayIndex) }));
      haptic("light");
    } else {
      const { error } = await supabase.from("routine_progress").insert({
        user_id: user.id, routine_id: routine.id, day_index: dayIndex, completed_on: today,
      });
      if (error) { toast.error("Could not update."); return; }
      setCompleted((c) => ({ ...c, [routine.id]: [...(c[routine.id] || []), dayIndex] }));
      haptic("success");
      toast.success(`${routine.days[dayIndex]?.label || "Day"} complete.`);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" strokeWidth={1.75} /> Routines
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground tap" onClick={() => { haptic("light"); setCreating((c) => !c); }}>
          <Plus className={cn("h-4 w-4 mr-1.5 transition-transform", creating && "rotate-45")} strokeWidth={1.75} />
          {creating ? "Cancel" : "New"}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence initial={false}>
          {creating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg bg-secondary/60 p-3 mb-4 space-y-3">
                <div>
                  <Label htmlFor="rt-name" className="text-sm text-muted-foreground">Routine name</Label>
                  <Input id="rt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My split" className="mt-1 h-12 text-base bg-background border-border" />
                </div>
                <div className="space-y-2">
                  {days.map((d, i) => (
                    <div key={i} className="rounded-md bg-background p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={d.label}
                          onChange={(e) => setDays((prev) => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                          placeholder={`Day ${i + 1}`}
                          className="h-11 text-base bg-secondary border-border"
                        />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0 tap" onClick={() => setDays((prev) => prev.filter((_, j) => j !== i))} aria-label="Remove day">
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                      <Input
                        value={d.notes}
                        onChange={(e) => setDays((prev) => prev.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))}
                        placeholder="What's on this day?"
                        className="h-11 text-base bg-secondary border-border"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rest day</span>
                        <Switch checked={d.rest} onCheckedChange={(v) => setDays((prev) => prev.map((x, j) => j === i ? { ...x, rest: v } : x))} />
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" className="w-full h-11 tap" onClick={() => setDays((p) => [...p, { label: `Day ${p.length + 1}`, rest: false, notes: "" }])}>
                    <Plus className="h-4 w-4 mr-1.5" strokeWidth={1.75} /> Add day
                  </Button>
                </div>
                <Button className="w-full h-12 text-base tap" onClick={() => saveRoutine(name, days)}>Save routine</Button>

                <div className="pt-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Or start from a template</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <Button key={t.name} variant="secondary" size="sm" className="h-10 tap" onClick={() => saveRoutine(t.name, t.days, t.description)}>
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-sm text-muted-foreground py-2">Loading…</p>
        ) : routines.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 leading-relaxed">
            Build a multi-day template with rest days built in, then check off each day as you go.
          </p>
        ) : (
          <div className="space-y-4">
            {routines.map((r) => (
              <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground shrink-0 tap" onClick={() => deleteRoutine(r.id)} aria-label={`Delete ${r.name}`}>
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                </div>
                <ul className="space-y-1.5">
                  {r.days.map((d, i) => {
                    const done = (completed[r.id] || []).includes(i);
                    return (
                      <li key={i}>
                        <button
                          onClick={() => toggleDay(r, i)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors tap",
                            done ? "bg-primary/10" : "bg-secondary/60 hover:bg-secondary"
                          )}
                        >
                          <span className={cn(
                            "h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            done ? "bg-primary border-primary" : "border-border"
                          )}>
                            {done && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              {d.label}
                              {d.rest && <Moon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />}
                            </span>
                            {d.notes && <span className="block text-xs text-muted-foreground truncate">{d.notes}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
