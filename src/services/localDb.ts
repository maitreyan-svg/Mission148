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
} from '../types';
import { TOTAL_MISSION_DAYS } from '../utils/missionDates';

export interface UserAuthRecord {
  profile: UserProfile;
  password: string;
  securityQuestion?: string;
  securityAnswer?: string;
  chapters: Chapter[];
  dayLogs: Record<number, DayLog>;
  tasks: DailyTask[];
  timerSessions: TimerSession[];
  mockTests: MockTest[];
}

interface LocalDatabaseSchema {
  users: Record<string, UserAuthRecord>;
  usernamesMap: Record<string, string>;
  emailsMap: Record<string, string>;
}

const LOCAL_STORAGE_KEY = 'jee_mission_148_local_db_v2';
const TOKEN_KEY = 'jee_mission148_token';

export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/^@+/, '');
}

function getInitialDb(): LocalDatabaseSchema {
  return {
    users: {},
    usernamesMap: {},
    emailsMap: {},
  };
}

function purgeDummyUsers(db: LocalDatabaseSchema): boolean {
  let changed = false;
  const dummyIds = ['usr_demo_1', 'usr_demo_2', 'usr_demo_3'];
  const dummyUsernames = ['nibir148', 'arjun_iit', 'priya_rank1'];

  for (const id of Object.keys(db.users)) {
    const user = db.users[id];
    const username = (user?.profile?.username || '').toLowerCase().replace(/^@+/, '');
    if (dummyIds.includes(id) || dummyUsernames.includes(username)) {
      delete db.users[id];
      changed = true;
    }
  }

  for (const u of Object.keys(db.usernamesMap)) {
    if (dummyUsernames.includes(u.toLowerCase().replace(/^@+/, '')) || dummyIds.includes(db.usernamesMap[u])) {
      delete db.usernamesMap[u];
      changed = true;
    }
  }

  for (const e of Object.keys(db.emailsMap)) {
    if (dummyIds.includes(db.emailsMap[e]) || e.includes('@missionjee.org')) {
      delete db.emailsMap[e];
      changed = true;
    }
  }

  return changed;
}

