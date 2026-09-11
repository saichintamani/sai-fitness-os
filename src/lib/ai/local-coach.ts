// ============================================================
// SAI FITNESS OS — Deterministic Local Coach
// ============================================================
// Pure rule-based coaching engine. No AI API required.
// Uses actual stored data to generate recommendations.

import { FitnessAIProvider, FitnessContext, CoachResponse } from "./provider";
import { TRAINING_PROGRAM, PHYSIQUE_GOALS } from "@/lib/data";
import { getDayOfWeek } from "@/lib/utils";

// ── Progressive Overload Logic ──────────────────────────────
function analyzeProgression(context: FitnessContext, exerciseName: string): {
  recommendation: string;
  reasoning: string;
  shouldProgress: boolean;
} {
  const logs = context.recentWorkouts
    .flatMap(w => w.exercises)
    .filter(e => e.exerciseName.toLowerCase().includes(exerciseName.toLowerCase()));

  if (logs.length < 2) {
    return {
      recommendation: `Keep the current load for ${exerciseName}. Build consistency first.`,
      reasoning: "I don't have enough logged sessions to make a reliable progression recommendation yet. Log at least 2 sessions with this exercise.",
      shouldProgress: false,
    };
  }

  const lastSession = logs[logs.length - 1];
  const lastSets = lastSession.sets;

  // Check if all sets hit the target reps range with RIR >= 1
  const allSetsHitTarget = lastSets.every(s => s.reps >= 8 && s.rir >= 1);
  const anySetFailedHard = lastSets.some(s => s.rir === 0);
  const avgRIR = lastSets.reduce((sum, s) => sum + s.rir, 0) / lastSets.length;

  if (allSetsHitTarget && avgRIR >= 1.5) {
    return {
      recommendation: `Consider increasing ${exerciseName} by the smallest increment (0.5-1kg per side).`,
      reasoning: `You hit all target reps with an average RIR of ${avgRIR.toFixed(1)}, indicating you have room to progress. The principle: if you can consistently hit the top of your rep range with RIR ≥ 1, it's time to add load.`,
      shouldProgress: true,
    };
  }

  if (anySetFailedHard) {
    return {
      recommendation: `Keep ${exerciseName} at the current weight.`,
      reasoning: `Your final set reached RIR 0 (technical failure). Continue with the current load until you can consistently complete the target rep range at approximately RIR 1-2. Forcing progression when you're grinding reps increases injury risk without meaningful hypertrophy benefit.`,
      shouldProgress: false,
    };
  }

  return {
    recommendation: `Maintain current weight for ${exerciseName}. You're close to progressing.`,
    reasoning: `Average RIR was ${avgRIR.toFixed(1)}. Once you consistently hit all sets at RIR ≥ 1.5 across two consecutive sessions, increase the load.`,
    shouldProgress: false,
  };
}

// ── Recovery & Readiness Logic ──────────────────────────────
function analyzeReadiness(context: FitnessContext): {
  score: number;
  factors: { label: string; value: string; status: "good" | "warning" | "poor" }[];
  recommendation: string;
} {
  const recent = context.recentRecovery;
  if (recent.length === 0) {
    return {
      score: 70,
      factors: [],
      recommendation: "I don't have enough recovery data to assess readiness. Start logging sleep, energy, and soreness daily.",
    };
  }

  const latest = recent[recent.length - 1];
  const sleepScore = Math.min(100, (latest.sleepHours / 8) * 100);
  const energyScore = (latest.energyLevel / 5) * 100;
  const sorenessScore = ((6 - latest.sorenessLevel) / 5) * 100; // Inverted: lower soreness = better
  const stressScore = ((6 - latest.stressLevel) / 5) * 100;

  const overall = Math.round(sleepScore * 0.3 + energyScore * 0.25 + sorenessScore * 0.25 + stressScore * 0.2);

  const factors = [
    { label: "Sleep", value: `${latest.sleepHours}h`, status: latest.sleepHours >= 7 ? "good" as const : latest.sleepHours >= 6 ? "warning" as const : "poor" as const },
    { label: "Energy", value: `${latest.energyLevel}/5`, status: latest.energyLevel >= 4 ? "good" as const : latest.energyLevel >= 3 ? "warning" as const : "poor" as const },
    { label: "Soreness", value: `${latest.sorenessLevel}/5`, status: latest.sorenessLevel <= 2 ? "good" as const : latest.sorenessLevel <= 3 ? "warning" as const : "poor" as const },
    { label: "Stress", value: `${latest.stressLevel}/5`, status: latest.stressLevel <= 2 ? "good" as const : latest.stressLevel <= 3 ? "warning" as const : "poor" as const },
  ];

  let recommendation: string;
  if (overall >= 80) {
    recommendation = "Readiness is excellent. Train at full intensity today.";
  } else if (overall >= 60) {
    recommendation = "Readiness is moderate. Consider reducing volume by 1 set per exercise or keeping RIR at 2+.";
  } else {
    recommendation = "Readiness is low. Strongly consider a lighter session or active recovery today. Prioritize sleep tonight.";
  }

  return { score: overall, factors, recommendation };
}

