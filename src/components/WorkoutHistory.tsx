import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import { History, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
  onUpdated: () => void;
}

export function WorkoutHistory({ logs, onUpdated }: WorkoutHistoryProps) {
  const { session } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ pushups: "", situps: "", notes: "" });

  const sorted = [...logs].sort((a, b) => b.workout_date.localeCompare(a.workout_date));
  const visible = expanded ? sorted : sorted.slice(0, 5);

  const startEdit = (log: WorkoutLog) => {
    setEditingDate(log.workout_date);
    setEditValues({
      pushups: String(log.pushups),
      situps: String(log.situps),
      notes: log.notes || "",
    });
  };

  const saveEdit = async () => {
    if (!editingDate || !session?.user?.id) return;
    const { error } = await supabase
      .from("workout_logs")
      .update({
        pushups: parseInt(editValues.pushups) || 0,
        situps: parseInt(editValues.situps) || 0,
        notes: editValues.notes.trim(),
      })
      .eq("workout_date", editingDate)
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to update.");
    } else {
      toast.success("Workout updated!");
      setEditingDate(null);
      onUpdated();
    }
  };

  const deleteLog = async (date: string) => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .eq("workout_date", date)
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to delete.");
    } else {
      toast.success("Workout deleted.");
      onUpdated();
    }
  };

  if (logs.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" /> Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((log) => (
              <motion.div
                key={log.workout_date}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {editingDate === log.workout_date ? (
                  <div className="p-3 rounded-lg bg-secondary space-y-2">
                    <p className="text-sm font-medium">{format(new Date(log.workout_date + "T00:00:00"), "EEE, MMM d")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Pushups</label>
                        <Input type="number" value={editValues.pushups} onChange={(e) => setEditValues(v => ({ ...v, pushups: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Situps</label>
                        <Input type="number" value={editValues.situps} onChange={(e) => setEditValues(v => ({ ...v, situps: e.target.value }))} className="h-8 text-sm" />
                      </div>
                    </div>
                    <Textarea value={editValues.notes} onChange={(e) => setEditValues(v => ({ ...v, notes: e.target.value }))} placeholder="Notes..." rows={2} className="text-sm resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="flex-1 h-7 text-xs"><Check className="h-3 w-3 mr-1" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingDate(null)} className="h-7 text-xs"><X className="h-3 w-3 mr-1" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{format(new Date(log.workout_date + "T00:00:00"), "EEE, MMM d")}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                        {log.pushups > 0 && <span>{log.pushups} pushups</span>}
                        {log.situps > 0 && <span>{log.situps} situps</span>}
                        {log.ladder_percent > 0 && <span>Ladder {log.ladder_percent}%</span>}
                        {log.plank_seconds > 0 && <span>Plank {Math.floor(log.plank_seconds / 60)}m{log.plank_seconds % 60 > 0 ? ` ${log.plank_seconds % 60}s` : ""}</span>}
                        {log.deadhang_seconds > 0 && <span>Hang {log.deadhang_seconds}s</span>}
                        {log.squat_count > 0 && <span>{log.squat_count} squats</span>}
                      </div>
                      {log.notes && <p className="text-xs text-muted-foreground/70 mt-1 truncate">{log.notes}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(log)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove the workout from {format(new Date(log.workout_date + "T00:00:00"), "MMM d, yyyy")}.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLog(log.workout_date)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {sorted.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Show less</> : <><ChevronDown className="h-3 w-3 mr-1" /> Show all {sorted.length} workouts</>}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
