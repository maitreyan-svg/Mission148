import { eq, and, sql, desc, asc, or, ilike } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../src/db/index.ts';
import { users, chapters, dayLogs, dailyTasks, timerSessions, mockTests } from '../src/db/schema.ts';
import { adminAuth } from '../src/lib/firebase-admin.ts';
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
} from '../src/types.ts';
import { TOTAL_MISSION_DAYS } from '../src/utils/missionDates.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'jee-mission-148-secure-secret-key-2027';

export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/^@+/, '');
}

export const DEFAULT_JEE_CHAPTERS: { subject: SubjectType; name: string; totalLectures: number; pyqTotal: number }[] = [
  // Physics
  { subject: 'physics', name: 'Units, Dimensions & Errors', totalLectures: 4, pyqTotal: 30 },
  { subject: 'physics', name: 'Kinematics 1D & 2D', totalLectures: 8, pyqTotal: 45 },
  { subject: 'physics', name: 'Laws of Motion & Friction', totalLectures: 8, pyqTotal: 40 },
  { subject: 'physics', name: 'Work, Energy & Power', totalLectures: 6, pyqTotal: 35 },
  { subject: 'physics', name: 'Circular Motion & Center of Mass', totalLectures: 7, pyqTotal: 40 },
  { subject: 'physics', name: 'Rotational Dynamics & Moment of Inertia', totalLectures: 10, pyqTotal: 60 },
  { subject: 'physics', name: 'Gravitation', totalLectures: 5, pyqTotal: 30 },
  { subject: 'physics', name: 'Mechanical Properties of Solids & Fluids', totalLectures: 8, pyqTotal: 45 },
  { subject: 'physics', name: 'Thermal Properties & Thermodynamics', totalLectures: 8, pyqTotal: 50 },
  { subject: 'physics', name: 'Kinetic Theory of Gases', totalLectures: 4, pyqTotal: 25 },
  { subject: 'physics', name: 'Simple Harmonic Motion (SHM)', totalLectures: 6, pyqTotal: 35 },
  { subject: 'physics', name: 'Waves & Sound', totalLectures: 7, pyqTotal: 40 },
  { subject: 'physics', name: 'Electrostatics & Gauss Law', totalLectures: 10, pyqTotal: 65 },
  { subject: 'physics', name: 'Capacitors', totalLectures: 5, pyqTotal: 35 },
  { subject: 'physics', name: 'Current Electricity', totalLectures: 9, pyqTotal: 55 },
  { subject: 'physics', name: 'Magnetic Effects of Current', totalLectures: 8, pyqTotal: 50 },
  { subject: 'physics', name: 'Magnetism and Matter', totalLectures: 3, pyqTotal: 20 },
  { subject: 'physics', name: 'Electromagnetic Induction (EMI)', totalLectures: 7, pyqTotal: 45 },
  { subject: 'physics', name: 'Alternating Current (AC)', totalLectures: 5, pyqTotal: 35 },
  { subject: 'physics', name: 'Electromagnetic Waves', totalLectures: 3, pyqTotal: 25 },
  { subject: 'physics', name: 'Ray Optics & Optical Instruments', totalLectures: 10, pyqTotal: 55 },
  { subject: 'physics', name: 'Wave Optics & Interference', totalLectures: 6, pyqTotal: 35 },
  { subject: 'physics', name: 'Dual Nature of Radiation & Matter', totalLectures: 4, pyqTotal: 30 },
  { subject: 'physics', name: 'Atoms & Nuclei', totalLectures: 6, pyqTotal: 40 },
  { subject: 'physics', name: 'Semiconductor Electronics & Logic Gates', totalLectures: 5, pyqTotal: 40 },

  // Chemistry
  { subject: 'chemistry', name: 'Some Basic Concepts of Chemistry (Mole Concept)', totalLectures: 6, pyqTotal: 35 },
  { subject: 'chemistry', name: 'Structure of Atom & Quantum Numbers', totalLectures: 7, pyqTotal: 40 },
  { subject: 'chemistry', name: 'Classification of Elements & Periodicity', totalLectures: 5, pyqTotal: 35 },
  { subject: 'chemistry', name: 'Chemical Bonding & Molecular Structure', totalLectures: 10, pyqTotal: 65 },
  { subject: 'chemistry', name: 'Chemical Thermodynamics & Thermochemistry', totalLectures: 8, pyqTotal: 50 },
  { subject: 'chemistry', name: 'Chemical & Ionic Equilibrium', totalLectures: 10, pyqTotal: 60 },
  { subject: 'chemistry', name: 'Redox Reactions', totalLectures: 4, pyqTotal: 25 },
  { subject: 'chemistry', name: 'Solutions & Colligative Properties', totalLectures: 7, pyqTotal: 45 },
  { subject: 'chemistry', name: 'Electrochemistry', totalLectures: 8, pyqTotal: 50 },
  { subject: 'chemistry', name: 'Chemical Kinetics', totalLectures: 7, pyqTotal: 45 },
  { subject: 'chemistry', name: 'p-Block Elements (Group 13-18)', totalLectures: 8, pyqTotal: 50 },
  { subject: 'chemistry', name: 'd and f Block Elements', totalLectures: 6, pyqTotal: 40 },
  { subject: 'chemistry', name: 'Coordination Compounds', totalLectures: 8, pyqTotal: 55 },
  { subject: 'chemistry', name: 'General Organic Chemistry (GOC & Isomerism)', totalLectures: 12, pyqTotal: 70 },
  { subject: 'chemistry', name: 'Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)', totalLectures: 9, pyqTotal: 55 },
  { subject: 'chemistry', name: 'Haloalkanes and Haloarenes', totalLectures: 6, pyqTotal: 40 },
  { subject: 'chemistry', name: 'Alcohols, Phenols and Ethers', totalLectures: 7, pyqTotal: 45 },
  { subject: 'chemistry', name: 'Aldehydes, Ketones & Carboxylic Acids', totalLectures: 10, pyqTotal: 60 },
  { subject: 'chemistry', name: 'Amines & Diazonium Salts', totalLectures: 6, pyqTotal: 40 },
  { subject: 'chemistry', name: 'Biomolecules', totalLectures: 5, pyqTotal: 35 },
  { subject: 'chemistry', name: 'Practical Chemistry & Salt Analysis', totalLectures: 4, pyqTotal: 25 },

  // Mathematics
  { subject: 'mathematics', name: 'Sets, Relations and Functions', totalLectures: 8, pyqTotal: 50 },
  { subject: 'mathematics', name: 'Complex Numbers & Quadratic Equations', totalLectures: 9, pyqTotal: 55 },
  { subject: 'mathematics', name: 'Matrices and Determinants', totalLectures: 8, pyqTotal: 55 },
  { subject: 'mathematics', name: 'Permutations and Combinations', totalLectures: 7, pyqTotal: 45 },
  { subject: 'mathematics', name: 'Binomial Theorem', totalLectures: 6, pyqTotal: 40 },
  { subject: 'mathematics', name: 'Sequence and Series (AP, GP, HP, AGP)', totalLectures: 6, pyqTotal: 45 },
  { subject: 'mathematics', name: 'Limits, Continuity and Differentiability', totalLectures: 9, pyqTotal: 60 },
  { subject: 'mathematics', name: 'Application of Derivatives (AOD)', totalLectures: 8, pyqTotal: 55 },
  { subject: 'mathematics', name: 'Indefinite & Definite Integrals', totalLectures: 12, pyqTotal: 75 },
  { subject: 'mathematics', name: 'Area Under Curves', totalLectures: 4, pyqTotal: 30 },
  { subject: 'mathematics', name: 'Differential Equations', totalLectures: 6, pyqTotal: 45 },
  { subject: 'mathematics', name: 'Straight Lines & Pair of Straight Lines', totalLectures: 7, pyqTotal: 45 },
  { subject: 'mathematics', name: 'Circles', totalLectures: 7, pyqTotal: 50 },
  { subject: 'mathematics', name: 'Conic Sections (Parabola, Ellipse, Hyperbola)', totalLectures: 11, pyqTotal: 70 },
  { subject: 'mathematics', name: 'Vector Algebra', totalLectures: 6, pyqTotal: 45 },
  { subject: 'mathematics', name: 'Three Dimensional Geometry (3D)', totalLectures: 8, pyqTotal: 60 },
  { subject: 'mathematics', name: 'Probability', totalLectures: 8, pyqTotal: 55 },
  { subject: 'mathematics', name: 'Trigonometric Ratios, Equations & Inverse Trig', totalLectures: 8, pyqTotal: 50 },
  { subject: 'mathematics', name: 'Statistics', totalLectures: 3, pyqTotal: 30 },
];

