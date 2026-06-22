import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface ShareStreakCardProps {
  streak: number;
  longest: number;
  totalWorkouts: number;
}

/**
 * Renders a streak card to a canvas and shares it via the Web Share API (mobile)
 * or downloads it as a PNG fallback (desktop).
 */
export function ShareStreakCard({ streak, longest, totalWorkouts }: ShareStreakCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  const buildBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background gradient
    const g = ctx.createLinearGradient(0, 0, 1080, 1080);
    g.addColorStop(0, "#0a0a0a");
    g.addColorStop(1, "#1a0f08");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);

    // Brand mark
    ctx.fillStyle = "#f97316";
    ctx.font = "600 36px ui-sans-serif, system-ui, -apple-system";
    ctx.textAlign = "left";
    ctx.fillText("GRINDFAITH", 80, 130);

    // Streak number
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "700 360px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(`${streak}`, 540, 620);

    // Flame accent
    ctx.fillStyle = "#f97316";
    ctx.font = "600 72px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText("🔥 day streak", 540, 720);

    // Stats row
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "500 40px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(
      `Longest: ${longest}d   ·   Workouts: ${totalWorkouts}`,
      540,
      830
    );

    // Tagline
    ctx.fillStyle = "#737373";
    ctx.font = "400 32px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText("Daily strength & scripture", 540, 960);

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  };

  const handleShare = async () => {
    setBusy(true);
    haptic("light");
    try {
      const blob = await buildBlob();
      if (!blob) {
        toast.error("Couldn't generate card.");
        return;
      }
      const file = new File([blob], `grindfaith-streak-${streak}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${streak}-day streak`,
          text: `${streak} days strong with GrindFaith 🔥`,
        });
        haptic("success");
      } else {
        // Desktop fallback — download.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grindfaith-streak-${streak}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Streak card downloaded!");
      }
    } catch (err) {
      // User cancellation throws — silent.
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Sharing failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={busy || streak === 0}
        className="gap-2 tap h-10"
      >
        {canNativeShare ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {busy ? "Preparing..." : canNativeShare ? "Share streak" : "Save streak card"}
      </Button>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </>
  );
}
