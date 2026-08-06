import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Ruler, Plus, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { haptic } from "@/lib/haptics";

interface Measurement {
  log_date: string;
  chest: number | null;
  waist: number | null;
  arms: number | null;
  thigh: number | null;
  unit: string;
}

const FIELDS = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "arms", label: "Arms" },
  { key: "thigh", label: "Thigh" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function BodyMeasurements() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Measurement[]>([]);
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [values, setValues] = useState<Record<FieldKey, string>>({
    chest: "",
    waist: "",
    arms: "",
    thigh: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchRows = async () => {
    const { data } = await supabase
      .from("body_measurements")
      .select("log_date, chest, waist, arms, thigh, unit")
      .order("log_date", { ascending: true });
    if (data) setRows(data as Measurement[]);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const latest = rows.length ? rows[rows.length - 1] : null;
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;

  const deltas = useMemo(() => {
    const out: Partial<Record<FieldKey, number>> = {};
    if (!latest || !previous) return out;
    FIELDS.forEach(({ key }) => {
      const a = latest[key];
      const b = previous[key];
      if (a != null && b != null) out[key] = Number(a) - Number(b);
    });
    return out;
  }, [latest, previous]);

  const handleSave = async () => {
    const payload: Record<string, number | null> = {};
    let any = false;
    FIELDS.forEach(({ key }) => {
      const v = parseFloat(values[key]);
      if (!Number.isNaN(v) && v > 0) {
        payload[key] = v;
        any = true;
      } else {
        payload[key] = null;
      }
    });
    if (!any) {
      toast.error("Enter at least one measurement.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("body_measurements").upsert(
      {
        user_id: user?.id,
        log_date: format(new Date(), "yyyy-MM-dd"),
        unit,
        ...payload,
      },
      { onConflict: "user_id,log_date" },
    );
    setSaving(false);
    if (error) {
      toast.error("Failed to save measurements.");
      return;
    }
    haptic("success");
    toast.success("Measurements saved!");
    setValues({ chest: "", waist: "", arms: "", thigh: "" });
    setOpen(false);
    fetchRows();
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} /> Measurements
          </CardTitle>
          <Button
            size="sm"
            variant={open ? "secondary" : "default"}
            className="active-scale"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close measurement form" : "Add measurements"}
          >
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground" htmlFor={`m-${f.key}`}>
                    {f.label}
                  </label>
                  <Input
                    id={`m-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder={latest?.[f.key] != null ? String(latest[f.key]) : "—"}
                    value={values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    className="h-12 bg-secondary border-border"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(["in", "cm"] as const).map((u) => (
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
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-12 active-scale"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </motion.div>
        )}

        {latest ? (
          <div className="grid grid-cols-4 gap-2">
            {FIELDS.map((f) => {
              const val = latest[f.key];
              const d = deltas[f.key];
              return (
                <div key={f.key} className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground">{f.label}</p>
                  <p className="text-lg font-bold text-foreground">
                    {val != null ? Number(val) : "—"}
                  </p>
                  {d != null && d !== 0 ? (
                    <p
                      className={`text-[10px] flex items-center justify-center gap-0.5 ${
                        d < 0 ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {d < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {d > 0 ? "+" : ""}
                      {d.toFixed(1)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">{latest.unit}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            Log chest, waist, arms, and thigh to track body changes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