export async function seedDefaultJEEChapters(userId: string) {
  const now = new Date();
  const values = DEFAULT_JEE_CHAPTERS.map((ch, idx) => ({
    id: `ch_${userId}_${ch.subject}_${idx + 1}`,
    userId,
    subject: ch.subject,
    name: ch.name,
    totalLectures: ch.totalLectures,
    completedLectures: JSON.stringify([]),
    pyq: JSON.stringify({ isDone: false, isDetailed: true, total: ch.pyqTotal, completed: 0, correct: 0, incorrect: 0 }),
    shortNotesMade: false,
    revisionCount: 0,
    order: idx + 1,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(chapters).values(values);
}

export async function getOrCreatePersonalDefaultUser(customUsername?: string): Promise<{ token: string; user: UserProfile; fullData: any }> {
  let userRecord;
  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0) {
    userRecord = existingUsers[0];
  } else {
    const uid = 'usr_personal_aspirant';
    const now = new Date();
    const defaultTargets = {
      jeeMainPercentile: '96+',
      jeeAdvancedAIR: '< 10,000',
      dailyStudyHoursGoal: 10,
      dailyWaterGoalMl: 3000,
    };

    const inserted = await db.insert(users).values({
      uid,
      name: 'Aspirant',
      username: customUsername ? `@${sanitizeUsername(customUsername)}` : '@aspirant2027',
      email: 'aspirant@jee2027.local',
      targets: JSON.stringify(defaultTargets),
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    }).returning();
    userRecord = inserted[0];
  }

  let fullData = await getCloudUserFullRecord(userRecord.uid);
  if (!fullData || fullData.chapters.length === 0) {
    await seedDefaultJEEChapters(userRecord.uid);
    fullData = await getCloudUserFullRecord(userRecord.uid);
  }

  const token = jwt.sign(
    { userId: userRecord.uid, email: userRecord.email, username: userRecord.username },
    JWT_SECRET,
    { expiresIn: '365d' }
  );

  return { token, user: fullData!.profile, fullData };
}

/**
 * Register User with PostgreSQL
 */
export async function registerCloudUser(params: {
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
}): Promise<{ token: string; user: UserProfile }> {
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

  // Check unique username and email in PostgreSQL
  const existingUsers = await db.select().from(users).where(
    or(
      ilike(users.username, `@${cleanUsername}`),
      ilike(users.username, cleanUsername),
      ilike(users.email, cleanEmail)
    )
  );

  for (const existing of existingUsers) {
    if (existing.email.toLowerCase() === cleanEmail) {
      throw new Error(`Email ${cleanEmail} is already registered. Please log in or use Forgot Password.`);
    }
    const existingUname = sanitizeUsername(existing.username);
    if (existingUname === cleanUsername) {
      throw new Error(`Username @${cleanUsername} is already taken. Please choose another.`);
    }
  }

  const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(params.password, salt);
  const securityAnswerHash = params.securityAnswer 
    ? bcrypt.hashSync(params.securityAnswer.toLowerCase().trim(), 8) 
    : undefined;

  const targetsObj = {
    jeeMainPercentile: params.targets?.jeeMainPercentile || '96+',
    jeeAdvancedAIR: params.targets?.jeeAdvancedAir || '< 10,000',
    dailyStudyHoursGoal: params.targets?.dailyStudyHoursGoal || 10,
    dailyWaterGoalMl: params.targets?.dailyWaterGoalMl || 3000,
  };

  const now = new Date();

  await db.insert(users).values({
    uid,
    name: params.name.trim(),
    username: `@${cleanUsername}`,
    email: cleanEmail,
    passwordHash,
    securityQuestion: params.securityQuestion,
    securityAnswerHash,
    targets: JSON.stringify(targetsObj),
    isPublic: true,
    createdAt: now,
    updatedAt: now,
  });

  const profile: UserProfile = {
    id: uid,
    name: params.name.trim(),
    username: `@${cleanUsername}`,
    email: cleanEmail,
    targets: targetsObj,
    isPublic: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const token = jwt.sign({ userId: uid, email: cleanEmail, username: profile.username }, JWT_SECRET, { expiresIn: '60d' });
  return { token, user: profile };
}

/**
 * Login User with PostgreSQL
 */
export async function loginCloudUser(identifier: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const rawClean = identifier.trim().toLowerCase();
  const cleanId = rawClean.replace(/^@+/, '');

  const userRecords = await db.select().from(users).where(
    or(
      ilike(users.username, `@${cleanId}`),
      ilike(users.username, cleanId),
      ilike(users.email, rawClean),
      ilike(users.email, cleanId)
    )
  );

  if (!userRecords.length) {
    throw new Error(`No account found for "${identifier}". Please verify spelling or create an account.`);
  }

  const userRecord = userRecords[0];
  if (!userRecord.passwordHash) {
    throw new Error('Account was registered via Google Sign-In. Please sign in with Google or reset your password.');
  }

  const isValid = bcrypt.compareSync(password, userRecord.passwordHash);
  if (!isValid) {
    throw new Error('Incorrect password. Please verify and try again or use Reset Password.');
  }

  let targets = {
    jeeMainPercentile: '96+',
    jeeAdvancedAIR: '< 10,000',
    dailyStudyHoursGoal: 10,
    dailyWaterGoalMl: 3000,
  };
  try {
    if (userRecord.targets) targets = JSON.parse(userRecord.targets);
  } catch (e) {}

  const profile: UserProfile = {
    id: userRecord.uid,
    name: userRecord.name,
    username: userRecord.username,
    email: userRecord.email,
    targets,
    isPublic: userRecord.isPublic ?? true,
    avatarSeed: userRecord.avatarSeed || undefined,
    bio: userRecord.bio || undefined,
    createdAt: userRecord.createdAt ? new Date(userRecord.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: userRecord.updatedAt ? new Date(userRecord.updatedAt).toISOString() : new Date().toISOString(),
  };

  const token = jwt.sign({ userId: userRecord.uid, email: userRecord.email, username: userRecord.username }, JWT_SECRET, { expiresIn: '60d' });
  return { token, user: profile };
}

/**
 * Firebase OAuth Token Verification & User Upsert
 */
export async function authenticateFirebaseToken(firebaseIdToken: string): Promise<{ token: string; user: UserProfile }> {
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(firebaseIdToken);
  } catch (err: any) {
    console.error('Firebase token verification error:', err);
    throw new Error('Invalid Firebase authentication token. Please sign in again.');
  }

  const uid = decoded.uid;
  const email = decoded.email || `${uid}@firebase.user`;
  const name = decoded.name || email.split('@')[0] || 'Mission Aspirant';
  const cleanUname = sanitizeUsername(decoded.email ? decoded.email.split('@')[0] : uid.slice(0, 8));

  // Check if user exists in PostgreSQL
  const existingUsers = await db.select().from(users).where(eq(users.uid, uid));
  let userRecord;

  if (existingUsers.length > 0) {
    userRecord = existingUsers[0];
  } else {
    // Check if email already registered
    const byEmail = await db.select().from(users).where(ilike(users.email, email));
    if (byEmail.length > 0) {
      userRecord = byEmail[0];
    } else {
      const defaultTargets = {
        jeeMainPercentile: '96+',
        jeeAdvancedAIR: '< 10,000',
        dailyStudyHoursGoal: 10,
        dailyWaterGoalMl: 3000,
      };

      const now = new Date();
      const inserted = await db.insert(users).values({
        uid,
        name,
        username: `@${cleanUname}`,
        email,
        targets: JSON.stringify(defaultTargets),
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      }).returning();
      userRecord = inserted[0];
    }
  }

  let targets = {
    jeeMainPercentile: '96+',
    jeeAdvancedAIR: '< 10,000',
    dailyStudyHoursGoal: 10,
    dailyWaterGoalMl: 3000,
  };
  try {
    if (userRecord.targets) targets = JSON.parse(userRecord.targets);
  } catch (e) {}

  const profile: UserProfile = {
    id: userRecord.uid,
    name: userRecord.name,
    username: userRecord.username,
    email: userRecord.email,
    targets,
    isPublic: userRecord.isPublic ?? true,
    avatarSeed: userRecord.avatarSeed || undefined,
    bio: userRecord.bio || undefined,
    createdAt: userRecord.createdAt ? new Date(userRecord.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: userRecord.updatedAt ? new Date(userRecord.updatedAt).toISOString() : new Date().toISOString(),
  };

  const token = jwt.sign({ userId: userRecord.uid, email: userRecord.email, username: userRecord.username }, JWT_SECRET, { expiresIn: '60d' });
  return { token, user: profile };
}

/**
 * Verify JWT or Firebase Token
 */
export async function verifyAnyToken(token: string): Promise<string | null> {
  if (!token) return null;
  // 1. Try JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (decoded?.userId) return decoded.userId;
  } catch (e) {}

  // 2. Try Firebase ID Token
  try {
    const decodedFb = await adminAuth.verifyIdToken(token);
    if (decodedFb?.uid) return decodedFb.uid;
  } catch (e) {}

  // 3. Try token_<uid> fallback
  const match = token.match(/^token_([^_]+)_/) || token.match(/^token_(usr_[^_]+)/);
  if (match) {
    const user = await db.select().from(users).where(eq(users.uid, match[1]));
    if (user.length > 0) return match[1];
  }

  return null;
}

/**
 * Fetch full user record from PostgreSQL
 */
export async function getCloudUserFullRecord(userId: string) {
  const userRecs = await db.select().from(users).where(eq(users.uid, userId));
  if (!userRecs.length) return null;
  const u = userRecs[0];

  let targets = {
    jeeMainPercentile: '96+',
    jeeAdvancedAIR: '< 10,000',
    dailyStudyHoursGoal: 10,
    dailyWaterGoalMl: 3000,
  };
  try {
    if (u.targets) targets = JSON.parse(u.targets);
  } catch (e) {}

  const profile: UserProfile = {
    id: u.uid,
    name: u.name,
    username: u.username,
    email: u.email,
    targets,
    isPublic: u.isPublic ?? true,
    avatarSeed: u.avatarSeed || undefined,
    bio: u.bio || undefined,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
  };

  const userChaptersRows = await db.select().from(chapters).where(eq(chapters.userId, userId)).orderBy(asc(chapters.order));
  const parsedChapters: Chapter[] = userChaptersRows.map(r => {
    let completedLectures: number[] = [];
    let pyq = { isDone: false, isDetailed: false, total: 0, completed: 0, correct: 0, incorrect: 0 };
    try {
      if (r.completedLectures) completedLectures = JSON.parse(r.completedLectures);
      if (r.pyq) pyq = JSON.parse(r.pyq);
    } catch (e) {}
    return {
      id: r.id,
      userId: r.userId,
      subject: r.subject as SubjectType,
      name: r.name,
      totalLectures: r.totalLectures,
      completedLectures,
      pyq,
      shortNotesMade: r.shortNotesMade,
      revisionCount: r.revisionCount,
      order: r.order,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    };
  });

  const dayLogsRows = await db.select().from(dayLogs).where(eq(dayLogs.userId, userId));
  const parsedDayLogs: Record<number, DayLog> = {};
  dayLogsRows.forEach(r => {
    let meals = { breakfast: false, lunch: false, dinner: false };
    let chaptersStudied: string[] = [];
    let subjectHours = { physics: 0, chemistry: 0, mathematics: 0 };
    try {
      if (r.meals) meals = JSON.parse(r.meals);
      if (r.chaptersStudied) chaptersStudied = JSON.parse(r.chaptersStudied);
      if (r.subjectHours) subjectHours = JSON.parse(r.subjectHours);
    } catch (e) {}

    parsedDayLogs[r.dayNumber] = {
      dayNumber: r.dayNumber,
      date: r.date,
      targetHours: r.targetHours,
      actualHours: parseFloat(r.actualHours) || 0,
      status: r.status as any,
      notes: r.notes || undefined,
      meals,
      waterMl: r.waterMl,
      chaptersStudied,
      subjectHours,
      lecturesCompletedCount: r.lecturesCompletedCount || 0,
      pyqsCompletedCount: r.pyqsCompletedCount || 0,
      revisionsLoggedCount: r.revisionsLoggedCount || 0,
      shortNotesLoggedCount: r.shortNotesLoggedCount || 0,
    };
  });

  const tasksRows = await db.select().from(dailyTasks).where(eq(dailyTasks.userId, userId)).orderBy(asc(dailyTasks.order));
  const parsedTasks: DailyTask[] = tasksRows.map(r => ({
    id: r.id,
    userId: r.userId,
    dayNumber: r.dayNumber,
    subject: r.subject as any,
    title: r.title,
    completed: r.completed,
    order: r.order,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));

  const sessionsRows = await db.select().from(timerSessions).where(eq(timerSessions.userId, userId)).orderBy(desc(timerSessions.createdAt));
  const parsedSessions: TimerSession[] = sessionsRows.map(r => ({
    id: r.id,
    userId: r.userId,
    dayNumber: r.dayNumber,
    date: r.date,
    subject: r.subject as any,
    durationMinutes: r.durationMinutes,
    chapterId: r.chapterId || undefined,
    chapterName: r.chapterName || undefined,
    notes: r.notes || undefined,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));

  const mockTestsRows = await db.select().from(mockTests).where(eq(mockTests.userId, userId)).orderBy(desc(mockTests.date));
  const parsedMockTests: MockTest[] = mockTestsRows.map(r => ({
    id: r.id,
    userId: r.userId,
    testName: r.testName,
    date: r.date,
    examType: r.examType as any,
    physicsScore: r.physicsScore,
    chemistryScore: r.chemistryScore,
    mathScore: r.mathScore,
    totalScore: r.totalScore,
    maxScore: r.maxScore,
    percentile: r.percentile ? parseFloat(r.percentile) : undefined,
    notes: r.notes || undefined,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    profile,
    chapters: parsedChapters,
    dayLogs: parsedDayLogs,
    tasks: parsedTasks,
    timerSessions: parsedSessions,
    mockTests: parsedMockTests,
  };
}

/**
 * Full Cloud Synchronization (Bidirectional & Bulk Save)
 */
export async function syncFullCloudUserData(userId: string, payload: {
  profile?: Partial<UserProfile>;
  chapters?: Chapter[];
  dayLogs?: Record<number, DayLog> | DayLog[];
  tasks?: DailyTask[];
  timerSessions?: TimerSession[];
  mockTests?: MockTest[];
}) {
  const now = new Date();

  // 1. Update Profile if present
  if (payload.profile) {
    const updateObj: any = { updatedAt: now };
    if (payload.profile.name) updateObj.name = payload.profile.name.trim();
    if (payload.profile.bio !== undefined) updateObj.bio = payload.profile.bio;
    if (typeof payload.profile.isPublic === 'boolean') updateObj.isPublic = payload.profile.isPublic;
    if (payload.profile.targets) updateObj.targets = JSON.stringify(payload.profile.targets);

    await db.update(users).set(updateObj).where(eq(users.uid, userId));
  }

  // 2. Sync Chapters (Upsert or Replace)
  if (payload.chapters && Array.isArray(payload.chapters)) {
    // Delete existing chapters for user and re-insert in batch to guarantee exact order and deletion synchronization
    await db.delete(chapters).where(eq(chapters.userId, userId));
    if (payload.chapters.length > 0) {
      const chapterValues = payload.chapters.map((c, index) => ({
        id: c.id || `ch_${Date.now()}_${index}`,
        userId,
        subject: c.subject,
        name: c.name,
        totalLectures: c.totalLectures || 0,
        completedLectures: JSON.stringify(c.completedLectures || []),
        pyq: JSON.stringify(c.pyq || { isDone: false, isDetailed: false, total: 0, completed: 0, correct: 0, incorrect: 0 }),
        shortNotesMade: !!c.shortNotesMade,
        revisionCount: c.revisionCount || 0,
        order: c.order ?? index,
        createdAt: c.createdAt ? new Date(c.createdAt) : now,
        updatedAt: now,
      }));
      await db.insert(chapters).values(chapterValues);
    }
  }

  // 3. Sync Day Logs
  if (payload.dayLogs) {
    const logsList = Array.isArray(payload.dayLogs) 
      ? payload.dayLogs 
      : Object.values(payload.dayLogs);

    for (const log of logsList) {
      if (!log || !log.dayNumber) continue;
      const existing = await db.select().from(dayLogs).where(
        and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, log.dayNumber))
      );

      const dayLogData = {
        userId,
        dayNumber: log.dayNumber,
        date: log.date || new Date().toISOString().split('T')[0],
        targetHours: log.targetHours || 10,
        actualHours: String(log.actualHours || 0),
        status: log.status || 'not_started',
        notes: log.notes || null,
        meals: JSON.stringify(log.meals || { breakfast: false, lunch: false, dinner: false }),
        waterMl: log.waterMl || 0,
        chaptersStudied: JSON.stringify(log.chaptersStudied || []),
        subjectHours: JSON.stringify(log.subjectHours || { physics: 0, chemistry: 0, mathematics: 0 }),
        lecturesCompletedCount: log.lecturesCompletedCount || 0,
        pyqsCompletedCount: log.pyqsCompletedCount || 0,
        revisionsLoggedCount: log.revisionsLoggedCount || 0,
        shortNotesLoggedCount: log.shortNotesLoggedCount || 0,
        updatedAt: now,
      };

      if (existing.length > 0) {
        await db.update(dayLogs).set(dayLogData).where(
          and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, log.dayNumber))
        );
      } else {
        await db.insert(dayLogs).values({
          ...dayLogData,
          createdAt: now,
        });
      }
    }
  }

  // 4. Sync Daily Tasks
  if (payload.tasks && Array.isArray(payload.tasks)) {
    await db.delete(dailyTasks).where(eq(dailyTasks.userId, userId));
    if (payload.tasks.length > 0) {
      const taskValues = payload.tasks.map((t, index) => ({
        id: t.id || `task_${Date.now()}_${index}`,
        userId,
        dayNumber: t.dayNumber || 1,
        subject: t.subject || 'general',
        title: t.title,
        completed: !!t.completed,
        order: t.order ?? index,
        createdAt: t.createdAt ? new Date(t.createdAt) : now,
      }));
      await db.insert(dailyTasks).values(taskValues);
    }
  }

  // 5. Sync Timer Sessions
  if (payload.timerSessions && Array.isArray(payload.timerSessions)) {
    for (const session of payload.timerSessions) {
      const existing = await db.select().from(timerSessions).where(
        and(eq(timerSessions.userId, userId), eq(timerSessions.id, session.id))
      );
      if (!existing.length) {
        await db.insert(timerSessions).values({
          id: session.id,
          userId,
          dayNumber: session.dayNumber || 1,
          date: session.date || new Date().toISOString().split('T')[0],
          subject: session.subject || 'general',
          durationMinutes: session.durationMinutes,
          chapterId: session.chapterId || null,
          chapterName: session.chapterName || null,
          notes: session.notes || null,
          createdAt: session.createdAt ? new Date(session.createdAt) : now,
        });
      }
    }
  }

  // 6. Sync Mock Tests
  if (payload.mockTests && Array.isArray(payload.mockTests)) {
    await db.delete(mockTests).where(eq(mockTests.userId, userId));
    if (payload.mockTests.length > 0) {
      const testValues = payload.mockTests.map((t) => ({
        id: t.id || `mock_${Date.now()}`,
        userId,
        testName: t.testName,
        date: t.date,
        examType: t.examType,
        physicsScore: t.physicsScore || 0,
        chemistryScore: t.chemistryScore || 0,
        mathScore: t.mathScore || 0,
        totalScore: t.totalScore || 0,
        maxScore: t.maxScore || 300,
        percentile: t.percentile ? String(t.percentile) : null,
        notes: t.notes || null,
        createdAt: t.createdAt ? new Date(t.createdAt) : now,
      }));
      await db.insert(mockTests).values(testValues);
    }
  }

  return await getCloudUserFullRecord(userId);
}

/**
 * Calculate user stats directly from records
 */
export function calculateStatsFromRecords(record: {
  profile: UserProfile;
  chapters: Chapter[];
  dayLogs: Record<number, DayLog>;
}): UserStats {
  const chapters = record.chapters || [];
  const dayLogs = Object.values(record.dayLogs || {});
  
  let totalStudyHours = 0;
  let todayStudyHours = 0;
  
  dayLogs.forEach(log => {
    totalStudyHours += (log.actualHours || 0);
  });

  const day1Log = record.dayLogs[1];
  if (day1Log) {
    todayStudyHours = day1Log.actualHours || 0;
  }

  const totalChapters = chapters.length;
  let completedChapters = 0;
  let totalLectures = 0;
  let completedLectures = 0;
  let totalPYQs = 0;
  let completedPYQs = 0;
  let totalShortNotes = 0;
  let totalRevisions = 0;

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
      const pyqDone = c.pyq?.isDone || (c.pyq?.completed > 0 && c.pyq?.completed >= c.pyq?.total);
      if (c.pyq?.isDetailed) {
        subStats[sub].pyq += (c.pyq.completed || 0);
      } else if (pyqDone) {
        subStats[sub].pyq += 1;
      }
      subStats[sub].rev += (c.revisionCount || 0);
    }

    totalLectures += (c.totalLectures || 0);
    completedLectures += (c.completedLectures?.length || 0);
    if (c.pyq?.isDetailed) {
      totalPYQs += (c.pyq.total || 0);
      completedPYQs += (c.pyq.completed || 0);
    } else {
      totalPYQs += 1;
      if (c.pyq?.isDone) completedPYQs += 1;
    }
    if (c.shortNotesMade) totalShortNotes += 1;
    totalRevisions += (c.revisionCount || 0);

    const lecDone = c.totalLectures > 0 ? (c.completedLectures?.length || 0) >= c.totalLectures : true;
    const pyqDone = c.pyq?.isDone || (c.pyq?.isDetailed && c.pyq.completed >= c.pyq.total && c.pyq.total > 0);
    if (lecDone && pyqDone && c.shortNotesMade) {
      completedChapters += 1;
      if (subStats[sub]) subStats[sub].compChapters += 1;
    }
  });

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

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= TOTAL_MISSION_DAYS; d++) {
    const log = record.dayLogs[d];
    if (log && log.actualHours > 0) {
      tempStreak += 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      currentStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  const daysCompleted = dayLogs.filter(l => l.actualHours > 0 || l.status === 'completed').length;
  const missionProgressPercent = Math.min(100, Math.round((daysCompleted / TOTAL_MISSION_DAYS) * 100));
  const averageDailyStudyHours = daysCompleted > 0 ? Number((totalStudyHours / daysCompleted).toFixed(1)) : 0;
  const weeklyStudyHours = Number((averageDailyStudyHours * 7).toFixed(1));

  const todayTarget = record.profile.targets.dailyStudyHoursGoal || 10;
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
    },
  };
}

