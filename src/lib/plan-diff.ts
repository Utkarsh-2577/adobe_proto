import { SemesterPlan } from '@/types/course';
import { COURSE_MAP } from '@/data/courses';

export interface CourseMovement {
  courseId: string;
  courseName: string;
  courseCode: string;
  previousSemester?: number;
  newSemester?: number;
  reason: string;
}

export interface PlanComparison {
  hasChanged: boolean;
  coursesDelayed: CourseMovement[];
  coursesAdvanced: CourseMovement[];
  coursesAddedToSchedule: CourseMovement[];
  coursesRemovedFromSchedule: CourseMovement[];
  totalSemestersDiff: number;
  oldTotalSemesters: number;
  newTotalSemesters: number;
  summaryText: string;
}

/**
 * Deterministically compares two academic plans to provide exact, unhallucinated diffs
 * for the LLM to explain.
 */
export function compareAcademicPlans(
  oldPlan: SemesterPlan[] | null,
  newPlan: SemesterPlan[],
  triggerReason?: string
): PlanComparison {
  if (!oldPlan || oldPlan.length === 0) {
    return {
      hasChanged: false,
      coursesDelayed: [],
      coursesAdvanced: [],
      coursesAddedToSchedule: [],
      coursesRemovedFromSchedule: [],
      totalSemestersDiff: 0,
      oldTotalSemesters: 0,
      newTotalSemesters: newPlan.length,
      summaryText: 'Initial deterministic academic plan generated.',
    };
  }

  // Build maps of courseId -> semester number
  const oldCoursePositions = new Map<string, number>();
  for (const sem of oldPlan) {
    for (const course of sem.courses) {
      oldCoursePositions.set(course.id, sem.semesterNumber);
    }
  }

  const newCoursePositions = new Map<string, number>();
  for (const sem of newPlan) {
    for (const course of sem.courses) {
      newCoursePositions.set(course.id, sem.semesterNumber);
    }
  }

  const coursesDelayed: CourseMovement[] = [];
  const coursesAdvanced: CourseMovement[] = [];
  const coursesAddedToSchedule: CourseMovement[] = [];
  const coursesRemovedFromSchedule: CourseMovement[] = [];

  // Check new courses and positions
  for (const [courseId, newSem] of newCoursePositions.entries()) {
    const course = COURSE_MAP.get(courseId);
    const courseName = course?.name || courseId;
    const courseCode = course?.code || courseId;

    if (!oldCoursePositions.has(courseId)) {
      coursesAddedToSchedule.push({
        courseId,
        courseName,
        courseCode,
        newSemester: newSem,
        reason: 'Added back to active schedule (e.g. required remediation / retake)',
      });
    } else {
      const oldSem = oldCoursePositions.get(courseId)!;
      if (newSem > oldSem) {
        coursesDelayed.push({
          courseId,
          courseName,
          courseCode,
          previousSemester: oldSem,
          newSemester: newSem,
          reason: `Pushed back by ${newSem - oldSem} semester(s) to respect prerequisite constraints and the 6-credit/semester cap`,
        });
      } else if (newSem < oldSem) {
        coursesAdvanced.push({
          courseId,
          courseName,
          courseCode,
          previousSemester: oldSem,
          newSemester: newSem,
          reason: `Moved earlier by ${oldSem - newSem} semester(s) as prerequisites became cleared sooner`,
        });
      }
    }
  }

  // Check removed courses
  for (const [courseId, oldSem] of oldCoursePositions.entries()) {
    if (!newCoursePositions.has(courseId)) {
      const course = COURSE_MAP.get(courseId);
      coursesRemovedFromSchedule.push({
        courseId,
        courseName: course?.name || courseId,
        courseCode: course?.code || courseId,
        previousSemester: oldSem,
        reason: 'Satisfied and archived from remaining semester sequence',
      });
    }
  }

  const oldTotalSemesters = oldPlan.length;
  const newTotalSemesters = newPlan.length;
  const totalSemestersDiff = newTotalSemesters - oldTotalSemesters;

  const hasChanged =
    coursesDelayed.length > 0 ||
    coursesAdvanced.length > 0 ||
    coursesAddedToSchedule.length > 0 ||
    coursesRemovedFromSchedule.length > 0 ||
    totalSemestersDiff !== 0;

  // Build descriptive human-readable summary
  const summaryParts: string[] = [];
  if (triggerReason) {
    summaryParts.push(`Trigger: ${triggerReason}.`);
  }
  if (coursesAddedToSchedule.length > 0) {
    summaryParts.push(
      `Re-scheduled into active plan: ${coursesAddedToSchedule.map((c) => `${c.courseCode} (Sem ${c.newSemester})`).join(', ')}.`
    );
  }
  if (coursesDelayed.length > 0) {
    summaryParts.push(
      `Deferred to later semesters: ${coursesDelayed.map((c) => `${c.courseCode} (Sem ${c.previousSemester} ➔ Sem ${c.newSemester})`).join(', ')}.`
    );
  }
  if (totalSemestersDiff > 0) {
    summaryParts.push(`Overall graduation path extended from ${oldTotalSemesters} to ${newTotalSemesters} semesters.`);
  }

  return {
    hasChanged,
    coursesDelayed,
    coursesAdvanced,
    coursesAddedToSchedule,
    coursesRemovedFromSchedule,
    totalSemestersDiff,
    oldTotalSemesters,
    newTotalSemesters,
    summaryText: summaryParts.join(' ') || 'Plan re-evaluated with zero topological shifts.',
  };
}

