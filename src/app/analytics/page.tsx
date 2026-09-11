"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { TRAINING_PROGRAM, MUSCLE_GROUP_META, PHYSIQUE_GOALS } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  Activity, BarChart3, Target, TrendingUp, TrendingDown, Minus,
  Trophy, Dumbbell, CheckCircle2, XCircle, Clock, Zap, Award, Shield
} from "lucide-react";

type Tab = "muscle" | "strength" | "adherence" | "physique";

// ── Muscle Volume Calculator ────────────────────────────────
function calculateMuscleVolume(workoutLogs: typeof import("@/lib/types").WorkoutLog[]) {
  const volume: Record<string, { sets: number; exercises: string[]; frequency: number }> = {};

  workoutLogs.forEach(workout => {
    const musclesHit = new Set<string>();
    workout.exercises.forEach(ex => {
      const muscles = guessMuscles(ex.exerciseName);
      const completedSets = ex.sets.filter(s => s.completed).length || ex.sets.length;
      muscles.forEach(m => {
        if (!volume[m]) volume[m] = { sets: 0, exercises: [], frequency: 0 };
        volume[m].sets += completedSets;
        if (!volume[m].exercises.includes(ex.exerciseName)) volume[m].exercises.push(ex.exerciseName);
        musclesHit.add(m);
      });
    });
    musclesHit.forEach(m => { if (volume[m]) volume[m].frequency++; });
  });

  return volume;
}

function guessMuscles(name: string): string[] {
  const n = name.toLowerCase();
  if (n.includes("bench") || n.includes("fly") || n.includes("chest") || n.includes("push-up") || n.includes("dip")) return ["chest", "triceps"];
  if (n.includes("lateral raise") || n.includes("lateral")) return ["lateral-delts"];
  if (n.includes("shoulder press") || n.includes("overhead press")) return ["front-delts", "lateral-delts", "triceps"];
  if (n.includes("reverse fly") || n.includes("face pull") || n.includes("rear")) return ["rear-delts"];
  if (n.includes("pulldown") || n.includes("pull-up")) return ["lats", "biceps"];
  if (n.includes("row") && !n.includes("upright")) return ["upper-back", "lats", "biceps"];
  if (n.includes("shrug")) return ["traps"];
  if (n.includes("curl") && !n.includes("leg")) return ["biceps"];
  if (n.includes("tricep") || n.includes("pushdown") || n.includes("skull") || n.includes("close-grip")) return ["triceps"];
  if (n.includes("squat") || n.includes("leg press") || n.includes("leg extension") || n.includes("lunge")) return ["quads", "glutes"];
  if (n.includes("deadlift") || n.includes("rdl") || n.includes("leg curl") || n.includes("hamstring")) return ["hamstrings", "glutes"];
  if (n.includes("calf")) return ["calves"];
  if (n.includes("plank") || n.includes("crunch") || n.includes("core") || n.includes("ab")) return ["core"];
  return [];
}

// ── Optimal Volume Ranges ───────────────────────────────────
const OPTIMAL_VOLUME: Record<string, { min: number; max: number }> = {
  "chest": { min: 10, max: 20 },
  "front-delts": { min: 6, max: 12 },
  "lateral-delts": { min: 12, max: 20 },
  "rear-delts": { min: 10, max: 16 },
  "upper-back": { min: 10, max: 20 },
  "lats": { min: 10, max: 20 },
  "biceps": { min: 10, max: 16 },
  "triceps": { min: 10, max: 16 },
  "quads": { min: 10, max: 20 },
  "hamstrings": { min: 8, max: 14 },
  "glutes": { min: 8, max: 16 },
  "calves": { min: 8, max: 16 },
  "core": { min: 6, max: 12 },
};

