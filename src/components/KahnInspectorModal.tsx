'use client';

import React from 'react';
import { DagSortResult } from '@/types/course';
import { COURSE_CATALOG } from '@/data/courses';
import { 
  X, 
  Binary, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Scale
} from 'lucide-react';

interface KahnInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dagResult: DagSortResult | null;
  completedCourses: string[];
  failedMastery: string[];
}

export const KahnInspectorModal: React.FC<KahnInspectorModalProps> = ({
  isOpen,
  onClose,
  dagResult,
  completedCourses,
  failedMastery,
}) => {
  if (!isOpen || !dagResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Kahn&apos;s Algorithm Trace & Mathematical Proof
              </h3>
              <p className="text-xs text-slate-400">
                Audit log of the deterministic DAG topological sort
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-slate-200">
          {/* Strict Separation Callout */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">Deterministic Mathematical Wall:</strong> This algorithm runs entirely inside pure TypeScript before any LLM is queried. In-degree calculation, ready queues, and credit ceiling bin-packing are strictly mathematical.
            </div>
          </div>

          {/* Catalog Graph Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Graph Dependency Network (Nodes &amp; Prerequisite In-Degrees)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {COURSE_CATALOG.map((course) => {
                const isEffectiveCompleted =
                  completedCourses.includes(course.id) &&
                  !failedMastery.includes(course.id);
                const isFailed = failedMastery.includes(course.id);

                return (
                  <div
                    key={course.id}
                    className={`p-2.5 rounded-lg border ${
                      isFailed
                        ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                        : isEffectiveCompleted
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-medium">
                      <span>{course.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {course.credits} cr
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Prereqs:{' '}
                      {course.prerequisites.length === 0 ? (
                        <span className="text-emerald-400">None (In-degree 0)</span>
                      ) : (
                        <span className="text-cyan-300 font-mono">
                          {course.prerequisites.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Trace Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Topological Sort Step Execution Trace</span>
              <span className="text-emerald-400 font-normal">
                {dagResult.executionSteps.length} Semesters Packed
              </span>
            </h4>

            <div className="space-y-2.5">
              {dagResult.executionSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white">
                      Step {step.stepNumber}: Packing Semester {step.stepNumber}
                    </span>
                    <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {step.semesterCredits} / 6 cr
                    </span>
                  </div>

                  <p className="text-slate-400">{step.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                    <div>
                      <span className="text-slate-400 text-[11px]">Ready Candidates (In-degree 0):</span>
                      <div className="font-mono text-cyan-300 mt-0.5">
                        {step.readyQueue.length > 0 ? step.readyQueue.join(', ') : 'None'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Scheduled in Semester (Max 6 cr):</span>
                      <div className="font-mono text-emerald-300 mt-0.5">
                        {step.selected.length > 0 ? step.selected.join(', ') : 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Audit Trace
          </button>
        </div>
      </div>
    </div>
  );
};

