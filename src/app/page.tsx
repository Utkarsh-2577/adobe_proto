'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { COURSE_CATALOG } from '@/data/courses';
import { generateAcademicPlan, validateAcademicPlan } from '@/lib/dag-engine';
import { compareAcademicPlans, PlanComparison } from '@/lib/plan-diff';
import { getBuddyExplanation } from '@/lib/ai-buddy';
import { SemesterPlan, ChatMessage, DagSortResult } from '@/types/course';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { PlanDashboard } from '@/components/PlanDashboard';
import { KahnInspectorModal } from '@/components/KahnInspectorModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';

// Initial state: Student has cleared foundational Math 101, Intro to Programming, and NPTEL Database Basics
const INITIAL_COMPLETED = ['math101', 'cs101', 'nptel-db'];
const INITIAL_FAILED: string[] = [];

export default function Home() {
  const [completedCourses, setCompletedCourses] = useState<string[]>(INITIAL_COMPLETED);
  const [failedMastery, setFailedMastery] = useState<string[]>(INITIAL_FAILED);
  const [currentPlan, setCurrentPlan] = useState<SemesterPlan[]>([]);
  const [previousPlan, setPreviousPlan] = useState<SemesterPlan[] | null>(null);
  const [dagResult, setDagResult] = useState<DagSortResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Modals state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Active view tab for smaller mobile screens
  const [mobileTab, setMobileTab] = useState<'chat' | 'dashboard'>('dashboard');

  /**
   * Core Logic Loop:
   * 1. Updates state (completedCourses, failedMastery)
   * 2. Re-runs Kahn's Topological Sort to generate the new valid plan
   * 3. Feeds oldPlan, newPlan, diff, and reason into the LLM Explainer
   */
  const executePlanUpdate = useCallback(
    async (
      newCompleted: string[],
      newFailed: string[],
      triggerReason: string,
      userMessage?: string
    ) => {
      // Step 2: Deterministic Kahn's Algorithm
      const sortResult = generateAcademicPlan({
        catalog: COURSE_CATALOG,
        completedCourses: newCompleted,
        failedMastery: newFailed,
        maxCreditsPerSemester: 6,
      });

      const oldPlanSnapshot = currentPlan.length > 0 ? currentPlan : null;
      const newPlanSnapshot = sortResult.semesters;

      // Compute mathematical diff
      const diff = compareAcademicPlans(oldPlanSnapshot, newPlanSnapshot, triggerReason);

      // Update state
      setCompletedCourses(newCompleted);
      setFailedMastery(newFailed);
      setPreviousPlan(oldPlanSnapshot);
      setCurrentPlan(newPlanSnapshot);
      setDagResult(sortResult);

      // Prepare Chat Message
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // If user typed a prompt, add their message first
      if (userMessage) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            sender: 'user',
            content: userMessage,
            timestamp,
          },
        ]);
      }

      // Step 3: Send to LLM Explainer (Strictly separated; explains DAG mathematical output)
      setIsLoadingAi(true);
      try {
        let explanation = '';
        try {
          const apiRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldPlan: oldPlanSnapshot,
              newPlan: newPlanSnapshot,
              diff,
              reason: triggerReason,
              userMessage,
              apiKey: apiKey || undefined,
            }),
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (data.success && data.explanation) {
              explanation = data.explanation;
            }
          }
        } catch {
          // Fall back gracefully to direct client-side explainer
        }

        if (!explanation) {
          explanation = await getBuddyExplanation({
            oldPlan: oldPlanSnapshot,
            newPlan: newPlanSnapshot,
            diff,
            reason: triggerReason,
            userMessage,
            apiKey: apiKey || undefined,
          });
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            content: explanation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            contextDiff: diff.hasChanged
              ? {
                  reason: triggerReason,
                  addedToRemediation: diff.coursesAddedToSchedule.map((c) => c.courseName),
                  evictedCourses: diff.coursesDelayed.map((c) => c.courseName),
                }
              : undefined,
          },
        ]);
      } catch (err) {
        console.error('Explanation generation failed:', err);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [currentPlan, apiKey]
  );

  // Initialize baseline plan on mount
  useEffect(() => {
    const initialSort = generateAcademicPlan({
      catalog: COURSE_CATALOG,
      completedCourses: INITIAL_COMPLETED,
      failedMastery: INITIAL_FAILED,
      maxCreditsPerSemester: 6,
    });

    setCurrentPlan(initialSort.semesters);
    setDagResult(initialSort);

    // Initial greeting message from Ada
    setChatMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        content: `👋 **Hello! I'm Ada, your AI Academic Learning Buddy.**

I am powered by a **strict architectural separation**:
- **Schedule Generator:** Pure deterministic DAG engine (**Kahn's Topological Sort**) enforcing a hard **6-credit ceiling** per semester.
- **My Role:** I translate and explain the mathematical schedule so you always know why courses are sequenced this way.

Your current plan is ready on the right! Try clicking **"Fail Database Mastery Check"** to simulate how the DAG recalculates downstream dependencies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  /**
   * Action: Fail Database Mastery Check
   * Edge Case Simulation:
   * - NPTEL Database Basics fails mastery
   * - DAG must schedule NPTEL Database Basics in Semester 1
   * - Advanced DB (which requires Database Basics) is evicted from Semester 1
   * - LLM explains the prerequisite conflict and credit ceiling
   */
  const handleFailDatabaseMastery = () => {
    const newFailed = Array.from(new Set([...failedMastery, 'nptel-db']));
    executePlanUpdate(
      completedCourses,
      newFailed,
      'Database Mastery Check Failed (NPTEL-CS21)'
    );
  };

  /**
   * Action: Restore / Pass Database Mastery Check
   */
  const handleRestoreDatabaseMastery = () => {
    const newFailed = failedMastery.filter((id) => id !== 'nptel-db');
    executePlanUpdate(
      completedCourses,
      newFailed,
      'Database Mastery Verified & Restored (NPTEL-CS21)'
    );
  };

  /**
   * Action: Toggle any course completion
   */
  const handleToggleCourseCompletion = (courseId: string) => {
    let newCompleted: string[];
    let actionReason: string;

    if (completedCourses.includes(courseId)) {
      newCompleted = completedCourses.filter((id) => id !== courseId);
      actionReason = `Marked course [${courseId}] as incomplete`;
    } else {
      newCompleted = [...completedCourses, courseId];
      actionReason = `Marked course [${courseId}] as completed`;
    }

    // If marked uncompleted, remove from failedMastery if present
    const newFailed = failedMastery.filter((id) => id !== courseId);

    executePlanUpdate(newCompleted, newFailed, actionReason);
  };

  /**
   * Action: Toggle mastery on any individual course
   */
  const handleToggleMastery = (courseId: string) => {
    let newFailed: string[];
    let actionReason: string;

    if (failedMastery.includes(courseId)) {
      newFailed = failedMastery.filter((id) => id !== courseId);
      actionReason = `Restored mastery check for course [${courseId}]`;
    } else {
      newFailed = [...failedMastery, courseId];
      actionReason = `Failed mastery check for course [${courseId}]`;
    }

    executePlanUpdate(completedCourses, newFailed, actionReason);
  };

  /**
   * Action: User sends a chat message
   */
  const handleUserSendMessage = (messageText: string) => {
    executePlanUpdate(
      completedCourses,
      failedMastery,
      'Student Question Inquiry',
      messageText
    );
  };

  /**
   * Action: Reset everything to initial baseline state
   */
  const handleReset = () => {
    setCompletedCourses(INITIAL_COMPLETED);
    setFailedMastery(INITIAL_FAILED);
    const initialSort = generateAcademicPlan({
      catalog: COURSE_CATALOG,
      completedCourses: INITIAL_COMPLETED,
      failedMastery: INITIAL_FAILED,
      maxCreditsPerSemester: 6,
    });
    setCurrentPlan(initialSort.semesters);
    setPreviousPlan(null);
    setDagResult(initialSort);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        content: 'System reset to default baseline state (Math 101, Intro to Programming, Database Basics passed).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Bar */}
      <Header
        onReset={handleReset}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Mobile Screen Navigation Toggle */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900">
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            mobileTab === 'dashboard'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-850'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Plan Dashboard (DAG)
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            mobileTab === 'chat'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-850'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Buddy Chat
        </button>
      </div>

      {/* Main Split Screen Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-61px)] overflow-hidden">
        {/* Left Half: The Chat (Chatbot Interface) */}
        <div
          className={`h-full ${
            mobileTab === 'chat' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleUserSendMessage}
            isLoading={isLoadingAi}
          />
        </div>

        {/* Right Half: The Dashboard (Output of DAG & Completed Courses) */}
        <div
          className={`h-full ${
            mobileTab === 'dashboard' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <PlanDashboard
            currentPlan={currentPlan}
            completedCourses={completedCourses}
            failedMastery={failedMastery}
            onFailDatabaseMastery={handleFailDatabaseMastery}
            onRestoreDatabaseMastery={handleRestoreDatabaseMastery}
            onToggleCourseCompletion={handleToggleCourseCompletion}
            onToggleMastery={handleToggleMastery}
            onOpenInspector={() => setIsInspectorOpen(true)}
          />
        </div>
      </main>

      {/* Modal: Kahn's Algorithm Mathematical Trace */}
      <KahnInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        dagResult={dagResult}
        completedCourses={completedCourses}
        failedMastery={failedMastery}
      />

      {/* Modal: Optional LLM API Key */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
      />
    </div>
  );
}
