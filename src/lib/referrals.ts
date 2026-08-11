import { supabase } from "@/integrations/supabase/client";
import { grantFreeze } from "@/lib/freezeTokens";

export interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string;
  code: string;
  rewarded: boolean;
  created_at: string;
}

export function referralLink(userId: string) {
  return `${window.location.origin}/social?ref=${userId}`;
}

/** Called by a newly-signed-up user arriving through a referral link. */
export async function recordReferral(referredId: string, referrerId: string) {
  if (!referrerId || referrerId === referredId) return false;
  const { error } = await supabase
    .from("referrals")
    .insert({ referred_id: referredId, referrer_id: referrerId, code: referrerId });
  return !error;
}

/** Mark my referral as earned once I've logged 7 workouts in my first week. */
export async function maybeMarkReferralEarned(referredId: string, totalWorkouts: number) {
  if (totalWorkouts < 7) return;
  const { data } = await supabase
    .from("referrals")
    .select("id,rewarded")
    .eq("referred_id", referredId)
    .maybeSingle();
  if (data && !data.rewarded) {
    await supabase.from("referrals").update({ rewarded: true }).eq("id", data.id);
  }
}

const GRANTED_KEY = (uid: string) => `grindfaith.referralGrants.${uid}`;

function granted(uid: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(GRANTED_KEY(uid)) ?? "[]");
  } catch {
    return [];
  }
}

/** Fetch my referrals and convert newly-earned ones into freeze tokens. */
export async function syncReferralRewards(userId: string) {
  const { data } = await supabase
    .from("referrals")
    .select("id,referrer_id,referred_id,code,rewarded,created_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as ReferralRow[];
  const already = granted(userId);
  const newlyEarned = rows.filter((r) => r.rewarded && !already.includes(r.id));
  if (newlyEarned.length) {
    grantFreeze(userId, newlyEarned.length);
    try {
      localStorage.setItem(GRANTED_KEY(userId), JSON.stringify([...already, ...newlyEarned.map((r) => r.id)]));
    } catch {
      /* ignore */
    }
  }
  return { rows, awarded: newlyEarned.length };
}
