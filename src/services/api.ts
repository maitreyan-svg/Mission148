import { 
  UserProfile, 
  Chapter, 
  DayLog, 
  DailyTask, 
  TimerSession, 
  MockTest,
  UserStats,
  PublicProfileData,
  LeaderboardUser 
} from '../types';
import { localDb } from './localDb';

const TOKEN_KEY = 'jee_mission148_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // If server returned 404 (e.g. static hosting without Express backend), throw specific 404
    if (response.status === 404) {
      throw new Error('API_404');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    // If it's a 404 or fetch network error, throw special error to trigger local fallback
    if (err.message === 'API_404' || err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
      throw new Error('API_UNAVAILABLE');
    }
    throw err;
  }
}

export const api = {
  // Auth
  register: async (data: { 
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
    try {
      return await request<{ 
        token: string; 
        user: UserProfile; 
        stats: UserStats; 
        chapters: Chapter[]; 
        dayLogs: Record<number, DayLog>; 
        tasks: DailyTask[]; 
        timerSessions: TimerSession[]; 
        mockTests: MockTest[] 
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const res = localDb.registerUser(data);
        return res;
      }
      throw err;
    }
  },

  login: async (identifier: string, password: string) => {
    try {
      return await request<{ 
        token: string; 
        user: UserProfile; 
        stats: UserStats; 
        chapters: Chapter[]; 
        dayLogs: Record<number, DayLog>; 
        tasks: DailyTask[]; 
        timerSessions: TimerSession[]; 
        mockTests: MockTest[] 
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const res = localDb.loginUser(identifier, password);
        return res;
      }
      throw err;
    }
  },

  getCurrentUser: async () => {
    try {
      return await request<{ 
        user: UserProfile; 
        stats: UserStats; 
        chapters: Chapter[]; 
        dayLogs: Record<number, DayLog>; 
        tasks: DailyTask[]; 
        timerSessions: TimerSession[]; 
        mockTests: MockTest[] 
      }>('/api/auth/me');
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || 'demo_token';
        return localDb.getCurrentUser(token);
      }
      throw err;
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    try {
      return await request<{ user: UserProfile; stats: UserStats }>('/api/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.updateProfile(token, data);
      }
      throw err;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      return await request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.changePassword(token, oldPassword, newPassword);
      }
      throw err;
    }
  },

  resetPassword: async (data: { identifier: string; newPassword: string; securityAnswer?: string }) => {
    try {
      return await request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        return localDb.resetPassword(data.identifier, data.newPassword);
      }
      throw err;
    }
  },

  // Chapters
  addChapter: async (chapter: Omit<Chapter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await request<{ chapter: Chapter; stats: UserStats }>('/api/chapters', {
        method: 'POST',
        body: JSON.stringify(chapter),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.addChapter(token, chapter);
      }
      throw err;
    }
  },

  updateChapter: async (id: string, updates: Partial<Chapter>) => {
    try {
      return await request<{ chapter: Chapter; stats: UserStats }>(`/api/chapters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.updateChapter(token, id, updates);
      }
      throw err;
    }
  },

  deleteChapter: async (id: string) => {
    try {
      return await request<{ success: boolean; stats: UserStats }>(`/api/chapters/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.deleteChapter(token, id);
      }
      throw err;
    }
  },

  // Day Logs
  saveDayLog: async (dayNumber: number, logData: Partial<DayLog>) => {
    try {
      return await request<{ dayLog: DayLog; stats: UserStats }>(`/api/day-logs/${dayNumber}`, {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.saveDayLog(token, dayNumber, logData);
      }
      throw err;
    }
  },

  // Tasks
  saveTask: async (task: Omit<DailyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    try {
      return await request<{ task: DailyTask }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.saveTask(token, task);
      }
      throw err;
    }
  },

  deleteTask: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.deleteTask(token, id);
      }
      throw err;
    }
  },

  // Timer
  logTimerSession: async (session: Omit<TimerSession, 'id' | 'userId' | 'createdAt'>) => {
    try {
      return await request<{ session: TimerSession; stats: UserStats; dayLog?: DayLog }>('/api/timer-sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.logTimerSession(token, session);
      }
      throw err;
    }
  },

  // Mock Tests
  saveMockTest: async (mockTest: Omit<MockTest, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    try {
      return await request<{ mockTest: MockTest }>('/api/mock-tests', {
        method: 'POST',
        body: JSON.stringify(mockTest),
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.saveMockTest(token, mockTest);
      }
      throw err;
    }
  },

  deleteMockTest: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/mock-tests/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        const token = getAuthToken() || '';
        return localDb.deleteMockTest(token, id);
      }
      throw err;
    }
  },

  // Public Community
  getPublicProfile: async (username: string) => {
    try {
      return await request<PublicProfileData>(`/api/public/profile/${encodeURIComponent(username.replace(/^@/, ''))}`);
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        return localDb.getPublicProfile(username);
      }
      throw err;
    }
  },

  getLeaderboard: async (sortBy: string = 'studyHours') => {
    try {
      return await request<{ leaderboard: LeaderboardUser[] }>(`/api/public/leaderboard?sortBy=${sortBy}`);
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        return localDb.getLeaderboard(sortBy);
      }
      throw err;
    }
  },

  searchPublicUsers: async (query: string) => {
    try {
      return await request<{ results: { name: string; username: string }[] }>(`/api/public/search?q=${encodeURIComponent(query)}`);
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        return localDb.searchPublicUsers(query);
      }
      throw err;
    }
  },

  compareUsers: async (u1: string, u2: string) => {
    try {
      return await request<{ user1: PublicProfileData | null; user2: PublicProfileData | null }>(`/api/public/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`);
    } catch (err: any) {
      if (err.message === 'API_UNAVAILABLE') {
        return localDb.compareUsers(u1, u2);
      }
      throw err;
    }
  },
};