// ── Nutrition Analysis ──────────────────────────────────────
function analyzeNutrition(context: FitnessContext): {
  proteinAdherence: number;
  calorieAdherence: number;
  recommendation: string;
  reasoning: string;
} {
  const logs = context.recentNutrition;
  if (logs.length === 0) {
    return {
      proteinAdherence: 0,
      calorieAdherence: 0,
      recommendation: "Start logging your meals to get nutrition insights.",
      reasoning: "I don't have enough logged nutrition data to make a reliable recommendation yet.",
    };
  }

  const targetProtein = Math.round(context.profile.weightKg * 2.2);
  const targetCalories = 2500; // Simplified lean-bulk target

  const avgProtein = logs.reduce((sum, l) => sum + l.totalProtein, 0) / logs.length;
  const avgCalories = logs.reduce((sum, l) => sum + l.totalCalories, 0) / logs.length;

  const proteinAdherence = Math.round((avgProtein / targetProtein) * 100);
  const calorieAdherence = Math.round((avgCalories / targetCalories) * 100);

  let recommendation: string;
  let reasoning: string;

  if (proteinAdherence < 80) {
    recommendation = "Your protein intake is consistently below target. Prioritize soya chunks, paneer, dal, and curd at every meal.";
    reasoning = `Average protein: ${Math.round(avgProtein)}g vs target: ${targetProtein}g (${proteinAdherence}% adherence). You need ~${targetProtein - Math.round(avgProtein)}g more protein daily for optimal muscle protein synthesis.`;
  } else if (calorieAdherence < 85) {
    recommendation = "You're under-eating. Add calorie-dense foods like peanuts, banana shakes, or extra rice.";
    reasoning = `Average calories: ${Math.round(avgCalories)} vs target: ${targetCalories} (${calorieAdherence}% adherence). A caloric surplus is essential for weight gain.`;
  } else {
    recommendation = "Nutrition adherence is strong. Maintain current eating patterns.";
    reasoning = `Protein at ${proteinAdherence}% and calories at ${calorieAdherence}% of targets — both within optimal range.`;
  }

  return { proteinAdherence, calorieAdherence, recommendation, reasoning };
}

// ── Weight Trend Analysis ───────────────────────────────────
function analyzeWeightTrend(context: FitnessContext): {
  trend: string;
  weeklyRate: number | null;
  recommendation: string;
  reasoning: string;
} {
  const weights = context.measurements.filter(m => m.weightKg).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (weights.length < 2) {
    return {
      trend: "insufficient",
      weeklyRate: null,
      recommendation: "Log your bodyweight at least twice a week to track trends.",
      reasoning: "I don't have enough weight data to determine a reliable trend. Weight should be measured consistently — same time, same conditions.",
    };
  }

  const first = weights[0];
  const last = weights[weights.length - 1];
  const daysBetween = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
  const weeksBetween = Math.max(1, daysBetween / 7);
  const totalChange = last.weightKg - first.weightKg;
  const weeklyRate = totalChange / weeksBetween;

  let trend: string;
  let recommendation: string;
  let reasoning: string;

  if (weeklyRate > 0.5) {
    trend = "gaining-fast";
    recommendation = "Weight is increasing faster than optimal. Reduce surplus slightly to minimize fat gain.";
    reasoning = `Rate: +${weeklyRate.toFixed(2)}kg/week. Optimal lean bulk rate for beginners is 0.2-0.4kg/week. Faster gains typically mean excess fat accumulation.`;
  } else if (weeklyRate >= 0.15) {
    trend = "gaining-optimal";
    recommendation = "Weight trend is excellent. Stay the course.";
    reasoning = `Rate: +${weeklyRate.toFixed(2)}kg/week — right in the sweet spot for lean muscle gain as a beginner.`;
  } else if (weeklyRate >= 0) {
    trend = "maintaining";
    recommendation = "Weight is barely moving. Increase daily calories by 200-300 through extra rice, peanuts, or milk.";
    reasoning = `Rate: +${weeklyRate.toFixed(2)}kg/week. To gain muscle, you need a consistent caloric surplus.`;
  } else {
    trend = "losing";
    recommendation = "You're losing weight. Significantly increase food intake — add extra meals or calorie-dense snacks.";
    reasoning = `Rate: ${weeklyRate.toFixed(2)}kg/week. Losing weight while trying to build muscle will severely limit your progress.`;
  }

  return { trend, weeklyRate, recommendation, reasoning };
}

