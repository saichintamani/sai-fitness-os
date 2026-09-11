"use client";

import { useProfile } from "@/lib/store";
import { getGreeting, getCurrentWeek, getCurrentPhase, getTrainingDayLabel, getDayOfWeek, isRestDay } from "@/lib/utils";
import { TRAINING_PROGRAM } from "@/lib/data";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Droplets, Flame, Moon, ArrowRight, BrainCircuit, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { profile } = useProfile();

  if (!profile) return null; // Let AppShell handle redirection

  const startDate = new Date(profile.programStartDate);
  const currentWeek = getCurrentWeek(startDate);
  const currentPhase = getCurrentPhase(currentWeek);
  
  const dayOfWeek = getDayOfWeek();
  const isRest = isRestDay();
  const trainingDay = getTrainingDayLabel(dayOfWeek);
  
  const todaysWorkout = TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {profile.name}.
        </h1>
        <p className="text-[var(--muted-fg)] flex items-center">
          Week {currentWeek.toString().padStart(2, '0')} <span className="mx-2">·</span> {currentPhase}
        </p>
      </section>

      {/* Missed Workout Engine */}
      <section>
        <Card className="bg-rose-500/10 border-rose-500/30 text-rose-500 mb-6 relative overflow-hidden">
          <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold flex items-center mb-1"><AlertTriangle className="w-5 h-5 mr-2" /> Missed Workout Detected</h3>
              <p className="text-sm opacity-90 max-w-xl">
                You missed <strong>Legs A + Core</strong> yesterday. Since today is Push B, stacking them would compromise recovery. 
                <br/><strong>Recommendation:</strong> Skip Legs A and continue with Push B today. Hit legs hard on Saturday.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/20 w-full sm:w-auto">
                Resume Yesterday
              </Button>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white w-full sm:w-auto">
                Skip & Proceed
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Today's Mission */}
      <section>
        <Card className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--secondary)] overflow-hidden relative border-[var(--primary)]/20">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Dumbbell className="w-48 h-48" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-[var(--muted-fg)]">
              Today's Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {isRest ? (
              <div>
                <h2 className="text-4xl font-black mb-2">FULL REST</h2>
                <p className="text-lg text-[var(--muted-fg)]">Focus on nutrition and recovery.</p>
              </div>
            ) : todaysWorkout ? (
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">{todaysWorkout.label}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {todaysWorkout.targetMuscles.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold uppercase tracking-wider">
                      {m.replace('-', ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-fg)] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse-glow" />
                  Est. duration: ~{todaysWorkout.estimatedDurationMin} min
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-black mb-2">NO WORKOUT SCHEDULED</h2>
              </div>
            )}

            {!isRest && (
              <Button asChild size="lg" className="w-full sm:w-auto font-bold tracking-wide">
                <Link href="/today">
                  START WORKOUT <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Daily Progress */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Daily Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <ProgressRing progress={0} size={60} icon={<Dumbbell className="w-5 h-5 text-[var(--primary)]" />} />
            <span className="text-xs font-medium mt-3 uppercase tracking-wider text-[var(--muted-fg)]">Workout</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <ProgressRing progress={45} size={60} color="#3b82f6" icon={<Flame className="w-5 h-5 text-blue-500" />} />
            <span className="text-xs font-medium mt-3 uppercase tracking-wider text-[var(--muted-fg)]">Protein</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <ProgressRing progress={60} size={60} color="#0ea5e9" icon={<Droplets className="w-5 h-5 text-sky-500" />} />
            <span className="text-xs font-medium mt-3 uppercase tracking-wider text-[var(--muted-fg)]">Water</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <ProgressRing progress={100} size={60} color="#a855f7" icon={<span className="text-xs font-bold text-purple-500">Cr</span>} />
            <span className="text-xs font-medium mt-3 uppercase tracking-wider text-[var(--muted-fg)]">Creatine</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <ProgressRing progress={85} size={60} color="#6366f1" icon={<Moon className="w-5 h-5 text-indigo-500" />} />
            <span className="text-xs font-medium mt-3 uppercase tracking-wider text-[var(--muted-fg)]">Sleep</span>
          </Card>
        </div>
      </section>

      {/* Coach Insight */}
      <section>
        <Card className="border-l-4 border-l-[var(--primary)]">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="bg-[var(--primary)]/10 p-3 rounded-full shrink-0">
              <BrainCircuit className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Coach Insight</h4>
              <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                {todaysWorkout 
                  ? `Focus heavily on ${todaysWorkout.priority.toLowerCase()} today. Keep your rest periods strict at 60s for isolation movements.`
                  : `Use today's rest to meal prep. Hitting your protein target consistently is the bottleneck for lean bulking in a hostel.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
