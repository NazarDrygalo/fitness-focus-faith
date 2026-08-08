import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { RECOVERY_SUGGESTIONS } from "@/data/formGuides";

export function RecoverySuggestions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Leaf className="h-5 w-5" strokeWidth={1.75} /> Active Recovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Rest days still count. Pick one or two — keep it easy enough to talk through.
        </p>
        <ul className="space-y-2">
          {RECOVERY_SUGGESTIONS.map((item, i) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-lg bg-secondary/60 px-3 py-2.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">{item.duration}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
