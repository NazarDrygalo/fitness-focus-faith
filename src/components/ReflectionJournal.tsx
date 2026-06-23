import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PenLine, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { getReflectionPrompt } from "@/data/readingPlans";

interface Props { reference: string; }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ReflectionJournal({ reference }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const date = todayISO();
  const prompt = useMemo(() => {
    const seed = date.split("-").reduce((a, b) => a + Number(b), 0);
    return getReflectionPrompt(seed);
  }, [date]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("bible_reflections")
        .select("content, updated_at")
        .eq("user_id", user.id)
        .eq("reflection_date", date)
        .maybeSingle();
      if (data) {
        setContent(data.content);
        setSavedAt(data.updated_at);
      }
      setLoading(false);
    })();
  }, [user, date]);

  const save = async () => {
    if (!user) {
      toast({ title: "Sign in to journal" });
      return;
    }
    if (!content.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("bible_reflections").upsert({
        user_id: user.id,
        reflection_date: date,
        reference,
        prompt,
        content: content.trim(),
      }, { onConflict: "user_id,reflection_date" });
      if (error) throw error;
      setSavedAt(new Date().toISOString());
      toast({ title: "Reflection saved" });
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PenLine className="h-5 w-5" /> Reflection Journal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground italic">{prompt}</p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={user ? "Write a few sentences…" : "Sign in to start journaling."}
            disabled={!user || loading}
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Saved · ${new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Private to you"}
            </span>
            <Button size="sm" onClick={save} disabled={saving || !user || !content.trim()} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
