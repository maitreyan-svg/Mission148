import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  UserProfile, 
  Chapter, 
  DayLog, 
  DailyTask, 
  TimerSession, 
  MockTest,
  UserStats,
  PublicProfileData,
  LeaderboardUser,
  SubjectType
} from '../src/types.js';
import { TOTAL_MISSION_DAYS } from '../src/utils/missionDates.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jee-mission-148-secure-secret-key-2027';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserAuthRecord {
  profile: UserProfile;
  passwordHash: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
  chapters: Chapter[];
  dayLogs: Record<number, DayLog>; // key: dayNumber (1-148)
  tasks: DailyTask[];
  timerSessions: TimerSession[];
  mockTests: MockTest[];
}

interface DatabaseSchema {
  users: Record<string, UserAuthRecord>; // key: userId
  usernamesMap: Record<string, string>; // lowercase username -> userId
  emailsMap: Record<string, string>; // lowercase email -> userId
}

let dbCache: DatabaseSchema | null = null;

function loadDb(): DatabaseSchema {
  if (dbCache) return dbCache;
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    } catch (e) {
      console.error('Error reading db file, re-initializing:', e);
    }
  }

  // Initial fresh database
  dbCache = {
    users: {},
    usernamesMap: {},
    emailsMap: {},
  };
  saveDb();
  return dbCache!;
}

function saveDb() {
  if (!dbCache) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

/**
 * Clean username helper (removes leading @ and trims)
 */
export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/^@+/, '');
}

/**
 * User Registration
 * CRITICAL REQUIREMENT 5: Fresh state! 0% progress, 0 hrs, 0 chapters, 0 lectures, etc.
 */
export function registerUser(params: {
  name: string;
  username: string;
  email: string;
  password: string;
  securityQuestion?: string;
  securityAnswer?: string;
  targets?: {
    jeeMainPercentile?: string;
    jeeAdvancedAir?: string;
    dailyStudyHoursGoal?: number;
    dailyWaterGoalMl?: number;
  };
}): { token: string; user: UserProfile } {
  const db = loadDb();
  const cleanUsername = sanitizeUsername(params.username);
  const cleanEmail = params.email.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!params.password || params.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (db.usernamesMap[cleanUsername]) {
    throw new Error(`Username @${cleanUsername} is already taken. Please choose another.`);
  }
  if (db.emailsMap[cleanEmail]) {
    throw new Error(`Email ${cleanEmail} is already registered. Please login.`);
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(params.password, salt);
  const securityAnswerHash = params.securityAnswer 
    ? bcrypt.hashSync(params.securityAnswer.toLowerCase().trim(), 8) 
    : undefined;

  const profile: UserProfile = {
    id: userId,
    name: params.name.trim(),
    username: `@${cleanUsername}`,
    email: cleanEmail,
    targets: {
      jeeMainPercentile: params.targets?.jeeMainPercentile || '96+',
      jeeAdvancedAIR: params.targets?.jeeAdvancedAir || '< 10,000',
      dailyStudyHoursGoal: params.targets?.dailyStudyHoursGoal || 10,
      dailyWaterGoalMl: params.targets?.dailyWaterGoalMl || 3000,
    },
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Fresh user state (0 chapters, 0 logs, 0 tasks)
  db.users[userId] = {
    profile,
    passwordHash,
    securityQuestion: params.securityQuestion,
    securityAnswerHash,
    chapters: [],
    dayLogs: {},
    tasks: [],
    timerSessions: [],
    mockTests: [],
  };

  db.usernamesMap[cleanUsername] = userId;
  db.emailsMap[cleanEmail] = userId;
  saveDb();

  const token = jwt.sign({ userId, email: cleanEmail, username: profile.username }, JWT_SECRET, { expiresIn: '60d' });
  return { token, user: profile };
}

/**
 * User Login
 */
export function loginUser(identifier: string, password: string): { token: string; user: UserProfile } {
  const db = loadDb();
  const cleanId = identifier.trim().toLowerCase().replace(/^@+/, '');
  
  let userId = db.usernamesMap[cleanId] || db.emailsMap[cleanId];
  if (!userId) {
    throw new Error('No account found with this username or email.');
  }

  const userRecord = db.users[userId];
  if (!userRecord) {
    throw new Error('Account record corrupted.');
  }

  const isValid = bcrypt.compareSync(password, userRecord.passwordHash);
  if (!isValid) {
    throw new Error('Incorrect password. Please try again.');
  }

  const token = jwt.sign({ userId, email: userRecord.profile.email, username: userRecord.profile.username }, JWT_SECRET, { expiresIn: '60d' });
  return { token, user: userRecord.profile };
}

/**
 * Verify JWT Token
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

/**
 * Get full user record by ID
 */
export function getUserFullRecord(userId: string): UserAuthRecord | null {
  const db = loadDb();
  return db.users[userId] || null;
}

/**
 * Update user profile & targets
 */
export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  if (updates.name) user.profile.name = updates.name.trim();
  if (updates.targets) {
    user.profile.targets = {
      ...user.profile.targets,
      ...updates.targets
    };
  }
  if (typeof updates.isPublic === 'boolean') {
    user.profile.isPublic = updates.isPublic;
  }
  if (updates.bio !== undefined) user.profile.bio = updates.bio;
  user.profile.updatedAt = new Date().toISOString();

  saveDb();
  return user.profile;
}

/**
 * Change user password
 */
export function changePassword(userId: string, oldPass: string, newPass: string) {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  const isValid = bcrypt.compareSync(oldPass, user.passwordHash);
  if (!isValid) throw new Error('Current password is incorrect.');
  if (newPass.length < 6) throw new Error('New password must be at least 6 characters.');

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPass, salt);
  saveDb();
}

