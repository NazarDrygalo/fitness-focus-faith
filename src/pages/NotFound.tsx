import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Dumbbell } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
    document.title = "Page not found · GRIND";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary mb-6">
          <Dumbbell className="h-7 w-7 text-foreground" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-muted-foreground mb-8">
          This page took a rest day. Let's get back to the grind.
        </p>
        <Button asChild className="active-scale">
          <Link to="/"><Home className="h-4 w-4 mr-1" /> Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
