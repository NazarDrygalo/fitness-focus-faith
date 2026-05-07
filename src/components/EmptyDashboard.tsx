import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card border-dashed border-border">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Dumbbell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Log your first workout</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Your dashboard comes alive once you start tracking. Use Quick Log above or open the full tracker.
          </p>
          <Link to="/workout">
            <Button className="active-scale">
              Start a workout <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
