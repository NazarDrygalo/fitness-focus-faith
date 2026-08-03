import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Loader2, Flame, Link2 } from "lucide-react";
import { isoDate, makeInviteCode, weekStart } from "@/lib/social";
import { haptic } from "@/lib/haptics";

type Partnership = { id: string; inviter_id: string; invitee_id: string | null; invite_code: string; status: string };
type Stats = { current_streak: number; weekly_workouts: number; total_workouts: number };

const CHEERS = ["🔥", "💪", "🙌", "🙏"];

export function PartnerCard({ joinCode }: { joinCode?: string | null }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerStats, setPartnerStats] = useState<Stats | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [checkIns, setCheckIns] = useState<{ id: string; message: string; from_user_id: string; week_start: string }[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("partnerships")
      .select("id, inviter_id, invitee_id, invite_code, status")
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1);
    const p = (data?.[0] as Partnership) ?? null;
    setPartnership(p);

    if (p?.status === "accepted") {
      const partnerId = p.inviter_id === user.id ? p.invitee_id! : p.inviter_id;
      const [{ data: prof }, { data: stats }, { data: ci }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", partnerId).maybeSingle(),
        supabase.from("user_stats").select("current_streak, weekly_workouts, total_workouts").eq("user_id", partnerId).maybeSingle(),
        supabase
          .from("check_ins")
          .select("id, message, from_user_id, week_start")
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
          .order("week_start", { ascending: false })
          .limit(5),
      ]);
      setPartnerName(prof?.display_name ?? "Your partner");
      setPartnerStats((stats as Stats) ?? null);
      setCheckIns(ci ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = useCallback(
    async (c: string) => {
      if (!c.trim()) return;
      setBusy(true);
      const { error } = await supabase.rpc("accept_partner_invite", { _code: c.trim().toUpperCase() });
      setBusy(false);
      if (error) return toast.error(error.message);
      haptic("success");
      toast.success("You're connected");
      setCode("");
      load();
    },
    [load]
  );

  useEffect(() => {
    if (joinCode && !loading && !partnership) accept(joinCode);
  }, [joinCode, loading, partnership, accept]);

  const createInvite = async () => {
    if (!user) return;
    setBusy(true);
    const invite_code = makeInviteCode();
    const { error } = await supabase.from("partnerships").insert({ inviter_id: user.id, invite_code, status: "pending" });
    setBusy(false);
    if (error) return toast.error("Could not create invite");
    haptic("medium");
    load();
  };

  const shareInvite = async () => {
    if (!partnership) return;
    const url = `${window.location.origin}/social?join=${partnership.invite_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Be my accountability partner", url });
        return;
      } catch {
        /* cancelled */
      }
    }
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied");
  };

  const cheer = async (emoji: string) => {
    if (!user || !partnership) return;
    const partnerId = partnership.inviter_id === user.id ? partnership.invitee_id! : partnership.inviter_id;
    const { error } = await supabase.from("cheers").insert({ from_user_id: user.id, to_user_id: partnerId, emoji });
    if (error) return toast.error("Could not send cheer");
    haptic("success");
    toast.success(`${emoji} sent to ${partnerName}`);
  };

  const sendCheckIn = async () => {
    if (!user || !partnership || !message.trim()) return;
    const partnerId = partnership.inviter_id === user.id ? partnership.invitee_id! : partnership.inviter_id;
    setBusy(true);
    const { error } = await supabase.from("check_ins").insert({
      from_user_id: user.id,
      to_user_id: partnerId,
      week_start: isoDate(weekStart()),
      message: message.trim(),
    });
    setBusy(false);
    if (error) return toast.error("Check-in already sent this week");
    haptic("success");
    setMessage("");
    toast.success("Check-in sent");
    load();
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" strokeWidth={1.75} /> Accountability partner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : partnership?.status === "accepted" ? (
          <>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium mb-3">{partnerName}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-semibold flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    {partnerStats?.current_streak ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Streak</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{partnerStats?.weekly_workouts ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">This week</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{partnerStats?.total_workouts ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {CHEERS.map((e) => (
                <Button key={e} variant="outline" className="flex-1 h-12 text-xl" onClick={() => cheer(e)}>
                  {e}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Weekly check-in message…"
                rows={3}
              />
              <Button className="w-full h-12" onClick={sendCheckIn} disabled={busy || !message.trim()}>
                Send check-in
              </Button>
            </div>

            {checkIns.length > 0 && (
              <div className="space-y-2">
                {checkIns.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border px-3 py-2">
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      {c.from_user_id === user?.id ? "You" : partnerName} · week of {c.week_start}
                    </p>
                    <p className="text-sm">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {partnership ? (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Invite pending. Share your link:</p>
                <p className="font-mono text-lg tracking-widest">{partnership.invite_code}</p>
                <Button className="w-full h-12" onClick={shareInvite}>
                  <Link2 className="h-4 w-4 mr-2" /> Share invite link
                </Button>
              </div>
            ) : (
              <Button className="w-full h-12" onClick={createInvite} disabled={busy}>
                Create invite link
              </Button>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Got a code from a friend?</p>
              <div className="flex gap-2">
                <Input
                  className="h-12 uppercase"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="INVITE CODE"
                />
                <Button className="h-12" onClick={() => accept(code)} disabled={busy || !code.trim()}>
                  Join
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
