import { Flame, Trophy, Target, Zap, Crown, Star, type LucideIcon } from "lucide-react";

export interface BadgeStats {
  streak: number;
  totalPushups: number;
  totalSitups: number;
  totalWorkouts: number;
}

export interface BadgeDef {
  id: string;
  label: string;
  icon: LucideIcon;
  goal: number;
  /** Short blurb shown on the full-screen celebration. */
  blurb: string;
  value: (s: BadgeStats) => number;
  format?: (n: number) => string;
}

const num = (n: number) => n.toLocaleString();

export const BADGE_DEFS: BadgeDef[] = [
  { id: "streak-7", label: "7-Day Streak", icon: Flame, goal: 7, blurb: "One full week without missing a day.", value: (s) => s.streak, format: (n) => `${n} days` },
  { id: "streak-30", label: "30-Day Streak", icon: Zap, goal: 30, blurb: "A month of showing up. That's a habit now.", value: (s) => s.streak, format: (n) => `${n} days` },
  { id: "streak-100", label: "100-Day Streak", icon: Crown, goal: 100, blurb: "Triple digits. Very few people get here.", value: (s) => s.streak, format: (n) => `${n} days` },
  { id: "pushups-1000", label: "1K Pushups", icon: Target, goal: 1000, blurb: "One thousand pushups logged.", value: (s) => s.totalPushups, format: num },
  { id: "situps-1000", label: "1K Situps", icon: Trophy, goal: 1000, blurb: "One thousand situps logged.", value: (s) => s.totalSitups, format: num },
  { id: "workouts-50", label: "50 Workouts", icon: Star, goal: 50, blurb: "Fifty sessions in the books.", value: (s) => s.totalWorkouts, format: num },
];

export interface ComputedBadge extends BadgeDef {
  current: number;
  earned: boolean;
  progress: number;
  description: string;
}

export function computeBadges(stats: BadgeStats): ComputedBadge[] {
  return BADGE_DEFS.map((def) => {
    const current = def.value(stats);
    const fmt = def.format ?? num;
    return {
      ...def,
      current,
      earned: current >= def.goal,
      progress: Math.min(current / def.goal, 1),
      description: `${fmt(Math.min(current, def.goal))}/${fmt(def.goal)}`,
    };
  });
}

const KEY = (uid: string) => `grindfaith.badges.${uid}`;

export function getSeenBadges(uid: string): string[] {
  try {
    const raw = localStorage.getItem(KEY(uid));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markBadgesSeen(uid: string, ids: string[]) {
  try {
    const next = Array.from(new Set([...getSeenBadges(uid), ...ids]));
    localStorage.setItem(KEY(uid), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
