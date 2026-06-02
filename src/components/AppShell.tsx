import { Link, useLocation } from "@tanstack/react-router";
import { Home, ScanLine, Leaf, Users, User, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/plants", label: "My Plants", icon: Leaf },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen text-foreground">
      {/* Desktop top nav */}
      <header className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-4 glass-strong border-b border-glass-border">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-full bg-gradient-to-br from-leaf to-accent glow-leaf flex items-center justify-center">
            <Leaf className="size-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Planta<span className="text-gradient-leaf">Speak</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  active
                    ? "bg-leaf text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page */}
      <main className="pb-24 md:pb-8 md:pt-2">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass-strong rounded-3xl px-2 py-2 flex justify-around">
        {NAV.filter((_, i) => i !== 4).map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all",
                active ? "text-leaf" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
