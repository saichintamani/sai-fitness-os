"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { localCoach } from "@/lib/ai/local-coach";
import { FitnessContext, CoachResponse } from "@/lib/ai/provider";
import { getCurrentWeek, getCurrentPhase } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, Sparkles, ChevronDown, AlertCircle, Lightbulb, Info } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  reasoning?: string;
  confidence?: string;
  source?: string;
  suggestions?: string[];
  timestamp: Date;
  showReasoning?: boolean;
}

const QUICK_QUESTIONS = [
  "What should I do today?",
  "Should I increase my shoulder press?",
  "Why am I not gaining weight?",
  "What should I eat tonight?",
  "How was my week?",
  "What muscle is lagging?",
  "Am I recovering?",
  "Why did my strength decrease?",
  "What replaces lat pulldown?",
];

export default function CoachPage() {
  const { state } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function buildContext(): FitnessContext {
    return {
      profile: state.profile!,
      recentWorkouts: state.workoutLogs.slice(-14),
      recentNutrition: state.nutritionLogs.slice(-7),
      recentRecovery: state.recoveryLogs.slice(-7),
      measurements: state.measurements,
      currentWeek: getCurrentWeek(new Date(state.profile?.programStartDate || Date.now())),
      currentPhase: getCurrentPhase(getCurrentWeek(new Date(state.profile?.programStartDate || Date.now()))),
    };
  }

  async function handleSend(question?: string) {
    const q = question || input.trim();
    if (!q || isThinking) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const context = buildContext();
      const response: CoachResponse = await localCoach.askCoach(q, context);

      const coachMsg: Message = {
        id: crypto.randomUUID(),
        role: "coach",
        content: response.answer,
        reasoning: response.reasoning,
        confidence: response.confidence,
        source: response.source,
        suggestions: response.suggestions,
        timestamp: new Date(),
        showReasoning: false,
      };
      setMessages(prev => [...prev, coachMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "coach",
        content: "Something went wrong processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }

  function toggleReasoning(id: string) {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, showReasoning: !m.showReasoning } : m)
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="shrink-0 pb-4 border-b border-[var(--border-color)] mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--primary)]/10 p-3 rounded-xl">
            <BrainCircuit className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">SAI COACH</h1>
            <p className="text-xs text-[var(--muted-fg)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI unavailable — using local coaching rules
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12">
            <div className="space-y-3">
              <Sparkles className="w-12 h-12 text-[var(--primary)] mx-auto opacity-50" />
              <h2 className="text-xl font-bold">Your Personal Performance Analyst</h2>
              <p className="text-sm text-[var(--muted-fg)] max-w-md mx-auto">
                Ask me anything about your training, nutrition, recovery, or progress. I use your actual logged data — never fabricated information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all text-sm font-medium text-[var(--muted-fg)] hover:text-[var(--fg)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user"
                ? "bg-[var(--primary)] text-[var(--primary-fg)] rounded-2xl rounded-br-md px-4 py-3"
                : "space-y-2"
              }`}>
              {msg.role === "coach" && (
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl rounded-bl-md p-4 space-y-3">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--muted-fg)] font-bold flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Suggestions
                      </span>
                      {msg.suggestions.map((s, i) => (
                        <p key={i} className="text-xs text-[var(--muted-fg)] pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-[var(--primary)]">{s}</p>
                      ))}
                    </div>
                  )}

                  {/* Why Layer Toggle */}
                  {msg.reasoning && (
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--primary)] font-bold hover:underline pt-1"
                    >
                      <Info className="w-3 h-3" />
                      {msg.showReasoning ? "Hide reasoning" : "Why?"}
                      <ChevronDown className={`w-3 h-3 transition-transform ${msg.showReasoning ? "rotate-180" : ""}`} />
                    </button>
                  )}

                  {msg.showReasoning && msg.reasoning && (
                    <div className="bg-[var(--secondary)]/50 rounded-lg p-3 text-xs text-[var(--muted-fg)] leading-relaxed whitespace-pre-wrap animate-fade-in border border-[var(--border-color)]/50">
                      {msg.reasoning}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-[var(--muted-fg)]">
                    {msg.source === "local-rules" && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Local rules
                      </span>
                    )}
                    {msg.confidence && (
                      <span className={`px-1.5 py-0.5 rounded ${
                        msg.confidence === "high" ? "bg-emerald-500/10 text-emerald-500" :
                        msg.confidence === "medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-rose-500/10 text-rose-500"
                      }`}>
                        {msg.confidence} confidence
                      </span>
                    )}
                  </div>
                </div>
              )}

              {msg.role === "user" && (
                <span className="text-sm font-medium">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl rounded-bl-md p-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-4 border-t border-[var(--border-color)] mt-4">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 h-12 bg-[var(--card-bg)] border-[var(--border-color)] text-sm"
            disabled={isThinking}
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={!input.trim() || isThinking}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