// ── Muscle Analysis ─────────────────────────────────────────
function analyzeMuscleBalance(context: FitnessContext): {
  lagging: string[];
  strong: string[];
  recommendation: string;
} {
  const muscleVolume: Record<string, number> = {};

  context.recentWorkouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed).length;
      // Simple heuristic: map exercise names to muscles
      const muscle = guessMusclefromExercise(ex.exerciseName);
      if (muscle) {
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + completedSets;
      }
    });
  });

  // Compare against priority goals
  const priorities = PHYSIQUE_GOALS.slice(0, 5).map(g => g.muscleGroup);
  const lagging = priorities.filter(m => (muscleVolume[m] || 0) < 8);
  const strong = Object.entries(muscleVolume)
    .filter(([, sets]) => sets >= 12)
    .map(([muscle]) => muscle);

  const recommendation = lagging.length > 0
    ? `Your priority muscles (${lagging.join(", ")}) are under-trained this week. Focus on hitting their target volume.`
    : "Muscle volume distribution looks balanced. Keep it up.";

  return { lagging, strong, recommendation };
}

function guessMusclefromExercise(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("bench") || n.includes("fly") || n.includes("chest") || n.includes("push-up")) return "chest";
  if (n.includes("lateral raise") || n.includes("lateral")) return "lateral-delts";
  if (n.includes("shoulder press") || n.includes("overhead press")) return "front-delts";
  if (n.includes("reverse fly") || n.includes("face pull") || n.includes("rear")) return "rear-delts";
  if (n.includes("pulldown") || n.includes("pull-up") || n.includes("lat")) return "lats";
  if (n.includes("row") || n.includes("shrug")) return "upper-back";
  if (n.includes("curl") && !n.includes("leg")) return "biceps";
  if (n.includes("tricep") || n.includes("pushdown") || n.includes("skull") || n.includes("close-grip")) return "triceps";
  if (n.includes("squat") || n.includes("leg press") || n.includes("leg extension") || n.includes("lunge")) return "quads";
  if (n.includes("deadlift") || n.includes("leg curl") || n.includes("hamstring")) return "hamstrings";
  if (n.includes("calf")) return "calves";
  if (n.includes("plank") || n.includes("crunch") || n.includes("core") || n.includes("ab")) return "core";
  if (n.includes("glute") || n.includes("hip thrust")) return "glutes";
  return null;
}

// ── Exercise Substitution Engine ────────────────────────────
export interface ExerciseSubstitution {
  original: string;
  alternatives: { name: string; equipment: string; difficulty: string }[];
  reasoning: string;
}

