import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  Cpu,
  Eye,
  LayoutDashboard,
  Library,
  Settings,
  Swords,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Floor", icon: LayoutDashboard },
  { to: "/providers", label: "Models", icon: Cpu },
  { to: "/characters", label: "Cast", icon: Users },
  { to: "/setup", label: "Stage", icon: Swords },
  { to: "/board", label: "Board", icon: Eye },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/library", label: "Library", icon: Library },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
      <rect x="3" y="5" width="9" height="22" rx="1.5" className="fill-tide" />
      <rect x="20" y="5" width="9" height="22" rx="1.5" className="fill-ember" />
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-ink text-fg lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 z-20 hidden h-screen flex-col border-r border-line bg-panel px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-3 px-2">
          <Mark />
          <span>
            <span className="block font-display text-xl font-extrabold tracking-wide">DYAD</span>
            <span className="block text-xs text-muted">Two minds. One floor.</span>
          </span>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm",
                  active ? "bg-lime text-lime-ink" : "text-muted hover:bg-panel-2 hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="px-3 text-xs leading-relaxed text-muted">
          Keys never leave this browser. The floor keeps the transcript.
        </p>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Mark />
            <span className="font-display text-lg font-extrabold">DYAD</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-sm",
                    active ? "bg-lime text-lime-ink" : "bg-panel text-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
