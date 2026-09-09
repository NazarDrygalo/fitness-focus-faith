# GRIND: Post-Launch Feature Roadmap (v2)

All 50 original roadmap features are shipped. This plan covers the next 30 features, grouped into 6 waves of 5, ordered by impact ÷ effort for a mobile-first audience.

## Wave 11 — Workout Depth & Tracking
1. **Supersets & circuits** — chain exercises into timed circuits with per-round logging
2. **Rep schemes** — pyramid, EMOM (every minute on the minute), AMRAP modes in the tracker
3. **Rest timer between sets** — auto-start countdown with haptic + sound at zero
4. **Workout templates duplication** — clone any past day as a starting point
5. **Per-set logging** — log individual sets (reps × weight) instead of only totals

## Wave 12 — Deeper Bible Integration
6. **Verse memorization mode** — flashcard-style review of saved highlights with spaced repetition
7. **Prayer journal** — private entries with answered/unanswered status
8. **Shareable verse images** — canvas-generated verse cards for Stories (reuses ShareStreakCard tech)
9. **Bible reading streak** — separate streak for daily reading, merged badge view
10. **Group verse discussion** — a daily verse thread inside small groups

## Wave 13 — Social 2.0
11. **Direct challenges** — "beat my 45 pushups this week" sent to a partner or group
12. **Group workout feed** — live feed of group members' completed workouts with cheers
13. **Partner streak sync** — combined "duo streak" only counts when both log
14. **Comments on workouts** — short text replies beyond emoji cheers
15. **Leaderboard filters** — weekly/monthly/all-time, per exercise

## Wave 14 — AI Coach Pro
16. **Conversational coach chat** — free-form Q&A about training, nutrition basics, faith
17. **Injury-aware adjustments** — tell the coach a sore area; plans adapt around it
18. **Plateau detection** — flags stalled metrics and suggests a deload or variation
19. **AI-generated routines** — full multi-day routine generated from goals, saved to library
20. **Voice coaching cues** — TTS countdowns and encouragement during timers (reuses tts-verse)

## Wave 15 — Polish & Monetization Prep
21. **Custom app icon + theme accents** — user-picked accent color persisted per profile
22. **Widget-style dashboard layouts** — drag-to-reorder dashboard cards
23. **Offline logging queue** — workouts saved locally and synced when back online
24. **Localization groundwork** — extract strings, start with Spanish
25. **Pro tier scaffolding** — feature-flag system + paywall UI, ready for RevenueCat

## Wave 16 — Native Store Launch
26. **RevenueCat subscriptions** (deferred from Wave 10) — Pro unlocks AI coach pro, themes, advanced analytics
27. **Apple Health / Google Fit import** (deferred from Wave 6)
28. **Live Activities / lock-screen widget** (deferred from Waves 3 & 6)
29. **App Store + Play Store submission** — screenshots, listings, review flow
30. **Store rating prompt** — in-app review request after milestone celebrations

## Technical Notes
- Waves 11–15 are PWA-only; no new native dependencies.
- Wave 13 needs one new table per feature (challenges, comments) with strict RLS.
- Wave 14 reuses the existing `ai-coach` edge function and Lovable AI Gateway — no new keys.
- Wave 15 item 24 should start before strings grow further; retrofitting later is costly.
- Wave 16 requires Apple Developer ($99/yr) and Play Console ($25) accounts plus the RevenueCat setup.
- Offline queue (23) uses the existing service worker + IndexedDB via Capacitor Preferences on native.

## Suggested Order
- Month 1: Wave 11 (core product depth)
- Month 2: Wave 12 + 13 (engagement loops)
- Month 3: Wave 14 + 15 (differentiation + monetization prep)
- Month 4: Wave 16 (store launch)
