'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/course';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isGeminiActive?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isGeminiActive = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const samplePrompts = [
    'Why did Advanced DB move to Semester 2?',
    'Can I take 9 credits in Semester 1 to graduate sooner?',
    'Explain how Kahn’s Algorithm scheduled my courses',
    'What happens if I pass Database mastery now?',
  ];

  // Client-side markdown cleaner to prevent meta-prompts and indented code boxes
  const sanitizeDisplayMarkdown = (content: string) => {
    if (!content) return '';
    return content
      // Remove echoed persona or task instructions
      .replace(/^Ada,?\s*(AI\s*)?Academic Learning Buddy.*$/gim, '')
      .replace(/^Explain the changes.*$/gim, '')
      .replace(/^A new schedule generated.*$/gim, '')
      // Unwrap any label wrappers like • Greeting/Empathy: "..."
      .replace(/^[•\s*-]*(?:Greeting\/Empathy|The Core Issue|The "Why"|The Domino Effect|The Constraints|The Outcome):\s*"(.*?)"\s*$/gim, '$1')
      .replace(/^[•\s*-]*(?:Greeting\/Empathy|The Core Issue|The "Why"|The Domino Effect|The Constraints|The Outcome):\s*(.*)$/gim, '$1')
      // Strip leading 2-6 spaces before list items so they don't become <pre> code boxes
      .replace(/^[ \t]{2,}([*-]|\d+\.)/gm, '$1')
      .trim();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">Ada // Academic Buddy</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono">
                Explainer Only
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Strictly explains Kahn&apos;s DAG schedule. Zero hallucinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGeminiActive ? (
            <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/80 shadow-sm shadow-purple-900/30">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-medium">Gemini Live (Active)</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-750">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Built-in Deterministic Engine</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Architecture Reminder Banner */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-900/40 text-xs text-slate-300 flex items-start gap-2.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">Architectural Separation Active: </span>
            The academic plan on the right is computed mathematically by{' '}
            <code className="text-cyan-200 bg-slate-800 px-1 py-0.5 rounded font-mono">
              Kahn&apos;s DAG Topological Sort
            </code>
            . Ada never hallucinates or modifies the plan; she explains why prerequisites and the 6-credit limit dictate this sequence.
          </div>
        </div>

        {/* Message History */}
        {messages.map((message) => {
          const isAi = message.sender === 'ai';
          const isSystem = message.sender === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center my-2">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {message.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${isAi
                    ? 'bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                  }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[94%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words [overflow-wrap:anywhere] overflow-hidden ${isAi
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-indigo-600 text-white shadow-md'
                  }`}
              >
                {/* Context badge if this was triggered by a schedule change */}
                {message.contextDiff && (
                  <div className="mb-2 pb-2 border-b border-slate-800 text-xs text-amber-300/90 flex items-center gap-1.5 font-medium">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Schedule Adapted: {message.contextDiff.reason}</span>
                  </div>
                )}

                {/* Formatted Message Body with Markdown Rendering */}
                {isAi ? (
                  <div className="text-sm text-slate-200 break-words [overflow-wrap:anywhere]">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h3 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-800 break-words">
                            {children}
                          </h3>
                        ),
                        h2: ({ children }) => (
                          <h4 className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5 break-words">
                            {children}
                          </h4>
                        ),
                        h3: ({ children }) => (
                          <h4 className="text-sm font-bold text-cyan-300 mt-2.5 mb-1.5 flex items-center gap-1.5 break-words">
                            {children}
                          </h4>
                        ),
                        h4: ({ children }) => (
                          <h5 className="text-xs font-bold text-slate-200 mt-2 mb-1 uppercase tracking-wide break-words">
                            {children}
                          </h5>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-200 text-sm break-words">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-slate-300">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1.5 my-2 text-slate-200 text-sm">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 space-y-1.5 my-2 text-slate-200 text-sm">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed pl-0.5 break-words">{children}</li>
                        ),
                        hr: () => (
                          <hr className="border-slate-800 my-3" />
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-cyan-500/70 pl-3 py-1 my-2 bg-slate-950/50 rounded-r text-slate-300 italic text-xs break-words">
                            {children}
                          </blockquote>
                        ),
                        pre: ({ children }) => (
                          <div className="my-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono whitespace-pre-wrap break-words overflow-x-auto">
                            {children}
                          </div>
                        ),
                        code: ({ children, ...props }: any) => {
                          return (
                            <code
                              className="bg-slate-950/80 border border-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs [overflow-wrap:anywhere]"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {sanitizeDisplayMarkdown(message.content)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-sm text-white leading-relaxed break-words [overflow-wrap:anywhere]">
                    {message.content}
                  </div>
                )}

                {/* Message Timestamp & Model Provenance */}
                <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10px]">
                  <span className={isAi ? 'text-slate-400' : 'text-indigo-200'}>
                    {message.timestamp}
                  </span>
                  {isAi && (
                    <span className="flex items-center gap-1 font-mono">
                      {message.provider === 'gemini' ? (
                        <span className="text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/60 flex items-center gap-1 font-sans font-medium">
                          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                          <span>Gemini Live ({message.modelUsed || '2.0-flash'})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-850 px-1.5 py-0.5 rounded border border-slate-750 flex items-center gap-1 font-sans">
                          <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Local DAG Engine</span>
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Ada is reviewing the mathematically validated DAG changes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/90">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          <span>Ask Ada about the plan:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Ada why a course shifted, about credit limits, or DAG rules..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

