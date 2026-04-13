import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Dumbbell, BarChart3, BookOpen, Settings } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/bible", icon: BookOpen, label: "Bible" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 transition-colors", isActive && "text-foreground")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
