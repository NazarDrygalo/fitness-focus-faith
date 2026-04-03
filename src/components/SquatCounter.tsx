import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Flag } from "lucide-react";

interface SquatCounterProps {
  onFinish: (count: number, weight: number, unit: string) => void;
  disabled?: boolean;
  initialData?: { count: number; weight: number; unit: string };
}

export function SquatCounter({ onFinish, disabled = false, initialData }: SquatCounterProps) {
  const [count, setCount] = useState("");
  const [weightMode, setWeightMode] = useState<"bodyweight" | "custom">("bodyweight");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [finished, setFinished] = useState(disabled && !!initialData);

  const handleSave = () => {
    const c = parseInt(count) || 0;
    if (c <= 0) return;
    const w = weightMode === "bodyweight" ? 0 : (parseFloat(weight) || 0);
    setFinished(true);
    onFinish(c, w, unit);
  };

  if (finished) {
    const d = initialData || { count: parseInt(count) || 0, weight: weightMode === "bodyweight" ? 0 : (parseFloat(weight) || 0), unit };
    return (
      <div className="text-center p-4 rounded-lg bg-success/15 text-success">
        <p className="text-sm font-medium">
          ✅ {d.count} squats{d.weight > 0 ? ` @ ${d.weight} ${d.unit}` : " (bodyweight)"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground">Number of Squats</Label>
        <Input
          type="number"
          min="0"
          placeholder="0"
          value={count}
          onChange={e => setCount(e.target.value)}
          className="mt-1 bg-secondary border-border no-spinners text-center text-2xl font-bold h-14"
        />
      </div>

      {/* Weight mode selector */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit mx-auto">
        {(["bodyweight", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setWeightMode(m)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${weightMode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {weightMode === m && (
              <motion.div layoutId="squat-weight-mode" className="absolute inset-0 bg-accent rounded-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">{m === "bodyweight" ? "Bodyweight" : "Custom Weight"}</span>
          </button>
        ))}
      </div>

      {weightMode === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="mt-1 bg-secondary border-border no-spinners"
              />
            </div>
            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              {(["lb", "kg"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${unit === u ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {unit === u && (
                    <motion.div layoutId="squat-unit" className="absolute inset-0 bg-accent rounded-md" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10">{u}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <Button onClick={handleSave} disabled={!count || parseInt(count) <= 0} className="w-full active-scale gap-2">
        <Check className="h-4 w-4" /> Log Squats
      </Button>
    </div>
  );
}
