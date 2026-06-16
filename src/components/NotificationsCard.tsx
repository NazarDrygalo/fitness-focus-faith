import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { enablePush, disablePush, hasActiveSubscription, pushSupported } from "@/lib/push";

type Prefs = {
  workout_reminder_enabled: boolean;
  workout_reminder_time: string;
  verse_enabled: boolean;
  verse_time: string;
  streak_at_risk_enabled: boolean;
  streak_at_risk_time: string;
  timezone: string;
};

const DEFAULTS: Prefs = {
  workout_reminder_enabled: false,
  workout_reminder_time: "07:00",
  verse_enabled: false,
  verse_time: "06:00",
  streak_at_risk_enabled: true,
  streak_at_risk_time: "20:00",
  timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
};

export function NotificationsCard() {
  const { user } = useAuth();
  const [supported] = useState(pushSupported());
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sub = await hasActiveSubscription().catch(() => false);
      setEnabled(!!sub);
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          workout_reminder_enabled: data.workout_reminder_enabled,
          workout_reminder_time: data.workout_reminder_time?.slice(0, 5) ?? DEFAULTS.workout_reminder_time,
          verse_enabled: data.verse_enabled,
          verse_time: data.verse_time?.slice(0, 5) ?? DEFAULTS.verse_time,
          streak_at_risk_enabled: data.streak_at_risk_enabled,
          streak_at_risk_time: data.streak_at_risk_time?.slice(0, 5) ?? DEFAULTS.streak_at_risk_time,
          timezone: data.timezone ?? DEFAULTS.timezone,
        });
      }
      setLoaded(true);
    })();
  }, [user]);

  const updatePref = async (patch: Partial<Prefs>) => {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          ...next,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || next.timezone,
        },
        { onConflict: "user_id" },
      );
    if (error) toast.error("Could not save preferences");
  };

  const toggleEnable = async (on: boolean) => {
    if (!user) return;
    setBusy(true);
    try {
      if (on) {
        await enablePush(user.id);
        setEnabled(true);
        toast.success("Notifications enabled");
      } else {
        await disablePush(user.id);
        setEnabled(false);
        toast.success("Notifications turned off");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update notifications");
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("send-test-push");
    setBusy(false);
    if (error) return toast.error("Test failed");
    if ((data as any)?.sent > 0) toast.success("Test sent — check your device");
    else toast.message("No active devices subscribed");
  };

  if (!supported) {
    return (
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BellOff className="h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>
            This browser doesn't support push notifications. Install GRIND to your home screen on iOS 16.4+ or use Chrome/Edge/Firefox on desktop.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notifications
        </CardTitle>
        <CardDescription>Daily reminders to grind and read scripture.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <div>
            <p className="text-sm font-medium">Enable on this device</p>
            <p className="text-xs text-muted-foreground">Required for any reminders below.</p>
          </div>
          <Button
            variant={enabled ? "outline" : "default"}
            disabled={busy}
            onClick={() => toggleEnable(!enabled)}
            className="h-10 px-4 tap"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : enabled ? "Turn off" : "Enable"}
          </Button>
        </div>

        <div className={`space-y-5 ${!enabled || !loaded ? "opacity-50 pointer-events-none" : ""}`}>
          <Row
            label="Workout reminder"
            sub="Daily nudge to log your set"
            checked={prefs.workout_reminder_enabled}
            onChecked={(v) => updatePref({ workout_reminder_enabled: v })}
            time={prefs.workout_reminder_time}
            onTime={(t) => updatePref({ workout_reminder_time: t })}
          />
          <Row
            label="Daily verse"
            sub="Today's reading from Bible Study"
            checked={prefs.verse_enabled}
            onChecked={(v) => updatePref({ verse_enabled: v })}
            time={prefs.verse_time}
            onTime={(t) => updatePref({ verse_time: t })}
          />
          <Row
            label="Streak at risk"
            sub="Evening ping if you haven't logged today"
            checked={prefs.streak_at_risk_enabled}
            onChecked={(v) => updatePref({ streak_at_risk_enabled: v })}
            time={prefs.streak_at_risk_time}
            onTime={(t) => updatePref({ streak_at_risk_time: t })}
          />

          <Button variant="outline" onClick={sendTest} disabled={busy || !enabled} className="w-full h-11 gap-2 tap">
            <Send className="h-4 w-4" /> Send test notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label, sub, checked, onChecked, time, onTime,
}: {
  label: string; sub: string;
  checked: boolean; onChecked: (v: boolean) => void;
  time: string; onTime: (t: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <Input
        type="time"
        value={time}
        onChange={(e) => onTime(e.target.value)}
        className="w-[110px] h-10 bg-secondary border-border"
        disabled={!checked}
      />
      <Switch checked={checked} onCheckedChange={onChecked} />
    </div>
  );
}
