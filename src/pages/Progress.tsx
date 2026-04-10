import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

import { BarChart3, TrendingUp, Zap, Calendar, Target, Timer, Hand, Dumbbell as DumbbellIcon } from "lucide-react";
import { PersonalRecords } from "@/components/PersonalRecords";
import { ExportButton } from "@/components/ExportButton";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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

type Range = 7 | 30 | 90;

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-lg p-4 shadow-xl shadow-black/20">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload
          .filter((entry: any, i: number, arr: any[]) =>
            arr.findIndex((e: any) => e.name === entry.name) === i
          )
          .map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">
              {entry.name === "Ladder %" ? `${entry.value}%` : entry.name.includes("s)") ? `${entry.value}s` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload
        .filter((entry: any, i: number, arr: any[]) =>
          arr.findIndex((e: any) => e.value === entry.value) === i
        )
        .map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Progress() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [range, setRange] = useState<Range>(7);

  useEffect(() => {
    supabase
      .from("workout_logs")
      .select("workout_date, pushups, situps, ladder_percent, plank_seconds, deadhang_seconds, squat_count, squat_weight, squat_unit")
      .then(({ data }) => {
        if (data) setLogs(data as WorkoutLog[]);
      });
  }, []);

  const chartData = useMemo(() => {
    const today = new Date();
    const logMap = new Map<string, WorkoutLog>();
    logs.forEach((l) => logMap.set(l.workout_date, l));

    const data = [];
    for (let i = 0; i < range; i++) {
      const d = subDays(today, range - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const log = logMap.get(dateStr);
      data.push({
        date: format(d, range <= 7 ? "EEE" : range <= 30 ? "d" : "MMM d"),
        pushups: log?.pushups || 0,
        situps: log?.situps || 0,
        ladder: log?.ladder_percent || 0,
        plank: log?.plank_seconds || 0,
        deadhang: log?.deadhang_seconds || 0,
        squats: log?.squat_count || 0,
      });
    }
    return data;
  }, [logs, range]);

  const totals = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, range - 1);
    const startStr = format(startDate, "yyyy-MM-dd");
    const filtered = logs.filter((l) => l.workout_date >= startStr);
    return {
      pushups: filtered.reduce((s, l) => s + l.pushups, 0),
      situps: filtered.reduce((s, l) => s + l.situps, 0),
      avgLadder: filtered.length
        ? Math.round(filtered.reduce((s, l) => s + l.ladder_percent, 0) / filtered.length)
        : 0,
      plank: filtered.reduce((s, l) => s + l.plank_seconds, 0),
      deadhang: filtered.reduce((s, l) => s + l.deadhang_seconds, 0),
      squats: filtered.reduce((s, l) => s + l.squat_count, 0),
      days: filtered.length,
    };
  }, [logs, range]);

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const summaryCards = [
    { icon: TrendingUp, value: totals.pushups, label: "Pushups", color: "hsl(220, 70%, 55%)" },
    { icon: Zap, value: totals.situps, label: "Situps", color: "hsl(280, 60%, 55%)" },
    { icon: Target, value: `${totals.avgLadder}%`, label: "Avg Ladder", color: "hsl(var(--success))" },
    { icon: Timer, value: formatSecs(totals.plank), label: "Plank", color: "hsl(40, 70%, 50%)" },
    { icon: Hand, value: formatSecs(totals.deadhang), label: "Dead Hang", color: "hsl(190, 60%, 50%)" },
    { icon: DumbbellIcon, value: totals.squats, label: "Squats", color: "hsl(350, 60%, 55%)" },
    { icon: Calendar, value: totals.days, label: "Active Days", color: "hsl(var(--streak))" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Progress</h1>
              <p className="text-muted-foreground">Track your gains over time</p>
            </div>
            <ExportButton logs={logs} />
          </div>
        </motion.div>

        {/* Range selector */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }} className="flex gap-1 mb-6 p-1 bg-secondary rounded-lg w-fit">
          {([7, 30, 90] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${range === r ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {range === r && (<motion.div layoutId="range-indicator" className="absolute inset-0 bg-accent rounded-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} />)}
              <span className="relative z-10">{r}d</span>
            </button>
          ))}
        </motion.div>

        {/* Summary cards */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summaryCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Card className="bg-card border-border hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className="h-4 w-4" style={{ color: card.color }} />
                    <span className="text-xs text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Personal Records */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }} className="mb-6">
          <PersonalRecords logs={logs} />
        </motion.div>

        {/* Combined chart */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }}>
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" /> Combined Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                <motion.div key={range} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ width: "100%", height: 360, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height={360}>
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pushupGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="situpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(280, 60%, 55%)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(280, 60%, 55%)" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="ladderGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(142, 50%, 45%)" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(142, 50%, 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 16%)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                      <YAxis yAxisId="left" tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={45} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220, 12%, 16%)" }} />
                      <Legend content={<CustomLegend />} />
                      <Area yAxisId="right" type="monotone" dataKey="ladder" fill="url(#ladderGrad)" stroke="none" name="Ladder Area" legendType="none" tooltipType="none" animationDuration={800} animationEasing="ease-out" />
                      <Bar yAxisId="left" dataKey="pushups" fill="url(#pushupGrad)" radius={[6, 6, 0, 0]} name="Pushups" barSize={range <= 7 ? 20 : range <= 30 ? 8 : 4} animationDuration={600} animationEasing="ease-out" />
                      <Bar yAxisId="left" dataKey="situps" fill="url(#situpGrad)" radius={[6, 6, 0, 0]} name="Situps" barSize={range <= 7 ? 20 : range <= 30 ? 8 : 4} animationDuration={600} animationEasing="ease-out" animationBegin={150} />
                      <Bar yAxisId="left" dataKey="squats" fill="hsl(350, 60%, 55%)" radius={[6, 6, 0, 0]} name="Squats" barSize={range <= 7 ? 20 : range <= 30 ? 8 : 4} animationDuration={600} animationEasing="ease-out" animationBegin={300} />
                      <Line yAxisId="right" type="monotone" dataKey="ladder" stroke="hsl(142, 50%, 45%)" strokeWidth={2.5} dot={{ fill: "hsl(142, 50%, 45%)", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }} name="Ladder %" animationDuration={1000} animationEasing="ease-out" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
