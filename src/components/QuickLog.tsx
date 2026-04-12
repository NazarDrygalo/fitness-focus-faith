import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuickLogProps {
  todayLogged: boolean;
  onLogged: () => void;
}

export function QuickLog({ todayLogged, onLogged }: QuickLogProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [squats, setSquats] = useState("");

  const handleQuickSave = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in first.");
      return;
    }
    const p = parseInt(pushups) || 0;
    const si = parseInt(situps) || 0;
    const sq = parseInt(squats) || 0;
    if (p === 0 && si === 0 && sq === 0) {
      toast.error("Enter at least one value.");
      return;
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
    } else {
      toast.success("Quick log saved!");
      setPushups("");
      setSitups("");
      setSquats("");
      setOpen(false);
      onLogged();
    }
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

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Quick Log</p>
              <p className="text-xs text-muted-foreground">Log today's basics without leaving</p>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
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
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Pushups</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={pushups}
                    onChange={(e) => setPushups(e.target.value)}
                    className="h-9 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Situps</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={situps}
                    onChange={(e) => setSitups(e.target.value)}
                    className="h-9 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Squats</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={squats}
                    onChange={(e) => setSquats(e.target.value)}
                    className="h-9 text-center"
                  />
                </div>
              </div>
              <Button
                onClick={handleQuickSave}
                disabled={saving}
                size="sm"
                className="w-full mt-3 active-scale"
              >
                {saving ? "Saving..." : "Save Quick Log"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
