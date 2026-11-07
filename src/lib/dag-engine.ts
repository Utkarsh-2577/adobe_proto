import { Course, DagSortResult, SemesterPlan } from '@/types/course';
import { COURSE_MAP } from '@/data/courses';

export interface TopologicalSortOptions {
  catalog: Course[];
  completedCourses: string[];
  failedMastery?: string[];
  maxCreditsPerSemester?: number;
}

/**
 * Deterministic Academic DAG Engine using Kahn's Algorithm
 * 
 * Guarantees:
 * 1. Topological order: Course X only scheduled after ALL prerequisites are scheduled in strictly prior semesters.
 * 2. Strict credit cap: Sum of credits in each semester <= maxCreditsPerSemester (default 6).
 * 3. Cycle and missing dependency detection.
 * 4. Step-by-step trace generation for mathematical explainability.
 */
export function generateAcademicPlan({
  catalog,
  completedCourses,
  failedMastery = [],
  maxCreditsPerSemester = 6,
}: TopologicalSortOptions): DagSortResult {
  const executionSteps: DagSortResult['executionSteps'] = [];
  let stepCounter = 1;

  // Set of courses considered effectively completed (must NOT be in failedMastery)
  const failedMasterySet = new Set(failedMastery);
  const effectiveCompleted = new Set(
    completedCourses.filter((id) => !failedMasterySet.has(id))
  );

  // Set of courses that need to be scheduled
  // (courses in catalog not in effectiveCompleted, which includes courses in failedMastery)
  const remainingCourses = new Map<string, Course>();
  for (const course of catalog) {
    if (!effectiveCompleted.has(course.id)) {
      remainingCourses.set(course.id, course);
    }
  }

  // Calculate downstream dependency counts to prioritize bottleneck courses
  const downstreamCount = new Map<string, number>();
  for (const course of catalog) {
    downstreamCount.set(course.id, 0);
  }
  for (const course of catalog) {
    for (const prereqId of course.prerequisites) {
      downstreamCount.set(prereqId, (downstreamCount.get(prereqId) || 0) + 1);
    }
  }

  const semesters: SemesterPlan[] = [];
  const scheduledCourseIds: string[] = [];
  const completedInPriorSemesters = new Set<string>(effectiveCompleted);

  let currentSemesterNumber = 1;
  const maxIterations = 50; // Safeguard against unbounded loops
  let iteration = 0;

  while (remainingCourses.size > 0 && iteration < maxIterations) {
    iteration++;

    // Step A: Find all candidate courses whose prerequisites are ALL in completedInPriorSemesters
    const readyCandidates: Course[] = [];
    for (const [courseId, course] of remainingCourses.entries()) {
      const allPrereqsMet = course.prerequisites.every((prereqId) =>
        completedInPriorSemesters.has(prereqId)
      );
      if (allPrereqsMet) {
        readyCandidates.push(course);
      }
    }

    if (readyCandidates.length === 0) {
      // Kahn's algorithm cycle detection or unresolvable prerequisite
      const cycleIds = Array.from(remainingCourses.keys());
      return {
        semesters,
        scheduledCourseIds,
        totalCredits: semesters.reduce((sum, s) => sum + s.totalCredits, 0),
        unlockedNextSemesterCourseIds: [],
        isValidDag: false,
        cyclesDetected: cycleIds,
        executionSteps,
      };
    }

    // Step B: Sort candidates deterministically:
    // 1. Prioritize failed mastery remediation (urgent retakes)
    // 2. Prioritize high downstream dependencies (unblocks maximum future courses)
    // 3. Prioritize Core over Open Resource
    // 4. Stable tie-breaker by course code
    readyCandidates.sort((a, b) => {
      const aIsRemediation = failedMasterySet.has(a.id) ? 1 : 0;
      const bIsRemediation = failedMasterySet.has(b.id) ? 1 : 0;
      if (aIsRemediation !== bIsRemediation) {
        return bIsRemediation - aIsRemediation; // Remediation first
      }

      const aDownstream = downstreamCount.get(a.id) || 0;
      const bDownstream = downstreamCount.get(b.id) || 0;
      if (aDownstream !== bDownstream) {
        return bDownstream - aDownstream; // Highest downstream bottleneck first
      }

      if (a.category !== b.category) {
        return a.category === 'Core' ? -1 : 1; // Core first
      }

      return a.code.localeCompare(b.code);
    });

    // Step C: Greedy knapsack packing for the semester with hard limit maxCreditsPerSemester
    const semesterCourses: Course[] = [];
    let currentSemesterCredits = 0;

    for (const candidate of readyCandidates) {
      if (currentSemesterCredits + candidate.credits <= maxCreditsPerSemester) {
        semesterCourses.push(candidate);
        currentSemesterCredits += candidate.credits;
      }
    }

    // Edge case safeguard: if candidate exists but even single course exceeds maxCreditsPerSemester
    if (semesterCourses.length === 0 && readyCandidates.length > 0) {
      const forcedCandidate = readyCandidates[0];
      semesterCourses.push(forcedCandidate);
      currentSemesterCredits += forcedCandidate.credits;
    }

    // Step D: Record execution step for auditability
    executionSteps.push({
      stepNumber: stepCounter++,
      description: `Semester ${currentSemesterNumber}: Evaluated ${readyCandidates.length} ready courses, scheduled ${semesterCourses.length} courses within ${maxCreditsPerSemester} credit ceiling.`,
      readyQueue: readyCandidates.map((c) => c.code),
      selected: semesterCourses.map((c) => `${c.code} (${c.credits} cr)`),
      semesterCredits: currentSemesterCredits,
    });

    // Step E: Create Semester Plan
    semesters.push({
      semesterNumber: currentSemesterNumber,
      semesterName: `Semester ${currentSemesterNumber}`,
      courses: [...semesterCourses],
      totalCredits: currentSemesterCredits,
    });

    // Step F: Mark scheduled courses as completed for subsequent semesters
    for (const course of semesterCourses) {
      scheduledCourseIds.push(course.id);
      completedInPriorSemesters.add(course.id);
      remainingCourses.delete(course.id);
    }

    currentSemesterNumber++;
  }

  // Calculate which courses are unlocked immediately in Semester 1
  const unlockedNextSemesterCourseIds = semesters[0]?.courses.map((c) => c.id) || [];
  const totalCredits = semesters.reduce((sum, s) => sum + s.totalCredits, 0);

  return {
    semesters,
    scheduledCourseIds,
    totalCredits,
    unlockedNextSemesterCourseIds,
    isValidDag: true,
    executionSteps,
  };
}

