import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Flag } from "lucide-react";

interface PullUpLadderProps {
  onFinish: (percent: number) => void;
  initialPercent?: number;
  disabled?: boolean;
}

const UP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DOWN_STEPS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const TOTAL_STEPS = UP_STEPS.length + DOWN_STEPS.length; // 20

export function PullUpLadder({ onFinish, initialPercent = 0, disabled = false }: PullUpLadderProps) {
  const [completedUp, setCompletedUp] = useState<number[]>([]);
  const [completedDown, setCompletedDown] = useState<number[]>([]);
  const [finished, setFinished] = useState(disabled);

  // Restore state from initialPercent on mount
  useEffect(() => {
    if (initialPercent > 0 && initialPercent <= 100) {
      const stepsCompleted = Math.round((initialPercent / 100) * TOTAL_STEPS);
      const upCount = Math.min(stepsCompleted, UP_STEPS.length);
      const downCount = Math.max(0, stepsCompleted - UP_STEPS.length);
      setCompletedUp(UP_STEPS.slice(0, upCount));
      setCompletedDown(DOWN_STEPS.slice(0, downCount));
      if (initialPercent > 0) setFinished(true);
    }
  }, []);

  const completedCount = completedUp.length + completedDown.length;
  const percent = Math.round((completedCount / TOTAL_STEPS) * 100);

  const isLocked = finished;

  const handleUpClick = (step: number) => {
    if (isLocked) return;
    // Must complete in order
    const idx = UP_STEPS.indexOf(step);
    if (idx !== completedUp.length) return;
    setCompletedUp(prev => [...prev, step]);
  };

  const handleDownClick = (step: number) => {
    if (isLocked) return;
    if (completedUp.length < UP_STEPS.length) return; // must finish up first
    const idx = DOWN_STEPS.indexOf(step);
    if (idx !== completedDown.length) return;
    setCompletedDown(prev => [...prev, step]);
  };

  const handleFinish = () => {
    setFinished(true);
    onFinish(percent);
  };

  // Pyramid segments: 20 total, filled left to right
  const pyramidRows = 5;
  const pyramidSegments = useMemo(() => {
    // Build a pyramid with rows of increasing width: 2, 3, 4, 5, 6 = 20 segments
    const rows = [2, 3, 4, 5, 6];
    let segmentIndex = 0;
    return rows.map((count) => {
      const row: { index: number; filled: boolean; missed: boolean }[] = [];
      for (let i = 0; i < count; i++) {
        const filled = segmentIndex < completedCount;
        const missed = finished && !filled;
        row.push({ index: segmentIndex, filled, missed });
        segmentIndex++;
      }
      return row;
    });
  }, [completedCount, finished]);

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-4">
        {/* Up column */}
        <div className="flex flex-col gap-1.5 items-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Up ↑</p>
          {UP_STEPS.map((step, idx) => {
            const done = completedUp.includes(step);
            const isNext = idx === completedUp.length && !isLocked;
            return (
              <motion.button
                key={`up-${step}`}
                whileTap={isNext ? { scale: 0.9 } : {}}
                onClick={() => handleUpClick(step)}
                disabled={isLocked || !isNext}
                className={`
                  w-10 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center
                  ${done ? "bg-success text-success-foreground" : isNext ? "bg-primary text-primary-foreground ring-2 ring-ring animate-pulse" : "bg-secondary text-muted-foreground"}
                  ${isLocked && !done ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </motion.button>
            );
          })}
        </div>

        {/* Pyramid visualization */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            {pyramidSegments.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 justify-center">
                {row.map((seg) => (
                  <motion.div
                    key={seg.index}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: seg.filled || seg.missed ? 1 : 0.85,
                      opacity: seg.filled || seg.missed ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded-sm transition-colors duration-300
                      ${seg.filled ? "bg-success" : seg.missed ? "bg-destructive" : "bg-secondary"}
                    `}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="text-2xl font-bold mt-3 text-foreground">{percent}%</p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>

        {/* Down column */}
        <div className="flex flex-col gap-1.5 items-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Down ↓</p>
          {DOWN_STEPS.map((step, idx) => {
            const done = completedDown.includes(step);
            const canClickDown = completedUp.length === UP_STEPS.length;
            const isNext = canClickDown && idx === completedDown.length && !isLocked;
            return (
              <motion.button
                key={`down-${step}`}
                whileTap={isNext ? { scale: 0.9 } : {}}
                onClick={() => handleDownClick(step)}
                disabled={isLocked || !isNext}
                className={`
                  w-10 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center
                  ${done ? "bg-success text-success-foreground" : isNext ? "bg-primary text-primary-foreground ring-2 ring-ring animate-pulse" : "bg-secondary text-muted-foreground"}
                  ${isLocked && !done ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Finish button */}
      {!finished && (
        <Button
          onClick={handleFinish}
          disabled={completedCount === 0}
          className="w-full transition-all duration-300 active-scale"
          variant={percent === 100 ? "default" : "destructive"}
        >
          <Flag className="h-4 w-4 mr-2" />
          {percent === 100 ? "Complete Ladder!" : `Finish Ladder (${percent}%)`}
        </Button>
      )}

      {finished && (
        <div className={`text-center p-3 rounded-lg ${percent === 100 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
          <p className="text-sm font-medium">
            {percent === 100 ? "🎉 Perfect ladder!" : `Ladder finished at ${percent}%`}
          </p>
        </div>
      )}
    </div>
  );
}
