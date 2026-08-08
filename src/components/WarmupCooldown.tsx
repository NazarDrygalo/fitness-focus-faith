import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Play, Pause, RotateCcw, SkipForward, Snowflake } from "lucide-react";
import { WARMUP_SEQUENCE, COOLDOWN_SEQUENCE, type SequenceStep } from "@/data/formGuides";
import { haptic } from "@/lib/haptics";
import { useKeepAwake } from "@/hooks/useKeepAwake";
import { cn } from "@/lib/utils";

type Mode = "warmup" | "cooldown";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function WarmupCooldown() {
  const [mode, setMode] = useState<Mode>("warmup");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(WARMUP_SEQUENCE[0].seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number>();

  const sequence: SequenceStep[] = mode === "warmup" ? WARMUP_SEQUENCE : COOLDOWN_SEQUENCE;
  const step = sequence[index];
  useKeepAwake(running);

  const reset = (m: Mode = mode) => {
    const seq = m === "warmup" ? WARMUP_SEQUENCE : COOLDOWN_SEQUENCE;
    setIndex(0);
    setRemaining(seq[0].seconds);
    setRunning(false);
    setDone(false);
  };

  const advance = () => {
    if (index + 1 < sequence.length) {
      setIndex(index + 1);
      setRemaining(sequence[index + 1].seconds);
      haptic("medium");
    } else {
      setRunning(false);
      setDone(true);
      haptic("success");
    }
  };

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.setTimeout(advance, 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, index, mode]);

  const total = sequence.reduce((a, s) => a + s.seconds, 0);
  const elapsed = sequence.slice(0, index).reduce((a, s) => a + s.seconds, 0) + (step.seconds - remaining);
  const pct = Math.min(100, Math.round((elapsed / total) * 100));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {mode === "warmup" ? <Flame className="h-5 w-5" strokeWidth={1.75} /> : <Snowflake className="h-5 w-5" strokeWidth={1.75} />}
          Warmup &amp; Cooldown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-5">
          {(["warmup", "cooldown"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { if (m !== mode) { haptic("light"); setMode(m); reset(m); } }}
              className={cn(
                "relative flex-1 h-11 rounded-full text-sm font-medium transition-colors tap",
                mode === m ? "text-primary-foreground" : "text-muted-foreground bg-secondary hover:text-foreground"
              )}
            >
              {mode === m && (
                <motion.span layoutId="wc-pill" className="absolute inset-0 bg-primary rounded-full" transition={{ type: "spring", stiffness: 500, damping: 36 }} />
              )}
              <span className="relative z-10">{m === "warmup" ? "Warmup" : "Cooldown"}</span>
            </button>
          ))}
        </div>

        <div className="text-center py-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${mode}-${index}-${done}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="text-sm text-muted-foreground mb-2"
            >
              {done ? "Sequence complete" : `Step ${index + 1} of ${sequence.length} · ${step.name}`}
            </motion.p>
          </AnimatePresence>
          <p className="text-5xl font-bold tabular-nums tracking-tight">{done ? "0:00" : fmt(remaining)}</p>
        </div>

        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-5">
          <motion.div className="h-full bg-primary" animate={{ width: `${done ? 100 : pct}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" className="h-12 tap" onClick={() => { haptic("light"); reset(); }}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button
            className="h-12 tap"
            disabled={done}
            onClick={() => { haptic("medium"); setRunning((r) => !r); }}
          >
            {running ? <Pause className="h-4 w-4 mr-2" strokeWidth={1.75} /> : <Play className="h-4 w-4 mr-2" strokeWidth={1.75} />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="secondary" className="h-12 tap" disabled={done} onClick={() => { haptic("light"); advance(); }}>
            <SkipForward className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>

        <ul className="mt-5 space-y-1.5">
          {sequence.map((s, i) => (
            <li
              key={s.name}
              className={cn(
                "flex items-center justify-between text-sm py-1.5 px-2 rounded-md transition-colors",
                i === index && !done ? "bg-secondary text-foreground" : "text-muted-foreground"
              )}
            >
              <span>{s.name}</span>
              <span className="tabular-nums">{fmt(s.seconds)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
