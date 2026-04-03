import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { Flame, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from "date-fns";

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

function calculateStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => b.workout_date.localeCompare(a.workout_date));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sorted.length; i++) {
    const logDate = new Date(sorted[i].workout_date + "T00:00:00");
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    expected.setHours(0, 0, 0, 0);
    if (isSameDay(logDate, expected)) {
      streak++;
    } else if (i === 0 && differenceInDays(today, logDate) === 1) {
      streak++;
      today.setDate(today.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const fetchLogs = () => {
    supabase.from("workout_logs").select("workout_date, pushups, situps, ladder_percent, plank_seconds, deadhang_seconds, squat_count, squat_weight, squat_unit").then(({ data }) => {
      if (data) setLogs(data as WorkoutLog[]);
    });
  };

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

  const totalPushups = useMemo(() => logs.reduce((s, l) => s + l.pushups, 0), [logs]);
  const totalSitups = useMemo(() => logs.reduce((s, l) => s + l.situps, 0), [logs]);
  const streak = useMemo(() => calculateStreak(logs), [logs]);
  const daysLeft = getDaysUntilTarget();

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-1">{getGreeting()}, Nazar Drygalo</h1>
          <p className="text-muted-foreground mb-8">Keep pushing. Every rep counts.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
            <Card className={`border-border transition-all duration-500 ${todayLogged ? "bg-success/15 border-success/40 shadow-[0_0_15px_hsl(var(--success)/0.15)]" : "bg-card"}`}>
              <CardContent className="p-4 text-center">
                <CalendarIcon className={`h-5 w-5 mx-auto mb-2 transition-colors duration-500 ${todayLogged ? "text-success" : "text-muted-foreground"}`} style={todayLogged ? { color: "hsl(var(--success))" } : {}} />
                <AnimatedCounter value={daysLeft} className="text-3xl font-bold text-foreground" />
                <p className="text-xs text-muted-foreground mt-1">days to Dec 20</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Flame className="h-5 w-5 mx-auto mb-2" style={{ color: "hsl(var(--streak))" }} />
                <AnimatedCounter value={streak} className="text-3xl font-bold text-foreground" />
                <p className="text-xs text-muted-foreground mt-1">day streak</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <AnimatedCounter value={totalPushups} className="text-3xl font-bold text-foreground" />
                <p className="text-xs text-muted-foreground mt-1">total pushups</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <AnimatedCounter value={totalSitups} className="text-3xl font-bold text-foreground" />
                <p className="text-xs text-muted-foreground mt-1">total situps</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Activity</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={viewMode === "month" ? "default" : "ghost"} className="active-scale" onClick={() => { setViewMode("month"); setCurrentMonth(new Date()); setSelectedDay(null); }}>
                    Today
                  </Button>
                  <Button size="sm" variant={viewMode === "year" ? "default" : "ghost"} className="active-scale" onClick={() => setViewMode("year")}>
                    Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "month" ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" className="active-scale" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>←</Button>
                    <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
                    <Button variant="ghost" size="sm" className="active-scale" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>→</Button>
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
                          onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                          className={`
                            aspect-square rounded-md text-xs flex flex-col items-center justify-center transition-all duration-200 p-0.5
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
        </motion.div>
      </main>
    </div>
  );
}
