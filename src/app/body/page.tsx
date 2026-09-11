"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { MUSCLE_GROUP_META, PHYSIQUE_GOALS, TRAINING_PROGRAM } from "@/lib/data";
import { analyzeReadiness, analyzeNutrition, analyzeWeightTrend } from "@/lib/ai/local-coach";
import { FitnessContext } from "@/lib/ai/provider";
import { getCurrentWeek, getCurrentPhase } from "@/lib/utils";
import { MuscleMap } from "@/components/body/muscle-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  Activity, Dumbbell, Scale, Target, TrendingUp, TrendingDown,
  Minus, Trophy, Moon, Heart, Flame, Zap, Shield, CheckCircle2
} from "lucide-react";

export default function BodyOSPage() {
  const { state } = useStore();
  const [selectedMuscle, setSelectedMuscle] = useState<string>("lateral-delts");

  if (!state.profile) return null;

  const context: FitnessContext = {
    profile: state.profile,
    recentWorkouts: state.workoutLogs.slice(-14),
    recentNutrition: state.nutritionLogs.slice(-7),
    recentRecovery: state.recoveryLogs.slice(-7),
    measurements: state.measurements,
    currentWeek: getCurrentWeek(new Date(state.profile.programStartDate)),
    currentPhase: getCurrentPhase(getCurrentWeek(new Date(state.profile.programStartDate))),
  };

  const readiness = analyzeReadiness(context);
  const nutrition = analyzeNutrition(context);
  const weight = analyzeWeightTrend(context);

  const selectedMuscleMeta = MUSCLE_GROUP_META[selectedMuscle];

  // Calculate total weekly sets from program
  const totalPlannedSets = TRAINING_PROGRAM.reduce((sum, day) => sum + day.exercises.reduce((s, e) => s + e.sets, 0), 0);
  const totalLoggedSets = state.workoutLogs.flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length;

  // PRs from logged data
  const prCount = new Set(
    state.workoutLogs.flatMap(w => w.exercises.flatMap(e =>
      e.sets.filter(s => s.weightKg > 0).map(s => `${e.exerciseName}-${s.weightKg}`)
    ))
  ).size;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Body OS</h1>
          <p className="text-[var(--muted-fg)]">Transformation command center.</p>
        </div>
        <div className="text-right text-sm text-[var(--muted-fg)]">
          Week {context.currentWeek} · {context.currentPhase}
        </div>
      </div>

      {/* ── Top Metrics Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Weight / Structure */}
        <Card className="p-4 bg-gradient-to-br from-[var(--card-bg)] to-[var(--secondary)]/30">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold mb-2">
            <Scale className="w-3.5 h-3.5" /> Weight
          </div>
          <div className="text-2xl font-black">{state.profile.weightKg}<span className="text-sm text-[var(--muted-fg)] font-medium ml-1">kg</span></div>
          {weight.weeklyRate !== null && (
            <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
              weight.trend === "gaining-optimal" ? "text-emerald-500" :
              weight.trend === "gaining-fast" ? "text-amber-500" : "text-rose-500"
            }`}>
              {weight.weeklyRate > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {weight.weeklyRate > 0 ? "+" : ""}{weight.weeklyRate.toFixed(2)} kg/wk
            </div>
          )}
        </Card>

        {/* Strength / Performance */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold mb-2">
            <Dumbbell className="w-3.5 h-3.5" /> Strength
          </div>
          <div className="text-2xl font-black">{totalLoggedSets || "—"}</div>
          <div className="text-xs text-[var(--muted-fg)]">sets logged</div>
        </Card>

        {/* PRs */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> PRs
          </div>
          <div className="text-2xl font-black">{prCount || "—"}</div>
          <div className="text-xs text-[var(--muted-fg)]">unique records</div>
        </Card>

        {/* Readiness / Recovery */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Readiness
          </div>
          <div className={`text-2xl font-black ${
            readiness.score >= 75 ? "text-emerald-500" : readiness.score >= 50 ? "text-amber-500" : "text-rose-500"
          }`}>
            {readiness.score}
          </div>
          <div className="text-xs text-[var(--muted-fg)]">/ 100</div>
        </Card>

        {/* Nutrition */}
        <Card className="p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Protein
          </div>
          <div className="text-2xl font-black">{nutrition.proteinAdherence}%</div>
          <div className="text-xs text-[var(--muted-fg)]">adherence</div>
        </Card>
      </div>

      {/* ── Body Map + Muscle Inspector ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Priority Muscles & Recovery */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-[var(--muted-fg)] uppercase tracking-wider">
                <Target className="w-4 h-4 mr-2" /> Muscle Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PHYSIQUE_GOALS.slice(0, 5).map((goal, i) => (
                <button
                  key={goal.muscleGroup}
                  onClick={() => setSelectedMuscle(goal.muscleGroup)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-left ${
                    selectedMuscle === goal.muscleGroup
                      ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                      : "hover:bg-[var(--secondary)]/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black bg-[var(--secondary)]">{i + 1}</div>
                    <div>
                      <div className="text-sm font-bold">{MUSCLE_GROUP_META[goal.muscleGroup]?.label}</div>
                      <div className="text-[10px] text-[var(--muted-fg)]">{goal.emphasis}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MUSCLE_GROUP_META[goal.muscleGroup]?.color }} />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Recovery Factors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-[var(--muted-fg)] uppercase tracking-wider">
                <Shield className="w-4 h-4 mr-2" /> Recovery Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readiness.factors.length > 0 ? readiness.factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    f.status === "good" ? "bg-emerald-500/10 text-emerald-500" :
                    f.status === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {f.value}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-[var(--muted-fg)] italic">Log recovery data to see breakdown.</p>
              )}
              <p className="text-[10px] text-[var(--muted-fg)] italic pt-2 border-t border-[var(--border-color)]">
                Training readiness indicator — not a medical assessment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Center + Right: Interactive Muscle Map */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="pb-0 shrink-0">
            <CardTitle className="text-sm text-[var(--muted-fg)] uppercase tracking-wider">
              Anatomy Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 min-h-[300px]">
              <MuscleMap
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
                className="h-full"
              />
            </div>

            {/* Selected Muscle Inspector */}
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--secondary)]/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: selectedMuscleMeta?.color || "var(--primary)" }}
                  />
                  {selectedMuscleMeta?.label || "Select a muscle"}
                </h3>
                {PHYSIQUE_GOALS.find(g => g.muscleGroup === selectedMuscle)?.rank! <= 3 && (
                  <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold rounded uppercase tracking-wider">
                    Priority Target
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Weekly Sets</div>
                  <div className="text-lg font-bold">
                    {TRAINING_PROGRAM.reduce((sum, day) => {
                      return sum + day.exercises.filter(e => {
                        const n = e.exerciseName.toLowerCase();
                        const m = selectedMuscle;
                        if (m === "chest") return n.includes("bench") || n.includes("fly") || n.includes("dip");
                        if (m === "lateral-delts") return n.includes("lateral");
                        if (m === "lats") return n.includes("pulldown") || n.includes("pull-up") || n.includes("row");
                        if (m === "biceps") return n.includes("curl") && !n.includes("leg");
                        if (m === "triceps") return n.includes("tricep") || n.includes("pushdown") || n.includes("skull");
                        if (m === "quads") return n.includes("squat") || n.includes("leg press") || n.includes("extension") || n.includes("lunge");
                        return false;
                      }).reduce((s, e) => s + e.sets, 0);
                    }, 0) || "—"}
                  </div>
                </div>
                <div className="bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Frequency</div>
                  <div className="text-lg font-bold">2× <span className="text-xs text-[var(--muted-fg)]">/wk</span></div>
                </div>
                <div className="bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Volume Trend</div>
                  <div className="text-lg font-bold text-emerald-500 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> Increasing
                  </div>
                </div>
                <div className="bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--border-color)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] mb-1">Recovery</div>
                  <div className="text-lg font-bold text-emerald-500">Good</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
