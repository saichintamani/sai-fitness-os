// ============================================================
// SAI FITNESS OS — AI Provider Abstraction
// ============================================================
// Supports: Gemini, OpenAI, Claude, and deterministic local fallback.
// The app MUST work without an AI API key.

import { WorkoutLog, DailyNutrition, DailyRecovery, BodyMeasurements, UserProfile } from "@/lib/types";

export interface FitnessContext {
  profile: UserProfile;
  recentWorkouts: WorkoutLog[];
  recentNutrition: DailyNutrition[];
  recentRecovery: DailyRecovery[];
  measurements: BodyMeasurements[];
  currentWeek: number;
  currentPhase: string;
}

export interface CoachResponse {
  answer: string;
  reasoning?: string; // The "Why Layer"
  confidence: "high" | "medium" | "low" | "insufficient-data";
  source: "ai" | "local-rules";
  suggestions?: string[];
}

export interface FitnessAIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  askCoach(question: string, context: FitnessContext): Promise<CoachResponse>;
  generateWeeklyReview(context: FitnessContext): Promise<CoachResponse>;
  generateDailySummary(context: FitnessContext): Promise<CoachResponse>;
}

// Registry of providers — tried in order
const providers: FitnessAIProvider[] = [];

export function registerProvider(provider: FitnessAIProvider) {
  providers.push(provider);
}

export async function getAvailableProvider(): Promise<FitnessAIProvider | null> {
  for (const provider of providers) {
    try {
      if (await provider.isAvailable()) return provider;
    } catch {
      continue;
    }
  }
  return null;
}

// Re-export for convenience
export type { FitnessAIProvider as AIProvider };
