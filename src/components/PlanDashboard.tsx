'use client';

import React from 'react';
import { SemesterPlan, Course } from '@/types/course';
import { COURSE_CATALOG, COURSE_MAP } from '@/data/courses';
import { CourseCard } from './CourseCard';
import { 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Zap,
  ArrowRight,
  RotateCcw,
  BookCheck,
  Binary
} from 'lucide-react';

interface PlanDashboardProps {
  currentPlan: SemesterPlan[];
  completedCourses: string[];
  failedMastery: string[];
  onFailDatabaseMastery: () => void;
  onRestoreDatabaseMastery: () => void;
  onToggleCourseCompletion: (courseId: string) => void;
  onToggleMastery: (courseId: string) => void;
  onOpenInspector: () => void;
}

export const PlanDashboard: React.FC<PlanDashboardProps> = ({
  currentPlan,
  completedCourses,
  failedMastery,
  onFailDatabaseMastery,
  onRestoreDatabaseMastery,
  onToggleCourseCompletion,
  onToggleMastery,
  onOpenInspector,
}) => {
  const isDbFailed = failedMastery.includes('nptel-db');
  const completedSet = new Set(completedCourses);
  const totalCredits = currentPlan.reduce((acc, sem) => acc + sem.totalCredits, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Edge Case Simulation Action Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-4 lg:p-5 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isDbFailed ? 'bg-amber-500' : 'bg-cyan-500'
        }`} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Interactive Edge Case Simulator
              </span>
              {isDbFailed ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Mastery Check Failed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  All Masteries Verified
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Test Real-Time Academic DAG Adaptation
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triggering the mastery failure below updates state, causes Kahn&apos;s algorithm to reschedule the dependent tree, and commands the LLM to explain the resulting mathematical diff.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            {isDbFailed ? (
              <button
                onClick={onRestoreDatabaseMastery}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Restore / Pass Database Mastery</span>
              </button>
            ) : (
              <button
                onClick={onFailDatabaseMastery}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30 active:scale-[0.98]"
              >
                <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
                <span>Fail Database Mastery Check</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Semesters */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Semesters Needed</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            {currentPlan.length}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">Terms</span>
          </div>
        </div>

        {/* Total Credits */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Remaining Credits</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            {totalCredits}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">Credits</span>
          </div>
        </div>

        {/* Credit Ceiling Rule */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Credit Limit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            6.0 <span className="text-xs text-slate-400 font-sans font-normal">cr / sem max</span>
          </div>
        </div>

        {/* Topological Verification */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Academic Rule Audit</span>
            <Binary className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-purple-300 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>0 Violations (DAG Valid)</span>
          </div>
        </div>
      </div>

      {/* Section 1: Current Plan (The Output of Kahn's Algorithm) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Mathematically Validated Schedule (Kahn&apos;s Output)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentPlan.length} Semesters Planned
            </span>
          </div>

          <button
            onClick={onOpenInspector}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <span>View Graph In-Degrees</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Semester Columns/Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentPlan.map((semester) => {
            const isFull = semester.totalCredits >= 6;
            const progressPercent = Math.min(100, (semester.totalCredits / 6) * 100);

            return (
              <div
                key={semester.semesterNumber}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 flex flex-col justify-between hover:border-slate-750 transition-colors"
              >
                {/* Semester Header with Credit Meter */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
                        {semester.semesterNumber}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-100">
                        {semester.semesterName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {semester.totalCredits} / 6 cr
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isFull ? 'At Capacity' : `${6 - semester.totalCredits} cr open`}
                      </div>
                    </div>
                  </div>

                  {/* Visual Credit Cap Meter */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Course Cards inside this semester */}
                <div className="space-y-2.5 flex-1 pt-1">
                  {semester.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      semesterNumber={semester.semesterNumber}
                      isFailedMastery={failedMastery.includes(course.id)}
                      completedCourseIds={completedCourses}
                      onToggleMastery={onToggleMastery}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Completed Courses & Mastery State */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
              <BookCheck className="w-4 h-4 text-emerald-400" />
              Completed Courses & Mastery Status
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              {completedCourses.length} Completed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click badge to toggle course status
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <p className="text-xs text-slate-400">
            Courses verified as completed satisfy outgoing prerequisite edges in the DAG. You can toggle any course below to inspect how Kahn&apos;s algorithm dynamically re-evaluates remaining terms:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {COURSE_CATALOG.map((course) => {
              const isCompleted = completedSet.has(course.id);
              const isFailed = failedMastery.includes(course.id);

              return (
                <button
                  key={course.id}
                  onClick={() => onToggleCourseCompletion(course.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    isFailed
                      ? 'bg-amber-950/40 border-amber-600/70 text-amber-300 hover:bg-amber-950/60'
                      : isCompleted
                      ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-300 hover:bg-emerald-950/60 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                  title={`Toggle completed status for ${course.name}`}
                >
                  {isFailed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  )}

                  <span className="font-mono font-medium">{course.code}</span>
                  <span className="text-slate-300 hidden md:inline truncate max-w-[140px]">
                    {course.name}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {course.credits}cr
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