const SUBSTITUTION_MAP: Record<string, { name: string; equipment: string; difficulty: string }[]> = {
  "lat pulldown": [
    { name: "Assisted Pull-Up", equipment: "bodyweight", difficulty: "harder" },
    { name: "Band Lat Pulldown", equipment: "band", difficulty: "easier" },
    { name: "Single-Arm Cable Pulldown", equipment: "cable", difficulty: "same" },
  ],
  "barbell bench press": [
    { name: "Dumbbell Bench Press", equipment: "dumbbell", difficulty: "same" },
    { name: "Machine Chest Press", equipment: "machine", difficulty: "easier" },
    { name: "Push-Ups (Weighted)", equipment: "bodyweight", difficulty: "same" },
  ],
  "barbell squat": [
    { name: "Goblet Squat", equipment: "dumbbell", difficulty: "easier" },
    { name: "Leg Press", equipment: "machine", difficulty: "easier" },
    { name: "Bulgarian Split Squat", equipment: "dumbbell", difficulty: "harder" },
  ],
  "dumbbell shoulder press": [
    { name: "Machine Shoulder Press", equipment: "machine", difficulty: "easier" },
    { name: "Barbell Overhead Press", equipment: "barbell", difficulty: "harder" },
    { name: "Landmine Press", equipment: "barbell", difficulty: "same" },
  ],
  "cable row": [
    { name: "Dumbbell Row", equipment: "dumbbell", difficulty: "same" },
    { name: "Machine Row", equipment: "machine", difficulty: "easier" },
    { name: "Band Row", equipment: "band", difficulty: "easier" },
  ],
  "barbell row": [
    { name: "Dumbbell Row", equipment: "dumbbell", difficulty: "same" },
    { name: "T-Bar Row", equipment: "barbell", difficulty: "same" },
    { name: "Cable Row", equipment: "cable", difficulty: "easier" },
  ],
  "romanian deadlift": [
    { name: "Dumbbell RDL", equipment: "dumbbell", difficulty: "same" },
    { name: "Single-Leg RDL", equipment: "dumbbell", difficulty: "harder" },
    { name: "Leg Curl", equipment: "machine", difficulty: "easier" },
  ],
  "dumbbell lateral raise": [
    { name: "Cable Lateral Raise", equipment: "cable", difficulty: "same" },
    { name: "Band Lateral Raise", equipment: "band", difficulty: "easier" },
    { name: "Machine Lateral Raise", equipment: "machine", difficulty: "easier" },
  ],
};

export function getSubstitutions(exerciseName: string): ExerciseSubstitution {
  const key = exerciseName.toLowerCase().replace(/flat |incline |decline |wide-grip |close-grip /g, "");
  const alternatives = SUBSTITUTION_MAP[key] || [];

  return {
    original: exerciseName,
    alternatives: alternatives.length > 0
      ? alternatives
      : [{ name: "No alternatives mapped yet", equipment: "any", difficulty: "n/a" }],
    reasoning: alternatives.length > 0
      ? `These alternatives match the same movement pattern and target the same primary muscle group as ${exerciseName}.`
      : `No pre-mapped substitutions exist for ${exerciseName} yet. Choose an exercise targeting the same muscle with similar movement pattern.`,
  };
}

