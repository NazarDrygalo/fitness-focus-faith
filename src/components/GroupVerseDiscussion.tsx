import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { localISO } from "@/lib/bibleStreak";
import { toast } from "@/hooks/use-toast";

interface Post { id: string; user_id: string; message: string; created_at: string; }

export function GroupVerseDiscussion({ reference }: { reference: string }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const today = localISO();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mem } = await supabase.from("group_members").select("group_id").eq("user_id", user.id);
      const ids = (mem ?? []).map((m) => m.group_id);
      if (!ids.length) return;
      const { data } = await supabase.from("groups").select("id, name").in("id", ids);
      setGroups(data ?? []);
      setGroupId(data?.[0]?.id ?? null);
    })();
  }, [user]);

  const load = useCallback(async () => {
    if (!groupId) return;
    const { data } = await supabase.from("group_verse_posts").select("id, user_id, message, created_at")
      .eq("group_id", groupId).eq("verse_date", today).order("created_at");
    const list = data ?? [];
    setPosts(list);
    const ids = [...new Set(list.map((p) => p.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", ids);
      setNames(Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name])));
    }
  }, [groupId, today]);

  useEffect(() => { load(); }, [load]);

  if (!user || !groups.length) return null;

  const send = async () => {
    const m = msg.trim();
    if (!m || !groupId) return;
    const { error } = await supabase.from("group_verse_posts").insert({
      group_id: groupId, user_id: user.id, verse_date: today, reference, message: m.slice(0, 500),
    });
    if (error) return toast({ title: "Couldn't post", variant: "destructive" });
    setMsg("");
    load();
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><MessagesSquare className="h-5 w-5" /> Group Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.length > 1 && (
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
            {groups.map((g) => (
              <Button key={g.id} size="sm" variant={g.id === groupId ? "default" : "outline"} onClick={() => setGroupId(g.id)}>{g.name}</Button>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Today's verse · {reference}</p>
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          <AnimatePresence initial={false}>
            {posts.map((p) => (
              <motion.li key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg px-3 py-2 text-sm ${p.user_id === user.id ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8"}`}>
                <p className="text-xs opacity-70 mb-0.5">{p.user_id === user.id ? "You" : names[p.user_id] ?? "Member"}</p>
                {p.message}
              </motion.li>
            ))}
          </AnimatePresence>
          {!posts.length && <p className="text-sm text-muted-foreground">Be the first to share a thought.</p>}
        </ul>
        <div className="flex gap-2">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Share what stood out…" maxLength={500} className="h-12" />
          <Button size="icon" className="h-12 w-12 shrink-0" onClick={send} aria-label="Send"><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
