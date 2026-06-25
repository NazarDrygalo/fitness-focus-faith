import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  logs: any[];
}

export function AIWeeklyRecap({ logs }: Props) {
  const [recap, setRecap] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRecap = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { action: "weekly_recap", logs: logs.slice(-7) },
    });
    setLoading(false);
    if (error || data?.error) { toast.error("Couldn't load recap"); return; }
    setRecap(data.recap || "");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--streak))" }} /> AI Weekly Recap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recap && !loading && (
          <Button variant="outline" size="sm" onClick={fetchRecap} className="gap-2">
            <Sparkles className="h-4 w-4" /> Generate weekly recap
          </Button>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reviewing your week…
          </div>
        )}
        {recap && !loading && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {recap}
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}
