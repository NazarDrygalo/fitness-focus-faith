import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandHeart, Plus, Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

interface Prayer { id: string; title: string; answered: boolean; answered_at: string | null; created_at: string; }

export function PrayerJournal() {
  const { user } = useAuth();
  const [items, setItems] = useState<Prayer[]>([]);
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<"open" | "answered">("open");

  useEffect(() => {
    if (!user) return;
    supabase.from("prayer_entries").select("id, title, answered, answered_at, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Prayer[]));
  }, [user]);

  if (!user) return null;

  const add = async () => {
    const t = title.trim();
    if (!t) return;
    const { data, error } = await supabase.from("prayer_entries")
      .insert({ user_id: user.id, title: t.slice(0, 200) })
      .select("id, title, answered, answered_at, created_at").single();
    if (error) return toast({ title: "Couldn't save", variant: "destructive" });
    haptic("light");
    setItems((p) => [data as Prayer, ...p]);
    setTitle("");
  };

  const toggle = async (p: Prayer) => {
    const answered = !p.answered;
    const answered_at = answered ? new Date().toISOString() : null;
    await supabase.from("prayer_entries").update({ answered, answered_at }).eq("id", p.id);
    if (answered) { haptic("success"); toast({ title: "Praise God — marked answered" }); }
    setItems((list) => list.map((x) => (x.id === p.id ? { ...x, answered, answered_at } : x)));
  };

  const remove = async (id: string) => {
    await supabase.from("prayer_entries").delete().eq("id", id);
    setItems((list) => list.filter((x) => x.id !== id));
  };

  const shown = items.filter((i) => (tab === "answered" ? i.answered : !i.answered));

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><HandHeart className="h-5 w-5" /> Prayer Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="What are you praying for?" maxLength={200} className="h-12" />
          <Button size="icon" className="h-12 w-12 shrink-0" onClick={add} aria-label="Add prayer"><Plus className="h-5 w-5" /></Button>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["open", "answered"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-9 rounded-md text-sm capitalize transition ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t} ({items.filter((i) => (t === "answered" ? i.answered : !i.answered)).length})
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {shown.map((p) => (
              <motion.li key={p.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2">
                <button onClick={() => toggle(p)} aria-label="Toggle answered"
                  className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${p.answered ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                  {p.answered && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.answered && p.answered_at ? `Answered ${new Date(p.answered_at).toLocaleDateString()}` : new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete prayer"><Trash2 className="h-4 w-4" /></Button>
              </motion.li>
            ))}
          </AnimatePresence>
          {shown.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
        </ul>
      </CardContent>
    </Card>
  );
}
