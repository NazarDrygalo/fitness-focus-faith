import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type DashboardTabId = "today" | "stats" | "history" | "activity";

interface Tab {
  id: DashboardTabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "today", label: "Today" },
  { id: "stats", label: "Stats" },
  { id: "history", label: "History" },
  { id: "activity", label: "Activity" },
];

interface Props {
  value: DashboardTabId;
  onChange: (id: DashboardTabId) => void;
}

export function DashboardTabs({ value, onChange }: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-3 px-3 pt-2 pb-2 bg-background/85 backdrop-blur-xl sm:hidden">
      <div
        role="tablist"
        className="flex gap-1 p-1 bg-secondary rounded-full"
      >
        {TABS.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (active) return;
                haptic("light");
                onChange(t.id);
              }}
              className={cn(
                "relative flex-1 min-h-[40px] px-3 text-sm font-medium rounded-full select-none transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="dash-tab-pill"
                  className="absolute inset-0 bg-background border border-border rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const DASHBOARD_TAB_ORDER: DashboardTabId[] = TABS.map((t) => t.id);
