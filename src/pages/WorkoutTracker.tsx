import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { PullUpLadder } from "@/components/PullUpLadder";
import { PlankTimer } from "@/components/PlankTimer";
import { DeadHangTimer } from "@/components/DeadHangTimer";
import { SquatCounter } from "@/components/SquatCounter";
import { StickyActionBar } from "@/components/StickyActionBar";
import { Button as UIButton } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyMessage } from "@/data/encouragementMessages";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Quote, Dumbbell, Timer as TimerIcon, Hand, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { PageMeta } from "@/components/PageMeta";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

type ExerciseMode = "pullup-ladder" | "plank" | "dead-hang" | "squats";

const EXERCISES: { id: ExerciseMode; label: string; Icon: typeof Dumbbell }[] = [
  { id: "pullup-ladder", label: "Pull-Up", Icon: Dumbbell },
  { id: "plank", label: "Plank", Icon: TimerIcon },
  { id: "dead-hang", label: "Dead Hang", Icon: Hand },
  { id: "squats", label: "Squats", Icon: Activity },
];

export default function WorkoutTracker() {
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("pullup-ladder");

  const [ladderDone, setLadderDone] = useState(false);
  const [existingLadder, setExistingLadder] = useState<number>(0);
  const [ladderLoaded, setLadderLoaded] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  const { user } = useAuth();
  const verse = getDailyVerse();
  const message = getDailyMessage();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    supabase.from("workout_logs").select("*").eq("workout_date", today).maybeSingle().then(({ data }) => {
      if (data) {
        setExistingData(data);
        if ((data as any).ladder_percent > 0) {
          setExistingLadder((data as any).ladder_percent);
          setLadderDone(true);
        }
      }
      setLadderLoaded(true);
    });
  }, [today]);

  const handleSave = async () => {
    const p = parseInt(pushups) || 0;
    const s = parseInt(situps) || 0;
    if (p === 0 && s === 0) { toast.error("Enter at least one exercise count."); return; }

    setSaving(true);
    haptic("medium");
    const { data: existing } = await supabase
      .from("workout_logs")
      .select("pushups, situps")
      .eq("workout_date", today)
      .maybeSingle();

    const newPushups = (existing?.pushups || 0) + p;
    const newSitups = (existing?.situps || 0) + s;

    const upsertData: any = { workout_date: today, pushups: newPushups, situps: newSitups, user_id: user?.id, ...(notes.trim() ? { notes: notes.trim() } : {}) };
    const { error } = await supabase.from("workout_logs").upsert(upsertData, { onConflict: "workout_date,user_id" });
    setSaving(false);

    if (error) {
      toast.error("Failed to save workout.");
    } else {
      setSaved(true);
      haptic("success");
      toast.success(`Workout logged! Today's total: ${newPushups} pushups, ${newSitups} situps`);
      setPushups("");
      setSitups("");
      setNotes("");
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSaveExercise = async (field: string, value: number, extras?: Record<string, any>) => {
    const upsertData: any = { workout_date: today, [field]: value, ...extras, user_id: user?.id };
    const { error } = await supabase.from("workout_logs").upsert(upsertData, { onConflict: "workout_date,user_id" });
    if (error) {
      toast.error("Failed to save.");
    } else {
      const labels: Record<string, string> = {
        plank_seconds: "Plank",
        deadhang_seconds: "Dead hang",
        squat_count: "Squats",
      };
      haptic("success");
      toast.success(`${labels[field] || "Exercise"} saved!`);
      const { data } = await supabase.from("workout_logs").select("*").eq("workout_date", today).maybeSingle();
      if (data) setExistingData(data);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      <PageMeta title="Workout · GRIND" description="Log pull-ups, planks, dead hangs, and squats with one-tap tracking." path="/workout" />
      <Navigation />
      <MobileNav />
      <main className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Daily Workout</h1>
          <p className="text-sm text-muted-foreground mb-5 sm:mb-8">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </motion.div>

        {/* Workout Input */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border mb-5 sm:mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Log Today's Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <Label htmlFor="pushups" className="text-sm text-muted-foreground">Pushups</Label>
                  <Input id="pushups" type="number" inputMode="numeric" pattern="[0-9]*" min="0" placeholder="0" value={pushups} onChange={e => setPushups(e.target.value)} className="mt-1 h-12 text-base bg-secondary border-border no-spinners" />
                </div>
                <div>
                  <Label htmlFor="situps" className="text-sm text-muted-foreground">Situps</Label>
                  <Input id="situps" type="number" inputMode="numeric" pattern="[0-9]*" min="0" placeholder="0" value={situps} onChange={e => setSitups(e.target.value)} className="mt-1 h-12 text-base bg-secondary border-border no-spinners" />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="notes" className="text-sm text-muted-foreground">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="How did the workout feel? Any PRs?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 bg-secondary border-border resize-none"
                  rows={2}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full h-12 text-base transition-all duration-300 tap">
                {saved ? <><Check className="h-4 w-4 mr-2" /> Saved!</> : saving ? "Saving..." : "Log Workout"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encouragement */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border mb-5 sm:mb-6 hover-lift">
            <CardContent className="p-5 sm:p-6">
              <p className="text-base sm:text-lg font-medium text-center italic text-foreground leading-relaxed">
                "{message}"
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bible Verse */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border mb-5 sm:mb-6 hover-lift">
            <CardContent className="p-5 sm:p-6">
              <Quote className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-base leading-relaxed text-foreground mb-3">
                "{verse.verse}"
              </p>
              <p className="text-sm text-muted-foreground font-medium">— {verse.reference} (NIV)</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Section with Pill Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" /> Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Horizontal scrollable pill picker */}
              <div className="-mx-1 mb-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-2 px-1 min-w-min">
                  {EXERCISES.map(({ id, label, Icon }) => {
                    const active = exerciseMode === id;
                    return (
                      <button
                        key={id}
                        onClick={() => { if (!active) { haptic("light"); setExerciseMode(id); } }}
                        className={cn(
                          "relative shrink-0 snap-start inline-flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium select-none transition-colors tap",
                          active ? "text-primary-foreground" : "text-muted-foreground bg-secondary hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="exercise-pill"
                            className="absolute inset-0 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 500, damping: 36 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className="h-4 w-4" strokeWidth={2} />
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={exerciseMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {exerciseMode === "pullup-ladder" && ladderLoaded && (
                    <PullUpLadder
                      initialPercent={existingLadder}
                      disabled={ladderDone}
                      onFinish={async (percent) => {
                        setLadderDone(true);
                        const upsertData: any = { workout_date: today, ladder_percent: percent, user_id: user?.id };
                        const { error } = await supabase.from("workout_logs").upsert(upsertData, { onConflict: "workout_date,user_id" });
                        if (error) toast.error("Failed to save ladder progress.");
                        else { haptic("success"); toast.success(`Ladder saved at ${percent}%!`); }
                      }}
                    />
                  )}

                  {exerciseMode === "plank" && (
                    <PlankTimer
                      initialSeconds={existingData?.plank_seconds || 0}
                      disabled={!!(existingData?.plank_seconds && existingData.plank_seconds > 0)}
                      onFinish={(secs) => handleSaveExercise("plank_seconds", secs)}
                    />
                  )}

                  {exerciseMode === "dead-hang" && (
                    <DeadHangTimer
                      initialSeconds={existingData?.deadhang_seconds || 0}
                      disabled={!!(existingData?.deadhang_seconds && existingData.deadhang_seconds > 0)}
                      onFinish={(secs) => handleSaveExercise("deadhang_seconds", secs)}
                    />
                  )}

                  {exerciseMode === "squats" && (
                    <SquatCounter
                      initialData={existingData?.squat_count > 0 ? { count: existingData.squat_count, weight: existingData.squat_weight || 0, unit: existingData.squat_unit || "lb" } : undefined}
                      disabled={!!(existingData?.squat_count && existingData.squat_count > 0)}
                      onFinish={(count, weight, unit) => handleSaveExercise("squat_count", count, { squat_weight: weight, squat_unit: unit })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <StickyActionBar show={(parseInt(pushups) || 0) + (parseInt(situps) || 0) > 0 && !saved}>
        <UIButton
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-base tap"
        >
          {saving ? "Saving..." : `Log Workout`}
        </UIButton>
      </StickyActionBar>
    </div>
  );
}
