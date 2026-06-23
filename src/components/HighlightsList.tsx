import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Highlight {
  id: string;
  reference: string;
  verse_text: string;
  created_at: string;
}

export function HighlightsList({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Highlight[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("bible_highlights")
        .select("id, reference, verse_text, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
    })();
  }, [user, refreshKey]);

  const remove = async (id: string) => {
    await supabase.from("bible_highlights").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Highlight removed" });
  };

  if (!user || items.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5" /> Highlights ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((h) => (
                <motion.li
                  key={h.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start gap-3 border-l-2 border-primary pl-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">"{h.verse_text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">{h.reference}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(h.id)} aria-label="Remove highlight">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
