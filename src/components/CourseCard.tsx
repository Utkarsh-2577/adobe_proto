'use client';

import React from 'react';
import { Course } from '@/types/course';
import { COURSE_MAP } from '@/data/courses';
import { 
  BookOpen, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
  semesterNumber?: number;
  isCompleted?: boolean;
  isFailedMastery?: boolean;
  completedCourseIds: string[];
  onToggleMastery?: (courseId: string) => void;
  onToggleCompleted?: (courseId: string) => void;
  compact?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  semesterNumber,
  isCompleted = false,
  isFailedMastery = false,
  completedCourseIds,
  onToggleMastery,
  onToggleCompleted,
  compact = false,
}) => {
  const isCore = course.category === 'Core';
  const completedSet = new Set(completedCourseIds);

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
        isFailedMastery
          ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30'
          : isCompleted
          ? 'bg-slate-900/60 border-emerald-500/30'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md shadow-slate-950/40'
      }`}
    >
      {/* Top Banner for Remediation / Edge Case alert */}
      {isFailedMastery && (
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/30 to-amber-600/30 border-b border-amber-500/30 px-3 py-1 flex items-center justify-between text-[11px] text-amber-300 font-semibold tracking-wide uppercase">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Remediation Required
          </span>
          <span className="text-[10px] lowercase bg-amber-900/50 px-1.5 py-0.5 rounded border border-amber-700/50">
            mastery unverified
          </span>
        </div>
      )}

      <div className="p-3.5 space-y-2.5">
        {/* Header: Code, Badges, Credits */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-white tracking-wider px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
              {course.code}
            </span>

            {/* Category Badge */}
            {isCore ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                <BookOpen className="w-3 h-3 text-indigo-400" />
                Core
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                <Globe className="w-3 h-3 text-cyan-400" />
                Open Resource
              </span>
            )}
          </div>

          {/* Credits Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200">
            <span>{course.credits}</span>
            <span className="text-[10px] text-slate-400 uppercase font-normal">cr</span>
          </div>
        </div>

        {/* Course Title */}
        <div>
          <h4 className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-white">
            {course.name}
          </h4>
          {!compact && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Prerequisites Information */}
        <div className="pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Layers className="w-3 h-3 text-slate-500" />
              Prerequisites:
            </span>
            {course.prerequisites.length === 0 && (
              <span className="text-[10px] text-emerald-400 font-medium">None (Entry-level)</span>
            )}
          </div>

          {course.prerequisites.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.prerequisites.map((prereqId) => {
                const prereq = COURSE_MAP.get(prereqId);
                const isMet = completedSet.has(prereqId);

                return (
                  <span
                    key={prereqId}
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono ${
                      isMet
                        ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-300'
                    }`}
                    title={prereq ? `${prereq.name} (${isMet ? 'Completed' : 'Pending'})` : prereqId}
                  >
                    {isMet ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    )}
                    {prereq?.code || prereqId}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Action Footer */}
        {(onToggleMastery || onToggleCompleted) && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[11px]">
            {onToggleMastery && (
              <button
                onClick={() => onToggleMastery(course.id)}
                className={`text-[11px] px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  isFailedMastery
                    ? 'bg-emerald-900/60 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-700/60'
                    : 'bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700'
                }`}
                title={isFailedMastery ? 'Verify & restore mastery' : 'Simulate failing mastery check'}
              >
                {isFailedMastery ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Clear Mastery Check</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Fail Mastery</span>
                  </>
                )}
              </button>
            )}

            {semesterNumber && (
              <span className="text-[10px] font-mono text-slate-400 ml-auto">
                Sem {semesterNumber}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

