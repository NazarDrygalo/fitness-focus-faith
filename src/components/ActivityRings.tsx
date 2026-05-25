import { motion } from "framer-motion";
import { useMemo } from "react";

export interface Ring {
  label: string;
  current: number;
  target: number;
  /** CSS color string (hsl/var ok) */
  color: string;
  unit?: string;
}

interface Props {
  rings: Ring[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
}

/**
 * iOS Health-style concentric activity rings.
 * Renders up to 3 rings (outer = first). Each ring animates in on mount and
 * smoothly tweens to its current progress. Caps at 100% visually but shows
 * actual numeric value below.
 */
export function ActivityRings({ rings, size = 200, strokeWidth = 16, gap = 4 }: Props) {
  const items = rings.slice(0, 3);
  const cx = size / 2;
  const cy = size / 2;

  const ringsWithGeom = useMemo(
    () =>
      items.map((r, i) => {
        const radius = size / 2 - strokeWidth / 2 - i * (strokeWidth + gap);
        const circumference = 2 * Math.PI * radius;
        const pct = r.target > 0 ? Math.min(1, r.current / r.target) : 0;
        return { ...r, radius, circumference, pct };
      }),
    [items, size, strokeWidth, gap]
  );

  const completedCount = ringsWithGeom.filter((r) => r.pct >= 1).length;
  const totalCount = ringsWithGeom.length;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {ringsWithGeom.map((r, i) => (
            <g key={i}>
              {/* Track */}
              <circle
                cx={cx}
                cy={cy}
                r={r.radius}
                fill="none"
                stroke={r.color}
                strokeOpacity={0.18}
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={r.radius}
                fill="none"
                stroke={r.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={r.circumference}
                initial={{ strokeDashoffset: r.circumference }}
                animate={{ strokeDashoffset: r.circumference * (1 - r.pct) }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 }}
              />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-3xl font-bold text-foreground tabular-nums"
          >
            {completedCount}/{totalCount}
          </motion.span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            Goals
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 w-full grid grid-cols-1 gap-1.5">
        {ringsWithGeom.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-muted-foreground truncate">{r.label}</span>
            </div>
            <span
              className="font-semibold tabular-nums"
              style={{ color: r.pct >= 1 ? r.color : undefined }}
            >
              {r.current}/{r.target}
              {r.unit || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