// ── Main Question Router ────────────────────────────────────
function routeQuestion(question: string, context: FitnessContext): CoachResponse {
  const q = question.toLowerCase();

  // "Should I increase X?" — Progressive Overload
  if (q.includes("increase") || q.includes("progress") || q.includes("go up") || q.includes("add weight")) {
    const exerciseName = extractExerciseName(question);
    const analysis = analyzeProgression(context, exerciseName);
    return {
      answer: analysis.recommendation,
      reasoning: analysis.reasoning,
      confidence: context.recentWorkouts.length >= 2 ? "medium" : "low",
      source: "local-rules",
    };
  }

  // "What should I do today?"
  if (q.includes("what should i do today") || q.includes("today's workout") || q.includes("what to do today")) {
    const dayOfWeek = getDayOfWeek();
    const workout = TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek);

    if (dayOfWeek === 0) {
      return {
        answer: "Today is Sunday — a full rest day. Focus on nutrition, hydration, and sleep. Sunday must never be treated as a missed workout.",
        reasoning: "Rest days are programmed for systemic recovery. Your muscles grow during rest, not during training.",
        confidence: "high",
        source: "local-rules",
      };
    }

    if (workout) {
      const readiness = analyzeReadiness(context);
      let modifier = "";
      if (readiness.score < 60) {
        modifier = ` However, your readiness score is low (${readiness.score}/100). Consider reducing volume by 1 set per exercise.`;
      }
      return {
        answer: `Today is ${workout.label} day. Focus: ${workout.priority}. Estimated duration: ~${workout.estimatedDurationMin} min. ${workout.exercises.length} exercises planned.${modifier}`,
        reasoning: `This follows the PPL (Push/Pull/Legs) split programmed for Week ${context.currentWeek} of your ${context.currentPhase} phase.`,
        confidence: "high",
        source: "local-rules",
      };
    }

    return {
      answer: "No workout is scheduled for today.",
      reasoning: "Check your program plan for the correct training day assignment.",
      confidence: "high",
      source: "local-rules",
    };
  }

  // "Why am I not gaining weight?"
  if (q.includes("not gaining") || q.includes("weight not") || q.includes("can't gain") || q.includes("not growing")) {
    const weightAnalysis = analyzeWeightTrend(context);
    const nutritionAnalysis = analyzeNutrition(context);
    return {
      answer: `${weightAnalysis.recommendation} ${nutritionAnalysis.recommendation}`,
      reasoning: `${weightAnalysis.reasoning}\n\n${nutritionAnalysis.reasoning}`,
      confidence: context.measurements.length >= 2 ? "medium" : "low",
      source: "local-rules",
    };
  }

  // "What should I eat?" / "What should I eat tonight/now?"
  if (q.includes("eat") || q.includes("food") || q.includes("meal") || q.includes("nutrition")) {
    const nutritionAnalysis = analyzeNutrition(context);
    const hostel = context.profile.hostelMode || context.profile.livingsituation === "hostel";
    const hostelTip = hostel
      ? " Since you're in hostel mode, prioritize: mess food, oats, milk, curd, banana, peanuts, roasted chana, paneer, dal, rajma, chole, soy, rice, roti."
      : "";
    return {
      answer: `${nutritionAnalysis.recommendation}${hostelTip}`,
      reasoning: nutritionAnalysis.reasoning,
      confidence: context.recentNutrition.length >= 3 ? "medium" : "low",
      source: "local-rules",
    };
  }

  // "How was my week?"
  if (q.includes("my week") || q.includes("weekly") || q.includes("this week") || q.includes("week review")) {
    return generateWeekReview(context);
  }

  // "What muscle is lagging?" / "muscle balance"
  if (q.includes("lagging") || q.includes("weak point") || q.includes("muscle balance") || q.includes("underdeveloped")) {
    const analysis = analyzeMuscleBalance(context);
    return {
      answer: analysis.recommendation,
      reasoning: `Based on your logged sets this week. Lagging: ${analysis.lagging.join(", ") || "none detected"}. Strong: ${analysis.strong.join(", ") || "no muscles exceeded 12 sets yet"}.`,
      confidence: context.recentWorkouts.length >= 3 ? "medium" : "low",
      source: "local-rules",
    };
  }

  // "Am I recovering?"
  if (q.includes("recover") || q.includes("readiness") || q.includes("fatigue") || q.includes("overtraining")) {
    const readiness = analyzeReadiness(context);
    return {
      answer: `Readiness score: ${readiness.score}/100. ${readiness.recommendation}`,
      reasoning: readiness.factors.map(f => `${f.label}: ${f.value} (${f.status})`).join(". ") || "Not enough recovery data logged.",
      confidence: context.recentRecovery.length >= 1 ? "medium" : "low",
      source: "local-rules",
    };
  }

  // "Strength decrease" / "why did my strength decrease"
  if (q.includes("strength decrease") || q.includes("weaker") || q.includes("lost strength") || q.includes("went down")) {
    const readiness = analyzeReadiness(context);
    const nutritionAnalysis = analyzeNutrition(context);
    return {
      answer: "Temporary strength fluctuations are normal and can be caused by: insufficient sleep, accumulated fatigue, under-eating, stress, or normal neural variation.",
      reasoning: `Current readiness: ${readiness.score}/100. ${readiness.recommendation}\n\nNutrition: ${nutritionAnalysis.reasoning}`,
      confidence: "medium",
      source: "local-rules",
      suggestions: [
        "Check if you slept less than 7 hours recently",
        "Verify you're eating enough protein and calories",
        "Consider whether you need a deload week",
        "One bad session doesn't mean you're losing progress",
      ],
    };
  }

  // "Replace" / "substitute"
  if (q.includes("replace") || q.includes("substitute") || q.includes("alternative") || q.includes("swap")) {
    const exerciseName = extractExerciseName(question);
    const subs = getSubstitutions(exerciseName);
    const altList = subs.alternatives.map(a => `${a.name} (${a.equipment}, ${a.difficulty})`).join("; ");
    return {
      answer: `Alternatives for ${subs.original}: ${altList}`,
      reasoning: subs.reasoning,
      confidence: subs.alternatives[0]?.name === "No alternatives mapped yet" ? "low" : "high",
      source: "local-rules",
    };
  }

  // Default: generic response
  return {
    answer: "I can help with workout progression, nutrition, recovery, weight trends, muscle balance, and exercise substitutions. Try asking something more specific like 'Should I increase shoulder press?' or 'What should I eat tonight?'",
    reasoning: "Your question didn't match any specific analysis pattern. The local coaching engine uses rule-based logic grounded in your actual data.",
    confidence: "low",
    source: "local-rules",
  };
}

