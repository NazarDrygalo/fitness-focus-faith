import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserRound, Loader2 } from "lucide-react";
import { ensureProfile } from "@/lib/social";
import { haptic } from "@/lib/haptics";

export function ProfileCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [favoriteVerse, setFavoriteVerse] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await ensureProfile(user.id, user.email?.split("@")[0] ?? "Athlete");
      if (p) {
        setDisplayName(p.display_name ?? "");
        setFavoriteVerse(p.favorite_verse ?? "");
        setIsPublic(!!p.is_public);
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), favorite_verse: favoriteVerse.trim() || null, is_public: isPublic })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("Could not save profile");
    haptic("success");
    toast.success("Profile saved");
  };

  const copyLink = () => {
    if (!user) return;
    navigator.clipboard.writeText(`${window.location.origin}/u/${user.id}`);
    toast.success("Profile link copied");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserRound className="h-5 w-5" strokeWidth={1.75} /> Your profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" className="h-12" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How partners see you" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fav-verse">Favorite verse</Label>
              <Input id="fav-verse" className="h-12" value={favoriteVerse} onChange={(e) => setFavoriteVerse(e.target.value)} placeholder="Philippians 4:13" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
              <div>
                <p className="text-sm font-medium">Public profile</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can see your stats</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 h-12" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="outline" className="h-12" onClick={copyLink} disabled={!isPublic}>
                Copy link
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
