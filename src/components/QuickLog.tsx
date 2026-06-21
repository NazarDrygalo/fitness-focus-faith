import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import { haptic } from "@/lib/haptics";
import { NumberPadSheet } from "@/components/NumberPadSheet";

export interface QuickLogLast {
  pushups: number;
  situps: number;
  squats: number;
}

interface QuickLogProps {
  todayLogged: boolean;
  onLogged: () => void;
  /** Most recent prior workout — enables one-tap "Repeat" and swipe-to-log. */
  lastLog?: QuickLogLast | null;
}

type PadField = "pushups" | "situps" | "squats" | null;

export function QuickLog({ todayLogged, onLogged, lastLog }: QuickLogProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [squats, setSquats] = useState("");
  const [padField, setPadField] = useState<PadField>(null);
  const [swipeX, setSwipeX] = useState(0);

  const saveLog = async (p: number, si: number, sq: number, source: "manual" | "repeat") => {
    if (!session?.user?.id) {
      toast.error("Please sign in first.");
      return false;
    }
    if (p === 0 && si === 0 && sq === 0) {
      toast.error("Enter at least one value.");
      return false;
    }
    setSaving(true);
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { error } = await supabase.from("workout_logs").upsert(
      {
        user_id: session.user.id,
        workout_date: todayStr,
        pushups: p,
        situps: si,
        squat_count: sq,
      },
      { onConflict: "user_id,workout_date" }
    );
    setSaving(false);

    if (error) {
      toast.error("Failed to save.");
      haptic("warning");
      return false;
    }
    toast.success(source === "repeat" ? "Repeated yesterday's workout!" : "Quick log saved!");
    celebrate();
    haptic("success");
    setPushups("");
    setSitups("");
    setSquats("");
    setOpen(false);
    onLogged();
    return true;
  };

  const handleQuickSave = () =>
    saveLog(parseInt(pushups) || 0, parseInt(situps) || 0, parseInt(squats) || 0, "manual");

  const handleRepeat = () => {
    if (!lastLog) return;
    saveLog(lastLog.pushups, lastLog.situps, lastLog.squats, "repeat");
  };

  const canRepeat = !!lastLog && (lastLog.pushups + lastLog.situps + lastLog.squats) > 0;

  const onSwipeEnd = (_e: unknown, info: PanInfo) => {
    if (!canRepeat) {
      setSwipeX(0);
      return;
    }
    if (info.offset.x > 90 || info.velocity.x > 600) {
      handleRepeat();
    } else if (info.offset.x < -90 || info.velocity.x < -600) {
      haptic("light");
      toast.message("Skipped — open Quick Log to enter manually.");
    }
    setSwipeX(0);
  };

  if (todayLogged) {
    return (
      <Card className="bg-success/10 border-success/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
            <Check className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Today's workout logged</p>
            <p className="text-xs text-muted-foreground">Great job staying consistent!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const openPad = (field: Exclude<PadField, null>) => {
    haptic("light");
    setPadField(field);
  };

  const padInitial =
    padField === "pushups" ? pushups :
    padField === "situps" ? situps :
    padField === "squats" ? squats : "";

  const padTitle =
    padField === "pushups" ? "Pushups" :
    padField === "situps" ? "Situps" :
    padField === "squats" ? "Squats" : "";

  const onPadConfirm = (v: string) => {
    const clean = v.replace(/^0+(\d)/, "$1");
    if (padField === "pushups") setPushups(clean === "0" ? "" : clean);
    if (padField === "situps") setSitups(clean === "0" ? "" : clean);
    if (padField === "squats") setSquats(clean === "0" ? "" : clean);
  };

  return (
    <>
      <div className="relative">
        {/* Swipe action backdrops */}
        {canRepeat && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-start pl-6 rounded-lg bg-success/15 pointer-events-none"
              style={{ opacity: Math.min(1, Math.max(0, swipeX) / 90) }}
            >
              <RotateCcw className="h-5 w-5 text-success" />
              <span className="ml-2 text-xs font-medium text-success">Repeat last</span>
            </div>
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-end pr-6 rounded-lg bg-muted/40 pointer-events-none"
              style={{ opacity: Math.min(1, Math.max(0, -swipeX) / 90) }}
            >
              <span className="text-xs font-medium text-muted-foreground">Skip</span>
            </div>
          </>
        )}

        <motion.div
          drag={canRepeat ? "x" : false}
          dragConstraints={{ left: -120, right: 120 }}
          dragElastic={0.25}
          onDrag={(_e, info) => setSwipeX(info.offset.x)}
          onDragEnd={onSwipeEnd}
          className="relative"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between tap"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Quick Log</p>
                    <p className="text-xs text-muted-foreground">
                      {canRepeat ? "Tap to enter or swipe right to repeat last" : "Log today's basics without leaving"}
                    </p>
                  </div>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {canRepeat && !open && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRepeat}
                  disabled={saving}
                  className="w-full mt-3 h-11 tap gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Repeat last workout
                  <span className="text-xs text-muted-foreground ml-1">
                    ({lastLog!.pushups}p · {lastLog!.situps}s · {lastLog!.squats}sq)
                  </span>
                </Button>
              )}

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {([
                        { key: "pushups" as const, label: "Pushups", value: pushups },
                        { key: "situps" as const, label: "Situps", value: situps },
                        { key: "squats" as const, label: "Squats", value: squats },
                      ]).map((f) => (
                        <div key={f.key}>
                          <label className="text-[10px] text-muted-foreground mb-1 block">{f.label}</label>
                          <button
                            type="button"
                            onClick={() => openPad(f.key)}
                            className="w-full h-12 rounded-md bg-secondary border border-border text-center text-base font-medium tabular-nums text-foreground tap active:scale-[0.98] transition-transform"
                          >
                            {f.value || <span className="text-muted-foreground">0</span>}
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleQuickSave}
                      disabled={saving}
                      className="w-full mt-3 h-12 text-base active-scale tap"
                    >
                      {saving ? "Saving..." : "Save Quick Log"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <NumberPadSheet
        open={padField !== null}
        onOpenChange={(o) => { if (!o) setPadField(null); }}
        title={padTitle}
        initialValue={padInitial}
        onConfirm={onPadConfirm}
      />
    </>
  );
}
