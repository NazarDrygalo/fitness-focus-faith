// Cron-triggered: sends due web push notifications (workout / verse / streak-at-risk).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@grindfaith.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type Pref = {
  user_id: string;
  workout_reminder_enabled: boolean;
  workout_reminder_time: string;
  verse_enabled: boolean;
  verse_time: string;
  streak_at_risk_enabled: boolean;
  streak_at_risk_time: string;
  timezone: string;
  last_workout_sent_on: string | null;
  last_verse_sent_on: string | null;
  last_streak_sent_on: string | null;
};

type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

function localParts(tz: string) {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  } catch {
    return null;
  }
}
function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

async function sendToUser(userId: string, payload: Record<string, unknown>) {
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .eq("user_id", userId);
  if (!subs?.length) return 0;
  let ok = 0;
  for (const s of subs as Sub[]) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      );
      ok++;
    } catch (e: any) {
      const code = e?.statusCode;
      if (code === 404 || code === 410) {
        await admin.from("push_subscriptions").delete().eq("id", s.id);
      } else {
        console.error("push error", code, e?.body ?? e?.message);
      }
    }
  }
  return ok;
}

async function loggedToday(userId: string, localDate: string) {
  const { count } = await admin
    .from("workout_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("workout_date", localDate);
  return (count ?? 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { data: prefs, error } = await admin
      .from("notification_preferences")
      .select("*");
    if (error) throw error;

    const WINDOW = 10; // minutes — generous window in case cron fires slightly late
    let sent = 0;

    for (const p of (prefs ?? []) as Pref[]) {
      const local = localParts(p.timezone);
      if (!local) continue;
      const nowMin = local.minutes;

      // Workout reminder
      if (
        p.workout_reminder_enabled &&
        p.last_workout_sent_on !== local.date &&
        Math.abs(nowMin - timeToMinutes(p.workout_reminder_time)) <= WINDOW
      ) {
        const c = await sendToUser(p.user_id, {
          title: "Time to grind 💪",
          body: "Your daily workout is waiting. Log it in under a minute.",
          tag: "workout-reminder",
          url: "/workout",
        });
        if (c) {
          sent += c;
          await admin.from("notification_preferences")
            .update({ last_workout_sent_on: local.date })
            .eq("user_id", p.user_id);
        }
      }

      // Daily verse
      if (
        p.verse_enabled &&
        p.last_verse_sent_on !== local.date &&
        Math.abs(nowMin - timeToMinutes(p.verse_time)) <= WINDOW
      ) {
        const c = await sendToUser(p.user_id, {
          title: "Today's verse 📖",
          body: "Open Bible Study for today's reading and reflection.",
          tag: "daily-verse",
          url: "/bible",
        });
        if (c) {
          sent += c;
          await admin.from("notification_preferences")
            .update({ last_verse_sent_on: local.date })
            .eq("user_id", p.user_id);
        }
      }

      // Streak at risk
      if (
        p.streak_at_risk_enabled &&
        p.last_streak_sent_on !== local.date &&
        Math.abs(nowMin - timeToMinutes(p.streak_at_risk_time)) <= WINDOW
      ) {
        const did = await loggedToday(p.user_id, local.date);
        if (!did) {
          const c = await sendToUser(p.user_id, {
            title: "Don't break the chain 🔥",
            body: "You haven't logged today. A quick set keeps your streak alive.",
            tag: "streak-at-risk",
            url: "/",
          });
          if (c) {
            sent += c;
            await admin.from("notification_preferences")
              .update({ last_streak_sent_on: local.date })
              .eq("user_id", p.user_id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
