"use client";

import { useState } from "react";
import { useProfile } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Apple, Droplets, UtensilsCrossed, AlertCircle, Coffee, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function NutritionPage() {
  const { profile, updateProfile } = useProfile();
  
  // Mock Data (will be connected to DB)
  const [consumed, setConsumed] = useState({ calories: 1200, protein: 75, carbs: 140, fat: 35, waterMl: 1500 });
  const [hostelMode, setHostelMode] = useState(profile?.hostelMode ?? true);
  
  const targets = {
    calories: 2500, // Derived from user profile in real backend
    protein: profile ? Math.round(profile.weightKg * 2.2) : 140, // 2.2g/kg roughly for lean bulk
    carbs: 300,
    fat: 65,
    waterMl: 3000
  };

  const handleToggleHostelMode = () => {
    const newVal = !hostelMode;
    setHostelMode(newVal);
    updateProfile({ hostelMode: newVal });
  };

  const logWater = (ml: number) => {
    setConsumed(prev => ({ ...prev, waterMl: prev.waterMl + ml }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Engine</h1>
          <p className="text-[var(--muted-fg)]">Fuel your transformation.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--secondary)]/50 p-2 px-4 rounded-full border border-[var(--border-color)]">
          <label className="text-sm font-bold uppercase tracking-wider text-[var(--muted-fg)] flex items-center">
            Hostel Mode
          </label>
          <Switch checked={hostelMode} onCheckedChange={handleToggleHostelMode} />
        </div>
      </div>

      {hostelMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold block mb-1">Hostel Mode Active</span>
            Recommendations are optimized for mess food, limited budget (₹2000/mo), and no kitchen access (Oats, Milk, Soya, Peanuts).
          </div>
        </div>
      )}

      {/* Macro Tracking */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-1 p-6 flex flex-col items-center justify-center">
          <ProgressRing 
            progress={(consumed.calories / targets.calories) * 100} 
            size={100} 
            color="#f97316"
            label="Calories"
            icon={<div className="text-center">
              <span className="text-lg font-bold block">{consumed.calories}</span>
              <span className="text-[10px] text-[var(--muted-fg)]">/ {targets.calories}</span>
            </div>}
          />
        </Card>
        
        <Card className="p-4 flex flex-col items-center justify-center">
          <ProgressRing 
            progress={(consumed.protein / targets.protein) * 100} 
            size={80} 
            color="#3b82f6"
            label="Protein (g)"
            icon={<span className="font-bold">{consumed.protein}</span>}
          />
        </Card>
        
        <Card className="p-4 flex flex-col items-center justify-center">
          <ProgressRing 
            progress={(consumed.carbs / targets.carbs) * 100} 
            size={80} 
            color="#10b981"
            label="Carbs (g)"
            icon={<span className="font-bold">{consumed.carbs}</span>}
          />
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center">
          <ProgressRing 
            progress={(consumed.fat / targets.fat) * 100} 
            size={80} 
            color="#eab308"
            label="Fat (g)"
            icon={<span className="font-bold">{consumed.fat}</span>}
          />
        </Card>
      </div>

      {/* What Should I Eat Now? */}
      <Card className="border-[var(--primary)]/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <UtensilsCrossed className="w-48 h-48" />
        </div>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-[var(--muted-fg)] flex items-center">
            <Clock className="w-4 h-4 mr-2" /> What Should I Eat Now?
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="mb-4">
            <h3 className="text-2xl font-black mb-1">Post-Workout Recovery</h3>
            <p className="text-sm font-medium text-[var(--muted-fg)]">You need ~35g of protein right now.</p>
          </div>
          <div className="bg-[var(--secondary)] p-4 rounded-lg space-y-2 mb-4">
            <div className="font-bold flex items-center"><Apple className="w-4 h-4 mr-2" /> AI Recommendation</div>
            <p className="text-sm">
              <span className="text-[var(--primary)] font-semibold">100g Soya Chunks + 1 Bowl Rice + Curd.</span><br/>
              Matches your hostel constraints and hits the protein requirement perfectly.
            </p>
          </div>
          <p className="text-[10px] text-[var(--muted-fg)] italic text-right">* Nutritional values are estimates.</p>
        </CardContent>
      </Card>

      {/* Mess Meal Quick Logger */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Fast Mess Meals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold">Hostel Breakfast</span>
            <span className="text-[10px] text-[var(--muted-fg)]">Idli/Poha + Milk</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold">Mess Lunch</span>
            <span className="text-[10px] text-[var(--muted-fg)]">Dal, Rice, Roti, Sabzi</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <UtensilsCrossed className="w-5 h-5 text-sky-600" />
            <span className="text-xs font-bold">Mess Dinner</span>
            <span className="text-[10px] text-[var(--muted-fg)]">Dal, Roti, Sabzi</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2 border-dashed border-[var(--primary)] hover:bg-[var(--primary)]/10 text-[var(--primary)]">
            <span className="text-xl font-bold">+</span>
            <span className="text-xs font-bold">Custom Log</span>
          </Button>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center">
          <Droplets className="w-5 h-5 text-sky-500 mr-2" /> Water Intake
          <span className="ml-auto text-sm font-normal text-[var(--muted-fg)]">
            {(consumed.waterMl / 1000).toFixed(2)}L / {(targets.waterMl / 1000).toFixed(1)}L
          </span>
        </h3>
        
        <div className="w-full h-4 bg-[var(--secondary)] rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-sky-500 transition-all duration-500" 
            style={{ width: `${Math.min(100, (consumed.waterMl / targets.waterMl) * 100)}%` }} 
          />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" onClick={() => logWater(250)} className="text-xs">+250ml</Button>
          <Button variant="secondary" onClick={() => logWater(500)} className="text-xs">+500ml</Button>
          <Button variant="secondary" onClick={() => logWater(750)} className="text-xs">+750ml</Button>
          <Button variant="secondary" onClick={() => logWater(1000)} className="text-xs">+1L</Button>
        </div>
      </div>
    </div>
  );
}
