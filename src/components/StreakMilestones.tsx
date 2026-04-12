import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Target, Zap, Crown, Star } from "lucide-react";

interface StreakMilestonesProps {
  streak: number;
  totalPushups: number;
  totalSitups: number;
  totalWorkouts: number;
}

interface Badge {
  icon: React.ReactNode;
  label: string;
  description: string;
  earned: boolean;
  progress: number;
}

export function StreakMilestones({ streak, totalPushups, totalSitups, totalWorkouts }: StreakMilestonesProps) {
  const badges = useMemo<Badge[]>(() => [
    {
      icon: <Flame className="h-5 w-5" />,
      label: "7-Day Streak",
      description: `${Math.min(streak, 7)}/7 days`,
      earned: streak >= 7,
      progress: Math.min(streak / 7, 1),
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "30-Day Streak",
      description: `${Math.min(streak, 30)}/30 days`,
      earned: streak >= 30,
      progress: Math.min(streak / 30, 1),
    },
    {
      icon: <Crown className="h-5 w-5" />,
      label: "100-Day Streak",
      description: `${Math.min(streak, 100)}/100 days`,
      earned: streak >= 100,
      progress: Math.min(streak / 100, 1),
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: "1K Pushups",
      description: `${Math.min(totalPushups, 1000).toLocaleString()}/1,000`,
      earned: totalPushups >= 1000,
      progress: Math.min(totalPushups / 1000, 1),
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: "1K Situps",
      description: `${Math.min(totalSitups, 1000).toLocaleString()}/1,000`,
      earned: totalSitups >= 1000,
      progress: Math.min(totalSitups / 1000, 1),
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "50 Workouts",
      description: `${Math.min(totalWorkouts, 50)}/50`,
      earned: totalWorkouts >= 50,
      progress: Math.min(totalWorkouts / 50, 1),
    },
  ], [streak, totalPushups, totalSitups, totalWorkouts]);

  const earned = badges.filter(b => b.earned);
  const inProgress = badges.filter(b => !b.earned);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground mb-3">Milestones</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <AnimatePresence>
            {[...earned, ...inProgress].map((badge) => (
              <motion.div
                key={badge.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex flex-col items-center text-center gap-1.5 p-2 rounded-lg transition-colors ${
                  badge.earned
                    ? "bg-success/10"
                    : "bg-secondary/50"
                }`}
              >
                <div className="relative">
                  <div className={`transition-colors ${badge.earned ? "text-success" : "text-muted-foreground"}`}>
                    {badge.icon}
                  </div>
                  {badge.earned && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success"
                    />
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-medium leading-tight ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{badge.description}</p>
                </div>
                {!badge.earned && (
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress * 100}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
