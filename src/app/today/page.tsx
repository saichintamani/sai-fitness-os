"use client";

import { useProfile } from "@/lib/store";
import { TRAINING_PROGRAM } from "@/lib/data";
import { getDayOfWeek, isRestDay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, Info } from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  const { profile } = useProfile();
  const dayOfWeek = getDayOfWeek();
  const isRest = isRestDay();
  const todaysWorkout = TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek);

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Today's Mission</h1>
        <div className="text-sm text-[var(--muted-fg)] font-medium bg-[var(--secondary)] px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {isRest || !todaysWorkout ? (
        <Card className="p-12 text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-black mb-2">Rest Day</h2>
            <p className="text-[var(--muted-fg)]">Recover and prepare for tomorrow.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Priority Alert */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-[var(--primary)] uppercase tracking-wider mb-1">Priority Focus</h4>
              <p className="text-sm font-medium">{todaysWorkout.priority}</p>
            </div>
          </div>

          {/* Workout Overview */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{todaysWorkout.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {todaysWorkout.targetMuscles.map(m => (
                      <span key={m} className="text-xs font-medium text-[var(--muted-fg)] bg-[var(--secondary)] px-2 py-0.5 rounded">
                        {m.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center text-sm font-medium text-[var(--muted-fg)] bg-[var(--secondary)] px-2.5 py-1 rounded-md">
                  <Clock className="w-4 h-4 mr-1.5" />
                  ~{todaysWorkout.estimatedDurationMin}m
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {todaysWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--secondary)]/50 transition-colors border border-transparent hover:border-[var(--border-color)] group cursor-pointer">
                    <div className="mt-1 text-[var(--muted-fg)] group-hover:text-[var(--primary)] transition-colors">
                      <Circle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">{ex.exerciseName}</h4>
                      <p className="text-xs sm:text-sm text-[var(--muted-fg)] mt-0.5">
                        {ex.sets} sets × {ex.repsMin}-{ex.repsMax} reps @ {ex.rirTarget} RIR
                      </p>
                      {ex.notes && (
                        <p className="text-xs text-[var(--primary)] mt-1.5 font-medium bg-[var(--primary)]/10 inline-block px-2 py-0.5 rounded">
                          {ex.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-xs font-medium text-[var(--muted-fg)] bg-[var(--secondary)] px-2 py-1 rounded whitespace-nowrap">
                      {ex.restSeconds}s rest
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/workout/active" className="w-full">
                <Button className="w-full mt-6 h-12 text-md font-bold tracking-wide shadow-lg shadow-[var(--primary)]/20">
                  START LOGGING WORKOUT
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
