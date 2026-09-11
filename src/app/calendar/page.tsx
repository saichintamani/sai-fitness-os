"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { TRAINING_PROGRAM } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Moon, XCircle, CheckCircle2, Apple, Camera, Scale } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface DayData {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  workout?: { name: string; completed: boolean };
  isRestDay: boolean;
  hasNutrition: boolean;
  hasMeasurement: boolean;
  hasPhoto: boolean;
}

export default function CalendarPage() {
  const { state } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  // Generate calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: DayData[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i);
    calendarDays.push({ date, isToday: false, isCurrentMonth: false, isRestDay: date.getDay() === 0, hasNutrition: false, hasMeasurement: false, hasPhoto: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isToday = date.toDateString() === today.toDateString();
    const isRestDay = dayOfWeek === 0;
    const dateStr = date.toISOString().split("T")[0];

    // Check logs
    const workoutLog = state.workoutLogs.find(w => w.date === dateStr);
    const plannedWorkout = !isRestDay ? TRAINING_PROGRAM.find(w => w.dayOfWeek === dayOfWeek) : null;

    const workout = workoutLog
      ? { name: workoutLog.templateId, completed: workoutLog.completed }
      : (plannedWorkout && date <= today)
        ? { name: plannedWorkout.label, completed: false }
        : plannedWorkout
          ? { name: plannedWorkout.label, completed: false }
          : undefined;

    const hasNutrition = state.nutritionLogs.some(n => n.date === dateStr);
    const hasMeasurement = state.measurements.some(m => m.date === dateStr);

    calendarDays.push({
      date, isToday, isCurrentMonth: true, workout,
      isRestDay, hasNutrition, hasMeasurement, hasPhoto: false,
    });
  }

  // Next month fill
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    calendarDays.push({ date, isToday: false, isCurrentMonth: false, isRestDay: date.getDay() === 0, hasNutrition: false, hasMeasurement: false, hasPhoto: false });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDayData = selectedDate ? calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString()) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-[var(--muted-fg)]">Your training history at a glance.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
            <CardTitle className="text-lg font-bold">{MONTHS[month]} {year}</CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-fg)] py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate?.toDateString() === day.date.toDateString();
              const isPast = day.date < today && day.isCurrentMonth;
              const isFuture = day.date > today;
              const missed = isPast && day.workout && !day.workout.completed && !day.isRestDay;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day.date)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all border
                    ${!day.isCurrentMonth ? "opacity-30 border-transparent" : "border-transparent hover:border-[var(--border-color)]"}
                    ${day.isToday ? "border-[var(--primary)]! bg-[var(--primary)]/10 font-bold" : ""}
                    ${isSelected ? "border-[var(--primary)]! bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]" : ""}
                    ${day.isRestDay && day.isCurrentMonth ? "bg-[var(--secondary)]/30" : ""}
                    ${missed ? "bg-rose-500/10" : ""}
                    ${day.workout?.completed ? "bg-emerald-500/10" : ""}
                  `}
                >
                  <span className={day.isToday ? "text-[var(--primary)]" : ""}>{day.date.getDate()}</span>

                  {/* Status Indicators */}
                  <div className="flex gap-0.5 mt-0.5">
                    {day.workout?.completed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {missed && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    {day.isRestDay && day.isCurrentMonth && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    {day.hasNutrition && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    {day.hasMeasurement && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)]"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)]"><div className="w-2 h-2 rounded-full bg-rose-500" /> Missed</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)]"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Rest</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)]"><div className="w-2 h-2 rounded-full bg-amber-500" /> Nutrition</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-fg)]"><div className="w-2 h-2 rounded-full bg-sky-500" /> Measurement</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDayData && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-[var(--muted-fg)]">
              {selectedDayData.date.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayData.isRestDay ? (
              <div className="flex items-center gap-3 text-indigo-500">
                <Moon className="w-5 h-5" />
                <span className="font-bold">Rest Day</span>
              </div>
            ) : selectedDayData.workout ? (
              <div className="flex items-center gap-3">
                {selectedDayData.workout.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
                <div>
                  <span className="font-bold">{selectedDayData.workout.name}</span>
                  <span className={`ml-2 text-xs font-medium ${selectedDayData.workout.completed ? "text-emerald-500" : "text-rose-500"}`}>
                    {selectedDayData.workout.completed ? "Completed" : "Not completed"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--muted-fg)] text-sm">No workout data for this day.</p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${selectedDayData.hasNutrition ? "border-amber-500/30 bg-amber-500/5" : "border-[var(--border-color)]"}`}>
                <Apple className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">{selectedDayData.hasNutrition ? "Logged" : "—"}</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${selectedDayData.hasMeasurement ? "border-sky-500/30 bg-sky-500/5" : "border-[var(--border-color)]"}`}>
                <Scale className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-medium">{selectedDayData.hasMeasurement ? "Logged" : "—"}</span>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border border-[var(--border-color)]`}>
                <Camera className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium">—</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