export default function AnalyticsPage() {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("muscle");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "muscle", label: "Muscle Development", icon: <Activity className="w-4 h-4" /> },
    { id: "strength", label: "Strength", icon: <Dumbbell className="w-4 h-4" /> },
    { id: "adherence", label: "Consistency", icon: <Shield className="w-4 h-4" /> },
    { id: "physique", label: "Physique Balance", icon: <Target className="w-4 h-4" /> },
  ];

  // Use program data as default when no logs exist
  const hasLogs = state.workoutLogs.length > 0;
  const muscleVolume = hasLogs ? calculateMuscleVolume(state.workoutLogs) : calculateProgramVolume();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-[var(--muted-fg)]">Data-driven insights from your training.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-[var(--secondary)]/50 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[var(--card-bg)] text-[var(--fg)] shadow-sm"
                : "text-[var(--muted-fg)] hover:text-[var(--fg)]"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {!hasLogs && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-start gap-3 text-sm">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Showing program targets</span>
            No workout sessions logged yet. The data below shows your <em>planned</em> weekly volume from the training program. Start logging workouts to see real analytics.
          </div>
        </div>
      )}

      {/* Muscle Development Tab */}
      {activeTab === "muscle" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Which muscles are getting enough volume?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(MUSCLE_GROUP_META)
              .filter(([key]) => key !== "lower-back" && key !== "forearms" && key !== "traps")
              .map(([key, meta]) => {
                const data = muscleVolume[key] || { sets: 0, exercises: [], frequency: 0 };
                const optimal = OPTIMAL_VOLUME[key] || { min: 8, max: 16 };
                const pct = Math.min(100, (data.sets / optimal.max) * 100);
                const status = data.sets >= optimal.min
                  ? data.sets <= optimal.max ? "optimal" : "high"
                  : "low";
                const priority = PHYSIQUE_GOALS.find(g => g.muscleGroup === key);

                return (
                  <Card key={key} className="relative overflow-hidden">
                    {priority && priority.rank <= 3 && (
                      <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-bold rounded uppercase tracking-wider">
                          Priority #{priority.rank}
                        </span>
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="font-bold text-sm">{meta.label}</span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-3xl font-black">{data.sets}</div>
                          <div className="text-[10px] text-[var(--muted-fg)] uppercase tracking-wider">
                            sets/week ({optimal.min}-{optimal.max} optimal)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{data.frequency}×</div>
                          <div className="text-[10px] text-[var(--muted-fg)]">freq</div>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: status === "optimal" ? "#10b981" : status === "high" ? "#f97316" : meta.color,
                          }}
                        />
                      </div>

                      <div className={`text-[10px] font-bold uppercase tracking-wider ${
                        status === "optimal" ? "text-emerald-500" : status === "high" ? "text-amber-500" : "text-rose-500"
                      }`}>
                        {status === "optimal" ? "✓ Optimal Range" : status === "high" ? "↑ High Volume" : "↓ Below Target"}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Strength Tab */}
      {activeTab === "strength" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Which exercises are progressing fastest?</h2>

          {!hasLogs ? (
            <Card className="p-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-[var(--muted-fg)] opacity-30 mb-4" />
              <h3 className="font-bold mb-2">No Workout Data Yet</h3>
              <p className="text-sm text-[var(--muted-fg)] max-w-md mx-auto">
                Start logging your workouts to see strength progression, PRs, and performance trends.
                Each logged set contributes to your analytics.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getExerciseStats(state.workoutLogs).map((ex, i) => (
                <Card key={ex.name} className="relative">
                  {ex.isPR && (
                    <div className="absolute top-3 right-3">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-bold text-sm pr-8">{ex.name}</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-lg font-black">{ex.bestWeight}<span className="text-xs text-[var(--muted-fg)]">kg</span></div>
                        <div className="text-[10px] text-[var(--muted-fg)] uppercase">Best Load</div>
                      </div>
                      <div>
                        <div className="text-lg font-black">{ex.bestReps}</div>
                        <div className="text-[10px] text-[var(--muted-fg)] uppercase">Best Reps</div>
                      </div>
                      <div>
                        <div className="text-lg font-black">{ex.totalVolume}<span className="text-xs text-[var(--muted-fg)]">kg</span></div>
                        <div className="text-[10px] text-[var(--muted-fg)] uppercase">Total Vol</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      ex.trend === "up" ? "text-emerald-500" : ex.trend === "down" ? "text-rose-500" : "text-[var(--muted-fg)]"
                    }`}>
                      {ex.trend === "up" ? <TrendingUp className="w-3 h-3" /> : ex.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {ex.trend === "up" ? "Progressing" : ex.trend === "down" ? "Declining" : "Stable"}
                      <span className="text-[var(--muted-fg)] ml-1">· {ex.sessions} sessions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adherence Tab */}
      {activeTab === "adherence" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">How consistent am I?</h2>
          <p className="text-xs text-[var(--muted-fg)] italic">Behavioral tracking score — not a medical score.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AdherenceCard label="Workout Adherence" value={getWorkoutAdherence(state.workoutLogs)} icon={<Dumbbell className="w-5 h-5" />} />
            <AdherenceCard label="Nutrition Logging" value={getNutritionAdherence(state.nutritionLogs)} icon={<CheckCircle2 className="w-5 h-5" />} />
            <AdherenceCard label="Protein Target" value={getProteinAdherence(state.nutritionLogs, state.profile?.weightKg || 49)} icon={<Target className="w-5 h-5" />} />
            <AdherenceCard label="Water Logging" value={getWaterAdherence(state.nutritionLogs)} icon={<Activity className="w-5 h-5" />} />
            <AdherenceCard label="Recovery Logging" value={getRecoveryAdherence(state.recoveryLogs)} icon={<Shield className="w-5 h-5" />} />
            <AdherenceCard
              label="Overall Score"
              value={Math.round((getWorkoutAdherence(state.workoutLogs) + getNutritionAdherence(state.nutritionLogs) + getProteinAdherence(state.nutritionLogs, state.profile?.weightKg || 49)) / 3)}
              icon={<Award className="w-5 h-5" />}
              highlight
            />
          </div>

          <Card className="p-4">
            <p className="text-xs text-[var(--muted-fg)] leading-relaxed">
              <strong>How this is calculated:</strong> Workout adherence = logged sessions / planned sessions (6/week). Protein adherence = days meeting ≥80% of protein target. Nutrition logging = days with at least one meal logged. These are calculated from your actual logged behavior.
            </p>
          </Card>
        </div>
      )}

      {/* Physique Balance Tab */}
      {activeTab === "physique" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Is my physique developing proportionally?</h2>
          <p className="text-xs text-[var(--muted-fg)] italic mb-4">
            Based on training volume and frequency — not visual diagnosis from numerical data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Shoulder Development", muscles: ["front-delts", "lateral-delts", "rear-delts"] },
              { label: "Chest Development", muscles: ["chest"] },
              { label: "Back Development", muscles: ["lats", "upper-back"] },
              { label: "Arm Development", muscles: ["biceps", "triceps"] },
              { label: "Leg Development", muscles: ["quads", "hamstrings", "glutes"] },
              { label: "Core Development", muscles: ["core"] },
            ].map(group => {
              const totalSets = group.muscles.reduce((sum, m) => sum + (muscleVolume[m]?.sets || 0), 0);
              const totalOptimalMax = group.muscles.reduce((sum, m) => sum + (OPTIMAL_VOLUME[m]?.max || 16), 0);
              const pct = Math.min(100, Math.round((totalSets / totalOptimalMax) * 100));

              return (
                <Card key={group.label} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm">{group.label}</h4>
                    <span className="text-lg font-black">{totalSets} <span className="text-xs text-[var(--muted-fg)] font-normal">sets</span></span>
                  </div>
                  <div className="h-3 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? "linear-gradient(90deg, #10b981, #34d399)" : pct >= 40 ? "linear-gradient(90deg, #f97316, #fb923c)" : "linear-gradient(90deg, #ef4444, #f87171)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-[var(--muted-fg)]">
                    <span>{group.muscles.map(m => MUSCLE_GROUP_META[m]?.label || m).join(", ")}</span>
                    <span>{pct}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────
function AdherenceCard({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  const color = value >= 80 ? "#10b981" : value >= 50 ? "#f97316" : "#ef4444";
  return (
    <Card className={`p-5 flex flex-col items-center text-center ${highlight ? "border-[var(--primary)]/30 bg-[var(--primary)]/5" : ""}`}>
      <ProgressRing progress={value} size={80} color={color} icon={
        <span className="text-lg font-black">{value}%</span>
      } />
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[var(--muted-fg)]">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-fg)]">{label}</span>
      </div>
    </Card>
  );
}

function calculateProgramVolume() {
  const volume: Record<string, { sets: number; exercises: string[]; frequency: number }> = {};
  TRAINING_PROGRAM.forEach(day => {
    const musclesHit = new Set<string>();
    day.exercises.forEach(ex => {
      const muscles = guessMuscles(ex.exerciseName);
      muscles.forEach(m => {
        if (!volume[m]) volume[m] = { sets: 0, exercises: [], frequency: 0 };
        volume[m].sets += ex.sets;
        if (!volume[m].exercises.includes(ex.exerciseName)) volume[m].exercises.push(ex.exerciseName);
        musclesHit.add(m);
      });
    });
    musclesHit.forEach(m => { if (volume[m]) volume[m].frequency++; });
  });
  return volume;
}

function getExerciseStats(workoutLogs: any[]) {
  const stats: Record<string, { bestWeight: number; bestReps: number; totalVolume: number; sessions: number; isPR: boolean; trend: string }> = {};
  workoutLogs.forEach(workout => {
    workout.exercises.forEach((ex: any) => {
      if (!stats[ex.exerciseName]) stats[ex.exerciseName] = { bestWeight: 0, bestReps: 0, totalVolume: 0, sessions: 0, isPR: false, trend: "stable" };
      const s = stats[ex.exerciseName];
      s.sessions++;
      ex.sets.forEach((set: any) => {
        if (set.weightKg > s.bestWeight) { s.bestWeight = set.weightKg; s.isPR = true; }
        if (set.reps > s.bestReps) s.bestReps = set.reps;
        s.totalVolume += set.weightKg * set.reps;
      });
    });
  });
  return Object.entries(stats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.totalVolume - a.totalVolume);
}

function getWorkoutAdherence(logs: any[]) {
  if (logs.length === 0) return 0;
  const weeks = Math.max(1, Math.ceil(logs.length / 6));
  return Math.min(100, Math.round((logs.length / (weeks * 6)) * 100));
}

function getNutritionAdherence(logs: any[]) {
  return logs.length > 0 ? Math.min(100, Math.round((logs.length / 7) * 100)) : 0;
}

function getProteinAdherence(logs: any[], weightKg: number) {
  if (logs.length === 0) return 0;
  const target = Math.round(weightKg * 2.2);
  const daysHit = logs.filter(l => l.totalProtein >= target * 0.8).length;
  return Math.round((daysHit / logs.length) * 100);
}

function getWaterAdherence(logs: any[]) {
  if (logs.length === 0) return 0;
  const daysHit = logs.filter(l => l.waterLiters >= 2.5).length;
  return Math.round((daysHit / logs.length) * 100);
}

function getRecoveryAdherence(logs: any[]) {
  return logs.length > 0 ? Math.min(100, Math.round((logs.length / 7) * 100)) : 0;
}
