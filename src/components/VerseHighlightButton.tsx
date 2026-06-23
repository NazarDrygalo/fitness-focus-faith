import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

interface Props {
  reference: string;
  verseText: string;
}

export function VerseHighlightButton({ reference, verseText }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("bible_highlights")
        .select("id")
        .eq("user_id", user.id)
        .eq("reference", reference)
        .limit(1);
      if (!cancelled) setSaved(!!data?.length);
    })();
    return () => { cancelled = true; };
  }, [user, reference]);

  const toggle = async () => {
    if (!user) {
      toast({ title: "Sign in to save verses" });
      return;
    }
    setLoading(true);
    haptic("light");
    try {
      if (saved) {
        await supabase
          .from("bible_highlights")
          .delete()
          .eq("user_id", user.id)
          .eq("reference", reference);
        setSaved(false);
        toast({ title: "Removed from highlights" });
      } else {
        const { error } = await supabase.from("bible_highlights").insert({
          user_id: user.id,
          reference,
          verse_text: verseText,
        });
        if (error) throw error;
        setSaved(true);
        toast({ title: "Saved to highlights" });
      }
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading} className="gap-2">
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save verse"}
    </Button>
  );
}