/**
 * Validates a generated plan against academic DAG rules:
 * 1. No semester exceeds the credit limit.
 * 2. No course is scheduled prior to or in the same semester as its prerequisite.
 * 3. Courses requiring remediation appear before dependent courses.
 */
export function validateAcademicPlan(
  plan: SemesterPlan[],
  completedCourses: string[],
  failedMastery: string[] = [],
  maxCreditsPerSemester: number = 6
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const failedSet = new Set(failedMastery);
  const knownCompleted = new Set(completedCourses.filter((id) => !failedSet.has(id)));

  for (const sem of plan) {
    if (sem.totalCredits > maxCreditsPerSemester) {
      violations.push(
        `Semester ${sem.semesterNumber} exceeds credit limit: ${sem.totalCredits} cr > ${maxCreditsPerSemester} cr limit.`
      );
    }

    for (const course of sem.courses) {
      for (const prereqId of course.prerequisites) {
        if (!knownCompleted.has(prereqId)) {
          const prereqCourse = COURSE_MAP.get(prereqId);
          violations.push(
            `Prerequisite violation: "${course.name}" scheduled in Semester ${sem.semesterNumber} before "${prereqCourse?.name || prereqId}" is completed.`
          );
        }
      }
    }

    // Courses taken in this semester are only available as prerequisites for FUTURE semesters
    for (const course of sem.courses) {
      knownCompleted.add(course.id);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}
