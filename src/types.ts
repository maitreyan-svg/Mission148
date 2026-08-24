export type SubjectType = 'physics' | 'chemistry' | 'mathematics';

export type DayStatus = 
  | 'not_started' 
  | 'planned' 
  | 'in_progress' 
  | 'completed' 
  | 'partially_completed' 
  | 'missed';

export interface UserTargetConfig {
  jeeMainPercentile: string; // e.g. "96+"
  jeeAdvancedAIR: string; // e.g. "< 10,000"
  dailyStudyHoursGoal: number; // default 10
  dailyWaterGoalMl: number; // default 3000
}

export interface UserProfile {
  id: string;
  name: string;
  username: string; // e.g. "@nibir148" or "nibir148"
  email: string;
  targets: UserTargetConfig;
  isPublic: boolean;
  avatarSeed?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LectureItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface PYQTracking {
  isDone: boolean; // simple toggle: Done / Not Done
  isDetailed: boolean;
  total: number;
  completed: number;
  correct: number;
  incorrect: number;
}

export interface Chapter {
  id: string;
  userId: string;
  subject: SubjectType;
  name: string;
  totalLectures: number;
  completedLectures: number[]; // array of lecture numbers (1-indexed)
  pyq: PYQTracking;
  shortNotesMade: boolean;
  revisionCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRoutineMeals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface DayLog {
  dayNumber: number; // 1 to 148
  date: string; // YYYY-MM-DD
  targetHours: number; // default 10
  actualHours: number; // decimal or hours + minutes/60
  status: DayStatus;
  notes?: string;
  meals: DailyRoutineMeals;
  waterMl: number;
  chaptersStudied?: string[]; // chapter IDs
  subjectHours: {
    physics: number;
    chemistry: number;
    mathematics: number;
  };
  lecturesCompletedCount?: number;
  pyqsCompletedCount?: number;
  revisionsLoggedCount?: number;
  shortNotesLoggedCount?: number;
}

export interface DailyTask {
  id: string;
  userId: string;
  dayNumber: number;
  subject: SubjectType | 'general';
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface TimerSession {
  id: string;
  userId: string;
  dayNumber: number;
  date: string;
  subject: SubjectType | 'general';
  durationMinutes: number;
  chapterId?: string;
  chapterName?: string;
  notes?: string;
  createdAt: string;
}

export interface MockTest {
  id: string;
  userId: string;
  testName: string;
  date: string;
  examType: 'jee_main' | 'jee_advanced';
  physicsScore: number;
  chemistryScore: number;
  mathScore: number;
  totalScore: number;
  maxScore: number;
  percentile?: number;
  notes?: string;
  createdAt: string;
}

export interface UserStats {
  missionProgressPercent: number;
  currentMissionDay: number;
  daysRemaining: number;
  totalStudyHours: number;
  averageDailyStudyHours: number;
  weeklyStudyHours: number;
  todayStudyHours: number;
  todayCompletionPercent: number;
  totalChapters: number;
  completedChapters: number;
  totalLectures: number;
  completedLectures: number;
  totalPYQs: number;
  completedPYQs: number;
  totalShortNotes: number;
  totalRevisions: number;
  currentStreak: number;
  longestStreak: number;
  physics: {
    totalChapters: number;
    completedChapters: number;
    totalLectures: number;
    completedLectures: number;
    totalPYQs: number;
    revisions: number;
    progressPercent: number;
  };
  chemistry: {
    totalChapters: number;
    completedChapters: number;
    totalLectures: number;
    completedLectures: number;
    totalPYQs: number;
    revisions: number;
    progressPercent: number;
  };
  mathematics: {
    totalChapters: number;
    completedChapters: number;
    totalLectures: number;
    completedLectures: number;
    totalPYQs: number;
    revisions: number;
    progressPercent: number;
  };
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'mission_148'
  | 'daily_tracker'
  | 'physics'
  | 'chemistry'
  | 'mathematics'
  | 'analytics'
  | 'mock_tests'
  | 'timer'
  | 'profile';

export interface PublicProfileData {
  user: {
    id?: string;
    name: string;
    username: string;
    targets: {
      jeeMainPercentile: string;
      jeeAdvancedAir?: string;
      dailyStudyHoursGoal: number;
      dailyWaterGoalMl: number;
    };
    createdAt: string;
  };
  stats: UserStats;
  badges?: BadgeItem[];
  studyHoursHistory?: { day: number; date: string; hours: number; target: number }[];
  subjectProgress?: { subject: string; progress: number; chapters: number; completedChapters: number }[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  missionDay: number;
  missionProgress: number;
  studyHours: number;
  pyqs: number;
  lectures: number;
  chapters: number;
  streak: number;
  overallProgress: number;
}
