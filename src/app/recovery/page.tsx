"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Battery, BatteryWarning, Moon, Brain, AlertTriangle } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";

export default function RecoveryPage() {
  const readinessScore = 65; // Mock computed score

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recovery & Fatigue Engine</h1>
          <p className="text-[var(--muted-fg)]">System readiness assessment.</p>
        </div>
        <Button className="bg-[var(--primary)] text-white">
          <Activity className="w-4 h-4 mr-2" />
          Log Morning Readiness
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Readiness */}
        <Card className="flex flex-col items-center justify-center p-8 text-center border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-fg)] mb-6">Readiness Score</h3>
          <ProgressRing 
            progress={readinessScore} 
            size={160} 
            strokeWidth={12}
            color={readinessScore > 75 ? "#10b981" : readinessScore > 50 ? "#f97316" : "#ef4444"}
            icon={
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black">{readinessScore}</span>
                <span className="text-xs text-[var(--muted-fg)]">/ 100</span>
              </div>
            }
          />
          <p className="mt-6 text-sm text-[var(--muted-fg)] italic max-w-xs">
            This is an app-generated training indicator, not a medical assessment.
          </p>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {readinessScore <= 70 && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
              <BatteryWarning className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Fatigue Engine Warning</span>
                Based on your last 3 days of sleep, high systemic soreness, and low energy levels, your recovery is suboptimal.
                <br/><br/>
                <strong>Recommendation:</strong> Reduce volume by 1 set per exercise today or keep RIR at 3+. Consider a full deload next week.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center text-sm font-bold uppercase text-[var(--muted-fg)] mb-3">
                <Moon className="w-4 h-4 mr-2 text-indigo-500" /> Sleep
              </div>
              <div className="text-2xl font-black">6.5h</div>
              <p className="text-xs text-rose-500 font-medium mt-1">Below 8h target</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center text-sm font-bold uppercase text-[var(--muted-fg)] mb-3">
                <Battery className="w-4 h-4 mr-2 text-emerald-500" /> Energy
              </div>
              <div className="text-2xl font-black">Medium</div>
              <p className="text-xs text-[var(--muted-fg)] mt-1">Stable</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center text-sm font-bold uppercase text-[var(--muted-fg)] mb-3">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Soreness
              </div>
              <div className="text-2xl font-black">High</div>
              <p className="text-xs text-[var(--muted-fg)] mt-1">Legs & Chest</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center text-sm font-bold uppercase text-[var(--muted-fg)] mb-3">
                <Brain className="w-4 h-4 mr-2 text-sky-500" /> Stress
              </div>
              <div className="text-2xl font-black">Low</div>
              <p className="text-xs text-[var(--muted-fg)] mt-1">Optimal</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
