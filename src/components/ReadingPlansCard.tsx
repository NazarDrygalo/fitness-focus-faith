import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Check, Circle } from "lucide-react";
import { readingPlans } from "@/data/readingPlans";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

export function ReadingPlansCard() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string>(readingPlans[0].id);
  const [completedDays, setCompletedDays] = useState<Record<string, Set<number>>>({});
  const active = useMemo(() => readingPlans.find((p) => p.id === activeId)!, [activeId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("reading_plan_progress")
        .select("plan_id, day_index")
        .eq("user_id", user.id);
      const grouped: Record<string, Set<number>> = {};
      (data ?? []).forEach((r) => {
        grouped[r.plan_id] = grouped[r.plan_id] ?? new Set();
        grouped[r.plan_id].add(r.day_index);
      });
      setCompletedDays(grouped);
    })();
  }, [user]);

  const toggleDay = async (dayIndex: number) => {
    if (!user) {
      toast({ title: "Sign in to track plans" });
      return;
    }
    haptic("light");
    const set = new Set(completedDays[active.id] ?? []);
    const wasDone = set.has(dayIndex);
    if (wasDone) {
      set.delete(dayIndex);
      await supabase
        .from("reading_plan_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("plan_id", active.id)
        .eq("day_index", dayIndex);
    } else {
      set.add(dayIndex);
      await supabase.from("reading_plan_progress").upsert({
        user_id: user.id,
        plan_id: active.id,
        day_index: dayIndex,
      }, { onConflict: "user_id,plan_id,day_index" });
    }
    setCompletedDays({ ...completedDays, [active.id]: set });
  };

  const done = completedDays[active.id]?.size ?? 0;
  const pct = Math.round((done / active.days.length) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" /> Reading Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {readingPlans.map((p) => (
              <Button
                key={p.id}
                variant={p.id === activeId ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveId(p.id)}
              >
                {p.title}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{active.description}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{done} / {active.days.length} days</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <ul className="divide-y divide-border max-h-72 overflow-y-auto -mx-1">
            {active.days.map((d, i) => {
              const checked = completedDays[active.id]?.has(i) ?? false;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleDay(i)}
                    className="w-full flex items-center gap-3 px-1 py-2.5 text-left hover:bg-muted/50 transition rounded"
                  >
                    {checked
                      ? <Check className="h-4 w-4 text-primary shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        Day {i + 1} · {d.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.reference}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
