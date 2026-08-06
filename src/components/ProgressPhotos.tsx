import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Camera, Trash2, Loader2, GitCompareArrows } from "lucide-react";
import { format } from "date-fns";
import { haptic } from "@/lib/haptics";

interface Photo {
  id: string;
  photo_date: string;
  storage_path: string;
  url?: string;
}

export function ProgressPhotos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compare, setCompare] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("progress_photos")
      .select("id, photo_date, storage_path")
      .order("photo_date", { ascending: false });
    if (!data) return;
    const withUrls = await Promise.all(
      (data as Photo[]).map(async (p) => {
        const { data: signed } = await supabase.storage
          .from("progress-photos")
          .createSignedUrl(p.storage_path, 3600);
        return { ...p, url: signed?.signedUrl };
      }),
    );
    setPhotos(withUrls);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("progress-photos")
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error("Upload failed.");
      return;
    }
    const { error } = await supabase.from("progress_photos").insert({
      user_id: user.id,
      storage_path: path,
      photo_date: format(new Date(), "yyyy-MM-dd"),
    });
    setUploading(false);
    if (error) {
      toast.error("Could not save photo.");
      return;
    }
    haptic("success");
    toast.success("Photo added!");
    load();
  };

  const remove = async (p: Photo) => {
    await supabase.storage.from("progress-photos").remove([p.storage_path]);
    await supabase.from("progress_photos").delete().eq("id", p.id);
    setSelected((s) => s.filter((id) => id !== p.id));
    toast.success("Photo removed.");
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2),
    );
  };

  const comparePair = photos.filter((p) => selected.includes(p.id)).slice(0, 2);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} /> Progress Photos
          </CardTitle>
          <div className="flex gap-2">
            {photos.length > 1 && (
              <Button
                size="sm"
                variant={compare ? "default" : "ghost"}
                className="active-scale"
                onClick={() => {
                  setCompare(!compare);
                  setSelected([]);
                }}
                aria-label="Compare photos"
              >
                <GitCompareArrows className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              className="active-scale"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        {compare && (
          <p className="text-xs text-muted-foreground mb-3">
            Tap two photos to compare them side by side.
          </p>
        )}

        <AnimatePresence>
          {compare && comparePair.length === 2 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-2 mb-4"
            >
              {comparePair
                .slice()
                .sort((a, b) => a.photo_date.localeCompare(b.photo_date))
                .map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={p.url}
                      alt={`Progress photo from ${p.photo_date}`}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <p className="text-[11px] text-center py-1 text-muted-foreground">
                      {format(new Date(p.photo_date + "T00:00:00"), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Add a photo to start your visual timeline. Photos stay private to you.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-lg overflow-hidden group border-2 transition-colors ${
                  compare && selected.includes(p.id)
                    ? "border-primary"
                    : "border-transparent"
                }`}
                onClick={() => compare && toggleSelect(p.id)}
              >
                <img
                  src={p.url}
                  alt={`Progress photo from ${p.photo_date}`}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-background/70 text-[10px] text-center text-foreground py-0.5">
                  {format(new Date(p.photo_date + "T00:00:00"), "MMM d")}
                </span>
                {!compare && (
                  <button
                    onClick={() => remove(p)}
                    aria-label="Delete photo"
                    className="absolute top-1 right-1 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive tap"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
