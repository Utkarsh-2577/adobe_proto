'use client';

import React, { useState } from 'react';
import { X, Key, Sparkles, Check, ShieldAlert } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">LLM Explainer Settings</h3>
              <p className="text-xs text-slate-400">Optional: Connect Live Gemini / LLM API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-1.5">
            <p className="font-medium text-slate-200">
              ⚡ Works out of the box with zero keys:
            </p>
            <p>
              By default, LearnDAG runs a built-in deterministic AI Explainer that analyzes exact topological diffs and credit limits. You can enter an optional Gemini API key to test live LLM calls.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Stored only locally in your browser session. Never sent to any third-party server.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
            >
              Clear &amp; Use Built-in Engine
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
