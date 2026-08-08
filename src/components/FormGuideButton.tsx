import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Check, AlertTriangle } from "lucide-react";
import { getFormGuide } from "@/data/formGuides";
import { haptic } from "@/lib/haptics";

export function FormGuideButton({ exerciseKey }: { exerciseKey: string }) {
  const [open, setOpen] = useState(false);
  const guide = getFormGuide(exerciseKey);
  if (!guide) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2 text-muted-foreground tap"
        onClick={() => { haptic("light"); setOpen(true); }}
      >
        <Info className="h-4 w-4 mr-1.5" strokeWidth={1.75} />
        Form guide
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{guide.label} — form</DialogTitle>
          </DialogHeader>

          {open && guide.videoUrl && (
            <video
              src={guide.videoUrl}
              className="w-full rounded-lg bg-secondary"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
            />
          )}

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cues</p>
              <ul className="space-y-2">
                {guide.cues.map((c) => (
                  <li key={c} className="flex gap-2 text-sm leading-relaxed">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Common mistakes</p>
              <ul className="space-y-2">
                {guide.mistakes.map((m) => (
                  <li key={m} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
