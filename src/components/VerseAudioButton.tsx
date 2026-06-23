import { useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  text: string;
  label?: string;
}

export function VerseAudioButton({ text, label = "Listen" }: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const play = async () => {
    if (audioRef.current && urlRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tts-verse", {
        body: { text },
      });
      if (error) throw error;
      // supabase-js returns a Blob when content-type is non-json
      const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      audioRef.current = audio;
      await audio.play();
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      const friendly = msg.includes("429") || msg.includes("rate")
        ? "Audio is rate limited. Try again shortly."
        : msg.includes("402") || msg.includes("credits")
        ? "Audio credits are exhausted. Add credits in workspace billing."
        : "Couldn't generate audio.";
      toast({ title: friendly, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={playing ? pause : play}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {playing ? "Pause" : label}
    </Button>
  );
}