function extractExerciseName(question: string): string {
  // Try to pull out an exercise name from common patterns
  const patterns = [
    /increase (?:my |the )?(.+?)(?:\?|$)/i,
    /progress (?:on |my |the )?(.+?)(?:\?|$)/i,
    /replace (?:my |the )?(.+?)(?:\?| with|$)/i,
    /substitute (?:for |my |the )?(.+?)(?:\?|$)/i,
    /alternative (?:to |for )?(.+?)(?:\?|$)/i,
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) return match[1].trim();
  }

  return "this exercise";
}

function generateWeekReview(context: FitnessContext): CoachResponse {
  const workoutsThisWeek = context.recentWorkouts.length;
  const plannedWorkouts = 6; // Mon-Sat
  const adherence = Math.round((workoutsThisWeek / plannedWorkouts) * 100);

  const nutritionAnalysis = analyzeNutrition(context);
  const weightAnalysis = analyzeWeightTrend(context);
  const readiness = analyzeReadiness(context);

  const totalSets = context.recentWorkouts.flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length;

  const answer = [
    `**Week ${context.currentWeek} Review**`,
    `Workout adherence: ${adherence}% (${workoutsThisWeek}/${plannedWorkouts} sessions)`,
    `Total completed sets: ${totalSets}`,
    `Protein adherence: ${nutritionAnalysis.proteinAdherence}%`,
    weightAnalysis.weeklyRate !== null ? `Weight trend: ${weightAnalysis.weeklyRate > 0 ? "+" : ""}${weightAnalysis.weeklyRate.toFixed(2)} kg/week` : "Weight trend: insufficient data",
    `Readiness: ${readiness.score}/100`,
  ].join("\n");

  const suggestions = [
    nutritionAnalysis.recommendation,
    weightAnalysis.recommendation,
    readiness.recommendation,
  ].filter(Boolean);

  return {
    answer,
    reasoning: "This review is based on all data you logged this week. The more consistently you log, the more accurate these insights become.",
    confidence: workoutsThisWeek >= 3 ? "medium" : "low",
    source: "local-rules",
    suggestions,
  };
}

// ── Provider Implementation ─────────────────────────────────
export const localCoach: FitnessAIProvider = {
  name: "Local Coaching Engine",

  async isAvailable(): Promise<boolean> {
    return true; // Always available — it's deterministic
  },

  async askCoach(question: string, context: FitnessContext): Promise<CoachResponse> {
    return routeQuestion(question, context);
  },

  async generateWeeklyReview(context: FitnessContext): Promise<CoachResponse> {
    return generateWeekReview(context);
  },

  async generateDailySummary(context: FitnessContext): Promise<CoachResponse> {
    const dayOfWeek = getDayOfWeek();
    const workout = TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek);
    const readiness = analyzeReadiness(context);
    const nutrition = analyzeNutrition(context);

    const todayWorkouts = context.recentWorkouts.filter(w => w.date === new Date().toISOString().split("T")[0]);
    const workoutDone = todayWorkouts.length > 0 && todayWorkouts.some(w => w.completed);

    const summary = [
      workoutDone ? "✓ Workout completed" : (workout ? `○ ${workout.label} pending` : "✓ Rest day"),
      `Protein: ${nutrition.proteinAdherence}% of target`,
      `Readiness: ${readiness.score}/100`,
    ].join("\n");

    // Tomorrow preview
    const tomorrow = (dayOfWeek % 7) + 1;
    const tomorrowWorkout = tomorrow === 0 ? null : TRAINING_PROGRAM.find(w => w.dayOfWeek === tomorrow);
    const tomorrowPreview = tomorrowWorkout
      ? `Tomorrow: ${tomorrowWorkout.label} — ${tomorrowWorkout.priority}`
      : "Tomorrow: Rest Day";

    return {
      answer: `**Today's Summary**\n${summary}\n\n${tomorrowPreview}`,
      reasoning: "Generated from today's logged data.",
      confidence: "medium",
      source: "local-rules",
      suggestions: [nutrition.recommendation, readiness.recommendation].filter(Boolean),
    };
  },
};

// Export analysis functions for use in analytics pages
export {
  analyzeProgression,
  analyzeReadiness,
  analyzeNutrition,
  analyzeWeightTrend,
  analyzeMuscleBalance,
  guessMusclefromExercise,
};
