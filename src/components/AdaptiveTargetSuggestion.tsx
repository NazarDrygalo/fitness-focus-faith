import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

interface Log {
  workout_date: string;
  pushups: number;
  situps: number;
  squat_count: number;
}
interface Goals {
  pushups: number;
  situps: number;
  squat_count: number;
}

interface Props {
  logs: Log[];
  goals: Goals | null;
  onApplied: () => void;
}

// Compares 7-day rolling average to current goal; if user consistently
// beats target by >=20%, suggest bumping by 10%.
export function AdaptiveTargetSuggestion({ logs, goals, onApplied }: Props) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const suggestion = useMemo(() => {
    if (!goals) return null;
    const last7 = logs.slice(-7);
    if (last7.length < 4) return null;
    const fields: (keyof Goals)[] = ["pushups", "situps", "squat_count"];
    for (const key of fields) {
      const target = goals[key];
      if (!target) continue;
      const avg = last7.reduce((s, l) => s + (l[key] || 0), 0) / last7.length;
      if (avg >= target * 1.2 && !dismissed.includes(key)) {
        return { key, current: target, next: Math.round(target * 1.1), avg: Math.round(avg) };
      }
    }
    return null;
  }, [logs, goals, dismissed]);

  if (!suggestion || !user) return null;

  const labels: Record<keyof Goals, string> = {
    pushups: "pushups", situps: "situps", squat_count: "squats",
  };

  const apply = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("workout_goals")
      .update({ [suggestion.key]: suggestion.next } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error("Couldn't update goal"); return; }
    toast.success(`${labels[suggestion.key]} goal raised to ${suggestion.next}`);
    onApplied();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <Card className="bg-card border-border border-dashed mb-3">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--success))" }} />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="text-foreground font-medium">You're averaging {suggestion.avg} {labels[suggestion.key]}/day.</span>
              <span className="text-muted-foreground"> Bump goal to {suggestion.next}?</span>
            </div>
            <Button size="sm" onClick={apply} disabled={saving} className="h-8">
              {saving ? "…" : "Raise"}
            </Button>
            <button onClick={() => setDismissed((d) => [...d, suggestion.key])} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
