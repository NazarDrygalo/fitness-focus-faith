import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { computeReadingStreak, localISO, markReadToday } from "@/lib/bibleStreak";
import { haptic } from "@/lib/haptics";

export function ReadingStreakCard() {
  const { user } = useAuth();
  const [dates, setDates] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bible_reading_days")
      .select("read_on")
      .eq("user_id", user.id)
      .order("read_on", { ascending: false })
      .limit(400);
    setDates((data ?? []).map((r) => r.read_on));
  }, [user]);

  useEffect(() => {
    load();
    window.addEventListener("bible-read", load);
    return () => window.removeEventListener("bible-read", load);
  }, [load]);

  if (!user) return null;
  const streak = computeReadingStreak(dates);
  const readToday = dates.includes(localISO());

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold leading-none">{streak} <span className="text-sm font-normal text-muted-foreground">day reading streak</span></p>
            <p className="text-xs text-muted-foreground mt-1">{dates.length} total days in the Word</p>
          </div>
          <Button
            size="sm"
            variant={readToday ? "outline" : "default"}
            disabled={readToday}
            onClick={async () => { haptic("success"); await markReadToday(user.id); }}
            className="gap-1"
          >
            <Check className="h-4 w-4" /> {readToday ? "Read" : "I read today"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