/**
 * Public Profile & Leaderboard
 */
export async function getPublicProfileFromCloud(identifier: string): Promise<PublicProfileData | null> {
  const clean = sanitizeUsername(identifier);
  const foundUsers = await db.select().from(users).where(
    or(
      ilike(users.username, `@${clean}`),
      ilike(users.username, clean),
      eq(users.uid, identifier)
    )
  );

  if (!foundUsers.length) return null;
  const userRec = foundUsers[0];
  if (userRec.isPublic === false) return null;

  const fullData = await getCloudUserFullRecord(userRec.uid);
  if (!fullData) return null;

  const stats = calculateStatsFromRecords({
    profile: fullData.profile,
    chapters: fullData.chapters,
    dayLogs: fullData.dayLogs,
  });

  return {
    user: {
      id: fullData.profile.id,
      name: fullData.profile.name,
      username: fullData.profile.username,
      targets: {
        jeeMainPercentile: fullData.profile.targets.jeeMainPercentile,
        jeeAdvancedAir: fullData.profile.targets.jeeAdvancedAIR,
        dailyStudyHoursGoal: fullData.profile.targets.dailyStudyHoursGoal,
        dailyWaterGoalMl: fullData.profile.targets.dailyWaterGoalMl,
      },
      createdAt: fullData.profile.createdAt,
    },
    stats,
    studyHoursHistory: Object.values(fullData.dayLogs).map(l => ({
      day: l.dayNumber,
      date: l.date,
      hours: l.actualHours,
      target: l.targetHours,
    })),
    subjectProgress: [
      { subject: 'Physics', progress: stats.physics.progressPercent, chapters: stats.physics.totalChapters, completedChapters: stats.physics.completedChapters },
      { subject: 'Chemistry', progress: stats.chemistry.progressPercent, chapters: stats.chemistry.totalChapters, completedChapters: stats.chemistry.completedChapters },
      { subject: 'Mathematics', progress: stats.mathematics.progressPercent, chapters: stats.mathematics.totalChapters, completedChapters: stats.mathematics.completedChapters },
    ]
  };
}

export async function getPublicLeaderboardFromCloud(): Promise<LeaderboardUser[]> {
  const publicUsers = await db.select().from(users).where(eq(users.isPublic, true));
  const list: LeaderboardUser[] = [];

  for (const u of publicUsers) {
    const full = await getCloudUserFullRecord(u.uid);
    if (!full) continue;
    const stats = calculateStatsFromRecords({
      profile: full.profile,
      chapters: full.chapters,
      dayLogs: full.dayLogs,
    });

    list.push({
      rank: 1,
      name: full.profile.name,
      username: full.profile.username,
      missionDay: stats.currentMissionDay,
      missionProgress: stats.missionProgressPercent,
      studyHours: stats.totalStudyHours,
      pyqs: stats.completedPYQs,
      lectures: stats.completedLectures,
      chapters: stats.completedChapters,
      streak: stats.currentStreak,
      overallProgress: stats.missionProgressPercent,
    });
  }

  // Sort by overall progress & study hours
  list.sort((a, b) => (b.overallProgress - a.overallProgress) || (b.studyHours - a.studyHours));
  return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
}
