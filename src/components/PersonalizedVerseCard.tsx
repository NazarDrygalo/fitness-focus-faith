import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TAGS = ["anxious", "tired", "tempted", "discouraged", "grateful", "afraid"];

export function PersonalizedVerseCard() {
  const [struggle, setStruggle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reference: string; verse: string; why: string } | null>(null);

  const fetchVerse = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { action: "verse_for_struggle", struggle: q },
    });
    setLoading(false);
    if (error || data?.error) { toast.error("Couldn't find a verse"); return; }
    setResult(data);
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5" style={{ color: "hsl(var(--streak))" }} /> Verse for what you're facing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="anxious, tired, tempted…"
            value={struggle}
            onChange={(e) => setStruggle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVerse(struggle)}
            className="bg-secondary border-border"
          />
          <Button onClick={() => fetchVerse(struggle)} disabled={loading || !struggle.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => { setStruggle(t); fetchVerse(t); }}
              className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
        {result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-secondary">
            <p className="text-sm text-foreground leading-relaxed mb-1">"{result.verse}"</p>
            <p className="text-xs text-muted-foreground italic mb-2">— {result.reference}</p>
            {result.why && <p className="text-xs text-muted-foreground">{result.why}</p>}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
