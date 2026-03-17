import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

import { BarChart3 } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
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
}

type Range = 7 | 30 | 90;

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Progress() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [range, setRange] = useState<Range>(7);

  useEffect(() => {
    supabase
      .from("workout_logs")
      .select("workout_date, pushups, situps, ladder_percent")
      .then(({ data }) => {
        if (data) setLogs(data as WorkoutLog[]);
      });
  }, []);

  const chartData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, range - 1);
    const logMap = new Map<string, WorkoutLog>();
    logs.forEach((l) => logMap.set(l.workout_date, l));

    const data = [];
    for (let i = 0; i < range; i++) {
      const d = subDays(today, range - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const log = logMap.get(dateStr);
      data.push({
        date: format(d, range <= 7 ? "EEE" : "MMM d"),
        pushups: log?.pushups || 0,
        situps: log?.situps || 0,
        ladder: log?.ladder_percent || 0,
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
        ? Math.round(
            filtered.reduce((s, l) => s + l.ladder_percent, 0) / filtered.length
          )
        : 0,
      days: filtered.length,
    };
  }, [logs, range]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Progress</h1>
              <p className="text-muted-foreground">Track your gains over time</p>
            </div>
            
          </div>
        </motion.div>

        {/* Range selector */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {([7, 30, 90] as Range[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "ghost"}
              onClick={() => setRange(r)}
              className="active-scale"
            >
              {r} days
            </Button>
          ))}
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totals.pushups}</p>
              <p className="text-xs text-muted-foreground">Pushups</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totals.situps}</p>
              <p className="text-xs text-muted-foreground">Situps</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totals.avgLadder}%</p>
              <p className="text-xs text-muted-foreground">Avg Ladder</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totals.days}</p>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Combined chart */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Combined Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 320, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(220, 12%, 20%)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 14%, 13%)",
                        border: "1px solid hsl(220, 12%, 20%)",
                        borderRadius: "8px",
                        color: "hsl(220, 10%, 90%)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: "hsl(220, 10%, 50%)" }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="pushups"
                      fill="hsl(220, 70%, 55%)"
                      radius={[4, 4, 0, 0]}
                      name="Pushups"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="situps"
                      fill="hsl(280, 60%, 55%)"
                      radius={[4, 4, 0, 0]}
                      name="Situps"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ladder"
                      stroke="hsl(142, 50%, 45%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(142, 50%, 45%)", r: 3 }}
                      name="Ladder %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
