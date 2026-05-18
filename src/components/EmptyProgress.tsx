import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function EmptyProgress() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-card border-border border-dashed">
        <CardContent className="p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No progress yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Log your first workout to start seeing charts, personal records, and trends here.
          </p>
          <Button asChild className="active-scale">
            <Link to="/workout">Log a workout</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