/**
 * Reset password via username/email + security answer or direct reset token
 */
export function resetPassword(identifier: string, newPass: string, securityAnswer?: string) {
  const db = loadDb();
  const cleanId = identifier.trim().toLowerCase().replace(/^@+/, '');
  const userId = db.usernamesMap[cleanId] || db.emailsMap[cleanId];
  if (!userId) throw new Error('Account not found.');

  const user = db.users[userId];
  if (!user) throw new Error('Account not found.');

  if (user.securityAnswerHash && securityAnswer) {
    const isAnswerValid = bcrypt.compareSync(securityAnswer.toLowerCase().trim(), user.securityAnswerHash);
    if (!isAnswerValid) throw new Error('Security answer does not match.');
  }

  if (newPass.length < 6) throw new Error('Password must be at least 6 characters.');
  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPass, salt);
  saveDb();
}

// ---------------- USER DATA CALCULATIONS & CRUD ---------------- //

/**
 * Calculate comprehensive stats for any user
 */
export function calculateUserStats(userRecord: UserAuthRecord): UserStats {
  const chapters = userRecord.chapters || [];
  const dayLogs = Object.values(userRecord.dayLogs || {});
  
  let totalStudyHours = 0;
  let todayStudyHours = 0;
  
  // Calculate hours from dayLogs
  dayLogs.forEach(log => {
    totalStudyHours += (log.actualHours || 0);
  });

  // Calculate day 1 log if available
  const day1Log = userRecord.dayLogs[1];
  if (day1Log) {
    todayStudyHours = day1Log.actualHours || 0;
  }

  // Chapter metrics
  const totalChapters = chapters.length;
  let completedChapters = 0;
  let totalLectures = 0;
  let completedLectures = 0;
  let totalPYQs = 0;
  let completedPYQs = 0;
  let totalShortNotes = 0;
  let totalRevisions = 0;

  // Subjects breakdown
  const subStats = {
    physics: { chapters: 0, compChapters: 0, lec: 0, compLec: 0, pyq: 0, rev: 0, progress: 0 },
    chemistry: { chapters: 0, compChapters: 0, lec: 0, compLec: 0, pyq: 0, rev: 0, progress: 0 },
    mathematics: { chapters: 0, compChapters: 0, lec: 0, compLec: 0, pyq: 0, rev: 0, progress: 0 },
  };

  chapters.forEach(c => {
    const sub = c.subject;
    if (subStats[sub]) {
      subStats[sub].chapters += 1;
      subStats[sub].lec += c.totalLectures || 0;
      subStats[sub].compLec += (c.completedLectures?.length || 0);
      const pyqDone = c.pyq.isDone || (c.pyq.completed > 0 && c.pyq.completed >= c.pyq.total);
      if (c.pyq.isDetailed) {
        subStats[sub].pyq += (c.pyq.completed || 0);
      } else if (pyqDone) {
        subStats[sub].pyq += 1;
      }
      subStats[sub].rev += (c.revisionCount || 0);
    }

    totalLectures += (c.totalLectures || 0);
    completedLectures += (c.completedLectures?.length || 0);
    if (c.pyq.isDetailed) {
      totalPYQs += (c.pyq.total || 0);
      completedPYQs += (c.pyq.completed || 0);
    } else {
      totalPYQs += 1;
      if (c.pyq.isDone) completedPYQs += 1;
    }
    if (c.shortNotesMade) totalShortNotes += 1;
    totalRevisions += (c.revisionCount || 0);

    // Is chapter complete? (100% lectures, PYQ done, Short Notes made)
    const lecDone = c.totalLectures > 0 ? (c.completedLectures?.length || 0) >= c.totalLectures : true;
    const pyqDone = c.pyq.isDone || (c.pyq.isDetailed && c.pyq.completed >= c.pyq.total && c.pyq.total > 0);
    if (lecDone && pyqDone && c.shortNotesMade) {
      completedChapters += 1;
      if (subStats[sub]) subStats[sub].compChapters += 1;
    }
  });

  // Calculate subject progress %
  (['physics', 'chemistry', 'mathematics'] as SubjectType[]).forEach(sub => {
    const s = subStats[sub];
    if (s.chapters === 0) {
      s.progress = 0;
    } else {
      const lecP = s.lec > 0 ? (s.compLec / s.lec) * 50 : 0;
      const chP = (s.compChapters / s.chapters) * 50;
      s.progress = Math.min(100, Math.round(lecP + chP));
    }
  });

  // Streak calculation
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= TOTAL_MISSION_DAYS; d++) {
    const log = userRecord.dayLogs[d];
    if (log && log.actualHours > 0) {
      tempStreak += 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      currentStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Mission days completed count
  const daysCompleted = dayLogs.filter(l => l.actualHours > 0 || l.status === 'completed').length;
  const missionProgressPercent = Math.min(100, Math.round((daysCompleted / TOTAL_MISSION_DAYS) * 100));

  const averageDailyStudyHours = daysCompleted > 0 ? Number((totalStudyHours / daysCompleted).toFixed(1)) : 0;
  const weeklyStudyHours = Number((averageDailyStudyHours * 7).toFixed(1));

  const todayTarget = userRecord.profile.targets.dailyStudyHoursGoal || 10;
  const todayCompletionPercent = todayTarget > 0 ? Math.min(100, Math.round((todayStudyHours / todayTarget) * 100)) : 0;

  return {
    missionProgressPercent,
    currentMissionDay: Math.max(1, daysCompleted === 0 ? 1 : daysCompleted),
    daysRemaining: TOTAL_MISSION_DAYS - Math.max(1, daysCompleted),
    totalStudyHours: Number(totalStudyHours.toFixed(1)),
    averageDailyStudyHours,
    weeklyStudyHours,
    todayStudyHours: Number(todayStudyHours.toFixed(1)),
    todayCompletionPercent,
    totalChapters,
    completedChapters,
    totalLectures,
    completedLectures,
    totalPYQs,
    completedPYQs,
    totalShortNotes,
    totalRevisions,
    currentStreak,
    longestStreak,
    physics: {
      totalChapters: subStats.physics.chapters,
      completedChapters: subStats.physics.compChapters,
      totalLectures: subStats.physics.lec,
      completedLectures: subStats.physics.compLec,
      totalPYQs: subStats.physics.pyq,
      revisions: subStats.physics.rev,
      progressPercent: subStats.physics.progress,
    },
    chemistry: {
      totalChapters: subStats.chemistry.chapters,
      completedChapters: subStats.chemistry.compChapters,
      totalLectures: subStats.chemistry.lec,
      completedLectures: subStats.chemistry.compLec,
      totalPYQs: subStats.chemistry.pyq,
      revisions: subStats.chemistry.rev,
      progressPercent: subStats.chemistry.progress,
    },
    mathematics: {
      totalChapters: subStats.mathematics.chapters,
      completedChapters: subStats.mathematics.compChapters,
      totalLectures: subStats.mathematics.lec,
      completedLectures: subStats.mathematics.compLec,
      totalPYQs: subStats.mathematics.pyq,
      revisions: subStats.mathematics.rev,
      progressPercent: subStats.mathematics.progress,
    }
  };
}

/**
 * Chapter CRUD
 */
export function addChapter(userId: string, chapterData: Omit<Chapter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Chapter {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  const chapterId = `chap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newChapter: Chapter = {
    ...chapterData,
    id: chapterId,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!user.chapters) user.chapters = [];
  user.chapters.push(newChapter);
  saveDb();
  return newChapter;
}

export function updateChapter(userId: string, chapterId: string, updates: Partial<Chapter>): Chapter {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  const idx = user.chapters.findIndex(c => c.id === chapterId);
  if (idx === -1) throw new Error('Chapter not found');

  user.chapters[idx] = {
    ...user.chapters[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveDb();
  return user.chapters[idx];
}

export function deleteChapter(userId: string, chapterId: string) {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  user.chapters = user.chapters.filter(c => c.id !== chapterId);
  saveDb();
}

/**
 * Day Log update (dayNumber: 1..148)
 */
export function saveDayLog(userId: string, dayNumber: number, logData: Partial<DayLog>): DayLog {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  if (!user.dayLogs) user.dayLogs = {};

  const existing = user.dayLogs[dayNumber] || {
    dayNumber,
    date: `2026-08-${String(23 + dayNumber).padStart(2, '0')}`,
    targetHours: user.profile.targets.dailyStudyHoursGoal || 10,
    actualHours: 0,
    status: 'not_started',
    meals: { breakfast: false, lunch: false, dinner: false },
    waterMl: 0,
    subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
  };

  user.dayLogs[dayNumber] = {
    ...existing,
    ...logData,
    dayNumber,
  };

  saveDb();
  return user.dayLogs[dayNumber];
}

/**
 * Tasks CRUD
 */
export function saveTask(userId: string, task: Omit<DailyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }): DailyTask {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  if (!user.tasks) user.tasks = [];

  if (task.id) {
    const idx = user.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      user.tasks[idx] = { ...user.tasks[idx], ...task };
      saveDb();
      return user.tasks[idx];
    }
  }

  const newTask: DailyTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    dayNumber: task.dayNumber,
    subject: task.subject,
    title: task.title,
    completed: task.completed ?? false,
    order: task.order ?? (user.tasks.length + 1),
    createdAt: new Date().toISOString(),
  };

  user.tasks.push(newTask);
  saveDb();
  return newTask;
}

export function deleteTask(userId: string, taskId: string) {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');
  user.tasks = (user.tasks || []).filter(t => t.id !== taskId);
  saveDb();
}

/**
 * Timer session logger
 */
export function logTimerSession(userId: string, session: Omit<TimerSession, 'id' | 'userId' | 'createdAt'>): TimerSession {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  if (!user.timerSessions) user.timerSessions = [];
  const newSession: TimerSession = {
    id: `timer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    dayNumber: session.dayNumber,
    date: session.date,
    subject: session.subject,
    durationMinutes: session.durationMinutes,
    chapterId: session.chapterId,
    chapterName: session.chapterName,
    notes: session.notes,
    createdAt: new Date().toISOString(),
  };

  user.timerSessions.push(newSession);

  // Auto-accumulate hours into the day log
  if (!user.dayLogs) user.dayLogs = {};
  const currentDayLog = user.dayLogs[session.dayNumber] || {
    dayNumber: session.dayNumber,
    date: session.date,
    targetHours: user.profile.targets.dailyStudyHoursGoal || 10,
    actualHours: 0,
    status: 'in_progress',
    meals: { breakfast: false, lunch: false, dinner: false },
    waterMl: 0,
    subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
  };

  const addedHours = session.durationMinutes / 60;
  currentDayLog.actualHours = Number(((currentDayLog.actualHours || 0) + addedHours).toFixed(2));
  if (session.subject === 'physics' || session.subject === 'chemistry' || session.subject === 'mathematics') {
    currentDayLog.subjectHours[session.subject] = Number(((currentDayLog.subjectHours[session.subject] || 0) + addedHours).toFixed(2));
  }
  if (currentDayLog.actualHours >= (currentDayLog.targetHours || 10)) {
    currentDayLog.status = 'completed';
  } else if (currentDayLog.actualHours > 0) {
    currentDayLog.status = 'in_progress';
  }

  user.dayLogs[session.dayNumber] = currentDayLog;
  saveDb();
  return newSession;
}

/**
 * Mock test logger
 */
export function saveMockTest(userId: string, mockTest: Omit<MockTest, 'id' | 'userId' | 'createdAt'> & { id?: string }): MockTest {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');

  if (!user.mockTests) user.mockTests = [];

  if (mockTest.id) {
    const idx = user.mockTests.findIndex(m => m.id === mockTest.id);
    if (idx !== -1) {
      user.mockTests[idx] = { ...user.mockTests[idx], ...mockTest };
      saveDb();
      return user.mockTests[idx];
    }
  }

  const newTest: MockTest = {
    id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    testName: mockTest.testName,
    date: mockTest.date,
    examType: mockTest.examType,
    physicsScore: mockTest.physicsScore,
    chemistryScore: mockTest.chemistryScore,
    mathScore: mockTest.mathScore,
    totalScore: mockTest.totalScore,
    maxScore: mockTest.maxScore,
    percentile: mockTest.percentile,
    notes: mockTest.notes,
    createdAt: new Date().toISOString(),
  };

  user.mockTests.push(newTest);
  saveDb();
  return newTest;
}

export function deleteMockTest(userId: string, testId: string) {
  const db = loadDb();
  const user = db.users[userId];
  if (!user) throw new Error('User not found');
  user.mockTests = (user.mockTests || []).filter(m => m.id !== testId);
  saveDb();
}

// ---------------- PUBLIC COMMUNITY & LEADERBOARD ---------------- //

/**
 * Get sanitized public profile for username
 * Respects isPublic toggle & does NOT expose private email, pass, or private notes
 */
export function getPublicProfile(rawUsername: string): PublicProfileData | null {
  const db = loadDb();
  const clean = sanitizeUsername(rawUsername);
  const userId = db.usernamesMap[clean];
  if (!userId) return null;

  const user = db.users[userId];
  if (!user || !user.profile.isPublic) return null;

  const stats = calculateUserStats(user);

  // Sanitized study history (last 14 days)
  const history = Object.values(user.dayLogs || {})
    .filter(l => l.actualHours > 0)
    .slice(-14)
    .map(l => ({
      day: l.dayNumber,
      date: l.date,
      hours: l.actualHours,
      target: l.targetHours,
    }));

  return {
    user: {
      name: user.profile.name,
      username: user.profile.username,
      targets: user.profile.targets,
      createdAt: user.profile.createdAt,
    },
    stats,
    studyHoursHistory: history,
    subjectProgress: [
      { subject: 'Physics', progress: stats.physics.progressPercent, chapters: stats.physics.totalChapters, completedChapters: stats.physics.completedChapters },
      { subject: 'Chemistry', progress: stats.chemistry.progressPercent, chapters: stats.chemistry.totalChapters, completedChapters: stats.chemistry.completedChapters },
      { subject: 'Mathematics', progress: stats.mathematics.progressPercent, chapters: stats.mathematics.totalChapters, completedChapters: stats.mathematics.completedChapters },
    ]
  };
}

/**
 * Get Public Leaderboard
 */
export function getPublicLeaderboard(sortBy: string = 'studyHours'): LeaderboardUser[] {
  const db = loadDb();
  const publicUsers = Object.values(db.users).filter(u => u.profile.isPublic);

  const entries: LeaderboardUser[] = publicUsers.map(u => {
    const stats = calculateUserStats(u);
    const overallProgress = Math.round((stats.physics.progressPercent + stats.chemistry.progressPercent + stats.mathematics.progressPercent) / 3);
    return {
      rank: 0,
      name: u.profile.name,
      username: u.profile.username,
      missionDay: stats.currentMissionDay,
      missionProgress: stats.missionProgressPercent,
      studyHours: stats.totalStudyHours,
      pyqs: stats.completedPYQs,
      lectures: stats.completedLectures,
      chapters: stats.completedChapters,
      streak: stats.currentStreak,
      overallProgress,
    };
  });

  // Sort based on parameter
  entries.sort((a, b) => {
    switch (sortBy) {
      case 'missionProgress':
        return b.missionProgress - a.missionProgress || b.studyHours - a.studyHours;
      case 'pyqs':
        return b.pyqs - a.pyqs || b.studyHours - a.studyHours;
      case 'lectures':
        return b.lectures - a.lectures || b.studyHours - a.studyHours;
      case 'chapters':
        return b.chapters - a.chapters || b.studyHours - a.studyHours;
      case 'streak':
        return b.streak - a.streak || b.studyHours - a.studyHours;
      case 'overallProgress':
        return b.overallProgress - a.overallProgress || b.studyHours - a.studyHours;
      case 'studyHours':
      default:
        return b.studyHours - a.studyHours || b.streak - a.streak;
    }
  });

  // Assign ranks
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return entries;
}

/**
 * Search public users for Compare tool
 */
export function searchPublicUsers(query: string): { name: string; username: string }[] {
  const db = loadDb();
  const q = sanitizeUsername(query);
  if (!q) return [];

  return Object.values(db.users)
    .filter(u => u.profile.isPublic && (
      sanitizeUsername(u.profile.username).includes(q) ||
      u.profile.name.toLowerCase().includes(q)
    ))
    .map(u => ({
      name: u.profile.name,
      username: u.profile.username
    }))
    .slice(0, 10);
}
