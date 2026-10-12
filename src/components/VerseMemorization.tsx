import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { reviewCard, addDays, type Grade } from "@/lib/srs";
import { localISO } from "@/lib/bibleStreak";
import { haptic } from "@/lib/haptics";

interface CardRow { id: string; reference: string; verse_text: string; ease: number; interval_days: number; }

export function VerseMemorization() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<CardRow[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, count } = await supabase
        .from("bible_highlights")
        .select("id, reference, verse_text, ease, interval_days", { count: "exact" })
        .eq("user_id", user.id)
        .lte("due_on", localISO())
        .order("due_on");
      setQueue((data ?? []) as CardRow[]);
      const { count: all } = await supabase
        .from("bible_highlights").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      setTotal(all ?? count ?? 0);
    })();
  }, [user]);

  if (!user || total === 0) return null;
  const card = queue[0];

  const grade = async (g: Grade) => {
    if (!card) return;
    haptic(g === "again" ? "warning" : "light");
    const { ease, interval } = reviewCard(Number(card.ease), card.interval_days, g);
    await supabase.from("bible_highlights").update({
      ease, interval_days: interval, due_on: addDays(localISO(), interval),
    }).eq("id", card.id);
    setRevealed(false);
    setReviewed((r) => r + 1);
    setQueue((q) => (g === "again" ? [...q.slice(1), { ...card, ease, interval_days: 0 }] : q.slice(1)));
  };

  // Hide every other word as the prompt
  const masked = card?.verse_text.split(" ").map((w, i) => (i % 2 ? "____" : w)).join(" ");

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5" /> Memorize</CardTitle>
      </CardHeader>
      <CardContent>
        {!card ? (
          <p className="text-sm text-muted-foreground">
            {reviewed ? `Nice — ${reviewed} reviewed. ` : ""}All caught up. Come back tomorrow.
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={card.id + revealed} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="text-xs text-muted-foreground mb-2">{queue.length} due · {card.reference}</p>
              <p className="text-sm leading-relaxed mb-4">{revealed ? card.verse_text : masked}</p>
              {!revealed ? (
                <Button className="w-full h-12" onClick={() => setRevealed(true)}>Reveal</Button>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" className="h-12" onClick={() => grade("again")}><RotateCcw className="h-4 w-4" /></Button>
                  <Button variant="outline" className="h-12" onClick={() => grade("hard")}>Hard</Button>
                  <Button variant="outline" className="h-12" onClick={() => grade("good")}>Good</Button>
                  <Button className="h-12" onClick={() => grade("easy")}>Easy</Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
