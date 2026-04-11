import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Target, Pencil, Check, X } from "lucide-react";

interface Goals {
  pushups: number;
  situps: number;
  ladder_percent: number;
  plank_seconds: number;
  deadhang_seconds: number;
  squat_count: number;
}

const defaultGoals: Goals = { pushups: 0, situps: 0, ladder_percent: 0, plank_seconds: 0, deadhang_seconds: 0, squat_count: 0 };

const goalFields: { key: keyof Goals; label: string; unit?: string }[] = [
  { key: "pushups", label: "Pushups" },
  { key: "situps", label: "Situps" },
  { key: "ladder_percent", label: "Ladder", unit: "%" },
  { key: "plank_seconds", label: "Plank", unit: "s" },
  { key: "deadhang_seconds", label: "Dead Hang", unit: "s" },
  { key: "squat_count", label: "Squats" },
];

interface Props {
  todayLog?: { pushups: number; situps: number; ladder_percent: number; plank_seconds: number; deadhang_seconds: number; squat_count: number } | null;
}

export function WorkoutGoals({ todayLog }: Props) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goals>(defaultGoals);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("workout_goals")
      .select("pushups, situps, ladder_percent, plank_seconds, deadhang_seconds, squat_count")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const g = data as Goals;
          setGoals(g);
          setDraft(g);
        }
        setLoaded(true);
      });
  }, [user]);

  const hasGoals = Object.values(goals).some((v) => v > 0);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("workout_goals").upsert(
      { user_id: user.id, ...draft } as any,
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) {
      toast.error("Failed to save goals.");
    } else {
      setGoals(draft);
      setEditing(false);
      toast.success("Goals updated!");
    }
  };

  if (!loaded) return null;

  if (editing) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: "hsl(var(--streak))" }} /> Set Daily Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {goalFields.map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground">{f.label}{f.unit ? ` (${f.unit})` : ""}</Label>
                <Input
                  type="number"
                  min="0"
                  value={draft[f.key] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: parseInt(e.target.value) || 0 }))}
                  className="mt-1 bg-secondary border-border no-spinners"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Goals"}
            </Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(goals); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasGoals) {
    return (
      <Card className="bg-card border-border border-dashed">
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Set daily goals to track your progress</p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="h-3 w-3" /> Set Goals
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goalFields.filter((f) => goals[f.key] > 0);
  const current = todayLog || defaultGoals;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: "hsl(var(--streak))" }} /> Daily Goals
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activeGoals.map((f) => {
            const target = goals[f.key];
            const actual = current[f.key];
            const pct = Math.min(100, Math.round((actual / target) * 100));
            const done = pct >= 100;
            return (
              <div key={f.key} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <span className={`text-xs font-semibold ${done ? "text-success" : "text-foreground"}`}>
                    {actual}/{target}{f.unit || ""}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${done ? "bg-success" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
