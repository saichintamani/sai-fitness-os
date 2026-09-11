"use client";

import { useStore } from "@/lib/store";
import { getCurrentWeek } from "@/lib/utils";
import { TRAINING_PROGRAM } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, TrendingUp, TrendingDown, Minus, BarChart3, Scale } from "lucide-react";
import { analyzeWeightTrend } from "@/lib/ai/local-coach";

export default function ProgressPage() {
  const { state } = useStore();
  
  if (!state.profile) return null;

  const startDate = new Date(state.profile.programStartDate);
  const currentWeek = getCurrentWeek(startDate);

  // ── Calculate Plan vs Actual (This Week) ────────────────
  const today = new Date();
  // Get start of week (Monday)
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutsThisWeek = state.workoutLogs.filter(w => new Date(w.date) >= startOfWeek);
  const nutritionThisWeek = state.nutritionLogs.filter(n => new Date(n.date) >= startOfWeek);
  const recoveryThisWeek = state.recoveryLogs.filter(r => new Date(r.date) >= startOfWeek);

  const totalPlannedSets = TRAINING_PROGRAM.reduce((sum, d) => sum + d.exercises.reduce((s, e) => s + e.sets, 0), 0);
  const actualSets = workoutsThisWeek.flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length;
  const setsPct = totalPlannedSets > 0 ? Math.min(100, Math.round((actualSets / totalPlannedSets) * 100)) : 0;

  const proteinTarget = Math.round(state.profile.weightKg * 2.2);
  const daysHitProtein = nutritionThisWeek.filter(n => n.totalProtein >= proteinTarget * 0.8).length;
  const proteinPct = Math.round((daysHitProtein / 7) * 100);

  const daysHitSleep = recoveryThisWeek.filter(r => r.sleepHours >= 7).length;
  const sleepPct = Math.round((daysHitSleep / 7) * 100);

  // ── Weight Trend ────────────────────────────────────────
  const weightAnalysis = analyzeWeightTrend({
    profile: state.profile,
    recentWorkouts: [],
    recentNutrition: [],
    recentRecovery: [],
    measurements: state.measurements,
    currentWeek,
    currentPhase: "",
  });

  const weights = state.measurements.filter(m => m.weightKg).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const hasWeightData = weights.length >= 2;
  const lastWeights = weights.slice(-7); // Last 7 data points

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Engine</h1>
          <p className="text-[var(--muted-fg)]">Plan vs. Actual and Visual Tracking.</p>
        </div>
        <Button className="bg-[var(--primary)] text-white">
          <Camera className="w-4 h-4 mr-2" />
          Log Progress Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Timeline */}
        <Card className="md:col-span-2 border-[var(--primary)]/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Camera className="w-48 h-48" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-bold flex items-center">
              <Camera className="w-5 h-5 mr-2 text-[var(--primary)]" /> Transformation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-[3/4] bg-[var(--secondary)]/50 rounded-xl border border-[var(--border-color)] overflow-hidden relative flex flex-col items-center justify-center text-[var(--muted-fg)] transition-all hover:bg-[var(--secondary)]">
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold">Week 1 (Start)</span>
                <Camera className="w-8 h-8 opacity-20 mb-2" />
                <span className="text-xs font-medium">Add Photo</span>
              </div>
              <div className="aspect-[3/4] bg-[var(--secondary)]/30 rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center transition-all hover:bg-[var(--secondary)]/50 cursor-pointer">
                <span className="text-xs font-bold text-[var(--muted-fg)] block mb-1">Week 4</span>
                <span className="text-[10px] text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full font-bold">Upcoming</span>
              </div>
              <div className="hidden md:flex aspect-[3/4] bg-[var(--secondary)]/20 rounded-xl border border-dashed border-[var(--border-color)] flex-col items-center justify-center opacity-50">
                <span className="text-xs font-bold text-[var(--muted-fg)]">Week 8</span>
              </div>
              <div className="hidden md:flex aspect-[3/4] bg-[var(--secondary)]/20 rounded-xl border border-dashed border-[var(--border-color)] flex-col items-center justify-center opacity-50">
                <span className="text-xs font-bold text-[var(--muted-fg)]">Week 12</span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-6 bg-[var(--secondary)]/50 p-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              Keep consistent lighting, distance, and pose for accurate comparison. Visual changes take 4-6 weeks to become noticeable.
            </p>
          </CardContent>
        </Card>

        {/* Plan vs Actual */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" /> Plan vs. Actual <span className="text-[var(--muted-fg)] font-normal text-sm ml-2">(This Week)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Workout Volume (Sets)</span>
                <span className="font-bold">{actualSets} / {totalPlannedSets} <span className="text-[var(--muted-fg)] font-normal text-xs ml-1">Planned</span></span>
              </div>
              <div className="h-2.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000" style={{ width: \`\${setsPct}%\` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Protein Adherence</span>
                <span className="font-bold">{daysHitProtein} / 7 <span className="text-[var(--muted-fg)] font-normal text-xs ml-1">Days</span></span>
              </div>
              <div className="h-2.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: \`\${proteinPct}%\` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Sleep Target (7h+)</span>
                <span className="font-bold">{daysHitSleep} / 7 <span className="text-[var(--muted-fg)] font-normal text-xs ml-1">Days</span></span>
              </div>
              <div className="h-2.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: \`\${sleepPct}%\` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Tracker */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center"><Scale className="w-5 h-5 mr-2 text-sky-500" /> Weight Trend</span>
              {hasWeightData && weightAnalysis.weeklyRate !== null && (
                <span className={\`flex items-center text-sm font-bold px-2 py-1 rounded-md \${
                  weightAnalysis.trend === "gaining-optimal" ? "bg-emerald-500/10 text-emerald-500" :
                  weightAnalysis.trend === "gaining-fast" ? "bg-amber-500/10 text-amber-500" :
                  weightAnalysis.trend === "losing" ? "bg-rose-500/10 text-rose-500" : "bg-[var(--secondary)] text-[var(--fg)]"
                }\`}>
                  {weightAnalysis.weeklyRate > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : weightAnalysis.weeklyRate < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-1" /> : <Minus className="w-3.5 h-3.5 mr-1" />}
                  {weightAnalysis.weeklyRate > 0 ? "+" : ""}{weightAnalysis.weeklyRate.toFixed(2)} kg/wk
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-center">
            {!hasWeightData ? (
              <div className="text-center py-8">
                <Scale className="w-12 h-12 mx-auto text-[var(--muted-fg)] opacity-30 mb-3" />
                <h3 className="font-bold text-sm mb-1">Insufficient Data</h3>
                <p className="text-xs text-[var(--muted-fg)]">Log your weight at least twice to see trend analysis.</p>
              </div>
            ) : (
              <>
                <div className="w-full h-48 flex items-end justify-between px-2 gap-2 relative mt-4">
                  {/* Dynamic Chart based on real data */}
                  {Array.from({ length: 7 }).map((_, i) => {
                    const dataPoint = lastWeights[i];
                    if (!dataPoint) {
                      return <div key={i} className="w-full bg-[var(--secondary)]/30 h-[10%] rounded-t-sm" />;
                    }
                    
                    // Simple normalization for visualization: map weight to 20%-100% height
                    const minWeight = Math.min(...lastWeights.map(w => w.weightKg)) - 2;
                    const maxWeight = Math.max(...lastWeights.map(w => w.weightKg)) + 2;
                    const heightPct = Math.max(10, Math.min(100, ((dataPoint.weightKg - minWeight) / (maxWeight - minWeight)) * 100));
                    
                    const isLast = i === lastWeights.length - 1;

                    return (
                      <div key={i} className="w-full relative group h-full flex items-end">
                        <div 
                          className={\`w-full rounded-t-sm transition-all duration-500 \${isLast ? "bg-[var(--primary)] shadow-[0_0_15px_var(--primary)]" : "bg-[var(--secondary)] hover:bg-[var(--primary)]/50"}\`}
                          style={{ height: \`\${heightPct}%\` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--card-bg)] border border-[var(--border-color)] text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                          {dataPoint.weightKg} kg
                          <div className="text-[8px] text-[var(--muted-fg)] font-normal">{new Date(dataPoint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-sm bg-[var(--secondary)]/30 p-4 rounded-xl border border-[var(--border-color)]">
                  <span className="font-bold flex items-center gap-2 mb-1">
                    Coach Analysis
                  </span>
                  <p className="text-[var(--muted-fg)] leading-relaxed">
                    {weightAnalysis.reasoning}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
