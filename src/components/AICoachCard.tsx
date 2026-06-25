import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  logs: any[];
}

export function AICoachCard({ logs }: Props) {
  const [suggestion, setSuggestion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { action: "suggest_workout", logs: logs.slice(-14) },
    });
    setLoading(false);
    if (error || data?.error) {
      toast.error("Couldn't load coach tip");
      return;
    }
    setSuggestion(data.suggestion || "");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "hsl(var(--streak))" }} /> AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!suggestion && !loading && (
          <Button variant="outline" size="sm" onClick={fetchSuggestion} className="gap-2">
            <Sparkles className="h-4 w-4" /> Suggest today's workout
          </Button>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking through your last 14 days…
          </div>
        )}
        {suggestion && !loading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{suggestion}</p>
            <Button variant="ghost" size="sm" onClick={fetchSuggestion} className="mt-3 gap-2 text-xs">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
