import { supabase } from "@/integrations/supabase/client";

export function localISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Consecutive days read ending today (or yesterday, if today not yet read). */
export function computeReadingStreak(dates: string[], today = localISO()): number {
  const set = new Set(dates);
  const d = new Date(today + "T12:00:00");
  if (!set.has(localISO(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(localISO(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export async function markReadToday(userId: string) {
  await supabase
    .from("bible_reading_days")
    .upsert({ user_id: userId, read_on: localISO() }, { onConflict: "user_id,read_on", ignoreDuplicates: true });
  window.dispatchEvent(new Event("bible-read"));
}
