import { UserProfile, PhysiqueGoal, WorkoutTemplate } from "./types";

// ============================================================
// Default User Profile — Sai
// ============================================================
export const DEFAULT_USER: UserProfile = {
  name: "Sai",
  age: 20,
  sex: "male",
  heightCm: 170, // ~5'7"
  weightKg: 49,
  diet: "vegetarian",
  livingsituation: "hostel",
  hasKitchen: false,
  monthlyBudgetINR: 2000,
  trainingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  restDays: [0], // Sunday
  gymTimeStart: "18:00",
  gymTimeEnd: "20:00",
  lunchTime: "12:30",
  dinnerTime: "21:00",
  programStartDate: new Date().toISOString().split("T")[0],
  timezone: "Asia/Kolkata",
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================================
// Physique Priority Rankings
// ============================================================
export const PHYSIQUE_GOALS: PhysiqueGoal[] = [
  { muscleGroup: "lateral-delts", rank: 1, emphasis: "Shoulder width" },
  { muscleGroup: "rear-delts", rank: 2, emphasis: "3D shoulder look" },
  { muscleGroup: "chest", rank: 3, emphasis: "Chest development" },
  { muscleGroup: "lats", rank: 4, emphasis: "Back width / V-taper" },
  { muscleGroup: "upper-back", rank: 5, emphasis: "Back thickness" },
  { muscleGroup: "biceps", rank: 6, emphasis: "Arm size" },
  { muscleGroup: "triceps", rank: 7, emphasis: "Arm definition" },
  { muscleGroup: "quads", rank: 8, emphasis: "Leg size" },
  { muscleGroup: "hamstrings", rank: 9, emphasis: "Leg balance" },
  { muscleGroup: "glutes", rank: 10, emphasis: "Posterior chain" },
  { muscleGroup: "calves", rank: 11, emphasis: "Lower leg" },
  { muscleGroup: "core", rank: 12, emphasis: "Core definition" },
];

// ============================================================
// Current Strength Baselines
// ============================================================
export const STRENGTH_BASELINES: Record<string, { weight: number; unit: string }> = {
  "dumbbell-shoulder-press": { weight: 5, unit: "kg each" },
  "dumbbell-lateral-raise": { weight: 2.5, unit: "kg each" },
  "dumbbell-reverse-fly": { weight: 2.5, unit: "kg each" },
};

// ============================================================
// Available Foods
// ============================================================
export const AVAILABLE_FOODS = [
  { name: "Alpino oats", calories: 370, protein: 13, carbs: 60, fat: 8, per: "100g" },
  { name: "Peanuts", calories: 567, protein: 26, carbs: 16, fat: 49, per: "100g" },
  { name: "Cooked chana", calories: 164, protein: 9, carbs: 27, fat: 3, per: "100g" },
  { name: "Cooked beans", calories: 127, protein: 9, carbs: 22, fat: 0.5, per: "100g" },
  { name: "Green beans", calories: 31, protein: 1.8, carbs: 7, fat: 0.1, per: "100g" },
  { name: "Hostel mess food", calories: 450, protein: 12, carbs: 65, fat: 15, per: "meal" },
  { name: "Creatine monohydrate", calories: 0, protein: 0, carbs: 0, fat: 0, per: "5g" },
  { name: "Sev puri", calories: 250, protein: 5, carbs: 30, fat: 12, per: "plate" },
];

// ============================================================
// Training Program — PPL Split
// ============================================================
export const TRAINING_PROGRAM: WorkoutTemplate[] = [
  {
    id: "push-a",
    name: "Push A",
    label: "PUSH A",
    dayOfWeek: 1,
    targetMuscles: ["chest", "front-delts", "lateral-delts", "triceps"],
    estimatedDurationMin: 65,
    priority: "Lateral delts & chest development",
    exercises: [
      { exerciseId: "flat-bp", exerciseName: "Flat Barbell Bench Press", sets: 4, repsMin: 6, repsMax: 8, rirTarget: 2, restSeconds: 180, notes: "Primary chest compound" },
      { exerciseId: "incline-db-press", exerciseName: "Incline Dumbbell Press", sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "db-lateral-raise", exerciseName: "Dumbbell Lateral Raise", sets: 4, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60, notes: "Priority: shoulder width" },
      { exerciseId: "cable-lateral", exerciseName: "Cable Lateral Raise", sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
      { exerciseId: "overhead-tricep", exerciseName: "Overhead Tricep Extension", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "tricep-pushdown", exerciseName: "Tricep Pushdown", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 60 },
    ],
  },
  {
    id: "pull-a",
    name: "Pull A",
    label: "PULL A",
    dayOfWeek: 2,
    targetMuscles: ["lats", "upper-back", "rear-delts", "biceps"],
    estimatedDurationMin: 65,
    priority: "Back width & rear delts",
    exercises: [
      { exerciseId: "lat-pulldown", exerciseName: "Lat Pulldown", sets: 4, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: "Focus on width" },
      { exerciseId: "cable-row", exerciseName: "Seated Cable Row", sets: 4, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "db-reverse-fly", exerciseName: "Dumbbell Reverse Fly", sets: 4, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60, notes: "Priority: 3D shoulders" },
      { exerciseId: "face-pull", exerciseName: "Face Pull", sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      { exerciseId: "barbell-curl", exerciseName: "Barbell Curl", sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "hammer-curl", exerciseName: "Hammer Curl", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 60 },
    ],
  },
  {
    id: "legs-a",
    name: "Legs A",
    label: "LEGS A",
    dayOfWeek: 3,
    targetMuscles: ["quads", "hamstrings", "glutes", "calves", "core"],
    estimatedDurationMin: 60,
    priority: "Quad & glute development",
    exercises: [
      { exerciseId: "barbell-squat", exerciseName: "Barbell Squat", sets: 4, repsMin: 6, repsMax: 8, rirTarget: 2, restSeconds: 180, notes: "Primary leg compound" },
      { exerciseId: "leg-press", exerciseName: "Leg Press", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "rdl", exerciseName: "Romanian Deadlift", sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "leg-curl", exerciseName: "Leg Curl", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "calf-raise", exerciseName: "Standing Calf Raise", sets: 4, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
      { exerciseId: "plank", exerciseName: "Plank", sets: 3, repsMin: 30, repsMax: 60, rirTarget: 0, restSeconds: 60, notes: "Hold in seconds" },
    ],
  },
  {
    id: "push-b",
    name: "Push B",
    label: "PUSH B",
    dayOfWeek: 4,
    targetMuscles: ["chest", "front-delts", "lateral-delts", "triceps"],
    estimatedDurationMin: 65,
    priority: "Shoulder & chest volume",
    exercises: [
      { exerciseId: "db-shoulder-press", exerciseName: "Dumbbell Shoulder Press", sets: 4, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: "5 kg each hand" },
      { exerciseId: "dip-or-pushup", exerciseName: "Dips / Push-ups", sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "cable-fly", exerciseName: "Cable Fly", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "db-lateral-raise-b", exerciseName: "Dumbbell Lateral Raise", sets: 4, repsMin: 15, repsMax: 20, rirTarget: 0, restSeconds: 45, notes: "Lighter weight, higher reps" },
      { exerciseId: "close-grip-bp", exerciseName: "Close-Grip Bench Press", sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "skullcrusher", exerciseName: "Skull Crushers", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
    ],
  },
  {
    id: "pull-b",
    name: "Pull B",
    label: "PULL B",
    dayOfWeek: 5,
    targetMuscles: ["lats", "upper-back", "rear-delts", "biceps"],
    estimatedDurationMin: 65,
    priority: "Back thickness & arms",
    exercises: [
      { exerciseId: "barbell-row", exerciseName: "Barbell Row", sets: 4, repsMin: 6, repsMax: 8, rirTarget: 2, restSeconds: 150, notes: "Thickness focus" },
      { exerciseId: "wide-pulldown", exerciseName: "Wide-Grip Lat Pulldown", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "cable-reverse-fly", exerciseName: "Cable Reverse Fly", sets: 4, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
      { exerciseId: "shrug", exerciseName: "Barbell Shrug", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "incline-curl", exerciseName: "Incline Dumbbell Curl", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      { exerciseId: "cable-curl", exerciseName: "Cable Curl", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 60 },
    ],
  },
  {
    id: "legs-b",
    name: "Legs B",
    label: "LEGS B",
    dayOfWeek: 6,
    targetMuscles: ["quads", "hamstrings", "glutes", "calves", "core"],
    estimatedDurationMin: 60,
    priority: "Hamstring & glute focus",
    exercises: [
      { exerciseId: "front-squat", exerciseName: "Front Squat / Goblet Squat", sets: 4, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 150 },
      { exerciseId: "walking-lunge", exerciseName: "Walking Lunges", sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "stiff-dl", exerciseName: "Stiff-Leg Deadlift", sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120 },
      { exerciseId: "leg-extension", exerciseName: "Leg Extension", sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
      { exerciseId: "seated-calf", exerciseName: "Seated Calf Raise", sets: 4, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45 },
      { exerciseId: "cable-crunch", exerciseName: "Cable Crunch", sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
    ],
  },
];

// ============================================================
// Muscle Group Display Metadata
// ============================================================
export const MUSCLE_GROUP_META: Record<string, { label: string; color: string }> = {
  "chest": { label: "Chest", color: "#ef4444" },
  "front-delts": { label: "Front Delts", color: "#f97316" },
  "lateral-delts": { label: "Lateral Delts", color: "#f59e0b" },
  "rear-delts": { label: "Rear Delts", color: "#eab308" },
  "upper-back": { label: "Upper Back", color: "#84cc16" },
  "lats": { label: "Lats", color: "#22c55e" },
  "lower-back": { label: "Lower Back", color: "#10b981" },
  "biceps": { label: "Biceps", color: "#14b8a6" },
  "triceps": { label: "Triceps", color: "#06b6d4" },
  "forearms": { label: "Forearms", color: "#0ea5e9" },
  "quads": { label: "Quads", color: "#3b82f6" },
  "hamstrings": { label: "Hamstrings", color: "#6366f1" },
  "glutes": { label: "Glutes", color: "#8b5cf6" },
  "calves": { label: "Calves", color: "#a855f7" },
  "core": { label: "Core", color: "#d946ef" },
  "traps": { label: "Traps", color: "#ec4899" },
};
