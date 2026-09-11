"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { profile } = useProfile();

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center md:hidden">
        <h1 className="text-xl font-black tracking-tighter text-gradient">SAI OS</h1>
      </div>
      
      <div className="hidden md:flex items-center">
        {/* Breadcrumbs or contextual title could go here */}
      </div>

      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--primary)] rounded-full border border-[var(--bg)]"></span>
        </Button>

        {profile && (
          <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center font-bold text-sm text-[var(--secondary-fg)] ml-2 border border-[var(--border-color)]">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
