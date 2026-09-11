"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUP_META } from "@/lib/data";

interface MuscleMapProps {
  onSelectMuscle?: (muscle: string) => void;
  selectedMuscle?: string;
  className?: string;
}

export function MuscleMap({ onSelectMuscle, selectedMuscle, className }: MuscleMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Simplified SVG data for demonstration
  // In a real app, this would be a detailed anatomical SVG path collection
  const musclePaths = [
    { id: "chest", label: "Chest", path: "M 40,30 C 50,25 70,25 80,30 C 85,35 85,45 80,50 C 70,55 50,55 40,50 C 35,45 35,35 40,30 Z", type: "front" },
    { id: "front-delts", label: "Front Delts", path: "M 30,25 C 35,20 40,25 40,30 C 38,35 32,38 28,35 C 25,32 25,28 30,25 Z", type: "front" },
    { id: "front-delts", label: "Front Delts R", path: "M 90,25 C 85,20 80,25 80,30 C 82,35 88,38 92,35 C 95,32 95,28 90,25 Z", type: "front" },
    { id: "abs", label: "Core", path: "M 45,55 L 75,55 L 70,85 L 50,85 Z", type: "front" },
    { id: "biceps", label: "Biceps L", path: "M 25,35 C 30,35 32,45 28,50 C 25,55 20,45 25,35 Z", type: "front" },
    { id: "biceps", label: "Biceps R", path: "M 95,35 C 90,35 88,45 92,50 C 95,55 100,45 95,35 Z", type: "front" },
    { id: "quads", label: "Quads L", path: "M 45,90 C 55,90 55,120 50,130 C 45,140 40,120 45,90 Z", type: "front" },
    { id: "quads", label: "Quads R", path: "M 75,90 C 65,90 65,120 70,130 C 75,140 80,120 75,90 Z", type: "front" },
    
    // Back view (offset x by 120 for simplicity in this demo)
    { id: "upper-back", label: "Upper Back", path: "M 160,25 C 170,25 190,25 200,25 C 195,40 165,40 160,25 Z", type: "back" },
    { id: "lats", label: "Lats", path: "M 155,35 C 165,40 195,40 205,35 C 195,65 165,65 155,35 Z", type: "back" },
    { id: "lower-back", label: "Lower Back", path: "M 165,65 C 175,60 185,60 195,65 C 190,80 170,80 165,65 Z", type: "back" },
    { id: "rear-delts", label: "Rear Delts L", path: "M 150,25 C 155,20 160,25 160,30 C 158,35 152,38 148,35 C 145,32 145,28 150,25 Z", type: "back" },
    { id: "rear-delts", label: "Rear Delts R", path: "M 210,25 C 205,20 200,25 200,30 C 202,35 208,38 212,35 C 215,32 215,28 210,25 Z", type: "back" },
    { id: "triceps", label: "Triceps L", path: "M 145,35 C 150,35 152,45 148,50 C 145,55 140,45 145,35 Z", type: "back" },
    { id: "triceps", label: "Triceps R", path: "M 215,35 C 210,35 208,45 212,50 C 215,55 220,45 215,35 Z", type: "back" },
    { id: "hamstrings", label: "Hamstrings L", path: "M 165,90 C 175,90 175,120 170,130 C 165,140 160,120 165,90 Z", type: "back" },
    { id: "hamstrings", label: "Hamstrings R", path: "M 195,90 C 185,90 185,120 190,130 C 195,140 200,120 195,90 Z", type: "back" },
    { id: "glutes", label: "Glutes", path: "M 160,80 C 170,75 190,75 200,80 C 205,95 155,95 160,80 Z", type: "back" },
    { id: "calves", label: "Calves L", path: "M 165,135 C 172,135 172,160 168,165 C 162,160 162,135 165,135 Z", type: "back" },
    { id: "calves", label: "Calves R", path: "M 195,135 C 188,135 188,160 192,165 C 198,160 198,135 195,135 Z", type: "back" },
  ];

  const handleMuscleClick = (id: string) => {
    if (onSelectMuscle) {
      onSelectMuscle(id === "abs" ? "core" : id);
    }
  };

  return (
    <div className={cn("relative w-full aspect-video min-h-[300px] flex items-center justify-center p-4", className)}>
      <svg 
        viewBox="0 0 240 180" 
        className="w-full h-full drop-shadow-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Labels */}
        <text x="60" y="15" textAnchor="middle" className="text-[8px] fill-[var(--muted-fg)] font-medium uppercase tracking-wider">Front</text>
        <text x="180" y="15" textAnchor="middle" className="text-[8px] fill-[var(--muted-fg)] font-medium uppercase tracking-wider">Back</text>

        {/* Render paths */}
        {musclePaths.map((muscle, index) => {
          const mappedId = muscle.id === "abs" ? "core" : muscle.id;
          const isSelected = selectedMuscle === mappedId;
          const isHovered = hoveredMuscle === mappedId;
          const isActive = isSelected || isHovered;
          
          const meta = MUSCLE_GROUP_META[mappedId];
          const defaultColor = "var(--secondary)";
          const activeColor = meta?.color || "var(--primary)";
          
          return (
            <path
              key={`${muscle.id}-${index}`}
              d={muscle.path}
              fill={isActive ? activeColor : defaultColor}
              stroke={isActive ? "#fff" : "var(--border-color)"}
              strokeWidth={isActive ? "1" : "0.5"}
              className="transition-all duration-300 cursor-pointer"
              style={isActive ? { filter: "url(#glow)" } : {}}
              onMouseEnter={() => setHoveredMuscle(mappedId)}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => handleMuscleClick(muscle.id)}
            >
              <title>{muscle.label}</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}
