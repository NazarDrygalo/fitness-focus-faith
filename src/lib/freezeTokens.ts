// Freeze tokens: bridge a single missed day in the user's streak.
// Stored locally so we don't need a schema change. Keyed per-user.

const KEY = (uid: string) => `grindfaith.freeze.${uid}`;
const MAX_TOKENS = 3;
const EARN_EVERY = 7; // 1 token per 7-day streak completion

interface FreezeState {
  available: number;
  // Streak length values at which we have already granted a token.
  awardedAt: number[];
  // Dates (yyyy-MM-dd) where a freeze was consumed.
  usedOn: string[];
}

function read(uid: string): FreezeState {
  try {
    const raw = localStorage.getItem(KEY(uid));
    if (!raw) return { available: 0, awardedAt: [], usedOn: [] };
    const parsed = JSON.parse(raw);
    return {
      available: Number(parsed.available) || 0,
      awardedAt: Array.isArray(parsed.awardedAt) ? parsed.awardedAt : [],
      usedOn: Array.isArray(parsed.usedOn) ? parsed.usedOn : [],
    };
  } catch {
    return { available: 0, awardedAt: [], usedOn: [] };
  }
}

function write(uid: string, state: FreezeState) {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getFreezeState(uid: string | null | undefined) {
  if (!uid) return { available: 0, awardedAt: [], usedOn: [] } as FreezeState;
  return read(uid);
}

/** Award new freeze tokens for each multiple of EARN_EVERY days reached. */
export function syncFreezeAwards(uid: string | null | undefined, currentStreak: number) {
  if (!uid || currentStreak < EARN_EVERY) return getFreezeState(uid);
  const state = read(uid);
  const eligibleMilestones: number[] = [];
  for (let m = EARN_EVERY; m <= currentStreak; m += EARN_EVERY) {
    eligibleMilestones.push(m);
  }
  let granted = 0;
  for (const m of eligibleMilestones) {
    if (!state.awardedAt.includes(m)) {
      state.awardedAt.push(m);
      granted++;
    }
  }
  if (granted > 0) {
    state.available = Math.min(MAX_TOKENS, state.available + granted);
    write(uid, state);
  }
  return state;
}

/** Consume one freeze token for the given date. */
export function consumeFreeze(uid: string, date: string) {
  const state = read(uid);
  if (state.available <= 0) return false;
  state.available -= 1;
  if (!state.usedOn.includes(date)) state.usedOn.push(date);
  write(uid, state);
  return true;
}

export const FREEZE_MAX = MAX_TOKENS;
