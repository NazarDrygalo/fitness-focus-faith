import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimerReset, Play, Pause, RotateCcw } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { beep, finishChime } from "@/lib/timerSound";
import { cn } from "@/lib/utils";

const PRESETS = [30, 60, 90, 120];

export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 3 && left > 0) { haptic("light"); beep(660, 90); }
      if (left <= 0) {
        clearInterval(id);
        setRunning(false);
        haptic("success");
        finishChime();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const start = (secs = duration) => {
    haptic("medium");
    beep(880, 90);
    endAtRef.current = Date.now() + secs * 1000;
    setRemaining(secs);
    setRunning(true);
  };

  const pause = () => {
    haptic("light");
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(null);
  };

  const progress = remaining !== null ? 1 - remaining / duration : 0;
  const active = remaining !== null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TimerReset className="h-5 w-5" /> Rest Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { haptic("light"); setDuration(p); if (active && !running) setRemaining(p); }}
              className={cn(
                "flex-1 h-10 rounded-full text-sm font-medium tabular-nums transition-colors tap",
                duration === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {p}s
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" strokeWidth="7" className="stroke-secondary" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none" strokeWidth="7" strokeLinecap="round"
                className="stroke-primary"
                strokeDasharray={2 * Math.PI * 44}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress) }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {active ? remaining : duration}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            {!running ? (
              <Button onClick={() => start(remaining ?? duration)} className="flex-1 h-12 text-base tap gap-2">
                <Play className="h-4 w-4" /> {active ? "Resume" : "Start Rest"}
              </Button>
            ) : (
              <Button onClick={pause} variant="outline" className="flex-1 h-12 text-base tap gap-2">
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            {active && (
              <Button onClick={reset} variant="ghost" className="h-12 px-4 tap" aria-label="Reset timer">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
