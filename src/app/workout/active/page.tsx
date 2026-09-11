"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Dumbbell, Clock, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { TRAINING_PROGRAM } from "@/lib/data"; // Using existing seed data structure for offline capability
import { getDayOfWeek } from "@/lib/utils";

// In a real app with Redux/Zustand, this would be globally persisted.
// For now, we will manage active session state in the component and sync to DB on complete.

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const dayOfWeek = getDayOfWeek();
  const todaysWorkout = TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek);

  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  
  // Inputs
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("");

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Logged Data
  const [loggedSets, setLoggedSets] = useState<{ exerciseIdx: number; set: number; weight: number; reps: number; rir: number }[]>([]);

  const exercise = todaysWorkout?.exercises[activeExerciseIdx];
  const isLastExercise = todaysWorkout ? activeExerciseIdx === todaysWorkout.exercises.length - 1 : true;
  const isLastSet = exercise ? currentSetIdx === exercise.sets - 1 : true;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
    } else if (isResting && timeRemaining <= 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, timeRemaining]);

  if (!todaysWorkout || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">No Active Workout Found</h2>
        <p className="text-[var(--muted-fg)] mb-6">You don't have a workout scheduled for today, or it's a rest day.</p>
        <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  const handleLogSet = () => {
    if (!weight || !reps || !rir) return;

    // Log the set
    setLoggedSets(prev => [
      ...prev,
      {
        exerciseIdx: activeExerciseIdx,
        set: currentSetIdx + 1,
        weight: Number(weight),
        reps: Number(reps),
        rir: Number(rir)
      }
    ]);

    // Check for Progressive Overload recommendation (Mock logic for now)
    const hitTargetReps = Number(reps) >= exercise.repsMax;
    const hitTargetRir = Number(rir) >= exercise.rirTarget;
    
    // Launch rest timer
    setTimeRemaining(exercise.restSeconds);
    setIsResting(true);

    // Clear inputs (or leave weight for convenience)
    setReps("");
    setRir("");

    if (isLastSet) {
      if (!isLastExercise) {
        // Move to next exercise, but wait for user to skip rest timer
      } else {
        // Workout complete! (We'll let them rest before hitting complete if they want)
      }
    } else {
      setCurrentSetIdx(c => c + 1);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    if (isLastSet && !isLastExercise) {
      setActiveExerciseIdx(c => c + 1);
      setCurrentSetIdx(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Rest Timer UI Overlay
  if (isResting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-black mb-8 tracking-widest text-[var(--muted-fg)]">REST</h2>
        
        <div className="relative mb-12 flex items-center justify-center">
          <svg className="transform -rotate-90 w-64 h-64">
            <circle cx="128" cy="128" r="120" stroke="var(--secondary)" strokeWidth="8" fill="none" />
            <circle 
              cx="128" cy="128" r="120" 
              stroke="var(--primary)" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={120 * 2 * Math.PI}
              strokeDashoffset={(120 * 2 * Math.PI) * (1 - (timeRemaining / exercise.restSeconds))}
              className="transition-all duration-1000 linear"
            />
          </svg>
          <div className="absolute text-5xl font-mono font-bold tracking-tighter">
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button variant="outline" size="lg" onClick={() => setTimeRemaining(t => Math.max(0, t - 15))}>-15s</Button>
          <Button variant="outline" size="lg" onClick={() => setTimeRemaining(t => t + 15)}>+15s</Button>
        </div>

        <Button size="lg" className="w-full max-w-sm h-14 text-lg font-bold" onClick={handleSkipRest}>
          SKIP REST
        </Button>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--muted-fg)] uppercase tracking-wider mb-2">Up Next</p>
          <p className="font-bold text-lg">
            {isLastSet && !isLastExercise ? todaysWorkout.exercises[activeExerciseIdx+1].exerciseName : `${exercise.exerciseName} - Set ${currentSetIdx + 1}`}
          </p>
        </div>
      </div>
    );
  }

  // Active Logging UI
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-[var(--bg)]/90 backdrop-blur-md py-4 z-10 border-b border-[var(--border-color)]/50">
        <Button variant="ghost" size="icon" onClick={() => router.push("/today")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest">{todaysWorkout.name}</h2>
          <p className="text-sm text-[var(--muted-fg)] font-medium">
            Exercise {activeExerciseIdx + 1} of {todaysWorkout.exercises.length}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Current Exercise Context */}
      <Card className="border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-black">{exercise.exerciseName}</CardTitle>
          <p className="text-sm font-medium text-[var(--muted-fg)]">
            Target: {exercise.repsMin}–{exercise.repsMax} reps @ RIR {exercise.rirTarget}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)]">
            <span className="flex items-center bg-[var(--secondary)] px-2 py-1 rounded"><CheckCircle2 className="w-3 h-3 mr-1" /> Previous: 5kg × 9</span>
          </div>
        </CardContent>
      </Card>

      {/* Set Tracker */}
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-lg">Set {currentSetIdx + 1} <span className="text-[var(--muted-fg)] font-normal">/ {exercise.sets}</span></h3>
      </div>

      {/* Input Form */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--muted-fg)]">Weight (kg)</label>
              <Input 
                type="number" 
                inputMode="decimal"
                className="h-14 text-center text-xl font-bold bg-[var(--secondary)]/50" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--muted-fg)]">Reps</label>
              <Input 
                type="number" 
                inputMode="numeric"
                className="h-14 text-center text-xl font-bold bg-[var(--secondary)]/50" 
                value={reps} 
                onChange={e => setReps(e.target.value)} 
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--muted-fg)] flex items-center justify-between">
                RIR
              </label>
              <Input 
                type="number" 
                inputMode="numeric"
                className="h-14 text-center text-xl font-bold bg-[var(--secondary)]/50" 
                value={rir} 
                onChange={e => setRir(e.target.value)} 
                placeholder="0"
              />
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold tracking-widest shadow-lg shadow-[var(--primary)]/20" 
            onClick={handleLogSet}
            disabled={!weight || !reps || !rir}
          >
            LOG SET
          </Button>
        </CardContent>
      </Card>

      {/* Logged History for this exercise */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase text-[var(--muted-fg)] ml-2">Logged Sets</h4>
        <div className="space-y-2">
          {loggedSets.filter(s => s.exerciseIdx === activeExerciseIdx).map((s, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[var(--secondary)]/30 rounded-lg p-3 px-4 border border-[var(--border-color)]">
              <span className="font-bold">Set {s.set}</span>
              <span className="font-medium text-[var(--muted-fg)]">{s.weight}kg × {s.reps} <span className="ml-2 text-xs opacity-70">RIR {s.rir}</span></span>
            </div>
          ))}
          {loggedSets.filter(s => s.exerciseIdx === activeExerciseIdx).length === 0 && (
            <p className="text-sm text-center py-4 text-[var(--muted-fg)] italic">No sets logged yet.</p>
          )}
        </div>
      </div>

      {isLastSet && isLastExercise && loggedSets.length > 0 && (
        <Button 
          variant="default" 
          className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white mt-12"
          onClick={() => router.push("/workout/complete")}
        >
          COMPLETE WORKOUT <CheckCircle2 className="ml-2 w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
