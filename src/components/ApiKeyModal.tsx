'use client';

import React, { useState } from 'react';
import { X, Key, Sparkles, Check, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isEnvKeyActive?: boolean;
  maskedEnvKey?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  isEnvKeyActive = false,
  maskedEnvKey = null,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  const handleTestKey = async () => {
    const keyToTest = keyInput.trim() || apiKey;
    if (!keyToTest && !isEnvKeyActive) {
      setTestResult({
        success: false,
        message: 'Please paste an API key first to test the connection.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_key',
          apiKey: keyToTest,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connected to Gemini!' : 'Connection test failed'),
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network test error';
      setTestResult({
        success: false,
        message: `Failed to test key: ${errMsg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
    setTestResult(null);
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
              <h3 className="font-bold text-sm text-white">Gemini API Status &amp; Key</h3>
              <p className="text-xs text-slate-400">Manage Live LLM Explainer Connection</p>
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
          {/* Active status card */}
          {isEnvKeyActive && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-700/60 text-purple-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Server Environment Variable Active: </strong>
                <span className="font-mono text-purple-300">{maskedEnvKey || 'GEMINI_API_KEY detected'}</span>
                <p className="text-[11px] text-purple-300/80 mt-1">
                  Click &quot;Test Connection&quot; below to verify live Google Gemini API connectivity.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-1.5">
            <p className="font-medium text-slate-200">
              ⚡ How Gemini API is used:
            </p>
            <p>
              When active, Ada uses Google Gemini (<code className="text-purple-300 font-mono">gemini-2.0-flash</code>) to explain your mathematically sorted schedule without ever modifying the plan.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Stored only locally in your browser session. Never sent to any third-party server.
            </p>
          </div>

          {/* Test connection output */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-snug">{testResult.message}</div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-400 text-xs px-2 py-1 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
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
