import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Dumbbell, BookOpen, BarChart3 } from "lucide-react";

export function Navigation() {
  const linkClass = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent active-scale";
  const activeClass = "bg-accent text-foreground";
  const inactiveClass = "text-muted-foreground";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          GRIND
        </span>
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink
            to="/workout"
            className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}
          >
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workout</span>
          </NavLink>
          <NavLink
            to="/bible"
            className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Bible Study</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
