import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Timer, Flag, Clock } from "lucide-react";

interface PlankTimerProps {
  onFinish: (totalSeconds: number) => void;
  disabled?: boolean;
  initialSeconds?: number;
}

type Mode = "stopwatch" | "timer";

export function PlankTimer({ onFinish, disabled = false, initialSeconds = 0 }: PlankTimerProps) {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const [laps, setLaps] = useState<number[]>([]);
  const [finished, setFinished] = useState(disabled && initialSeconds > 0);

  // Timer mode state
  const [timerMinutes, setTimerMinutes] = useState("1");
  const [timerSeconds, setTimerSeconds] = useState("0");
  const [timerTotal, setTimerTotal] = useState(0); // ms
  const [timerRemaining, setTimerRemaining] = useState(0); // ms
  const [timerStarted, setTimerStarted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startStopwatch = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 50);
    setRunning(true);
  };

  const pauseStopwatch = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRunning(false);
  };

  const addLap = () => {
    setLaps(prev => [...prev, elapsed]);
  };

  const resetStopwatch = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    setLaps([]);
  };

  // Timer mode
  const startTimer = () => {
    const totalMs = (parseInt(timerMinutes || "0") * 60 + parseInt(timerSeconds || "0")) * 1000;
    if (totalMs <= 0) return;
    setTimerTotal(totalMs);
    setTimerRemaining(totalMs);
    setTimerStarted(true);
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    intervalRef.current = setInterval(() => {
      const spent = accumulatedRef.current + (Date.now() - startTimeRef.current);
      const rem = Math.max(0, totalMs - spent);
      setTimerRemaining(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setTimerRemaining(0);
      }
    }, 50);
    setRunning(true);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRunning(false);
  };

  const resumeTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const spent = accumulatedRef.current + (Date.now() - startTimeRef.current);
      const rem = Math.max(0, timerTotal - spent);
      setTimerRemaining(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setTimerRemaining(0);
      }
    }, 50);
    setRunning(true);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTimerStarted(false);
    setTimerRemaining(0);
    accumulatedRef.current = 0;
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  };

  const handleFinish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(true);
    const totalSec = mode === "stopwatch"
      ? Math.round(elapsed / 1000)
      : Math.round((timerTotal - timerRemaining) / 1000);
    onFinish(totalSec);
  };

  const timerProgress = timerTotal > 0 ? 1 - timerRemaining / timerTotal : 0;

  // Circle progress for timer
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - timerProgress);

  if (finished) {
    const secs = initialSeconds > 0 ? initialSeconds : (mode === "stopwatch" ? Math.round(elapsed / 1000) : Math.round((timerTotal - timerRemaining) / 1000));
    return (
      <div className="text-center p-4 rounded-lg bg-success/15 text-success">
        <p className="text-sm font-medium">✅ Plank completed: {Math.floor(secs / 60)}m {secs % 60}s</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit mx-auto">
        {(["stopwatch", "timer"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { if (!running) { setMode(m); resetStopwatch(); resetTimer(); } }}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {mode === m && (
              <motion.div layoutId="plank-mode" className="absolute inset-0 bg-accent rounded-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {m === "stopwatch" ? <Timer className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {m === "stopwatch" ? "Stopwatch" : "Timer"}
            </span>
          </button>
        ))}
      </div>

      {mode === "stopwatch" ? (
        <div className="flex flex-col items-center gap-4">
          <motion.p
            key={elapsed}
            className="text-4xl font-mono font-bold text-foreground tabular-nums"
          >
            {formatTime(elapsed)}
          </motion.p>

          <div className="flex gap-2">
            {!running ? (
              <Button onClick={startStopwatch} className="gap-2 active-scale">
                <Play className="h-4 w-4" /> {elapsed > 0 ? "Resume" : "Start"}
              </Button>
            ) : (
              <>
                <Button onClick={pauseStopwatch} variant="secondary" className="gap-2 active-scale">
                  <Pause className="h-4 w-4" /> Pause
                </Button>
                <Button onClick={addLap} variant="outline" className="gap-2 active-scale">
                  <Flag className="h-4 w-4" /> Lap
                </Button>
              </>
            )}
            {elapsed > 0 && !running && (
              <Button onClick={resetStopwatch} variant="ghost" className="gap-2 active-scale">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            )}
          </div>

          {/* Laps */}
          <AnimatePresence>
            {laps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full space-y-1 max-h-32 overflow-y-auto"
              >
                {laps.map((lap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-sm px-3 py-1.5 bg-secondary rounded-md"
                  >
                    <span className="text-muted-foreground">Lap {i + 1}</span>
                    <span className="font-mono text-foreground">{formatTime(lap)}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {elapsed > 0 && !running && (
            <Button onClick={handleFinish} className="w-full active-scale gap-2">
              <Flag className="h-4 w-4" /> Save Plank
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {!timerStarted ? (
            <div className="flex gap-3 items-end">
              <div>
                <Label className="text-xs text-muted-foreground">Minutes</Label>
                <Input type="number" min="0" max="99" value={timerMinutes} onChange={e => setTimerMinutes(e.target.value)} className="w-20 mt-1 bg-secondary border-border text-center no-spinners" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Seconds</Label>
                <Input type="number" min="0" max="59" value={timerSeconds} onChange={e => setTimerSeconds(e.target.value)} className="w-20 mt-1 bg-secondary border-border text-center no-spinners" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <svg width="180" height="180" className="-rotate-90">
                <circle cx="90" cy="90" r={circleRadius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <motion.circle
                  cx="90" cy="90" r={circleRadius}
                  fill="none"
                  stroke="hsl(var(--success))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.1 }}
                />
              </svg>
              <p className="absolute text-3xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(timerRemaining)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!timerStarted ? (
              <Button onClick={startTimer} className="gap-2 active-scale">
                <Play className="h-4 w-4" /> Start Timer
              </Button>
            ) : !running ? (
              <>
                {timerRemaining > 0 && (
                  <Button onClick={resumeTimer} className="gap-2 active-scale">
                    <Play className="h-4 w-4" /> Resume
                  </Button>
                )}
                <Button onClick={resetTimer} variant="ghost" className="gap-2 active-scale">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </>
            ) : (
              <Button onClick={pauseTimer} variant="secondary" className="gap-2 active-scale">
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
          </div>

          {timerStarted && !running && (timerRemaining === 0 || timerRemaining < timerTotal) && (
            <Button onClick={handleFinish} className="w-full active-scale gap-2">
              <Flag className="h-4 w-4" /> Save Plank
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
