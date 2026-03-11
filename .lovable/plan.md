

# Nazar's Workout Tracker

A dark-themed, minimalistic 3-page fitness tracking app with Lovable Cloud (Supabase) for data persistence.

---

## Page 1: Dashboard (Home)

- **Greeting**: "Welcome back, Nazar Drygalo" with time-of-day context (Good morning/afternoon/evening)
- **Countdown to Dec 20, 2026**: Large, clean countdown showing days remaining, updates daily
- **Daily Streak**: Shows consecutive workout days with a subtle flame/streak icon animation
- **Totals**: Lifetime pushup and situp counts displayed as animated counters
- **Calendar Widget**: 
  - Default: current month view with workout days highlighted
  - "Today" button to jump to today and show that day's logged activities
  - "Year" button to switch to a full-year heatmap-style view showing activity density
  - Clicking any day shows that day's logged workout details

## Page 2: Daily Workout Tracker

- **Input Form**: Clean number inputs for pushups and situps for today, with a submit button (smooth save animation)
- **Encouragement Message**: A hardcoded rotating set of ~30 short, deep motivational messages (one per day)
- **Daily Bible Verse**: A curated set of ~30+ NIV verses that rotate daily, displayed in a styled quote card
- **Sports Car of the Day**: 
  - A simplified 3D car viewer using React Three Fiber with a free low-poly car model
  - User can rotate/zoom the model
  - Car specs displayed below (make, model, year, horsepower, 0-60, top speed)
  - Curated set of ~10-15 cars that rotate daily

## Page 3: Bible Study

- **Full Chapter Display**: The complete chapter from which today's verse comes, hardcoded in NIV
- **Chapter Context Card**: Brief description of what's happening in the chapter
- **Teachings Card**: Key lessons and takeaways from the chapter
- **Book Overview Card**: What the entire book is about, its author, and themes
- Clean typography with good readability for longer text

---

## Navigation & Design

- **Top navigation bar** on all pages with smooth page transitions
- **Dark theme**: Deep dark background with muted neutral tones (grays, soft whites), no flashy colors
- **Animations**: Fade-in on page load, hover effects on buttons, smooth counter animations, subtle scale transitions on interactive elements
- **Mobile responsive** layout

## Backend (Lovable Cloud / Supabase)

- **workout_logs table**: Stores daily pushup/situp entries per date
- Data persists across sessions and devices

