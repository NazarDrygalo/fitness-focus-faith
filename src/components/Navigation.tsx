import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Dumbbell, BookOpen, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { signOut } = useAuth();
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
          <NavLink to="/" className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink to="/workout" className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}>
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workout</span>
          </NavLink>
          <NavLink to="/progress" className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}>
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </NavLink>
          <NavLink to="/bible" className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}>
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Bible Study</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => cn(linkClass, isActive ? activeClass : inactiveClass)}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </NavLink>
          <Button variant="ghost" size="icon" onClick={signOut} className="ml-2 text-muted-foreground hover:text-foreground active-scale" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
