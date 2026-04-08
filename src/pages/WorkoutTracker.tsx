import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { PullUpLadder } from "@/components/PullUpLadder";
import { PlankTimer } from "@/components/PlankTimer";
import { DeadHangTimer } from "@/components/DeadHangTimer";
import { SquatCounter } from "@/components/SquatCounter";
import { supabase } from "@/integrations/supabase/client";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyMessage } from "@/data/encouragementMessages";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Quote, Dumbbell, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

type ExerciseMode = "pullup-ladder" | "plank" | "dead-hang" | "squats";

export default function WorkoutTracker() {
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("pullup-ladder");

  // Pull-up ladder state
  const [ladderDone, setLadderDone] = useState(false);
  const [existingLadder, setExistingLadder] = useState<number>(0);
  const [ladderLoaded, setLadderLoaded] = useState(false);

  // Existing exercise data for today
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
    const { data: existing } = await supabase
      .from("workout_logs")
      .select("pushups, situps")
      .eq("workout_date", today)
      .maybeSingle();

    const newPushups = (existing?.pushups || 0) + p;
    const newSitups = (existing?.situps || 0) + s;

    const upsertData: any = { workout_date: today, pushups: newPushups, situps: newSitups, user_id: user?.id };
    const { error } = await supabase.from("workout_logs").upsert(upsertData, { onConflict: "workout_date,user_id" });
    setSaving(false);

    if (error) {
      toast.error("Failed to save workout.");
    } else {
      setSaved(true);
      toast.success(`Workout logged! Today's total: ${newPushups} pushups, ${newSitups} situps`);
      setPushups("");
      setSitups("");
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
      toast.success(`${labels[field] || "Exercise"} saved!`);
      // Refresh existing data
      const { data } = await supabase.from("workout_logs").select("*").eq("workout_date", today).maybeSingle();
      if (data) setExistingData(data);
    }
  };

  const exerciseLabels: Record<ExerciseMode, string> = {
    "pullup-ladder": "Pull-Up Ladder",
    "plank": "Plank",
    "dead-hang": "Dead Hang",
    "squats": "Squats",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-1">Daily Workout</h1>
          <p className="text-muted-foreground mb-8">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </motion.div>

        {/* Workout Input */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Log Today's Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="pushups" className="text-sm text-muted-foreground">Pushups</Label>
                  <Input id="pushups" type="number" min="0" placeholder="0" value={pushups} onChange={e => setPushups(e.target.value)} className="mt-1 bg-secondary border-border no-spinners" />
                </div>
                <div>
                  <Label htmlFor="situps" className="text-sm text-muted-foreground">Situps</Label>
                  <Input id="situps" type="number" min="0" placeholder="0" value={situps} onChange={e => setSitups(e.target.value)} className="mt-1 bg-secondary border-border no-spinners" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full transition-all duration-300 active-scale">
                {saved ? <><Check className="h-4 w-4 mr-2" /> Saved!</> : saving ? "Saving..." : "Log Workout"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encouragement */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border mb-6 hover-lift">
            <CardContent className="p-6">
              <p className="text-lg font-medium text-center italic text-foreground leading-relaxed">
                "{message}"
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bible Verse */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border mb-6 hover-lift">
            <CardContent className="p-6">
              <Quote className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-base leading-relaxed text-foreground mb-3">
                "{verse.verse}"
              </p>
              <p className="text-sm text-muted-foreground font-medium">— {verse.reference} (NIV)</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Section with Dropdown */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2 shrink-0">
                  <ArrowUpDown className="h-5 w-5" /> Exercise
                </CardTitle>
                <Select value={exerciseMode} onValueChange={(v) => setExerciseMode(v as ExerciseMode)}>
                  <SelectTrigger className="w-48 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pullup-ladder">Pull-Up Ladder</SelectItem>
                    <SelectItem value="plank">Plank</SelectItem>
                    <SelectItem value="dead-hang">Dead Hang</SelectItem>
                    <SelectItem value="squats">Squats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
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
                        else toast.success(`Ladder saved at ${percent}%!`);
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
    </div>
  );
}
