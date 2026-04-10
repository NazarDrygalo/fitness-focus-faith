import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyMessage } from "@/data/encouragementMessages";

export function DailyEncouragement() {
  const verse = useMemo(() => getDailyVerse(), []);
  const message = useMemo(() => getDailyMessage(), []);

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
          <CardContent className="p-4 relative">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "hsl(var(--success))" }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Daily Verse</p>
                <p className="text-sm text-foreground italic leading-relaxed">"{verse.verse}"</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">— {verse.reference}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--streak))]/5 to-transparent pointer-events-none" />
          <CardContent className="p-4 relative">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "hsl(var(--streak))" }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Daily Motivation</p>
                <p className="text-sm text-foreground leading-relaxed">"{message}"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
