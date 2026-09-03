import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { Loader2, Flame } from "lucide-react";

type Profile = { display_name: string; favorite_verse: string | null; is_public: boolean };
type Stats = { current_streak: number; weekly_workouts: number; total_workouts: number };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Guard against malformed ids — querying with a non-uuid throws a 400.
    if (!id || !UUID_RE.test(id)) {
      setProfile(null);
      setStats(null);
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("display_name, favorite_verse, is_public").eq("id", id).maybeSingle(),
        supabase.from("user_stats").select("current_streak, weekly_workouts, total_workouts").eq("user_id", id).maybeSingle(),
      ]);
      setProfile((p as Profile) ?? null);
      setStats((s as Stats) ?? null);
      setLoading(false);
    })();
  }, [id]);


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <PageMeta
        title={profile ? `${profile.display_name} · GRIND` : "Profile · GRIND"}
        description="A GRIND athlete profile with streak and consistency stats."
        path={`/u/${id ?? ""}`}
      />
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : !profile ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Profile unavailable</h1>
          <p className="text-sm text-muted-foreground mb-5">This profile is private or doesn't exist.</p>
          <Button asChild className="h-12">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      ) : (
        <Card className="bg-card border-border w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
              {profile.favorite_verse && (
                <p className="text-sm text-muted-foreground mt-1">{profile.favorite_verse}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xl font-semibold flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                  {stats?.current_streak ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground">Streak</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.weekly_workouts ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">This week</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.total_workouts ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full h-12">
              <Link to="/">Start your own streak</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
