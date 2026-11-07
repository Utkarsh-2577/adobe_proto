'use client';

import React from 'react';
import { 
  Network, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Scale, 
  Key, 
  Binary
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenInspector: () => void;
  onOpenApiKey: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenInspector,
  onOpenApiKey,
  hasCustomKey,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Concept Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                LearnDAG
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-medium font-mono">
                  v2.0
                </span>
              </h1>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 hidden md:inline">
                AI Personalized Academic Buddy
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Strict Separation: <strong className="text-slate-300 font-medium">Kahn&apos;s DAG Algorithm</strong> (Rules) + <strong className="text-slate-300 font-medium">LLM</strong> (Explanations)
            </p>
          </div>
        </div>

        {/* Guarantees Badges & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Architectural Guarantee Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Hallucination</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cap: 6 cr/sem</span>
          </div>

          {/* Inspect Kahn Trace */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            title="Inspect Kahn's Algorithm Mathematical Trace"
          >
            <Binary className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kahn DAG Trace</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKey}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              hasCustomKey
                ? 'bg-purple-950/80 border-purple-600/70 text-purple-200 shadow-sm shadow-purple-900/30'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Live LLM API Key (Optional)"
          >
            {hasCustomKey ? (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-semibold text-purple-200">Gemini Live Active</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>LLM Mode (Local)</span>
              </>
            )}
          </button>

          {/* Reset Scenario */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset to default baseline state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

