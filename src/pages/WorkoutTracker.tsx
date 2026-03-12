import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { Painting3DViewer } from "@/components/Painting3DViewer";
import { supabase } from "@/integrations/supabase/client";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyMessage } from "@/data/encouragementMessages";
import { getDailyPainting } from "@/data/paintings";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Quote, Palette, Dumbbell } from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function WorkoutTracker() {
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const verse = getDailyVerse();
  const message = getDailyMessage();
  const painting = getDailyPainting();
  const today = format(new Date(), "yyyy-MM-dd");

  const handleSave = async () => {
    const p = parseInt(pushups) || 0;
    const s = parseInt(situps) || 0;
    if (p === 0 && s === 0) { toast.error("Enter at least one exercise count."); return; }

    setSaving(true);
    const { error } = await supabase.from("workout_logs").upsert(
      { workout_date: today, pushups: p, situps: s },
      { onConflict: "workout_date" }
    );
    setSaving(false);

    if (error) {
      toast.error("Failed to save workout.");
    } else {
      setSaved(true);
      toast.success("Workout logged!");
      setTimeout(() => setSaved(false), 2000);
    }
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

        {/* Painting of the Day */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Painting of the Day</CardTitle>
            </CardHeader>
            <CardContent>
              <Painting3DViewer colors={painting.colors} />
              <div className="mt-4">
                <h3 className="text-xl font-bold">{painting.title}</h3>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-2 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">Painter</p>
                    <p className="text-sm font-medium">{painting.painter}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">Year Painted</p>
                    <p className="text-sm font-medium">{painting.yearPainted}</p>
                  </div>
                  <div className="col-span-2 p-2 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">Illustration</p>
                    <p className="text-sm font-medium">{painting.subject}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Drag to rotate • Scroll to zoom</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
