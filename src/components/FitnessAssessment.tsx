import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Answers = {
  level: "beginner" | "intermediate" | "advanced" | "";
  maxPushups: number;
  frequency: number;
  goal: "strength" | "endurance" | "consistency" | "";
};

const STORAGE_KEY = "fitness_assessment_complete";

// Shown once, after WelcomeOnboarding, only if no workout_goals row exists yet.
export function FitnessAssessment() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ level: "", maxPushups: 0, frequency: 3, goal: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Wait for welcome onboarding to finish.
    if (!localStorage.getItem("onboarding_complete")) return;
    supabase
      .from("workout_goals")
      .select("pushups")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        // Show only if no goals row OR all zeros.
        if (!data || !data.pushups) setShow(true);
      });
  }, [user]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  const seedGoals = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { action: "assessment_goals", answers },
    });
    if (error || data?.error) {
      setLoading(false);
      toast.error("Couldn't generate goals — try setting them manually.");
      close();
      return;
    }
    const g = {
      user_id: user.id,
      pushups: Math.max(0, Math.round(data.pushups || 0)),
      situps: Math.max(0, Math.round(data.situps || 0)),
      squat_count: Math.max(0, Math.round(data.squat_count || 0)),
      plank_seconds: Math.max(0, Math.round(data.plank_seconds || 0)),
      deadhang_seconds: Math.max(0, Math.round(data.deadhang_seconds || 0)),
      ladder_percent: Math.max(0, Math.round(data.ladder_percent || 0)),
    };
    const { error: e2 } = await supabase.from("workout_goals").upsert(g as any, { onConflict: "user_id" });
    setLoading(false);
    if (e2) { toast.error("Couldn't save starter goals."); close(); return; }
    toast.success("Starter goals set — let's go!");
    close();
  };

  if (!show) return null;

  const steps = [
    {
      title: "Quick fitness check (1 min)",
      body: (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Your current level</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["beginner", "intermediate", "advanced"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setAnswers((a) => ({ ...a, level: l }))}
                className={`p-2 rounded-lg border text-sm capitalize transition-colors ${
                  answers.level === l ? "bg-foreground text-background border-foreground" : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ),
      canNext: !!answers.level,
    },
    {
      title: "Max pushups in one set",
      body: (
        <div>
          <Label className="text-xs text-muted-foreground">Rough estimate is fine</Label>
          <Input
            type="number"
            min="0"
            value={answers.maxPushups || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, maxPushups: parseInt(e.target.value) || 0 }))}
            className="mt-1 bg-secondary border-border no-spinners"
            placeholder="e.g. 20"
          />
        </div>
      ),
      canNext: answers.maxPushups >= 0,
    },
    {
      title: "Workouts per week",
      body: (
        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setAnswers((a) => ({ ...a, frequency: n }))}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                answers.frequency === n ? "bg-foreground text-background border-foreground" : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      ),
      canNext: answers.frequency > 0,
    },
    {
      title: "Primary goal",
      body: (
        <div className="grid grid-cols-1 gap-2">
          {(["strength", "endurance", "consistency"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setAnswers((a) => ({ ...a, goal: g }))}
              className={`p-3 rounded-lg border text-sm capitalize text-left transition-colors ${
                answers.goal === g ? "bg-foreground text-background border-foreground" : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      ),
      canNext: !!answers.goal,
    },
  ];

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--streak))" }} />
            AI starter goals
          </div>
          <h2 className="text-lg font-bold text-foreground mb-4">{current.title}</h2>
          <div className="mb-6">{current.body}</div>

          <div className="flex justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? "w-5 bg-foreground" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" className="flex-1" onClick={() => setStep((s) => s - 1)}>Back</Button>
            )}
            {!isLast ? (
              <Button className="flex-1 gap-2" disabled={!current.canNext} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="flex-1 gap-2" disabled={!current.canNext || loading} onClick={seedGoals}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {loading ? "Generating…" : "Set my goals"}
              </Button>
            )}
          </div>

          <button onClick={close} className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground">
            Skip — I'll set them myself
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