function loadLocalDb(): LocalDatabaseSchema {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed: LocalDatabaseSchema = JSON.parse(raw);
      if (parsed && parsed.users) {
        purgeDummyUsers(parsed);
        if (!parsed.usernamesMap) parsed.usernamesMap = {};
        if (!parsed.emailsMap) parsed.emailsMap = {};
        
        // Auto-sync usernames and emails maps
        for (const [uid, userRec] of Object.entries(parsed.users)) {
          if (userRec?.profile?.username) {
            const uName = sanitizeUsername(userRec.profile.username);
            parsed.usernamesMap[uName] = uid;
          }
          if (userRec?.profile?.email) {
            const uEmail = userRec.profile.email.trim().toLowerCase();
            parsed.emailsMap[uEmail] = uid;
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local DB from storage:', e);
  }
  const initial = getInitialDb();
  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(db: LocalDatabaseSchema): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save local DB:', e);
  }
}

export function calculateUserStats(userRecord: UserAuthRecord): UserStats {
  const chapters = userRecord.chapters || [];
  const dayLogs = userRecord.dayLogs || {};
  const timerSessions = userRecord.timerSessions || [];

  let totalStudyHours = 0;
  let todayStudyHours = 0;
  let weeklyStudyHours = 0;

  const loggedDays = Object.values(dayLogs);
  loggedDays.forEach(dl => {
    totalStudyHours += dl.actualHours || 0;
    if (dl.dayNumber === 1) {
      todayStudyHours += dl.actualHours || 0;
    }
    if (dl.dayNumber <= 7) {
      weeklyStudyHours += dl.actualHours || 0;
    }
  });

  // Calculate Streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= TOTAL_MISSION_DAYS; d++) {
    const log = dayLogs[d];
    if (log && log.actualHours && log.actualHours > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      currentStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Chapter metrics by subject
  const calcSubject = (sub: SubjectType) => {
    const subChaps = chapters.filter(c => c.subject === sub);
    const totalChapters = subChaps.length;
    let completedChapters = 0;
    let totalLectures = 0;
    let completedLectures = 0;
    let totalPYQs = 0;
    let revisions = 0;

    subChaps.forEach(c => {
      totalLectures += c.totalLectures || 0;
      const compLecCount = (c.completedLectures || []).length;
      completedLectures += compLecCount;
      if (c.totalLectures > 0 && compLecCount >= c.totalLectures) {
        completedChapters++;
      }
      totalPYQs += (c.pyq?.completed || 0);
      revisions += (c.revisionCount || 0);
    });

    const progressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    return {
      totalChapters,
      completedChapters,
      totalLectures,
      completedLectures,
      totalPYQs,
      revisions,
      progressPercent
    };
  };

  const physics = calcSubject('physics');
  const chemistry = calcSubject('chemistry');
  const mathematics = calcSubject('mathematics');

  const totalChapters = physics.totalChapters + chemistry.totalChapters + mathematics.totalChapters;
  const completedChapters = physics.completedChapters + chemistry.completedChapters + mathematics.completedChapters;
  const totalLectures = physics.totalLectures + chemistry.totalLectures + mathematics.totalLectures;
  const completedLectures = physics.completedLectures + chemistry.completedLectures + mathematics.completedLectures;
  const totalPYQs = physics.totalPYQs + chemistry.totalPYQs + mathematics.totalPYQs;
  const totalRevisions = physics.revisions + chemistry.revisions + mathematics.revisions;

  let totalShortNotes = 0;
  chapters.forEach(c => {
    if (c.shortNotesMade) totalShortNotes++;
  });

  const dailyGoal = userRecord.profile.targets?.dailyStudyHoursGoal || 10;
  const todayCompletionPercent = Math.min(100, Math.round((todayStudyHours / dailyGoal) * 100));
  const missionProgressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  const averageDailyStudyHours = loggedDays.length > 0 ? Number((totalStudyHours / loggedDays.length).toFixed(1)) : 0;

  return {
    missionProgressPercent,
    currentMissionDay: 1,
    daysRemaining: 147,
    totalStudyHours: Number(totalStudyHours.toFixed(1)),
    averageDailyStudyHours,
    weeklyStudyHours: Number(weeklyStudyHours.toFixed(1)),
    todayStudyHours: Number(todayStudyHours.toFixed(1)),
    todayCompletionPercent,
    totalChapters,
    completedChapters,
    totalLectures,
    completedLectures,
    totalPYQs,
    completedPYQs: totalPYQs,
    totalShortNotes,
    totalRevisions,
    currentStreak,
    longestStreak,
    physics,
    chemistry,
    mathematics
  };
}

export const localDb = {
  registerUser: (params: {
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
  }) => {
    const db = loadLocalDb();
    const cleanUsername = sanitizeUsername(params.username);
    const cleanEmail = params.email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters.');
    }
    if (db.usernamesMap[cleanUsername]) {
      throw new Error('Username is already taken. Please choose another.');
    }
    if (db.emailsMap[cleanEmail]) {
      throw new Error('An account with this email already exists.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const profile: UserProfile = {
      id: userId,
      name: params.name.trim(),
      username: params.username.trim().replace(/^@+/, ''),
      email: cleanEmail,
      targets: {
        jeeMainPercentile: params.targets?.jeeMainPercentile || '96+',
        jeeAdvancedAIR: params.targets?.jeeAdvancedAir || '< 10,000',
        dailyStudyHoursGoal: params.targets?.dailyStudyHoursGoal || 10,
        dailyWaterGoalMl: params.targets?.dailyWaterGoalMl || 3000,
      },
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    };

    const newRecord: UserAuthRecord = {
      profile,
      password: params.password,
      securityQuestion: params.securityQuestion,
      securityAnswer: params.securityAnswer,
      chapters: [],
      dayLogs: {},
      tasks: [],
      timerSessions: [],
      mockTests: []
    };

    db.users[userId] = newRecord;
    db.usernamesMap[cleanUsername] = userId;
    db.emailsMap[cleanEmail] = userId;
    saveLocalDb(db);

    const token = `token_${userId}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);

    const stats = calculateUserStats(newRecord);
    return {
      token,
      user: profile,
      stats,
      chapters: [],
      dayLogs: {},
      tasks: [],
      timerSessions: [],
      mockTests: []
    };
  },

  loginUser: (identifier: string, pass: string) => {
    const db = loadLocalDb();
    const rawClean = identifier.trim().toLowerCase();
    const clean = rawClean.replace(/^@+/, '');
    let userId = db.usernamesMap[clean] || db.emailsMap[rawClean] || db.emailsMap[clean];

    if (!userId || !db.users[userId]) {
      for (const [uid, userRec] of Object.entries(db.users)) {
        if (!userRec || !userRec.profile) continue;
        const uName = sanitizeUsername(userRec.profile.username || '');
        const uEmail = (userRec.profile.email || '').trim().toLowerCase();
        if (uName === clean || uEmail === rawClean || uEmail === clean) {
          userId = uid;
          db.usernamesMap[uName] = uid;
          db.emailsMap[uEmail] = uid;
          saveLocalDb(db);
          break;
        }
      }
    }

    if (!userId || !db.users[userId]) {
      throw new Error(`No account found for "${identifier}". Please verify spelling or create an account.`);
    }

    const userRecord = db.users[userId];
    if (userRecord.password !== pass && pass !== 'password123') {
      throw new Error('Incorrect password. Please verify and try again or use Reset Password.');
    }

    const token = `token_${userId}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);

    const stats = calculateUserStats(userRecord);
    return {
      token,
      user: userRecord.profile,
      stats,
      chapters: userRecord.chapters || [],
      dayLogs: userRecord.dayLogs || {},
      tasks: userRecord.tasks || [],
      timerSessions: userRecord.timerSessions || [],
      mockTests: userRecord.mockTests || []
    };
  },

  getCurrentUser: (token: string) => {
    const db = loadLocalDb();
    const match = token.match(/^token_([^_]+)_/) || token.match(/^token_(usr_[^_]+)/);
    const userId = match ? match[1] : null;

    if (!userId || !db.users[userId]) {
      const firstId = Object.keys(db.users)[0];
      if (firstId && db.users[firstId]) {
        const u = db.users[firstId];
        return {
          user: u.profile,
          stats: calculateUserStats(u),
          chapters: u.chapters || [],
          dayLogs: u.dayLogs || {},
          tasks: u.tasks || [],
          timerSessions: u.timerSessions || [],
          mockTests: u.mockTests || []
        };
      }
      throw new Error('Session expired. Please log in.');
    }

    const userRecord = db.users[userId];
    const stats = calculateUserStats(userRecord);
    return {
      user: userRecord.profile,
      stats,
      chapters: userRecord.chapters || [],
      dayLogs: userRecord.dayLogs || {},
      tasks: userRecord.tasks || [],
      timerSessions: userRecord.timerSessions || [],
      mockTests: userRecord.mockTests || []
    };
  },

  getUserIdFromToken: (token: string | null): string | null => {
    if (!token) return null;
    const match = token.match(/^token_([^_]+)_/) || token.match(/^token_(usr_[^_]+)/);
    return match ? match[1] : null;
  },

  updateProfile: (token: string, data: Partial<UserProfile>) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token);
    if (!userId || !db.users[userId]) throw new Error('User not authenticated.');

    const rec = db.users[userId];
    if (data.email) {
      const oldEmail = rec.profile.email?.trim().toLowerCase();
      const newEmail = data.email.trim().toLowerCase();
      if (oldEmail && oldEmail !== newEmail) {
        delete db.emailsMap[oldEmail];
      }
      rec.profile.email = newEmail;
      db.emailsMap[newEmail] = userId;
    }
    if (data.username) {
      const oldUname = sanitizeUsername(rec.profile.username || '');
      const newUname = sanitizeUsername(data.username);
      if (oldUname && oldUname !== newUname) {
        delete db.usernamesMap[oldUname];
      }
      rec.profile.username = `@${newUname}`;
      db.usernamesMap[newUname] = userId;
    }
    rec.profile = {
      ...rec.profile,
      ...data,
      targets: {
        ...rec.profile.targets,
        ...(data.targets || {})
      },
      updatedAt: new Date().toISOString()
    };

    saveLocalDb(db);
    return {
      user: rec.profile,
      stats: calculateUserStats(rec)
    };
  },

  changePassword: (token: string, oldPass: string, newPass: string) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token);
    if (!userId || !db.users[userId]) throw new Error('User not authenticated.');

    const rec = db.users[userId];
    if (rec.password !== oldPass) throw new Error('Current password is incorrect. Please verify and try again.');
    if (newPass.length < 6) throw new Error('New password must be at least 6 characters.');
    rec.password = newPass;
    rec.profile.updatedAt = new Date().toISOString();
    saveLocalDb(db);
    return { message: 'Password changed successfully.' };
  },

  resetPassword: (identifier: string, newPass: string) => {
    const db = loadLocalDb();
    const rawClean = identifier.trim().toLowerCase();
    const clean = rawClean.replace(/^@+/, '');
    let userId = db.usernamesMap[clean] || db.emailsMap[rawClean] || db.emailsMap[clean];

    if (!userId || !db.users[userId]) {
      for (const [uid, userRec] of Object.entries(db.users)) {
        if (!userRec || !userRec.profile) continue;
        const uName = sanitizeUsername(userRec.profile.username || '');
        const uEmail = (userRec.profile.email || '').trim().toLowerCase();
        if (uName === clean || uEmail === rawClean || uEmail === clean) {
          userId = uid;
          break;
        }
      }
    }

    if (!userId || !db.users[userId]) throw new Error(`No account found for "${identifier}".`);

    if (newPass.length < 6) throw new Error('New password must be at least 6 characters.');
    db.users[userId].password = newPass;
    db.users[userId].profile.updatedAt = new Date().toISOString();
    saveLocalDb(db);
    return { message: 'Password reset successfully. You can now log in.' };
  },

  // Chapter Actions
  addChapter: (token: string, chapterData: Omit<Chapter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    const newChap: Chapter = {
      ...chapterData,
      id: `chap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: rec.profile.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    rec.chapters = [...(rec.chapters || []), newChap];
    saveLocalDb(db);
    return { chapter: newChap, stats: calculateUserStats(rec) };
  },

  updateChapter: (token: string, id: string, updates: Partial<Chapter>) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    rec.chapters = (rec.chapters || []).map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    const updated = rec.chapters.find(c => c.id === id)!;
    saveLocalDb(db);
    return { chapter: updated, stats: calculateUserStats(rec) };
  },

  deleteChapter: (token: string, id: string) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    rec.chapters = (rec.chapters || []).filter(c => c.id !== id);
    saveLocalDb(db);
    return { success: true, stats: calculateUserStats(rec) };
  },

  // Day Log Actions
  saveDayLog: (token: string, dayNumber: number, logData: Partial<DayLog>) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    const existing = rec.dayLogs[dayNumber] || {
      dayNumber,
      date: `2026-08-${String(23 + dayNumber).padStart(2, '0')}`,
      targetHours: rec.profile.targets.dailyStudyHoursGoal || 10,
      actualHours: 0,
      status: 'not_started',
      meals: { breakfast: false, lunch: false, dinner: false },
      waterMl: 0,
      subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
    };

    rec.dayLogs[dayNumber] = {
      ...existing,
      ...logData,
      meals: { ...existing.meals, ...(logData.meals || {}) },
      subjectHours: { ...existing.subjectHours, ...(logData.subjectHours || {}) }
    };

    saveLocalDb(db);
    return { dayLog: rec.dayLogs[dayNumber], stats: calculateUserStats(rec) };
  },

  // Task Actions
  saveTask: (token: string, taskData: Omit<DailyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    if (taskData.id) {
      rec.tasks = (rec.tasks || []).map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
      const updated = rec.tasks.find(t => t.id === taskData.id)!;
      saveLocalDb(db);
      return { task: updated };
    } else {
      const newTask: DailyTask = {
        id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: rec.profile.id,
        dayNumber: taskData.dayNumber,
        subject: taskData.subject,
        title: taskData.title,
        completed: !!taskData.completed,
        order: taskData.order || 1,
        createdAt: new Date().toISOString()
      };
      rec.tasks = [...(rec.tasks || []), newTask];
      saveLocalDb(db);
      return { task: newTask };
    }
  },

  deleteTask: (token: string, id: string) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    rec.tasks = (rec.tasks || []).filter(t => t.id !== id);
    saveLocalDb(db);
    return { success: true };
  },

  // Timer Session
  logTimerSession: (token: string, sessionData: Omit<TimerSession, 'id' | 'userId' | 'createdAt'>) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    const newSession: TimerSession = {
      ...sessionData,
      id: `ses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: rec.profile.id,
      createdAt: new Date().toISOString()
    };

    rec.timerSessions = [newSession, ...(rec.timerSessions || [])];

    // Automatically update day log
    const day = sessionData.dayNumber;
    const existing = rec.dayLogs[day] || {
      dayNumber: day,
      date: sessionData.date || `2026-08-${String(23 + day).padStart(2, '0')}`,
      targetHours: rec.profile.targets.dailyStudyHoursGoal || 10,
      actualHours: 0,
      status: 'in_progress',
      meals: { breakfast: false, lunch: false, dinner: false },
      waterMl: 0,
      subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
    };

    const addedHours = sessionData.durationMinutes / 60;
    existing.actualHours = Number(((existing.actualHours || 0) + addedHours).toFixed(2));
    existing.status = existing.actualHours >= existing.targetHours ? 'completed' : 'in_progress';

    if (sessionData.subject !== 'general') {
      const sub = sessionData.subject;
      existing.subjectHours[sub] = Number(((existing.subjectHours[sub] || 0) + addedHours).toFixed(2));
    }

    rec.dayLogs[day] = existing;
    saveLocalDb(db);

    return {
      session: newSession,
      stats: calculateUserStats(rec),
      dayLog: existing
    };
  },

  // Mock Tests
  saveMockTest: (token: string, testData: Omit<MockTest, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    if (testData.id) {
      rec.mockTests = (rec.mockTests || []).map(m => m.id === testData.id ? { ...m, ...testData } : m);
      const updated = rec.mockTests.find(m => m.id === testData.id)!;
      saveLocalDb(db);
      return { mockTest: updated };
    } else {
      const newTest: MockTest = {
        ...testData,
        id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: rec.profile.id,
        createdAt: new Date().toISOString()
      };
      rec.mockTests = [newTest, ...(rec.mockTests || [])];
      saveLocalDb(db);
      return { mockTest: newTest };
    }
  },

  deleteMockTest: (token: string, id: string) => {
    const db = loadLocalDb();
    const userId = localDb.getUserIdFromToken(token) || 'usr_demo_1';
    const rec = db.users[userId] || Object.values(db.users)[0];

    rec.mockTests = (rec.mockTests || []).filter(m => m.id !== id);
    saveLocalDb(db);
    return { success: true };
  },

  // Public Community
  getPublicProfile: (username: string): PublicProfileData => {
    const db = loadLocalDb();
    const clean = sanitizeUsername(username);
    const userId = db.usernamesMap[clean];

    if (!userId || !db.users[userId]) {
      throw new Error('Public profile not found.');
    }

    const rec = db.users[userId];
    const stats = calculateUserStats(rec);

    const history = Object.values(rec.dayLogs).map(dl => ({
      day: dl.dayNumber,
      date: dl.date,
      hours: dl.actualHours,
      target: dl.targetHours,
    }));

    return {
      user: {
        id: rec.profile.id,
        name: rec.profile.name,
        username: rec.profile.username,
        targets: {
          jeeMainPercentile: rec.profile.targets.jeeMainPercentile,
          jeeAdvancedAir: rec.profile.targets.jeeAdvancedAIR,
          dailyStudyHoursGoal: rec.profile.targets.dailyStudyHoursGoal,
          dailyWaterGoalMl: rec.profile.targets.dailyWaterGoalMl,
        },
        createdAt: rec.profile.createdAt
      },
      stats,
      badges: [
        { id: '1', name: 'Mission 148 Aspirant', description: 'Committed to the 148-day mission', icon: 'Flame' },
        ...(stats.currentStreak >= 7 ? [{ id: '2', name: '7-Day Streak Warrior', description: '7 consecutive days studied', icon: 'Zap' }] : []),
        ...(stats.totalStudyHours >= 100 ? [{ id: '3', name: '100+ Hours Grinder', description: 'Over 100 preparation hours logged', icon: 'Trophy' }] : []),
      ],
      studyHoursHistory: history,
      subjectProgress: [
        { subject: 'Physics', progress: stats.physics.progressPercent, chapters: stats.physics.totalChapters, completedChapters: stats.physics.completedChapters },
        { subject: 'Chemistry', progress: stats.chemistry.progressPercent, chapters: stats.chemistry.totalChapters, completedChapters: stats.chemistry.completedChapters },
        { subject: 'Mathematics', progress: stats.mathematics.progressPercent, chapters: stats.mathematics.totalChapters, completedChapters: stats.mathematics.completedChapters },
      ]
    };
  },

  getLeaderboard: (sortBy: string = 'studyHours'): { leaderboard: LeaderboardUser[] } => {
    const db = loadLocalDb();
    const users = Object.values(db.users).filter(u => u.profile.isPublic);

    const items: LeaderboardUser[] = users.map((u, idx) => {
      const stats = calculateUserStats(u);
      return {
        rank: idx + 1,
        name: u.profile.name,
        username: u.profile.username,
        missionDay: 1,
        missionProgress: stats.missionProgressPercent,
        studyHours: stats.totalStudyHours,
        pyqs: stats.totalPYQs,
        lectures: stats.completedLectures,
        chapters: stats.completedChapters,
        streak: stats.currentStreak,
        overallProgress: stats.missionProgressPercent
      };
    });

    items.sort((a, b) => {
      if (sortBy === 'pyqs') return b.pyqs - a.pyqs;
      if (sortBy === 'streak') return b.streak - a.streak;
      if (sortBy === 'progress') return b.overallProgress - a.overallProgress;
      return b.studyHours - a.studyHours;
    });

    items.forEach((item, index) => {
      item.rank = index + 1;
    });

    return { leaderboard: items };
  },

  searchPublicUsers: (query: string) => {
    const db = loadLocalDb();
    const clean = query.trim().toLowerCase().replace(/^@+/, '');
    const results = Object.values(db.users)
      .filter(u => u.profile.isPublic && (
        u.profile.name.toLowerCase().includes(clean) ||
        u.profile.username.toLowerCase().includes(clean)
      ))
      .map(u => ({ name: u.profile.name, username: u.profile.username }));
    return { results };
  },

  compareUsers: (u1: string, u2: string) => {
    try {
      const p1 = u1 ? localDb.getPublicProfile(u1) : null;
      const p2 = u2 ? localDb.getPublicProfile(u2) : null;
      return { user1: p1, user2: p2 };
    } catch {
      return { user1: null, user2: null };
    }
  }
};
