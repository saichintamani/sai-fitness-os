"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { AppState, UserProfile, BodyMeasurements, WorkoutLog, DailyNutrition, DailyRecovery, BudgetEntry } from "./types";

const STORAGE_KEY = "sai-fitness-os-state";

const initialState: AppState = {
  profile: null,
  measurements: [],
  workoutLogs: [],
  nutritionLogs: [],
  recoveryLogs: [],
  budgetEntries: [],
  theme: "dark",
};

type Action =
  | { type: "SET_PROFILE"; payload: UserProfile }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }
  | { type: "ADD_MEASUREMENT"; payload: BodyMeasurements }
  | { type: "ADD_WORKOUT_LOG"; payload: WorkoutLog }
  | { type: "ADD_NUTRITION_LOG"; payload: DailyNutrition }
  | { type: "ADD_RECOVERY_LOG"; payload: DailyRecovery }
  | { type: "ADD_BUDGET_ENTRY"; payload: BudgetEntry }
  | { type: "SET_THEME"; payload: "dark" | "light" | "system" }
  | { type: "HYDRATE"; payload: AppState }
  | { type: "RESET" };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, ...action.payload, updatedAt: new Date().toISOString() }
          : null,
      };
    case "ADD_MEASUREMENT":
      return { ...state, measurements: [...state.measurements, action.payload] };
    case "ADD_WORKOUT_LOG":
      return { ...state, workoutLogs: [...state.workoutLogs, action.payload] };
    case "ADD_NUTRITION_LOG":
      return { ...state, nutritionLogs: [...state.nutritionLogs, action.payload] };
    case "ADD_RECOVERY_LOG":
      return { ...state, recoveryLogs: [...state.recoveryLogs, action.payload] };
    case "ADD_BUDGET_ENTRY":
      return { ...state, budgetEntries: [...state.budgetEntries, action.payload] };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "HYDRATE":
      return action.payload;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "HYDRATE", payload: { ...initialState, ...parsed } });
      }
    } catch (e) {
      console.warn("Failed to hydrate state from localStorage:", e);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("Failed to persist state to localStorage:", e);
      }
    }
  }, [state, isHydrated]);

  return (
    <StoreContext.Provider value={{ state, dispatch, isHydrated }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export function useProfile() {
  const { state, dispatch } = useStore();
  const setProfile = useCallback(
    (profile: UserProfile) => dispatch({ type: "SET_PROFILE", payload: profile }),
    [dispatch]
  );
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => dispatch({ type: "UPDATE_PROFILE", payload: updates }),
    [dispatch]
  );
  return { profile: state.profile, setProfile, updateProfile };
}
