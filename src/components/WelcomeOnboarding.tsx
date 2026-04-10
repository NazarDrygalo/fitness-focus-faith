import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, BarChart3, BookOpen, Flame, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    icon: Dumbbell,
    title: "Track Your Workouts",
    description: "Log pushups, situps, squats, planks, dead hangs, and pull-up ladders — all in one place.",
    color: "hsl(220, 70%, 55%)",
  },
  {
    icon: BarChart3,
    title: "See Your Progress",
    description: "Charts, personal records, and exportable data help you see how far you've come.",
    color: "hsl(142, 50%, 45%)",
  },
  {
    icon: BookOpen,
    title: "Daily Encouragement",
    description: "Start each day with a Bible verse and motivational message to fuel your grind.",
    color: "hsl(var(--streak))",
  },
  {
    icon: Flame,
    title: "Build Your Streak",
    description: "Stay consistent and watch your streak grow. Every rep counts. Let's get after it.",
    color: "hsl(var(--streak))",
  },
];

export function WelcomeOnboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_complete");
    if (!seen) setShow(true);
  }, []);

  const handleFinish = () => {
    localStorage.setItem("onboarding_complete", "true");
    setShow(false);
  };

  if (!show) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${current.color}20` }}>
              <current.icon className="h-8 w-8" style={{ color: current.color }} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{current.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-foreground" : i < step ? "w-1.5 bg-foreground/50" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="ghost" className="flex-1" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            {!isLast ? (
              <Button className="flex-1 gap-2" onClick={() => setStep(s => s + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="flex-1 gap-2" onClick={handleFinish}>
                Let's Go <Check className="h-4 w-4" />
              </Button>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
