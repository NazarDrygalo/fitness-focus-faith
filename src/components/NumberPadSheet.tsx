import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Delete, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface NumberPadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue?: string;
  max?: number;
  onConfirm: (value: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"] as const;

/**
 * Large-thumb numeric bottom sheet for entering reps/weight.
 * Avoids the native browser keypad which is small and inconsistent on mobile.
 */
export function NumberPadSheet({
  open,
  onOpenChange,
  title,
  initialValue = "",
  max = 9999,
  onConfirm,
}: NumberPadSheetProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const press = (k: string) => {
    haptic("light");
    if (k === "del") {
      setValue((v) => v.slice(0, -1));
      return;
    }
    setValue((v) => {
      const next = (v + k).replace(/^0+(\d)/, "$1");
      const n = parseInt(next || "0", 10);
      if (n > max) return String(max);
      return next.slice(0, 5);
    });
  };

  const confirm = () => {
    haptic("medium");
    onConfirm(value || "0");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-muted-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 mb-5 text-center">
          <span className="text-5xl font-semibold tracking-tight tabular-nums text-foreground">
            {value || "0"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="h-14 rounded-xl bg-secondary text-2xl font-medium text-foreground active:scale-95 active:bg-secondary/70 transition-transform tap flex items-center justify-center"
            >
              {k === "del" ? <Delete className="h-6 w-6" /> : k}
            </button>
          ))}
        </div>

        <Button
          onClick={confirm}
          className="w-full mt-4 h-14 text-base tap"
        >
          <Check className="h-5 w-5 mr-2" />
          Done
        </Button>
      </SheetContent>
    </Sheet>
  );
}
