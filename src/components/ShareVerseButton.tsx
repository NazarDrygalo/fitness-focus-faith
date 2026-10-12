import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function renderVerseCard(verse: string, reference: string): Promise<Blob> {
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const styles = getComputedStyle(document.documentElement);
  const bg = `hsl(${styles.getPropertyValue("--background").trim() || "0 0% 4%"})`;
  const fg = `hsl(${styles.getPropertyValue("--foreground").trim() || "0 0% 98%"})`;
  const muted = `hsl(${styles.getPropertyValue("--muted-foreground").trim() || "0 0% 60%"})`;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  let size = 72;
  let lines: string[] = [];
  do {
    ctx.font = `600 ${size}px system-ui, -apple-system, sans-serif`;
    lines = wrap(ctx, `“${verse}”`, W - 200);
    size -= 4;
  } while (lines.length * size * 1.4 > H * 0.55 && size > 36);
  const lh = (size + 4) * 1.4;
  let y = H / 2 - (lines.length * lh) / 2;
  ctx.fillStyle = fg; ctx.textAlign = "center";
  lines.forEach((l) => { ctx.fillText(l, W / 2, y); y += lh; });
  ctx.font = "500 44px system-ui, sans-serif"; ctx.fillStyle = muted;
  ctx.fillText(`— ${reference}`, W / 2, y + 60);
  ctx.font = "800 40px system-ui, sans-serif"; ctx.fillStyle = fg;
  ctx.fillText("GRIND", W / 2, H - 140);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}

export function ShareVerseButton({ verse, reference }: { verse: string; reference: string }) {
  const [busy, setBusy] = useState(false);
  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderVerseCard(verse, reference);
      const file = new File([blob], "verse.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: reference, text: `${reference} — via GRIND` });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "verse.png"; a.click();
        toast({ title: "Verse image downloaded" });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") toast({ title: "Couldn't share", variant: "destructive" });
    } finally { setBusy(false); }
  };
  return (
    <Button variant="outline" size="sm" onClick={share} disabled={busy} className="gap-2">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Share
    </Button>
  );
}
