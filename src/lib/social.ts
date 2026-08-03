import { supabase } from "@/integrations/supabase/client";

export function makeInviteCode(len = 8) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Monday-based start of the current week (local). */
export function weekStart(base = new Date()) {
  const d = new Date(base);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function streakFromDates(dates: string[]) {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  // Allow today to be missing without breaking the streak.
  if (!set.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Recomputes the shareable stats row from the user's workout logs. */
export async function syncUserStats(userId: string) {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("workout_date")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false });
  if (error || !data) return;

  const dates = data.map((r) => r.workout_date as string);
  const ws = isoDate(weekStart());
  await supabase.from("user_stats").upsert(
    {
      user_id: userId,
      current_streak: streakFromDates(dates),
      weekly_workouts: dates.filter((d) => d >= ws).length,
      total_workouts: dates.length,
      last_workout_date: dates[0] ?? null,
    },
    { onConflict: "user_id" }
  );
}

export async function ensureProfile(userId: string, fallbackName: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (data) return data;
  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: userId, display_name: fallbackName })
    .select()
    .maybeSingle();
  return created;
}
