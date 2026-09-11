// ============================================================
// SAI FITNESS OS — Core Type Definitions
// ============================================================

export interface UserProfile {
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  diet: "vegetarian" | "non-vegetarian" | "vegan";
  livingsituation: "hostel" | "apartment" | "home";
  hasKitchen: boolean;
  monthlyBudgetINR: number;
  trainingDays: number[]; // 1=Mon ... 6=Sat
  restDays: number[]; // 0=Sun
  gymTimeStart: string; // "18:00"
  gymTimeEnd: string; // "20:00"
  lunchTime: string; // "12:30"
  dinnerTime: string; // "21:00"
  programStartDate: string; // ISO date
  timezone: string;
  onboardingCompleted: boolean;
  hostelMode?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurements {
  date: string;
  weightKg: number;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  neck?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  primaryMuscle: MuscleGroup;
  equipment: Equipment[];
  type: "compound" | "isolation";
}

export type MuscleGroup =
  | "chest"
  | "front-delts"
  | "lateral-delts"
  | "rear-delts"
  | "upper-back"
  | "lats"
  | "lower-back"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "traps";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "band"
  | "kettlebell"
  | "ez-bar";

export interface WorkoutTemplate {
  id: string;
  name: string;
  label: string; // "PUSH A", "PULL A", etc.
  dayOfWeek: number;
  targetMuscles: MuscleGroup[];
  exercises: WorkoutExercise[];
  estimatedDurationMin: number;
  priority: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rirTarget: number; // Reps In Reserve
  restSeconds: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: ExerciseLog[];
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface SetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number;
  completed: boolean;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterLiters: number;
  creatineTaken: boolean;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
}

export interface DailyRecovery {
  date: string;
  sleepHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sorenessLevel: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  readinessScore?: number;
}

export interface MuscleGroupStatus {
  muscleGroup: MuscleGroup;
  weeklySets: number;
  frequency: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  trend: "up" | "down" | "stable";
  recovery: "fresh" | "good" | "fatigued" | "overtrained";
  lastTrained?: string;
  nextSession?: string;
}

export interface PhysiqueGoal {
  muscleGroup: MuscleGroup;
  rank: number;
  emphasis: string;
}

export interface BudgetEntry {
  id: string;
  date: string;
  item: string;
  amount: number;
  category: "food" | "supplement" | "equipment" | "other";
}

export interface CoachInsight {
  id: string;
  type: "tip" | "warning" | "achievement" | "recommendation";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  relatedMuscle?: MuscleGroup;
  date: string;
}

export interface AppState {
  profile: UserProfile | null;
  measurements: BodyMeasurements[];
  workoutLogs: WorkoutLog[];
  nutritionLogs: DailyNutrition[];
  recoveryLogs: DailyRecovery[];
  budgetEntries: BudgetEntry[];
  theme: "dark" | "light" | "system";
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}
