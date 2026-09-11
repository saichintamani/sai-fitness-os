"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Dumbbell,
  Apple,
  TrendingUp,
  Activity,
  BrainCircuit,
  CalendarDays,
  User,
  Settings,
  BarChart3,
  Heart,
} from "lucide-react";

interface NavItemDef {
  label: string;
  href: string;
  icon: string;
  desktopOnly?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Today", href: "/today", icon: "Activity" },
  { label: "Workout", href: "/workout", icon: "Dumbbell" },
  { label: "Nutrition", href: "/nutrition", icon: "Apple" },
  { label: "Body OS", href: "/body", icon: "User" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Progress", href: "/progress", icon: "TrendingUp", desktopOnly: true },
  { label: "Recovery", href: "/recovery", icon: "Heart", desktopOnly: true },
  { label: "AI Coach", href: "/coach", icon: "BrainCircuit" },
  { label: "Calendar", href: "/calendar", icon: "CalendarDays", desktopOnly: true },
  { label: "Plan", href: "/plan", icon: "CalendarDays", desktopOnly: true },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Apple: <Apple className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
  CalendarDays: <CalendarDays className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || <Home className="h-5 w-5" />;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] z-40">
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tighter text-gradient">SAI OS</h1>
        <p className="text-xs text-[var(--muted-fg)] mt-1 tracking-widest uppercase">Fitness OS</p>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--sidebar-fg)] hover:bg-[var(--secondary)] hover:text-[var(--fg)]"
              )}
            >
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border-color)] space-y-0.5">
        <Link
          href="/profile"
          className={cn(
            "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            pathname === "/profile" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--sidebar-fg)] hover:bg-[var(--secondary)] hover:text-[var(--fg)]"
          )}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            pathname === "/settings" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--sidebar-fg)] hover:bg-[var(--secondary)] hover:text-[var(--fg)]"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = [
    { label: "Home", href: "/", icon: "Home" },
    { label: "Workout", href: "/workout", icon: "Dumbbell" },
    { label: "Coach", href: "/coach", icon: "BrainCircuit" },
    { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    { label: "Body", href: "/body", icon: "User" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--border-color)] z-50 px-2 pb-safe">
      <nav className="flex h-full items-center justify-around">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors",
                isActive ? "text-[var(--primary)]" : "text-[var(--muted-fg)]"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--primary)] rounded-b-md" />
              )}
              {getIcon(item.icon)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
