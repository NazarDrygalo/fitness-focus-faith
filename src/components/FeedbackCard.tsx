import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getRecentErrors } from "@/lib/errorLog";

const CATEGORIES = [
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idea" },
  { value: "general", label: "Other" },
] as const;

const MAX_SHOT_BYTES = 900_000;

/** Downscale an image file to a compact JPEG data URL. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function FeedbackCard() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>("bug");
  const [message, setMessage] = useState("");
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    try {
      const data = await shrink(file);
      if (data.length > MAX_SHOT_BYTES) {
        toast.error("Screenshot is too large");
        return;
      }
      setShot(data);
    } catch {
      toast.error("Could not read that image");
    }
  };

  const submit = async () => {
    if (!user) return;
    if (message.trim().length < 5) {
      toast.error("Please add a bit more detail");
      return;
    }
    setBusy(true);
    const diagnostics = {
      route: window.location.pathname,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      standalone: window.matchMedia("(display-mode: standalone)").matches,
      recent_errors: getRecentErrors(),
      at: new Date().toISOString(),
    };
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      category,
      message: message.trim(),
      screenshot_data_url: shot,
      diagnostics,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not send feedback");
      return;
    }
    setMessage("");
    setShot(null);
    toast.success("Thanks — feedback sent");
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Send feedback
        </CardTitle>
        <CardDescription>Report a bug or suggest an idea. Device details are attached automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.value}
              variant={category === c.value ? "default" : "outline"}
              className="flex-1 h-10 tap"
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        <div>
          <Label htmlFor="feedback-message" className="text-sm text-muted-foreground">
            What happened?
          </Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or idea…"
            maxLength={2000}
            className="mt-1 min-h-[110px] bg-secondary border-border"
          />
        </div>

        {shot ? (
          <div className="relative w-fit">
            <img src={shot} alt="Attached screenshot preview" className="h-28 rounded-md border border-border" />
            <button
              type="button"
              onClick={() => setShot(null)}
              aria-label="Remove screenshot"
              className="absolute -top-2 -right-2 rounded-full bg-secondary border border-border p-1 tap"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button variant="outline" className="w-full h-11 gap-2 tap" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="h-4 w-4" /> Attach screenshot
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />

        <Button onClick={submit} disabled={busy} className="w-full h-12 text-base tap">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}
