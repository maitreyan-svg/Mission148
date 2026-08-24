import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Chapter, 
  DayLog, 
  DailyTask, 
  TimerSession, 
  MockTest, 
  UserStats, 
  SubjectType, 
  PYQTracking 
} from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface MissionContextType {
  chapters: Chapter[];
  activeDayNumber: number;
  setActiveDayNumber: (day: number) => void;
  dayLogs: Record<number, DayLog>;
  tasks: DailyTask[];
  timerSessions: TimerSession[];
  mockTests: MockTest[];
  stats: UserStats | null;
  // Timer State
  isTimerRunning: boolean;
  timerSeconds: number;
  timerSubject: SubjectType | 'general';
  setTimerSubject: (s: SubjectType | 'general') => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveTimerSession: (note?: string) => Promise<void>;
  addManualStudyTime: (dayNumber: number, subject: SubjectType | 'general', hours: number, minutes: number) => Promise<void>;
  // Chapter Actions
  addChapter: (subject: SubjectType, name: string, totalLectures?: number) => Promise<Chapter>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  toggleLectureCompleted: (chapterId: string, lectureNum: number) => Promise<void>;
  setChapterPYQ: (chapterId: string, pyq: Partial<PYQTracking>) => Promise<void>;
  toggleShortNotes: (chapterId: string) => Promise<void>;
  adjustRevisionCount: (chapterId: string, delta: number) => Promise<void>;
  // Day Log & Routine Actions
  updateDayLog: (dayNumber: number, data: Partial<DayLog>) => Promise<void>;
  updateMealRoutine: (dayNumber: number, meal: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => Promise<void>;
  updateWaterIntake: (dayNumber: number, deltaMl: number) => Promise<void>;
  // Task Actions
  addDailyTask: (dayNumber: number, subject: SubjectType | 'general', title: string) => Promise<void>;
  toggleDailyTask: (taskId: string) => Promise<void>;
  deleteDailyTask: (taskId: string) => Promise<void>;
  // Mock Test Actions
  addMockTest: (data: Omit<MockTest, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteMockTest: (id: string) => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    stats: authStats, 
    initialChapters, 
    initialDayLogs, 
    initialTasks, 
    initialTimerSessions, 
    initialMockTests,
    setSyncStatus
  } = useAuth();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [dayLogs, setDayLogs] = useState<Record<number, DayLog>>({});
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerSubject, setTimerSubject] = useState<SubjectType | 'general'>('physics');

  // Hydrate from Auth Context
  useEffect(() => {
    setChapters(initialChapters || []);
    setDayLogs(initialDayLogs || {});
    setTasks(initialTasks || []);
    setTimerSessions(initialTimerSessions || []);
    setMockTests(initialMockTests || []);
    if (authStats) {
      setStats(authStats);
    }
  }, [initialChapters, initialDayLogs, initialTasks, initialTimerSessions, initialMockTests, authStats]);

  // Stopwatch Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const saveTimerSession = async (note?: string) => {
    if (timerSeconds < 10) {
      resetTimer();
      return;
    }

    const durationMinutes = Number((timerSeconds / 60).toFixed(1));
    const dayNumber = activeDayNumber;
    const dateStr = `2026-08-${String(23 + dayNumber).padStart(2, '0')}`;

    setSyncStatus('syncing');
    try {
      const res = await api.logTimerSession({
        dayNumber,
        date: dateStr,
        subject: timerSubject,
        durationMinutes,
        notes: note,
      });

      setTimerSessions(prev => [res.session, ...prev]);
      if (res.stats) setStats(res.stats);
      if (res.dayLog) {
        setDayLogs(prev => ({ ...prev, [dayNumber]: res.dayLog! }));
      }

      resetTimer();
      setSyncStatus('saved');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      setSyncStatus('error');
      console.error('Failed to log timer session:', e);
    }
  };

  const addManualStudyTime = async (dayNumber: number, subject: SubjectType | 'general', hours: number, minutes: number) => {
    const totalMinutes = (hours * 60) + minutes;
    if (totalMinutes <= 0) return;

    setSyncStatus('syncing');
    try {
      const dateStr = `2026-08-${String(23 + dayNumber).padStart(2, '0')}`;
      const res = await api.logTimerSession({
        dayNumber,
        date: dateStr,
        subject,
        durationMinutes: totalMinutes,
        notes: 'Manual study time log',
      });

      setTimerSessions(prev => [res.session, ...prev]);
      if (res.stats) setStats(res.stats);
      if (res.dayLog) {
        setDayLogs(prev => ({ ...prev, [dayNumber]: res.dayLog! }));
      }
      setSyncStatus('saved');
    } catch (e) {
      setSyncStatus('error');
      console.error('Failed to add study time:', e);
    }
  };

  // ---------------- CHAPTER CRUD ---------------- //

  const addChapter = async (subject: SubjectType, name: string, totalLectures: number = 10): Promise<Chapter> => {
    const defaultPyq: PYQTracking = {
      isDone: false,
      isDetailed: true,
      total: 100,
      completed: 0,
      correct: 0,
      incorrect: 0
    };

    setSyncStatus('syncing');
    try {
      const res = await api.addChapter({
        subject,
        name: name.trim(),
        totalLectures: Math.max(1, totalLectures),
        completedLectures: [],
        pyq: defaultPyq,
        shortNotesMade: false,
        revisionCount: 0,
        order: chapters.filter(c => c.subject === subject).length + 1
      });

      setChapters(prev => [...prev, res.chapter]);
      if (res.stats) setStats(res.stats);
      setSyncStatus('saved');
      return res.chapter;
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const updateChapter = async (id: string, updates: Partial<Chapter>) => {
    setSyncStatus('syncing');
    try {
      const res = await api.updateChapter(id, updates);
      setChapters(prev => prev.map(c => c.id === id ? res.chapter : c));
      if (res.stats) setStats(res.stats);
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const deleteChapter = async (id: string) => {
    setSyncStatus('syncing');
    try {
      const res = await api.deleteChapter(id);
      setChapters(prev => prev.filter(c => c.id !== id));
      if (res.stats) setStats(res.stats);
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const toggleLectureCompleted = async (chapterId: string, lectureNum: number) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const currentCompleted = ch.completedLectures || [];
    const isCompleted = currentCompleted.includes(lectureNum);
    const newCompleted = isCompleted 
      ? currentCompleted.filter(n => n !== lectureNum)
      : [...currentCompleted, lectureNum].sort((a, b) => a - b);

    await updateChapter(chapterId, { completedLectures: newCompleted });

    if (!isCompleted && newCompleted.length === ch.totalLectures) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }
  };

  const setChapterPYQ = async (chapterId: string, pyqUpdates: Partial<PYQTracking>) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const newPyq: PYQTracking = {
      ...ch.pyq,
      ...pyqUpdates,
    };

    if (pyqUpdates.isDone !== undefined && pyqUpdates.isDone) {
      newPyq.completed = newPyq.total || 100;
    }

    await updateChapter(chapterId, { pyq: newPyq });
  };

  const toggleShortNotes = async (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const newStatus = !ch.shortNotesMade;
    await updateChapter(chapterId, { shortNotesMade: newStatus });
  };

  const adjustRevisionCount = async (chapterId: string, delta: number) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;

    const newCount = Math.max(0, (ch.revisionCount || 0) + delta);
    await updateChapter(chapterId, { revisionCount: newCount });
  };

  // ---------------- DAY LOGS & ROUTINE ---------------- //

  const updateDayLog = async (dayNumber: number, data: Partial<DayLog>) => {
    setSyncStatus('syncing');
    try {
      const res = await api.saveDayLog(dayNumber, data);
      setDayLogs(prev => ({ ...prev, [dayNumber]: res.dayLog }));
      if (res.stats) setStats(res.stats);
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const updateMealRoutine = async (dayNumber: number, meal: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => {
    const existing = dayLogs[dayNumber] || {
      dayNumber,
      date: `2026-08-${String(23 + dayNumber).padStart(2, '0')}`,
      targetHours: user?.targets.dailyStudyHoursGoal || 10,
      actualHours: 0,
      status: 'not_started',
      meals: { breakfast: false, lunch: false, dinner: false },
      waterMl: 0,
      subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
    };

    const newMeals = {
      ...existing.meals,
      [meal]: checked,
    };

    await updateDayLog(dayNumber, { meals: newMeals });
  };

  const updateWaterIntake = async (dayNumber: number, deltaMl: number) => {
    const existing = dayLogs[dayNumber] || {
      dayNumber,
      date: `2026-08-${String(23 + dayNumber).padStart(2, '0')}`,
      targetHours: user?.targets.dailyStudyHoursGoal || 10,
      actualHours: 0,
      status: 'not_started',
      meals: { breakfast: false, lunch: false, dinner: false },
      waterMl: 0,
      subjectHours: { physics: 0, chemistry: 0, mathematics: 0 }
    };

    const newWater = Math.max(0, (existing.waterMl || 0) + deltaMl);
    await updateDayLog(dayNumber, { waterMl: newWater });
  };

  // ---------------- TASKS ---------------- //

  const addDailyTask = async (dayNumber: number, subject: SubjectType | 'general', title: string) => {
    if (!title.trim()) return;
    setSyncStatus('syncing');
    try {
      const res = await api.saveTask({
        dayNumber,
        subject,
        title: title.trim(),
        completed: false,
        order: tasks.filter(t => t.dayNumber === dayNumber).length + 1
      });

      setTasks(prev => [...prev, res.task]);
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const toggleDailyTask = async (taskId: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    const newCompleted = !t.completed;
    setSyncStatus('syncing');
    try {
      const res = await api.saveTask({
        id: taskId,
        dayNumber: t.dayNumber,
        subject: t.subject,
        title: t.title,
        completed: newCompleted,
        order: t.order
      });

      setTasks(prev => prev.map(item => item.id === taskId ? res.task : item));
      setSyncStatus('saved');
      if (newCompleted) {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      }
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const deleteDailyTask = async (taskId: string) => {
    setSyncStatus('syncing');
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  // ---------------- MOCK TESTS ---------------- //

  const addMockTest = async (data: Omit<MockTest, 'id' | 'userId' | 'createdAt'>) => {
    setSyncStatus('syncing');
    try {
      const res = await api.saveMockTest(data);
      setMockTests(prev => [res.mockTest, ...prev]);
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const deleteMockTest = async (id: string) => {
    setSyncStatus('syncing');
    try {
      await api.deleteMockTest(id);
      setMockTests(prev => prev.filter(m => m.id !== id));
      setSyncStatus('saved');
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  return (
    <MissionContext.Provider
      value={{
        chapters,
        activeDayNumber,
        setActiveDayNumber,
        dayLogs,
        tasks,
        timerSessions,
        mockTests,
        stats,
        isTimerRunning,
        timerSeconds,
        timerSubject,
        setTimerSubject,
        startTimer,
        pauseTimer,
        resetTimer,
        saveTimerSession,
        addManualStudyTime,
        addChapter,
        updateChapter,
        deleteChapter,
        toggleLectureCompleted,
        setChapterPYQ,
        toggleShortNotes,
        adjustRevisionCount,
        updateDayLog,
        updateMealRoutine,
        updateWaterIntake,
        addDailyTask,
        toggleDailyTask,
        deleteDailyTask,
        addMockTest,
        deleteMockTest,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
