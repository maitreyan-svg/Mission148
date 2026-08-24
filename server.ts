import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  registerCloudUser,
  loginCloudUser,
  authenticateFirebaseToken,
  verifyAnyToken,
  getCloudUserFullRecord,
  syncFullCloudUserData,
  calculateStatsFromRecords,
  getPublicProfileFromCloud,
  getPublicLeaderboardFromCloud
} from './server/cloudDb.ts';
import { db } from './src/db/index.ts';
import { users, chapters, dayLogs, dailyTasks, timerSessions, mockTests } from './src/db/schema.ts';
import { eq, and, or, ilike } from 'drizzle-orm';
import { Chapter, DayLog, DailyTask, TimerSession, MockTest } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 10MB limit for cloud backups/imports
  app.use(express.json({ limit: '10mb' }));

  // Auth Middleware
  const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    try {
      const userId = await verifyAnyToken(token);
      if (!userId) {
        res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
        return;
      }

      (req as any).userId = userId;
      next();
    } catch (e: any) {
      res.status(401).json({ error: 'Authentication verification failed.' });
    }
  };

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'cloudsql-postgresql', time: new Date().toISOString() });
  });

  // ---------------- AUTH ROUTES ---------------- //

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, username, email, password, securityQuestion, securityAnswer, targets } = req.body;
      if (!name || !username || !email || !password) {
        return res.status(400).json({ error: 'Name, username, email, and password are required.' });
      }

      const result = await registerCloudUser({
        name,
        username,
        email,
        password,
        securityQuestion,
        securityAnswer,
        targets,
      });

      const userRecord = await getCloudUserFullRecord(result.user.id);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.status(201).json({
        ...result,
        stats,
        chapters: userRecord?.chapters || [],
        dayLogs: userRecord?.dayLogs || {},
        tasks: userRecord?.tasks || [],
        timerSessions: userRecord?.timerSessions || [],
        mockTests: userRecord?.mockTests || [],
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required.' });
      }

      const result = await loginCloudUser(identifier, password);
      const userRecord = await getCloudUserFullRecord(result.user.id);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.json({
        ...result,
        stats,
        chapters: userRecord?.chapters || [],
        dayLogs: userRecord?.dayLogs || {},
        tasks: userRecord?.tasks || [],
        timerSessions: userRecord?.timerSessions || [],
        mockTests: userRecord?.mockTests || [],
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Login failed.' });
    }
  });

  // Firebase OAuth Sign-In Endpoint
  app.post('/api/auth/firebase', async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'Firebase ID token is required.' });
      }

      const result = await authenticateFirebaseToken(idToken);
      const userRecord = await getCloudUserFullRecord(result.user.id);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.json({
        ...result,
        stats,
        chapters: userRecord?.chapters || [],
        dayLogs: userRecord?.dayLogs || {},
        tasks: userRecord?.tasks || [],
        timerSessions: userRecord?.timerSessions || [],
        mockTests: userRecord?.mockTests || [],
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Firebase login failed.' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const userRecord = await getCloudUserFullRecord(userId);
      if (!userRecord) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      const stats = calculateStatsFromRecords(userRecord);
      res.json({
        user: userRecord.profile,
        stats,
        chapters: userRecord.chapters || [],
        dayLogs: userRecord.dayLogs || {},
        tasks: userRecord.tasks || [],
        timerSessions: userRecord.timerSessions || [],
        mockTests: userRecord.mockTests || [],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve profile.' });
    }
  });

  app.post('/api/auth/update-profile', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const now = new Date();
      const updates = req.body;

      const updateFields: any = { updatedAt: now };
      if (updates.name) updateFields.name = updates.name.trim();
      if (updates.bio !== undefined) updateFields.bio = updates.bio;
      if (typeof updates.isPublic === 'boolean') updateFields.isPublic = updates.isPublic;
      if (updates.targets) updateFields.targets = JSON.stringify(updates.targets);

      await db.update(users).set(updateFields).where(eq(users.uid, userId));
      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.json({ user: userRecord?.profile, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const userRecs = await db.select().from(users).where(eq(users.uid, userId));
      if (!userRecs.length) return res.status(404).json({ error: 'User not found.' });

      const user = userRecs[0];
      if (user.passwordHash) {
        const bcryptModule = (await import('bcryptjs')).default;
        const isValid = bcryptModule.compareSync(oldPassword, user.passwordHash);
        if (!isValid) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
      }

      const bcryptModule = (await import('bcryptjs')).default;
      const newHash = bcryptModule.hashSync(newPassword, bcryptModule.genSaltSync(10));
      await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.uid, userId));

      res.json({ message: 'Password changed successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { identifier, newPassword } = req.body;
      if (!identifier || !newPassword) {
        return res.status(400).json({ error: 'Identifier and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const rawClean = identifier.trim().toLowerCase();
      const cleanId = rawClean.replace(/^@+/, '');

      const found = await db.select().from(users).where(
        or(
          ilike(users.username, `@${cleanId}`),
          ilike(users.username, cleanId),
          ilike(users.email, rawClean),
          ilike(users.email, cleanId)
        )
      );

      if (!found.length) {
        return res.status(404).json({ error: `No user found for ${identifier}.` });
      }

      const bcryptModule = (await import('bcryptjs')).default;
      const newHash = bcryptModule.hashSync(newPassword, bcryptModule.genSaltSync(10));
      await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.uid, found[0].uid));

      res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- CLOUD FULL-SYNC & RECOVERY ---------------- //

  app.post('/api/cloud/sync', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const payload = req.body;
      const record = await syncFullCloudUserData(userId, payload);
      const stats = record ? calculateStatsFromRecords(record) : null;
      res.json({
        success: true,
        user: record?.profile,
        stats,
        chapters: record?.chapters || [],
        dayLogs: record?.dayLogs || {},
        tasks: record?.tasks || [],
        timerSessions: record?.timerSessions || [],
        mockTests: record?.mockTests || [],
        syncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Cloud sync error:', err);
      res.status(500).json({ error: err.message || 'Cloud sync failed.' });
    }
  });

  // Export User Database Backup
  app.get('/api/cloud/export', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const record = await getCloudUserFullRecord(userId);
      if (!record) return res.status(404).json({ error: 'User record not found.' });

      const stats = calculateStatsFromRecords(record);
      const backupData = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        engine: 'Cloud SQL PostgreSQL',
        userId: record.profile.id,
        profile: record.profile,
        stats,
        chapters: record.chapters,
        dayLogs: record.dayLogs,
        tasks: record.tasks,
        timerSessions: record.timerSessions,
        mockTests: record.mockTests,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=mission148_backup_${record.profile.username.replace('@', '')}_${Date.now()}.json`);
      res.json(backupData);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Export failed.' });
    }
  });

  // Restore/Import User Database Backup
  app.post('/api/cloud/import', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const backupData = req.body;
      if (!backupData || (!backupData.chapters && !backupData.dayLogs)) {
        return res.status(400).json({ error: 'Invalid backup file payload.' });
      }

      const synced = await syncFullCloudUserData(userId, {
        chapters: backupData.chapters,
        dayLogs: backupData.dayLogs,
        tasks: backupData.tasks,
        timerSessions: backupData.timerSessions,
        mockTests: backupData.mockTests,
        profile: backupData.profile,
      });

      const stats = synced ? calculateStatsFromRecords(synced) : null;
      res.json({
        success: true,
        message: 'Backup restored successfully to cloud database.',
        user: synced?.profile,
        stats,
        chapters: synced?.chapters || [],
        dayLogs: synced?.dayLogs || {},
        tasks: synced?.tasks || [],
        timerSessions: synced?.timerSessions || [],
        mockTests: synced?.mockTests || [],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Restore failed.' });
    }
  });

  // ---------------- CHAPTER TRACKING ROUTES ---------------- //

  app.post('/api/chapters', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const data = req.body;
      const newId = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date();

      await db.insert(chapters).values({
        id: newId,
        userId,
        subject: data.subject,
        name: data.name,
        totalLectures: data.totalLectures || 0,
        completedLectures: JSON.stringify(data.completedLectures || []),
        pyq: JSON.stringify(data.pyq || { isDone: false, isDetailed: false, total: 0, completed: 0, correct: 0, incorrect: 0 }),
        shortNotesMade: !!data.shortNotesMade,
        revisionCount: data.revisionCount || 0,
        order: data.order || 0,
        createdAt: now,
        updatedAt: now,
      });

      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;
      const created = userRecord?.chapters.find(c => c.id === newId);

      res.status(201).json({ chapter: created, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/chapters/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const chapterId = req.params.id;
      const updates = req.body;
      const now = new Date();

      const updateObj: any = { updatedAt: now };
      if (updates.name) updateObj.name = updates.name;
      if (updates.subject) updateObj.subject = updates.subject;
      if (updates.totalLectures !== undefined) updateObj.totalLectures = updates.totalLectures;
      if (updates.completedLectures) updateObj.completedLectures = JSON.stringify(updates.completedLectures);
      if (updates.pyq) updateObj.pyq = JSON.stringify(updates.pyq);
      if (updates.shortNotesMade !== undefined) updateObj.shortNotesMade = updates.shortNotesMade;
      if (updates.revisionCount !== undefined) updateObj.revisionCount = updates.revisionCount;
      if (updates.order !== undefined) updateObj.order = updates.order;

      await db.update(chapters).set(updateObj).where(and(eq(chapters.userId, userId), eq(chapters.id, chapterId)));

      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;
      const updated = userRecord?.chapters.find(c => c.id === chapterId);

      res.json({ chapter: updated, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/chapters/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const chapterId = req.params.id;
      await db.delete(chapters).where(and(eq(chapters.userId, userId), eq(chapters.id, chapterId)));

      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- DAILY LOGS & ROUTINE ---------------- //

  app.post('/api/day-logs/:dayNumber', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dayNum = parseInt(req.params.dayNumber, 10);
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 148) {
        return res.status(400).json({ error: 'Day number must be between 1 and 148.' });
      }

      const body = req.body;
      const now = new Date();

      const existing = await db.select().from(dayLogs).where(
        and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, dayNum))
      );

      const logData = {
        userId,
        dayNumber: dayNum,
        date: body.date || new Date().toISOString().split('T')[0],
        targetHours: body.targetHours || 10,
        actualHours: String(body.actualHours || 0),
        status: body.status || 'not_started',
        notes: body.notes || null,
        meals: JSON.stringify(body.meals || { breakfast: false, lunch: false, dinner: false }),
        waterMl: body.waterMl || 0,
        chaptersStudied: JSON.stringify(body.chaptersStudied || []),
        subjectHours: JSON.stringify(body.subjectHours || { physics: 0, chemistry: 0, mathematics: 0 }),
        lecturesCompletedCount: body.lecturesCompletedCount || 0,
        pyqsCompletedCount: body.pyqsCompletedCount || 0,
        revisionsLoggedCount: body.revisionsLoggedCount || 0,
        shortNotesLoggedCount: body.shortNotesLoggedCount || 0,
        updatedAt: now,
      };

      if (existing.length > 0) {
        await db.update(dayLogs).set(logData).where(
          and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, dayNum))
        );
      } else {
        await db.insert(dayLogs).values({ ...logData, createdAt: now });
      }

      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.json({ dayLog: userRecord?.dayLogs[dayNum], stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- DAILY TASKS ---------------- //

  app.post('/api/tasks', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const data = req.body;
      const taskId = data.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const existing = await db.select().from(dailyTasks).where(
        and(eq(dailyTasks.userId, userId), eq(dailyTasks.id, taskId))
      );

      if (existing.length > 0) {
        await db.update(dailyTasks).set({
          title: data.title,
          completed: !!data.completed,
          subject: data.subject || 'general',
          dayNumber: data.dayNumber || 1,
          order: data.order || 0,
        }).where(and(eq(dailyTasks.userId, userId), eq(dailyTasks.id, taskId)));
      } else {
        await db.insert(dailyTasks).values({
          id: taskId,
          userId,
          dayNumber: data.dayNumber || 1,
          subject: data.subject || 'general',
          title: data.title,
          completed: !!data.completed,
          order: data.order || 0,
          createdAt: new Date(),
        });
      }

      res.json({ task: { id: taskId, userId, ...data } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      await db.delete(dailyTasks).where(
        and(eq(dailyTasks.userId, userId), eq(dailyTasks.id, req.params.id))
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- TIMER SESSIONS ---------------- //

  app.post('/api/timer-sessions', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const data = req.body;
      const sessionId = data.id || `session_${Date.now()}`;
      const now = new Date();

      await db.insert(timerSessions).values({
        id: sessionId,
        userId,
        dayNumber: data.dayNumber || 1,
        date: data.date || now.toISOString().split('T')[0],
        subject: data.subject || 'general',
        durationMinutes: data.durationMinutes,
        chapterId: data.chapterId || null,
        chapterName: data.chapterName || null,
        notes: data.notes || null,
        createdAt: now,
      });

      // Update study hours in dayLogs as well
      const dayNum = data.dayNumber || 1;
      const addedHours = Number((data.durationMinutes / 60).toFixed(2));
      const existingLog = await db.select().from(dayLogs).where(
        and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, dayNum))
      );

      if (existingLog.length > 0) {
        const curHours = parseFloat(existingLog[0].actualHours) || 0;
        const newHours = Number((curHours + addedHours).toFixed(2));
        await db.update(dayLogs).set({
          actualHours: String(newHours),
          status: newHours >= existingLog[0].targetHours ? 'completed' : 'in_progress',
          updatedAt: now,
        }).where(and(eq(dayLogs.userId, userId), eq(dayLogs.dayNumber, dayNum)));
      }

      const userRecord = await getCloudUserFullRecord(userId);
      const stats = userRecord ? calculateStatsFromRecords(userRecord) : null;

      res.status(201).json({ session: data, stats, dayLog: userRecord?.dayLogs[dayNum] });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- MOCK TESTS ---------------- //

  app.post('/api/mock-tests', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const data = req.body;
      const testId = data.id || `mock_${Date.now()}`;

      await db.insert(mockTests).values({
        id: testId,
        userId,
        testName: data.testName,
        date: data.date,
        examType: data.examType,
        physicsScore: data.physicsScore || 0,
        chemistryScore: data.chemistryScore || 0,
        mathScore: data.mathScore || 0,
        totalScore: data.totalScore || 0,
        maxScore: data.maxScore || 300,
        percentile: data.percentile ? String(data.percentile) : null,
        notes: data.notes || null,
        createdAt: new Date(),
      });

      res.status(201).json({ mockTest: { id: testId, userId, ...data } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/mock-tests/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      await db.delete(mockTests).where(
        and(eq(mockTests.userId, userId), eq(mockTests.id, req.params.id))
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- PUBLIC PROFILES & LEADERBOARD ---------------- //

  app.get('/api/public/profile/:username', async (req, res) => {
    try {
      const rawUsername = req.params.username;
      const profile = await getPublicProfileFromCloud(rawUsername);
      if (!profile) {
        return res.status(404).json({ error: 'Public profile not found or set to private.' });
      }
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/leaderboard', async (req, res) => {
    try {
      const leaderboard = await getPublicLeaderboardFromCloud();
      res.json({ leaderboard });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/search', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const clean = query.trim().toLowerCase().replace(/^@+/, '');
      const results = await db.select().from(users).where(
        and(
          eq(users.isPublic, true),
          or(
            ilike(users.username, `%${clean}%`),
            ilike(users.name, `%${query.trim()}%`)
          )
        )
      );

      const mapped = results.map(u => ({
        id: u.uid,
        name: u.name,
        username: u.username,
        targets: u.targets ? JSON.parse(u.targets) : {},
      }));

      res.json({ results: mapped });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/public/compare', async (req, res) => {
    try {
      const u1 = (req.query.u1 as string) || '';
      const u2 = (req.query.u2 as string) || '';

      const p1 = u1 ? await getPublicProfileFromCloud(u1) : null;
      const p2 = u2 ? await getPublicProfileFromCloud(u2) : null;

      if (!p1 && !p2) {
        return res.status(404).json({ error: 'Neither user profile was found or public.' });
      }

      res.json({ user1: p1, user2: p2 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------------- VITE MIDDLEWARE ---------------- //

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JEE 2027 Mission 148 Cloud SQL Server running on http://localhost:${PORT}`);
  });
}

startServer();
