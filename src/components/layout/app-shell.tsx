"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sidebar, MobileNav } from "./navigation";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, isHydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Check onboarding status
    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const hasCompletedOnboarding = state.profile?.onboardingCompleted;

    if (!hasCompletedOnboarding && !isOnboardingRoute) {
      router.push("/onboarding");
    } else if (hasCompletedOnboarding && isOnboardingRoute) {
      router.push("/");
    }
  }, [isHydrated, state.profile?.onboardingCompleted, pathname, router]);

  // Don't render until hydration is complete to prevent layout shift
  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If on onboarding route, just render the content without sidebar/header
  if (pathname.startsWith("/onboarding")) {
    return <main className="min-h-screen bg-[var(--bg)]">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col pb-16 md:pb-0 min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
