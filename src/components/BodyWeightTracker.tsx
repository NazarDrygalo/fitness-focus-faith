import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WeightLog {
  log_date: string;
  weight: number;
  unit: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-lg p-3 shadow-xl shadow-black/20">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} {payload[0].payload.unit}
      </p>
    </div>
  );
}

export function BodyWeightTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("weight_logs")
      .select("log_date, weight, unit")
      .order("log_date", { ascending: true });
    if (data) setLogs(data as WeightLog[]);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find((l) => l.log_date === todayStr);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      toast.error("Enter a valid weight.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("weight_logs").upsert(
      { user_id: user?.id, log_date: todayStr, weight: w, unit },
      { onConflict: "user_id,log_date" }
    );
    setSaving(false);
    if (error) {
      toast.error("Failed to save weight.");
    } else {
      toast.success("Weight logged!");
      setWeight("");
      setShowInput(false);
      fetchLogs();
    }
  };

  const chartData = useMemo(() => {
    const last30 = logs.filter(
      (l) => l.log_date >= format(subDays(new Date(), 30), "yyyy-MM-dd")
    );
    return last30.map((l) => ({
      date: format(new Date(l.log_date + "T00:00:00"), "MMM d"),
      weight: Number(l.weight),
      unit: l.unit,
    }));
  }, [logs]);

  const trend = useMemo(() => {
    if (logs.length < 2) return null;
    const recent = logs.slice(-7);
    if (recent.length < 2) return null;
    const diff = Number(recent[recent.length - 1].weight) - Number(recent[0].weight);
    return diff;
  }, [logs]);

  const latestWeight = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" /> Body Weight
          </CardTitle>
          <Button
            size="sm"
            variant={showInput ? "secondary" : "default"}
            className="active-scale"
            onClick={() => setShowInput(!showInput)}
          >
            {showInput ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.1"
                  placeholder={todayLog ? String(todayLog.weight) : "Weight"}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex gap-1">
                {(["lb", "kg"] as const).map((u) => (
                  <Button
                    key={u}
                    size="sm"
                    variant={unit === u ? "default" : "ghost"}
                    onClick={() => setUnit(u)}
                    className="px-3"
                  >
                    {u}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={handleSave} disabled={saving} className="active-scale">
                {saving ? "..." : "Log"}
              </Button>
            </div>
          </motion.div>
        )}

        {latestWeight && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-3xl font-bold text-foreground">
              {Number(latestWeight.weight)}<span className="text-lg text-muted-foreground ml-1">{latestWeight.unit}</span>
            </p>
            {trend !== null && (
              <div className={`flex items-center gap-1 text-sm ${trend < 0 ? "text-success" : trend > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {trend < 0 ? <TrendingDown className="h-4 w-4" /> : trend > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                <span>{trend > 0 ? "+" : ""}{trend.toFixed(1)} {latestWeight.unit} (7d)</span>
              </div>
            )}
          </div>
        )}

        {chartData.length > 1 ? (
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 16%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(220, 70%, 55%)"
                  strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={{ fill: "hsl(220, 70%, 55%)", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            {logs.length === 0 ? "Log your weight to start tracking trends." : "Log at least 2 entries to see your chart."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}