
# GrindFaith – Next Expansion Plan

A prioritized roadmap of high-impact features and fixes for the next release, based on the current app (mobile-first PWA with workout tracker, dashboard, Bible study, progress analytics, Lovable AI tips) and patterns from the leading faith+fitness apps (Centr, Strong, Hevy, YouVersion, Glorify, Pray.com).

## Priorities at a glance

```text
P0 — Ship next (high impact, low/medium effort)
  1. Push notifications & smart reminders
  2. Custom exercises + custom routines
  3. Share cards (workout + verse) for social loops
  4. Prayer / reflection journal tied to daily verse

P1 — Build after P0
  5. AI Coach chat (Lovable AI Gateway) — programs, form Q&A, scripture Q&A
  6. Rest timer + per-set logging upgrade for WorkoutTracker
  7. Weekly programs / plans (4-, 8-, 12-week)
  8. Friends + accountability (lightweight)

P2 — Nice to have
  9. Widgets / lock-screen quick log (PWA shortcuts)
 10. Audio Bible / read-along for daily verse
 11. Wearable / Health Connect import (steps, HR)
 12. Gamified seasons & shareable badges
```

## P0 — Ship next

### 1. Push notifications & smart reminders
Re-engagement is the #1 retention lever for habit apps. The PWA already has a service worker; add Web Push.
- Daily workout reminder (user-set time, default 07:00 local).
- Daily verse notification (default 06:00).
- Streak-at-risk ping at 20:00 if no log today and streak ≥ 3.
- Settings page: per-channel toggles + time pickers.

### 2. Custom exercises + custom routines
Today the tracker is fixed (pull-up / plank / dead hang / squats). Power users churn without flexibility.
- `exercises` table (system + user-created), `routines` + `routine_items`.
- Pick from a starter library (push-ups, rows, lunges, burpees, running, cycling, etc.).
- "Today's Routine" card on Dashboard.

### 3. Share cards
Drives organic growth. Generate a branded PNG from a workout or daily verse.
- "Share" button on completed workout and on Bible Study page.
- Canvas-rendered card (brand colors, streak badge, verse/stats), Web Share API with PNG fallback download.

### 4. Prayer / reflection journal
Deepens the faith side and gives a reason to return between workouts.
- Free-text entry attached to the day's verse, private by default.
- Calendar view in Bible Study showing days with entries.
- Optional "Gratitude" prompt + tags.

## P1 — After P0

### 5. AI Coach (chat)
Use Lovable AI Gateway (already enabled). A single chat surface that can:
- Suggest a routine based on history and goals.
- Answer form/technique questions.
- Provide a short devotional reflection on the day's verse.
- Streamed responses, persisted thread per user.

### 6. Workout tracker upgrades
- Rest timer (start automatically when a set is logged, configurable 30/60/90/120s, vibration on complete).
- Per-set reps & RPE for strength exercises (replaces single count input where it makes sense).
- "Last time" hint under each exercise (last reps/time/PR).

### 7. Programs / plans
4-, 8-, and 12-week structured plans (e.g., "Pull-Up Foundations", "Daily 10", "Lent 40"). Each day pre-loads a routine; progress bar across the program.

### 8. Friends & accountability (lightweight)
- Invite by link → mutual follow.
- Shared feed of completed workouts (opt-in, no metrics required).
- 🔥 reactions only — no comments to keep moderation surface zero.

## P2 — Later

- PWA app shortcuts (`manifest.json` `shortcuts`) for "Log Workout" / "Today's Verse".
- Audio playback of the daily verse (Web Speech API; later a real audio CDN).
- Health Connect / Apple Health import via a future native shell.
- Seasons (monthly themes) with shareable badges.

## Research-backed fixes & improvements

Based on a review of the current code and standard PWA/health-app pitfalls:

- **Auth UX**: add "magic link" option in addition to password + Google; reduces password reset support load.
- **Offline write queue**: Dashboard re-fetches on focus, but workout logs fail silently if offline. Queue inserts in IndexedDB and replay on reconnect (the SW is already there).
- **Time-zone correctness**: streaks/daily counts should use the user's local day boundary, not UTC, for users traveling.
- **Error monitoring**: wire Sentry (or similar) to `ErrorBoundary` so production crashes are visible.
- **Analytics**: lightweight event analytics (PostHog/Plausible) for funnel insight on the new features.
- **Lighthouse pass**: run a mobile audit; likely wins are preloading the brand font, deferring Three.js viewers on Dashboard, and adding `width`/`height` on images to fix CLS.
- **Accessibility**: add visible focus rings on the new `.tap` utility, ensure pill tabs are reachable via keyboard with `role="tablist"`, and add `aria-live` to the streak/stat counters.
- **SEO**: verify `PageMeta` is mounted on every route (Progress / BibleStudy still rely on defaults from `index.html`).
- **Email**: weekly summary email is still blocked by the paid-domain requirement — re-confirm scope before building.

## Technical notes

- All new tables: enable RLS + GRANT block per project rules; user-scoped policies via `auth.uid()`.
- Push notifications need a VAPID keypair stored as secrets and a Supabase edge function to send.
- AI Coach uses the existing Lovable AI Gateway — no extra keys.
- Share cards rendered fully client-side (no server image pipeline).
- No new heavy deps: Canvas API for share cards, Web Push API for notifications, existing `framer-motion` for any new motion.

## Suggested first sprint

Pick **P0 items 1–3** for the next release. They are independent, each ~1–2 builds, and together they noticeably move retention (reminders), flexibility (custom routines), and growth (share cards). Prayer journal (#4) follows immediately after as it reuses the Bible Study surface.

## Open questions before implementing

1. Which P0 item should I start with — push reminders, custom routines, share cards, or the prayer journal?
2. For custom routines, do you want a curated starter exercise library or only user-defined entries to start?
3. For share cards, should the design lean "minimal monochrome verse card" or "stat-heavy workout receipt"?
4. Are you open to adding Sentry + PostHog as part of the production-readiness pass?
