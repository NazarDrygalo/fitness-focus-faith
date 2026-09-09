import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Repeat, Plus, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { beep, finishChime } from "@/lib/timerSound";
import { cn } from "@/lib/utils";

type ExerciseKey = "pushups" | "situps" | "squats";
const EXERCISES: { key: ExerciseKey; label: string }[] = [
  { key: "pushups", label: "Pushups" },
  { key: "situps", label: "Situps" },
  { key: "squats", label: "Squats" },
];

interface CircuitStep { id: string; exercise: ExerciseKey; reps: number }

interface Props {
  onSave: (totals: Record<ExerciseKey, number>) => Promise<void>;
}

type Phase = "build" | "work" | "rest" | "done";

export function CircuitBuilder({ onSave }: Props) {
  const [steps, setSteps] = useState<CircuitStep[]>([
    { id: "1", exercise: "pushups", reps: 10 },
    { id: "2", exercise: "situps", reps: 15 },
  ]);
  const [rounds, setRounds] = useState(3);
  const [restSecs, setRestSecs] = useState(30);

  const [phase, setPhase] = useState<Phase>("build");
  const [round, setRound] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [saving, setSaving] = useState(false);
  const restEndRef = useRef(0);
  // totals accumulate as the user completes each step
  const totalsRef = useRef<Record<ExerciseKey, number>>({ pushups: 0, situps: 0, squats: 0 });

  useEffect(() => {
    if (phase !== "rest") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((restEndRef.current - Date.now()) / 1000));
      setRestLeft(left);
      if (left <= 0) {
        clearInterval(id);
        haptic("medium"); beep(880, 140);
        advance();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const addStep = () => {
    haptic("light");
    setSteps((s) => [...s, { id: crypto.randomUUID(), exercise: "pushups", reps: 10 }]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    haptic("light");
    setSteps((s) => s.filter((x) => x.id !== id));
  };

  const start = () => {
    if (steps.length === 0) return;
    haptic("medium"); beep(880, 120);
    totalsRef.current = { pushups: 0, situps: 0, squats: 0 };
    setRound(1); setStepIdx(0); setPhase("work");
  };

  const advance = () => {
    const next = stepIdx + 1;
    if (next < steps.length) {
      setStepIdx(next);
      setPhase("work");
    } else if (round < rounds) {
      setRound((r) => r + 1);
      setStepIdx(0);
      setPhase("work");
    } else {
      setPhase("done");
      haptic("success"); finishChime();
    }
  };

  const completeStep = () => {
    haptic("light"); beep(660, 70);
    totalsRef.current[steps[stepIdx].exercise] += steps[stepIdx].reps;
    const isLastStep = stepIdx === steps.length - 1;
    const isLastRound = round === rounds;
    if (!isLastStep || !isLastRound) {
      restEndRef.current = Date.now() + restSecs * 1000;
      setRestLeft(restSecs);
      setPhase("rest");
    } else {
      advance();
    }
  };

  const finishAndSave = async () => {
    setSaving(true);
    await onSave(totalsRef.current);
    setSaving(false);
    setPhase("build");
  };

  const totalReps = useMemo(
    () => Object.values(totalsRef.current).reduce((a, b) => a + b, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase]
  );

  const current = steps[stepIdx];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Repeat className="h-5 w-5" /> Circuit</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {phase === "build" && (
            <motion.div key="build" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="space-y-2 mb-4">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                    <div className="flex gap-1 flex-1">
                      {EXERCISES.map((e) => (
                        <button key={e.key}
                          onClick={() => { haptic("light"); setSteps((prev) => prev.map((x) => x.id === s.id ? { ...x, exercise: e.key } : x)); }}
                          className={cn("flex-1 h-9 rounded-md text-xs font-medium tap",
                            s.exercise === e.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                          {e.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number" inputMode="numeric" min={1} value={s.reps}
                      onChange={(e) => setSteps((prev) => prev.map((x) => x.id === s.id ? { ...x, reps: Math.max(1, parseInt(e.target.value) || 1) } : x))}
                      className="w-16 h-9 text-center bg-secondary border-border no-spinners"
                    />
                    <button onClick={() => removeStep(s.id)} className="p-2 text-muted-foreground hover:text-destructive tap" aria-label="Remove step">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep} className="w-full h-10 tap gap-2">
                  <Plus className="h-4 w-4" /> Add exercise
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Rounds</label>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => { haptic("light"); setRounds(r); }}
                        className={cn("flex-1 h-9 rounded-md text-sm font-medium tabular-nums tap",
                          rounds === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Rest between</label>
                  <div className="flex gap-1">
                    {[15, 30, 45, 60].map((r) => (
                      <button key={r} onClick={() => { haptic("light"); setRestSecs(r); }}
                        className={cn("flex-1 h-9 rounded-md text-sm font-medium tabular-nums tap",
                          restSecs === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                        {r}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={start} className="w-full h-12 text-base tap gap-2">
                <Play className="h-4 w-4" /> Start Circuit ({steps.length} exercises × {rounds})
              </Button>
            </motion.div>
          )}

          {phase === "work" && current && (
            <motion.div key={`work-${round}-${stepIdx}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Round {round} of {rounds} · Exercise {stepIdx + 1} of {steps.length}</p>
              <p className="text-lg font-medium mb-1">{EXERCISES.find((e) => e.key === current.exercise)?.label}</p>
              <p className="text-6xl font-bold tabular-nums mb-5">{current.reps}</p>
              <Button onClick={completeStep} className="w-full h-14 text-lg tap">Done</Button>
            </motion.div>
          )}

          {phase === "rest" && (
            <motion.div key="rest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Rest</p>
              <p className="text-6xl font-bold tabular-nums mb-5">{restLeft}</p>
              <Button variant="outline" onClick={() => { haptic("light"); advance(); }} className="w-full h-12 text-base tap">Skip rest</Button>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="text-lg font-medium mb-1">Circuit complete!</p>
              <p className="text-sm text-muted-foreground mb-4">
                {totalReps} total reps — {totalsRef.current.pushups} pushups · {totalsRef.current.situps} situps · {totalsRef.current.squats} squats
              </p>
              <Button onClick={finishAndSave} disabled={saving} className="w-full h-12 text-base tap">
                {saving ? "Saving..." : "Save to today's workout"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
