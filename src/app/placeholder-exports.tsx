"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Dumbbell, Apple, TrendingUp, Activity, BrainCircuit, CalendarDays, User, Settings } from "lucide-react";

export function WorkoutPage() {
  return <EmptyState icon={Dumbbell} title="Workout Logs" description="This module is planned for Part 2. It will track all your historic workouts." actionLabel="Go Home" actionHref="/" />;
}

export function NutritionPage() {
  return <EmptyState icon={Apple} title="Nutrition Engine" description="This module is planned for Part 2. It will track macros, meals, and hydration." actionLabel="Go Home" actionHref="/" />;
}

export function ProgressPage() {
  return <EmptyState icon={TrendingUp} title="Progress Tracking" description="This module is planned for Part 2. View photo timelines and measurement charts." actionLabel="Go Home" actionHref="/" />;
}

export function RecoveryPage() {
  return <EmptyState icon={Activity} title="Recovery Status" description="This module is planned for Part 2. Log sleep and soreness to calculate readiness." actionLabel="Go Home" actionHref="/" />;
}

export function CoachPage() {
  return <EmptyState icon={BrainCircuit} title="AI Coach" description="This module is planned for Part 2. It will provide intelligent recommendations based on your data." actionLabel="Go Home" actionHref="/" />;
}

export function PlanPage() {
  return <EmptyState icon={CalendarDays} title="Training Plan" description="This module is planned for Part 2. View and edit your upcoming macrocycle." actionLabel="Go Home" actionHref="/" />;
}

export function ProfilePage() {
  return <EmptyState icon={User} title="User Profile" description="This module is planned for Part 2. Edit your goals, stats, and budget here." actionLabel="Go Home" actionHref="/" />;
}

export function SettingsPage() {
  return <EmptyState icon={Settings} title="App Settings" description="This module is planned for Part 2. Configure themes, notifications, and connections." actionLabel="Go Home" actionHref="/" />;
}
