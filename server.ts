import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  registerUser,
  loginUser,
  verifyToken,
  getUserFullRecord,
  updateUserProfile,
  changePassword,
  resetPassword,
  calculateUserStats,
  addChapter,
  updateChapter,
  deleteChapter,
  saveDayLog,
  saveTask,
  deleteTask,
  logTimerSession,
  saveMockTest,
  deleteMockTest,
  getPublicProfile,
  getPublicLeaderboard,
  searchPublicUsers,
  sanitizeUsername
} from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Auth Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (!userId) {
      res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
      return;
    }

    (req as any).userId = userId;
    next();
  };

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ---------------- AUTH ROUTES ---------------- //

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, username, email, password, securityQuestion, securityAnswer } = req.body;
      if (!name || !username || !email || !password) {
        return res.status(400).json({ error: 'Name, username, email, and password are required.' });
      }

      const result = registerUser({
        name,
        username,
        email,
        password,
        securityQuestion,
        securityAnswer,
      });

      const userRecord = getUserFullRecord(result.user.id);
      const stats = userRecord ? calculateUserStats(userRecord) : null;

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

  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required.' });
      }

      const result = loginUser(identifier, password);
      const userRecord = getUserFullRecord(result.user.id);
      const stats = userRecord ? calculateUserStats(userRecord) : null;

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

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const userRecord = getUserFullRecord(userId);
    if (!userRecord) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    const stats = calculateUserStats(userRecord);
    res.json({
      user: userRecord.profile,
      stats,
      chapters: userRecord.chapters || [],
      dayLogs: userRecord.dayLogs || {},
      tasks: userRecord.tasks || [],
      timerSessions: userRecord.timerSessions || [],
      mockTests: userRecord.mockTests || [],
    });
  });

  app.post('/api/auth/update-profile', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const updated = updateUserProfile(userId, req.body);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.json({ user: updated, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/change-password', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }
      changePassword(userId, oldPassword, newPassword);
      res.json({ message: 'Password changed successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { identifier, newPassword, securityAnswer } = req.body;
      if (!identifier || !newPassword) {
        return res.status(400).json({ error: 'Identifier and new password are required.' });
      }
      resetPassword(identifier, newPassword, securityAnswer);
      res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- CHAPTER TRACKING ROUTES ---------------- //

  app.post('/api/chapters', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const chapter = addChapter(userId, req.body);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.status(201).json({ chapter, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/chapters/:id', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const chapter = updateChapter(userId, req.params.id, req.body);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.json({ chapter, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/chapters/:id', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      deleteChapter(userId, req.params.id);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- DAILY LOGS & ROUTINE ---------------- //

  app.post('/api/day-logs/:dayNumber', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const dayNum = parseInt(req.params.dayNumber, 10);
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 148) {
        return res.status(400).json({ error: 'Day number must be between 1 and 148.' });
      }

      const dayLog = saveDayLog(userId, dayNum, req.body);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.json({ dayLog, stats });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- DAILY TASKS ---------------- //

  app.post('/api/tasks', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const task = saveTask(userId, req.body);
      res.json({ task });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      deleteTask(userId, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- TIMER SESSIONS ---------------- //

  app.post('/api/timer-sessions', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const session = logTimerSession(userId, req.body);
      const userRecord = getUserFullRecord(userId);
      const stats = userRecord ? calculateUserStats(userRecord) : null;
      res.status(201).json({ session, stats, dayLog: userRecord?.dayLogs[session.dayNumber] });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- MOCK TESTS ---------------- //

  app.post('/api/mock-tests', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      const mockTest = saveMockTest(userId, req.body);
      res.status(201).json({ mockTest });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/mock-tests/:id', requireAuth, (req, res) => {
    try {
      const userId = (req as any).userId;
      deleteMockTest(userId, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- PUBLIC PROFILES & LEADERBOARD ---------------- //

  app.get('/api/public/profile/:username', (req, res) => {
    const rawUsername = req.params.username;
    const profile = getPublicProfile(rawUsername);
    if (!profile) {
      return res.status(404).json({ error: 'Public profile not found or set to private.' });
    }
    res.json(profile);
  });

  app.get('/api/public/leaderboard', (req, res) => {
    const sortBy = (req.query.sortBy as string) || 'studyHours';
    const leaderboard = getPublicLeaderboard(sortBy);
    res.json({ leaderboard });
  });

  app.get('/api/public/search', (req, res) => {
    const query = (req.query.q as string) || '';
    const results = searchPublicUsers(query);
    res.json({ results });
  });

  app.get('/api/public/compare', (req, res) => {
    const u1 = (req.query.u1 as string) || '';
    const u2 = (req.query.u2 as string) || '';

    const p1 = u1 ? getPublicProfile(u1) : null;
    const p2 = u2 ? getPublicProfile(u2) : null;

    if (!p1 && !p2) {
      return res.status(404).json({ error: 'Neither user profile was found or public.' });
    }

    res.json({ user1: p1, user2: p2 });
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
    console.log(`JEE 2027 Mission 148 Server running on http://localhost:${PORT}`);
  });
}

startServer();
