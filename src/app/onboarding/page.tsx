"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/lib/store";
import { DEFAULT_USER } from "@/lib/data";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 12;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_USER);
  const { setProfile } = useProfile();
  const router = useRouter();

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    setProfile({ ...formData, onboardingCompleted: true });
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-[var(--muted-fg)] mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-[var(--card-bg)]/80 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-10">
            {step === 1 && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome to SAI OS</h1>
                  <p className="text-[var(--muted-fg)]">Your personal bodybuilding command center.</p>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 animate-slide-in">
                <h2 className="text-xl font-bold">Basic Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Age</label>
                    <Input 
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-slide-in">
                <h2 className="text-xl font-bold">Starting Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height (cm)</label>
                    <Input 
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({...formData, heightCm: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Weight (kg)</label>
                    <Input 
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({...formData, weightKg: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step > 3 && step < 12 && (
              <div className="space-y-4 text-center py-8 animate-slide-in">
                <h2 className="text-xl font-bold mb-2">Step {step} configured</h2>
                <p className="text-[var(--muted-fg)]">Using predefined defaults for Sai.</p>
              </div>
            )}

            {step === 12 && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Profile Ready</h1>
                  <p className="text-[var(--muted-fg)]">Your command center is configured for a lean bulk.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={step === 1}
                className={cn(step === 1 && "opacity-0")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleNext}>
                {step === TOTAL_STEPS ? "Enter Dashboard" : "Continue"} 
                {step < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
