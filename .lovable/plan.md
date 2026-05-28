## Mobile optimization pass

Builds on the existing MobileNav + ActivityRings + safe-area work. All changes are mobile-only (`sm:` resets keep desktop unchanged).

### 1. Tighter spacing & typography (mobile)

- Page padding `px-3 py-5` on mobile, `sm:px-4 sm:py-8` on desktop. Applied to `Index`, `WorkoutTracker`, `Progress`, `BibleStudy`, `Settings`.
- H1: `text-2xl sm:text-3xl`, tighter line height; greeting subtitle `text-sm`.
- Section gaps: `mb-5 sm:mb-8`.
- Stat cards: 2-col grid stays, but `p-3 sm:p-4`, value `text-2xl sm:text-3xl`, icon row tightened.

### 2. Sectioned/collapsible Dashboard

Replace the long single scroll with a sticky **segmented tab bar** under the greeting:

```text
[ Today ] [ Stats ] [ History ] [ Activity ]
```

- `Today` → QuickLog + WorkoutGoals (rings) + RestDayIndicator
- `Stats` → ConsistencyStats + WeeklyRecap + StreakMilestones
- `History` → WorkoutHistory
- `Activity` → calendar (month/year)

Built with framer-motion `layoutId` for the active pill (matches MobileNav style). State stored in `useState` (no URL change). Tab content swaps with a 200ms fade/slide. Stat cards (countdown/streak/totals) stay at the top, always visible.

On `sm:` and up, the tabs collapse back into the current single scroll so desktop is untouched.

### 3. Thumb-zone CTAs

- New `<StickyActionBar>` component: `fixed bottom-[68px] left-0 right-0` (sits above MobileNav), `pb-safe`, blurred `bg-background/85 backdrop-blur`, top border. Slides up via framer-motion when mounted.
- `WorkoutTracker`: when the user types a count or selects an exercise, the bar shows the relevant Save/Log button full-width `h-12`. Inline buttons inside cards stay for desktop.
- Hidden `sm:hidden`.
- `QuickLog` on Dashboard already has a full-width `h-12` Save inside the card — keep it (it's already in the visible Today section).

### 4. Workout page: pill tabs replace dropdown

Replace the `<Select>` for exercise mode with a horizontal scrollable strip:

```text
[ 🏋 Pull-Up ] [ ⏱ Plank ] [ ✋ Dead Hang ] [ 🦵 Squats ]
```

- `overflow-x-auto snap-x snap-mandatory` strip, each pill `h-10 px-4 rounded-full` with icon + label, `snap-start`.
- Active pill: solid `bg-primary text-primary-foreground`, framer-motion `layoutId="exercise-pill"` for a springy slide.
- Inactive: `bg-secondary text-muted-foreground`.
- Strip is sticky under the header on mobile so users can switch without scrolling back up.

### 5. Native-feel gestures & motion

- **Swipe between Dashboard tabs**: framer-motion `drag="x"` on the active panel with `dragConstraints={{ left: 0, right: 0 }}` and `onDragEnd` that moves to prev/next tab when `offset.x` > 60 or velocity > 500.
- **Pull-to-refresh on Dashboard**: lightweight implementation using `useMotionValue` on the scroll container. When `scrollY === 0` and the user drags down >70px, trigger `fetchLogs()` and show a spinning `Loader2` that animates in from the top. No external lib.
- **Spring tap feedback**: replace the existing `.active-scale` with a `.tap` utility (`transition-transform duration-150 active:scale-[0.97]`) and apply broadly to Cards that act as buttons (history rows, calendar days, exercise pills, MobileNav items).
- **Sticky scroll header**: the greeting + stat-card row stays at top; once scrolled past, a compact 56px header slides in showing just "GRIND · {streak}d 🔥" with a subtle blur.

### 6. Touch-target audit

Bump everything under 44×44 on mobile:

- Calendar month nav arrows (`←`/`→`) → `h-10 w-10`.
- `WorkoutHistory` edit/delete icon buttons → `h-10 w-10`.
- Progress range selector (7d/30d/90d) → `h-10 px-4`.
- Settings rows: full-row tap targets with chevrons.
- Min `min-h-[44px]` on every interactive `<button>` in shared components.

### 7. New / changed files

**New**

- `src/components/StickyActionBar.tsx` — fixed bottom CTA wrapper.
- `src/components/DashboardTabs.tsx` — segmented control with framer-motion layoutId.
- `src/components/StickyHeader.tsx` — compact scrolled header with IntersectionObserver trigger.
- `src/hooks/usePullToRefresh.ts` — scroll-position + drag handler.
- `src/hooks/useSwipeNav.ts` — generic left/right swipe → callback.
- Inlcude hapitcs when needed, for example a vibration or some haptic when submitting a workout or starting a workout.

**Edited**

- `src/pages/Index.tsx` — wire tabs, swipe, pull-to-refresh, sticky header, tighter padding.
- `src/pages/WorkoutTracker.tsx` — pill tabs for exercises, StickyActionBar for Save, tighter padding.
- `src/pages/Progress.tsx` / `BibleStudy.tsx` / `Settings.tsx` — tighter mobile padding/typography, bigger tap targets.
- `src/components/WorkoutHistory.tsx`, `PullUpLadder.tsx`, `PlankTimer.tsx`, `DeadHangTimer.tsx`, `SquatCounter.tsx` — wire to StickyActionBar on mobile, bump icon-button sizes.
- `src/index.css` — add `.tap` utility, refine `.pb-safe`, add `.scrollbar-hide` for pill strip.
- `src/components/MobileNav.tsx` — verify it stays clear of the new sticky action bar (z-index ordering).

### Technical notes

- `framer-motion` is already installed — no new deps.
- Sticky elements use `z-30` (sticky header), `z-40` (StickyActionBar), `z-50` (MobileNav) — no overlap.
- All mobile-only styles use Tailwind `sm:` resets so desktop layouts are byte-identical to today.
- Drag handlers respect `prefers-reduced-motion` (skip swipe/pull-to-refresh transitions, keep instant state changes).
- No DB / RLS / auth changes.

### Out of scope

- No new analytics events, no Sentry wiring, no PWA manifest changes.
- Bible Study and Settings get only spacing/tap-target tweaks, not restructured.
  &nbsp;