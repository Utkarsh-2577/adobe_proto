export type CourseCategory = 'Core' | 'Open Resource';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites: string[]; // array of course IDs
  category: CourseCategory;
  provider?: string;
  description: string;
  colorTheme?: string;
}

export interface SemesterPlan {
  semesterNumber: number;
  semesterName: string;
  courses: Course[];
  totalCredits: number;
}

export interface DagSortResult {
  semesters: SemesterPlan[];
  scheduledCourseIds: string[];
  totalCredits: number;
  unlockedNextSemesterCourseIds: string[];
  isValidDag: boolean;
  cyclesDetected?: string[];
  executionSteps: Array<{
    stepNumber: number;
    description: string;
    readyQueue: string[];
    selected: string[];
    semesterCredits: number;
  }>;
}

export interface UserProfileState {
  completedCourses: string[]; // IDs of passed courses
  failedMastery: string[]; // IDs of courses that failed mastery check and need remediation
  currentPlan: SemesterPlan[];
  previousPlan: SemesterPlan[] | null;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  content: string;
  timestamp: string;
  contextDiff?: {
    reason: string;
    addedToRemediation?: string[];
    evictedCourses?: string[];
    pushedSemesters?: Array<{ courseName: string; fromSem: number; toSem: number }>;
  };
}
