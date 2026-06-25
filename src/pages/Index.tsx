import { useEffect, useState, useMemo } from "react";
import { motion, PanInfo } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { Flame, TrendingUp, Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { StreakMilestones } from "@/components/StreakMilestones";
import { WelcomeOnboarding } from "@/components/WelcomeOnboarding";
import { WorkoutGoals } from "@/components/WorkoutGoals";
import { QuickLog } from "@/components/QuickLog";
import { ConsistencyStats } from "@/components/ConsistencyStats";
import { RestDayIndicator } from "@/components/RestDayIndicator";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { EmptyDashboard } from "@/components/EmptyDashboard";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { DashboardTabs, DASHBOARD_TAB_ORDER, type DashboardTabId } from "@/components/DashboardTabs";
import { StickyHeader } from "@/components/StickyHeader";
import { WeeklyGoalRing } from "@/components/WeeklyGoalRing";
import { ComebackBanner } from "@/components/ComebackBanner";
import { ShareStreakCard } from "@/components/ShareStreakCard";
import { AICoachCard } from "@/components/AICoachCard";
import { AIWeeklyRecap } from "@/components/AIWeeklyRecap";
import { FitnessAssessment } from "@/components/FitnessAssessment";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { haptic } from "@/lib/haptics";
import { syncFreezeAwards } from "@/lib/freezeTokens";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from "date-fns";
import { PageMeta } from "@/components/PageMeta";

interface WorkoutLog {
  workout_date: string;
  pushups: number;
  situps: number;
  ladder_percent: number;
  plank_seconds: number;
  deadhang_seconds: number;
  squat_count: number;
  squat_weight: number;
  squat_unit: string;
  notes: string;
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysUntilTarget() {
  const target = new Date(2026, 11, 20);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, differenceInDays(target, today));
}

function calculateStreak(logs: WorkoutLog[]): { current: number; longest: number } {
  if (!logs.length) return { current: 0, longest: 0 };
  const sorted = [...logs].sort((a, b) => a.workout_date.localeCompare(b.workout_date));

  let longest = 1;
  let currentRun = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].workout_date + "T00:00:00");
    const curr = new Date(sorted[i].workout_date + "T00:00:00");
    if (differenceInDays(curr, prev) === 1) {
      currentRun++;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }
  if (sorted.length === 1) longest = 1;

  const descSorted = [...logs].sort((a, b) => b.workout_date.localeCompare(a.workout_date));
  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < descSorted.length; i++) {
    const logDate = new Date(descSorted[i].workout_date + "T00:00:00");
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    expected.setHours(0, 0, 0, 0);
    if (isSameDay(logDate, expected)) {
      current++;
    } else if (i === 0 && differenceInDays(today, logDate) === 1) {
      current++;
      today.setDate(today.getDate() - 1);
    } else {
      break;
    }
  }
  return { current, longest };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [tab, setTab] = useState<DashboardTabId>("today");
  const [freezeAvailable, setFreezeAvailable] = useState(0);

  const fetchLogs = () =>
    new Promise<void>((resolve) => {
      supabase
        .from("workout_logs")
        .select("workout_date, pushups, situps, ladder_percent, plank_seconds, deadhang_seconds, squat_count, squat_weight, squat_unit, notes")
        .then(({ data }) => {
          if (data) setLogs(data as WorkoutLog[]);
          setLoaded(true);
          resolve();
        });
    });

  useEffect(() => {
    fetchLogs();
    const handleFocus = () => fetchLogs();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchLogs();
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const { pull, refreshing } = usePullToRefresh({ onRefresh: fetchLogs });

  const totalPushups = useMemo(() => logs.reduce((s, l) => s + l.pushups, 0), [logs]);
  const totalSitups = useMemo(() => logs.reduce((s, l) => s + l.situps, 0), [logs]);
  const streakData = useMemo(() => calculateStreak(logs), [logs]);
  const streak = streakData.current;
  const daysLeft = getDaysUntilTarget();

  // Award freeze tokens as streak grows.
  useEffect(() => {
    if (!user?.id || !loaded) return;
    const state = syncFreezeAwards(user.id, streak);
    setFreezeAvailable(state.available);
  }, [user?.id, streak, loaded]);

  const lastWorkoutDate = useMemo(() => {
    if (!logs.length) return null;
    return [...logs].sort((a, b) => b.workout_date.localeCompare(a.workout_date))[0].workout_date;
  }, [logs]);

  const logDates = useMemo(() => new Set(logs.map(l => l.workout_date)), [logs]);
  const logMap = useMemo(() => {
    const map = new Map<string, WorkoutLog>();
    logs.forEach(l => map.set(l.workout_date, l));
    return map;
  }, [logs]);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLogged = logDates.has(todayStr);

  const selectedLog = useMemo(() => {
    if (!selectedDay) return null;
    return logs.find(l => l.workout_date === selectedDay) || null;
  }, [selectedDay, logs]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const months = useMemo(() => {
    const year = currentMonth.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(year, i, 1);
      const end = endOfMonth(start);
      return eachDayOfInterval({ start, end });
    });
  }, [currentMonth]);

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // ----- Mobile tab swipe -----
  const handleSwipe = (_e: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const idx = DASHBOARD_TAB_ORDER.indexOf(tab);
    if (offset.x < -60 || velocity.x < -500) {
      if (idx < DASHBOARD_TAB_ORDER.length - 1) {
        haptic("light");
        setTab(DASHBOARD_TAB_ORDER[idx + 1]);
      }
    } else if (offset.x > 60 || velocity.x > 500) {
      if (idx > 0) {
        haptic("light");
        setTab(DASHBOARD_TAB_ORDER[idx - 1]);
      }
    }
  };

  // ----- Reusable block builders -----
  const lastLog = useMemo(() => {
    const sorted = [...logs]
      .filter((l) => l.workout_date !== todayStr)
      .sort((a, b) => b.workout_date.localeCompare(a.workout_date));
    const recent = sorted[0];
    if (!recent) return null;
    return {
      pushups: recent.pushups || 0,
      situps: recent.situps || 0,
      squats: recent.squat_count || 0,
    };
  }, [logs, todayStr]);

  const priorLogsForPR = useMemo(
    () => logs.filter((l) => l.workout_date !== todayStr),
    [logs, todayStr]
  );
  const quickLogBlock = <QuickLog todayLogged={todayLogged} onLogged={fetchLogs} lastLog={lastLog} priorLogs={priorLogsForPR} />;
  const weeklyRingBlock = <WeeklyGoalRing logs={logs} />;
  const comebackBlock = <ComebackBanner lastWorkoutDate={lastWorkoutDate} />;
  const goalsBlock = <WorkoutGoals todayLog={logMap.get(todayStr) || null} recentLogs={logs} />;
  const restBlock = <RestDayIndicator currentStreak={streakData.current} />;
  const consistencyBlock = <ConsistencyStats logs={logs} />;
  const weeklyBlock = <WeeklyRecap logs={logs} />;
  const milestonesBlock = (
    <StreakMilestones
      streak={streakData.current}
      totalPushups={totalPushups}
      totalSitups={totalSitups}
      totalWorkouts={logs.length}
    />
  );
  const historyBlock = <WorkoutHistory logs={logs} onUpdated={fetchLogs} />;
  const aiCoachBlock = <AICoachCard logs={logs} />;
  const aiRecapBlock = <AIWeeklyRecap logs={logs} />;

  const activityBlock = (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === "month" ? "default" : "ghost"}
              className="tap min-h-[40px]"
              onClick={() => { setViewMode("month"); setCurrentMonth(new Date()); setSelectedDay(null); }}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant={viewMode === "year" ? "default" : "ghost"}
              className="tap min-h-[40px]"
              onClick={() => setViewMode("year")}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "month" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="tap h-10 w-10" aria-label="Previous month" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="ghost" size="icon" className="tap h-10 w-10" aria-label="Next month" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getDay(monthDays[0]) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map(day => {
                const dateStr = format(day, "yyyy-MM-dd");
                const hasLog = logDates.has(dateStr);
                const isSelected = selectedDay === dateStr;
                const isTodayDay = isToday(day);
                const isPast = day < new Date() && !isTodayDay;
                const dayLog = logMap.get(dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => { haptic("light"); setSelectedDay(isSelected ? null : dateStr); }}
                    className={`
                      aspect-square rounded-md text-xs flex flex-col items-center justify-center transition-all duration-200 p-0.5 tap
                      ${isSelected ? "ring-2 ring-ring" : ""}
                      ${hasLog ? "bg-success/25 text-success font-semibold" : isPast ? "text-muted-foreground hover:bg-secondary" : "text-muted-foreground hover:bg-secondary"}
                      ${isTodayDay && hasLog ? "ring-1 ring-success shadow-[0_0_8px_hsl(var(--success)/0.3)]" : isTodayDay ? "ring-1 ring-muted-foreground" : ""}
                    `}
                  >
                    <span className="leading-none">{day.getDate()}</span>
                    {dayLog && (
                      <span className="leading-tight mt-0.5 text-[7px] font-normal opacity-80">
                        {dayLog.pushups > 0 && <span className="block">P:{dayLog.pushups}</span>}
                        {dayLog.situps > 0 && <span className="block">S:{dayLog.situps}</span>}
                        {dayLog.ladder_percent > 0 && <span className="block">L:{dayLog.ladder_percent}%</span>}
                        {dayLog.plank_seconds > 0 && <span className="block">Pl:{Math.floor(dayLog.plank_seconds/60)}m</span>}
                        {dayLog.deadhang_seconds > 0 && <span className="block">DH:{dayLog.deadhang_seconds}s</span>}
                        {dayLog.squat_count > 0 && <span className="block">Sq:{dayLog.squat_count}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedLog && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-4 p-3 rounded-lg bg-secondary">
                <p className="text-sm font-medium mb-1">{format(new Date(selectedDay + "T00:00:00"), "EEEE, MMM d")}</p>
                <p className="text-sm text-muted-foreground">Pushups: <span className="text-foreground font-medium">{selectedLog.pushups}</span></p>
                <p className="text-sm text-muted-foreground">Situps: <span className="text-foreground font-medium">{selectedLog.situps}</span></p>
                {selectedLog.ladder_percent > 0 && <p className="text-sm text-muted-foreground">Ladder: <span className="text-foreground font-medium">{selectedLog.ladder_percent}%</span></p>}
                {selectedLog.plank_seconds > 0 && <p className="text-sm text-muted-foreground">Plank: <span className="text-foreground font-medium">{Math.floor(selectedLog.plank_seconds/60)}m {selectedLog.plank_seconds%60}s</span></p>}
                {selectedLog.deadhang_seconds > 0 && <p className="text-sm text-muted-foreground">Dead Hang: <span className="text-foreground font-medium">{selectedLog.deadhang_seconds}s</span></p>}
                {selectedLog.squat_count > 0 && <p className="text-sm text-muted-foreground">Squats: <span className="text-foreground font-medium">{selectedLog.squat_count}{selectedLog.squat_weight > 0 ? ` @ ${selectedLog.squat_weight} ${selectedLog.squat_unit}` : ""}</span></p>}
                {selectedLog.notes && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
                    <p className="text-sm text-foreground">{selectedLog.notes}</p>
                  </div>
                )}
              </motion.div>
            )}
            {selectedDay && !selectedLog && (
              <div className="mt-4 p-3 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">No workout logged for this day.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {months.map((mDays, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground mb-1">{monthNames[i]}</p>
                <div className="grid grid-cols-7 gap-px">
                  {Array.from({ length: getDay(mDays[0]) }).map((_, j) => (
                    <div key={`e-${j}`} className="w-2 h-2" />
                  ))}
                  {mDays.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const hasLog = logDates.has(dateStr);
                    const isPast = day <= new Date();
                    return (
                      <div
                        key={dateStr}
                        className={`w-2 h-2 rounded-sm transition-colors duration-300 ${
                          hasLog
                            ? "bg-success"
                            : isPast
                              ? "bg-destructive/40"
                              : "bg-secondary"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const wrap = (node: JSX.Element, key?: string) => (
    <div key={key} className="mb-5 sm:mb-8">{node}</div>
  );

  const sectionByTab: Record<DashboardTabId, JSX.Element> = {
    today: (
      <>
        {wrap(comebackBlock, "cb")}
        {wrap(quickLogBlock, "ql")}
        {wrap(aiCoachBlock, "ai")}
        {wrap(weeklyRingBlock, "wr")}
        {wrap(goalsBlock, "g")}
        {wrap(restBlock, "r")}
      </>
    ),
    stats: (
      <>
        {wrap(consistencyBlock, "c")}
        {wrap(aiRecapBlock, "air")}
        {wrap(weeklyBlock, "w")}
        {wrap(milestonesBlock, "m")}
      </>
    ),
    history: wrap(historyBlock, "h"),
    activity: wrap(activityBlock, "a"),
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      <PageMeta title="GRIND · Daily strength & scripture" description="Track pull-ups, planks, dead hangs, and squats with daily Bible verses. Build streaks that stick." path="/" />
      <WelcomeOnboarding />
      <FitnessAssessment />
      <Navigation />
      <StickyHeader streak={streak} />

      {/* Pull-to-refresh indicator (mobile only) */}
      <motion.div
        aria-hidden
        className="sm:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ height: pull }}
        animate={{ opacity: pull > 16 || refreshing ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <Loader2
          className="h-5 w-5 text-muted-foreground"
          style={{
            animation: refreshing ? "spin 1s linear infinite" : undefined,
            transform: refreshing ? undefined : `rotate(${Math.min(360, pull * 4)}deg)`,
          }}
        />
      </motion.div>

      <main
        className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 max-w-4xl"
        style={{
          transform: pull ? `translateY(${pull * 0.5}px)` : undefined,
          transition: refreshing ? "transform 0.2s" : undefined,
        }}
      >
        {!loaded ? <DashboardSkeleton /> : <>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">{getGreeting()}</h1>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Keep pushing. Every rep counts.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-8">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
            <Card className={`border-border transition-all duration-500 ${todayLogged ? "bg-success/15 border-success/40 shadow-[0_0_15px_hsl(var(--success)/0.15)]" : "bg-card"}`}>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="h-5 flex items-center justify-center mb-1.5 sm:mb-2">
                  <CalendarIcon className={`h-5 w-5 transition-colors duration-500 ${todayLogged ? "text-success" : "text-muted-foreground"}`} strokeWidth={1.75} style={todayLogged ? { color: "hsl(var(--success))" } : {}} />
                </div>
                <AnimatedCounter value={daysLeft} className="text-2xl sm:text-3xl font-bold text-foreground" />
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">days to Dec 20</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="h-5 flex items-center justify-center mb-1.5 sm:mb-2">
                  <Flame className="h-5 w-5" strokeWidth={1.75} style={{ color: "hsl(var(--streak))" }} />
                </div>
                <AnimatedCounter value={streak} className="text-2xl sm:text-3xl font-bold text-foreground" />
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">day streak</p>
                {streakData.longest > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">best: {streakData.longest}d</p>
                )}
                {freezeAvailable > 0 && (
                  <p className="text-[10px] mt-0.5" style={{ color: "hsl(210 90% 60%)" }}>
                    ❄ {freezeAvailable} freeze{freezeAvailable === 1 ? "" : "s"}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="h-5 flex items-center justify-center mb-1.5 sm:mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <AnimatedCounter value={totalPushups} className="text-2xl sm:text-3xl font-bold text-foreground" />
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">total pushups</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="h-5 flex items-center justify-center mb-1.5 sm:mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <AnimatedCounter value={totalSitups} className="text-2xl sm:text-3xl font-bold text-foreground" />
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">total situps</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {loaded && logs.length === 0 && (
          <div className="mb-5 sm:mb-8">
            <EmptyDashboard />
          </div>
        )}

        {/* Comeback banner — desktop (mobile renders inside tab) */}
        <div className="hidden sm:block mb-6">
          <ComebackBanner lastWorkoutDate={lastWorkoutDate} />
        </div>

        {/* Share streak action */}
        {streak > 0 && (
          <div className="flex justify-end mb-4">
            <ShareStreakCard streak={streak} longest={streakData.longest} totalWorkouts={logs.length} />
          </div>
        )}

        {/* Mobile: tabbed view with swipe */}
        <div className="sm:hidden">
          <DashboardTabs value={tab} onChange={setTab} />
          <div className="overflow-hidden">
            <motion.div
              key={tab}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={handleSwipe}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pt-4"
            >
              {sectionByTab[tab]}
            </motion.div>
          </div>
        </div>

        {/* Desktop: single scroll layout */}
        <div className="hidden sm:block">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.28 }} className="mb-8">{quickLogBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.285 }} className="mb-8">{aiCoachBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.29 }} className="mb-8">{weeklyRingBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.295 }} className="mb-8">{aiRecapBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.30 }} className="mb-8">{milestonesBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.33 }} className="mb-8">{weeklyBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.35 }} className="mb-8">{consistencyBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.37 }} className="mb-8">{goalsBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.39 }} className="mb-8">{restBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.41 }} className="mb-8">{historyBlock}</motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.45 }}>{activityBlock}</motion.div>
        </div>
        </>}
      </main>
      <MobileNav />
    </div>
  );
}
