import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { beep, finishChime } from "@/lib/timerSound";
import { cn } from "@/lib/utils";

type Scheme = "pyramid" | "emom" | "amrap";
type Exercise = "pushups" | "situps" | "squats";

const EXERCISE_LABELS: Record<Exercise, string> = { pushups: "Pushups", situps: "Situps", squats: "Squats" };
const SCHEME_INFO: Record<Scheme, string> = {
  pyramid: "Start at 1 rep, add 1 each round until failure.",
  emom: "Every minute on the minute — do your reps, rest the remainder.",
  amrap: "As many reps as possible before time runs out.",
};

interface Props {
  onSave: (exercise: Exercise, totalReps: number) => Promise<void>;
}

export function RepSchemes({ onSave }: Props) {
  const [scheme, setScheme] = useState<Scheme>("pyramid");
  const [exercise, setExercise] = useState<Exercise>("pushups");

  // Pyramid state
  const [target, setTarget] = useState(1);
  const [pyramidTotal, setPyramidTotal] = useState(0);
  const [pyramidActive, setPyramidActive] = useState(false);

  // EMOM state
  const [emomMinutes, setEmomMinutes] = useState(10);
  const [emomMinute, setEmomMinute] = useState(0); // current minute (1-based once running)
  const [emomReps, setEmomReps] = useState(0); // reps this minute
  const [emomTotal, setEmomTotal] = useState(0);
  const [emomRunning, setEmomRunning] = useState(false);
  const emomEndRef = useRef(0);

  // AMRAP state
  const [amrapMinutes, setAmrapMinutes] = useState(5);
  const [amrapLeft, setAmrapLeft] = useState<number | null>(null);
  const [amrapTotal, setAmrapTotal] = useState(0);
  const amrapEndRef = useRef(0);

  // EMOM clock
  useEffect(() => {
    if (!emomRunning) return;
    const id = setInterval(() => {
      const elapsedMin = Math.floor((Date.now() - emomEndRef.current) / 60000) + 1;
      if (elapsedMin !== emomMinute) {
        // minute rollover: bank reps, buzz, reset per-minute counter
        setEmomTotal((t) => t + emomReps);
        setEmomReps(0);
        setEmomMinute(elapsedMin);
        haptic("medium");
        beep(880, 150);
        if (elapsedMin > emomMinutes) finishEmom(elapsedMin - 1);
      }
    }, 300);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emomRunning, emomMinute, emomReps, emomMinutes]);

  // AMRAP clock
  useEffect(() => {
    if (amrapLeft === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((amrapEndRef.current - Date.now()) / 1000));
      setAmrapLeft(left);
      if (left <= 0) {
        clearInterval(id);
        haptic("success");
        finishChime();
      }
    }, 250);
    return () => clearInterval(id);
  }, [amrapLeft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const [saving, setSaving] = useState(false);
  const save = async (total: number) => {
    if (total <= 0) { toast.error("No reps logged yet."); return; }
    setSaving(true);
    await onSave(exercise, total);
    setSaving(false);
    // reset all scheme state
    setPyramidActive(false); setTarget(1); setPyramidTotal(0);
    setEmomRunning(false); setEmomMinute(0); setEmomReps(0); setEmomTotal(0);
    setAmrapLeft(null); setAmrapTotal(0);
  };

  const startEmom = () => {
    haptic("medium"); beep(880, 120);
    emomEndRef.current = Date.now();
    setEmomMinute(1); setEmomRunning(true);
  };

  const finishEmom = (minutesDone = emomMinute) => {
    setEmomRunning(false);
    const total = emomTotal + emomReps;
    haptic("success"); finishChime();
    toast.success(`EMOM done: ${total} ${EXERCISE_LABELS[exercise].toLowerCase()} in ${Math.min(minutesDone, emomMinutes)} min`);
    setEmomTotal(total); setEmomReps(0);
  };

  const startAmrap = () => {
    haptic("medium"); beep(880, 120);
    amrapEndRef.current = Date.now() + amrapMinutes * 60000;
    setAmrapLeft(amrapMinutes * 60); setAmrapTotal(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" /> Rep Schemes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Scheme picker */}
        <div className="flex gap-2 mb-3">
          {(["pyramid", "emom", "amrap"] as Scheme[]).map((s) => (
            <button
              key={s}
              onClick={() => { haptic("light"); setScheme(s); }}
              className={cn(
                "flex-1 h-10 rounded-full text-sm font-medium uppercase tracking-wide transition-colors tap",
                scheme === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Exercise picker */}
        <div className="flex gap-2 mb-4">
          {(Object.keys(EXERCISE_LABELS) as Exercise[]).map((e) => (
            <button
              key={e}
              onClick={() => { haptic("light"); setExercise(e); }}
              className={cn(
                "flex-1 h-9 rounded-full text-xs font-medium transition-colors tap",
                exercise === e ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {EXERCISE_LABELS[e]}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-4">{SCHEME_INFO[scheme]}</p>

        <AnimatePresence mode="wait">
          <motion.div key={scheme} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {scheme === "pyramid" && (
              <div className="text-center">
                {!pyramidActive ? (
                  <Button onClick={() => { haptic("medium"); setPyramidActive(true); }} className="w-full h-12 text-base tap">Start Pyramid</Button>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Round target</p>
                    <p className="text-5xl font-bold tabular-nums mb-1">{target}</p>
                    <p className="text-sm text-muted-foreground mb-4">Total so far: {pyramidTotal} {EXERCISE_LABELS[exercise].toLowerCase()}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => { haptic("light"); beep(660, 70); setPyramidTotal((t) => t + target); setTarget((t) => t + 1); }} className="flex-1 h-12 text-base tap">
                        Done — next round
                      </Button>
                      <Button variant="outline" onClick={() => save(pyramidTotal)} disabled={saving} className="flex-1 h-12 text-base tap">
                        {saving ? "Saving..." : "Stop & save"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {scheme === "emom" && (
              <div className="text-center">
                {!emomRunning && emomTotal === 0 ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      {[5, 10, 15, 20].map((m) => (
                        <button key={m} onClick={() => { haptic("light"); setEmomMinutes(m); }}
                          className={cn("flex-1 h-10 rounded-full text-sm font-medium tabular-nums tap", emomMinutes === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                          {m}m
                        </button>
                      ))}
                    </div>
                    <Button onClick={startEmom} className="w-full h-12 text-base tap">Start EMOM</Button>
                  </>
                ) : emomRunning ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Minute</p>
                    <p className="text-5xl font-bold tabular-nums mb-1">{Math.min(emomMinute, emomMinutes)}<span className="text-xl text-muted-foreground">/{emomMinutes}</span></p>
                    <p className="text-sm text-muted-foreground mb-3">This minute: {emomReps} · Banked: {emomTotal}</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full tap" onClick={() => { haptic("light"); setEmomReps((r) => Math.max(0, r - 1)); }}><Minus className="h-5 w-5" /></Button>
                      <Button variant="outline" size="icon" className="h-14 w-14 rounded-full tap" onClick={() => { haptic("light"); setEmomReps((r) => r + 1); }}><Plus className="h-6 w-6" /></Button>
                    </div>
                    <Button variant="outline" onClick={() => { finishEmom(); }} className="w-full h-12 text-base tap">Finish early</Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">Finished with {emomTotal} total reps.</p>
                    <Button onClick={() => save(emomTotal)} disabled={saving} className="w-full h-12 text-base tap">
                      {saving ? "Saving..." : `Save ${emomTotal} ${EXERCISE_LABELS[exercise].toLowerCase()}`}
                    </Button>
                  </>
                )}
              </div>
            )}

            {scheme === "amrap" && (
              <div className="text-center">
                {amrapLeft === null ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      {[3, 5, 8, 10].map((m) => (
                        <button key={m} onClick={() => { haptic("light"); setAmrapMinutes(m); }}
                          className={cn("flex-1 h-10 rounded-full text-sm font-medium tabular-nums tap", amrapMinutes === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                          {m}m
                        </button>
                      ))}
                    </div>
                    <Button onClick={startAmrap} className="w-full h-12 text-base tap">Start AMRAP</Button>
                  </>
                ) : (
                  <>
                    <p className={cn("text-5xl font-bold tabular-nums mb-1", amrapLeft === 0 && "text-success")}>{fmt(amrapLeft)}</p>
                    <p className="text-sm text-muted-foreground mb-3">Reps: {amrapTotal}</p>
                    {amrapLeft > 0 ? (
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full tap" onClick={() => { haptic("light"); setAmrapTotal((t) => Math.max(0, t - 1)); }}><Minus className="h-5 w-5" /></Button>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-full tap" onClick={() => { haptic("light"); setAmrapTotal((t) => t + 1); }}><Plus className="h-6 w-6" /></Button>
                      </div>
                    ) : (
                      <Button onClick={() => save(amrapTotal)} disabled={saving} className="w-full h-12 text-base tap mt-2">
                        {saving ? "Saving..." : `Save ${amrapTotal} ${EXERCISE_LABELS[exercise].toLowerCase()}`}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
