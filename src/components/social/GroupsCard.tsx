import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trophy, Loader2, Link2, Plus } from "lucide-react";
import { makeInviteCode } from "@/lib/social";
import { haptic } from "@/lib/haptics";

type Group = { id: string; name: string; invite_code: string; owner_id: string };
type Row = { user_id: string; name: string; weekly: number; streak: number };

export function GroupsCard({ joinCode }: { joinCode?: string | null }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [newName, setNewName] = useState("");
  const [code, setCode] = useState("");

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", user.id);
    const ids = (memberships ?? []).map((m) => m.group_id);
    if (ids.length === 0) {
      setGroups([]);
      setActive(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("groups").select("id, name, invite_code, owner_id").in("id", ids);
    const list = (data as Group[]) ?? [];
    setGroups(list);
    setActive((a) => a ?? list[0]?.id ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!active) {
      setRows([]);
      return;
    }
    (async () => {
      const { data: members } = await supabase.from("group_members").select("user_id").eq("group_id", active);
      const ids = (members ?? []).map((m) => m.user_id);
      if (ids.length === 0) return setRows([]);
      const [{ data: profs }, { data: stats }] = await Promise.all([
        supabase.from("profiles").select("id, display_name").in("id", ids),
        supabase.from("user_stats").select("user_id, weekly_workouts, current_streak").in("user_id", ids),
      ]);
      const nameOf = new Map((profs ?? []).map((p) => [p.id, p.display_name]));
      const statOf = new Map((stats ?? []).map((s) => [s.user_id, s]));
      setRows(
        ids
          .map((id) => ({
            user_id: id,
            name: nameOf.get(id) ?? "Member",
            weekly: statOf.get(id)?.weekly_workouts ?? 0,
            streak: statOf.get(id)?.current_streak ?? 0,
          }))
          .sort((a, b) => b.weekly - a.weekly || b.streak - a.streak)
      );
    })();
  }, [active]);

  const createGroup = async () => {
    if (!user || !newName.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("groups")
      .insert({ name: newName.trim(), owner_id: user.id, invite_code: makeInviteCode(6) })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
      setActive(data.id);
    }
    setBusy(false);
    if (error) return toast.error("Could not create group");
    haptic("success");
    setNewName("");
    toast.success("Group created");
    loadGroups();
  };

  const join = useCallback(
    async (c: string) => {
      if (!c.trim()) return;
      setBusy(true);
      const { data, error } = await supabase.rpc("join_group_by_code", { _code: c.trim().toUpperCase() });
      setBusy(false);
      if (error) return toast.error(error.message);
      haptic("success");
      setCode("");
      setActive(data as string);
      toast.success("Joined group");
      loadGroups();
    },
    [loadGroups]
  );

  useEffect(() => {
    if (joinCode && !loading) join(joinCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode, loading]);

  const shareGroup = async () => {
    const g = groups.find((x) => x.id === active);
    if (!g) return;
    const url = `${window.location.origin}/social?group=${g.invite_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${g.name} on GRIND`, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    navigator.clipboard.writeText(url);
    toast.success("Group link copied");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" strokeWidth={1.75} /> Groups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            {groups.length > 0 && (
              <>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {groups.map((g) => (
                    <Button
                      key={g.id}
                      variant={active === g.id ? "default" : "outline"}
                      className="h-10 shrink-0 rounded-full"
                      onClick={() => setActive(g.id)}
                    >
                      {g.name}
                    </Button>
                  ))}
                </div>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {rows.map((r, i) => (
                    <div key={r.user_id} className="flex items-center justify-between px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                        <span className="truncate text-sm font-medium">
                          {r.name}
                          {r.user_id === user?.id && " (you)"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{r.weekly}</p>
                        <p className="text-[11px] text-muted-foreground">{r.streak}d streak</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-12" onClick={shareGroup}>
                  <Link2 className="h-4 w-4 mr-2" /> Invite to group
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Input className="h-12" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New group name" />
              <Button className="h-12" onClick={createGroup} disabled={busy || !newName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                className="h-12 uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="GROUP CODE"
              />
              <Button variant="outline" className="h-12" onClick={() => join(code)} disabled={busy || !code.trim()}>
                Join
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
