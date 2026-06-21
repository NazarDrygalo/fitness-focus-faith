# Mobile Roadmap: Next 50 Features

Grouped into 10 waves of 5. Each wave is a coherent release you can ship on its own. Order is suggested by impact ÷ effort for a mobile-first PWA / Capacitor audience.

## Wave 1 — Mobile Polish & Input Speed
1. One-tap "Repeat last workout" button on the dashboard QuickLog
2. Haptic-confirmed swipe-to-log on workout cards (left = skip, right = log)
3. Large-thumb numeric keypad sheet for reps/weight (replaces native numeric input)
4. Pull-to-refresh on Dashboard, Progress, and Bible pages
5. Persistent bottom "Log workout" FAB visible across all main routes

## Wave 2 — Streak & Motivation Mechanics
6. Streak freeze tokens (earn 1 per 7-day streak, auto-spend on missed days)
7. Weekly goal ring (M–S) with end-of-week celebration animation
8. Personal best (PR) push notification when a new record is set
9. Streak comeback flow: smaller "get back on track" target after a missed week
10. Shareable streak card (image export) for Stories / iMessage

## Wave 3 — Bible Study Depth
11. Verse of the day lock-screen widget (iOS/Android via Capacitor)
12. Save verses to a personal "Highlights" collection
13. Reading plans: 7-day, 30-day, and 1-year tracks with progress
14. Audio playback of the daily verse (Lovable AI TTS)
15. Reflection journal: short prompt + private note attached to each day

## Wave 4 — Coaching & Personalization
16. AI workout suggestion based on last 14 days (Lovable AI)
17. Adaptive daily targets that scale with rolling 7-day average
18. Personalized verse selection tied to current struggle tags
19. Weekly AI recap: "What you crushed, what to focus on next"
20. Onboarding fitness assessment (3-min) to seed initial goals

## Wave 5 — Social & Accountability
21. Accountability partner: invite by link, see each other's streaks
22. Small groups (max 8) with shared weekly leaderboard
23. Cheer reactions on partner's logged workouts (haptic + push)
24. Public profile page with stats, badges, favorite verse
25. Optional weekly "check-in" message sent to your partner

## Wave 6 — Native Mobile Capabilities (Capacitor)
26. Apple Health / Google Fit import (steps, weight, HR)
27. Background workout timer that survives screen lock
28. Live Activity / Dynamic Island for active timers (iOS)
29. App shortcuts / quick actions on long-press of icon
30. Biometric (Face ID / fingerprint) app lock

## Wave 7 — Data, Insights, Exports
31. Body measurements tracker (chest, waist, arms, thigh)
32. Progress photo timeline with side-by-side compare
33. Heatmap calendar (GitHub-style) of workout intensity
34. Monthly PDF report emailed/shared from the app
35. Apple Watch / Wear OS companion: log a set, see streak

## Wave 8 — Workout Library Expansion
36. Custom exercise builder (name, unit, target type)
37. Programmed routines: multi-day templates with rest days
38. Video form guides per exercise (short MP4, lazy-loaded)
39. Warmup & cooldown timers built into a session
40. Rest-day active recovery suggestions (mobility, stretch)

## Wave 9 — Retention & Re-engagement
41. Smart re-engagement push (only when actually inactive, ML-lite)
42. "Last chance" streak-save reminder 90 min before midnight local
43. Milestone badges with full-screen celebration (100 days, 1000 reps)
44. Year-in-review wrapped experience (annual share card)
45. Referral program: gift a freeze token per friend who logs week 1

## Wave 10 — Trust, Settings, Monetization
46. In-app subscription (Pro) via RevenueCat (Capacitor)
47. Family / accountability bundle pricing
48. Granular notification controls (per-channel, per-day quiet hours)
49. Data export bundle (CSV + JSON + photos) on demand
50. In-app feedback widget with screenshot + auto-attached logs

## Technical Notes
- Waves 1–5 are deliverable as PWA-only and ship fastest.
- Waves 6, 30, 35, 46–47 require Capacitor wrap; recommend pairing with App Store submission milestone.
- AI-driven items (16, 17, 19, 41) use the existing Lovable AI Gateway — no new keys.
- Social features (Wave 5) need a new `friendships`, `groups`, `group_members`, and `reactions` schema with strict RLS; budget one migration per feature.
- Health integrations (26) need Capacitor plugins (`@capacitor-community/health` or equivalent) and per-platform permission prompts.
- Live Activities (28), widgets (11), and Watch app (35) require native Swift/Kotlin targets added after `npx cap add ios|android`.
- Subscriptions (46) should go through RevenueCat to stay store-compliant; gate Pro features behind a `is_pro` flag synced from RC webhooks to a `subscriptions` table.

## Suggested Sequencing
- Months 1–2: Waves 1–3 (polish, retention, content depth) — pure PWA.
- Months 3–4: Waves 4–5 (AI coaching, social) — still PWA.
- Month 5: Capacitor wrap + Wave 6.
- Months 6–7: Waves 7–8 (data depth, library).
- Months 8–9: Waves 9–10 (re-engagement + monetization, store launch).
