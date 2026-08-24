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

const TOKEN_KEY = 'jee_mission148_cloud_token';
const OFFLINE_QUEUE_KEY = 'jee_mission148_offline_mutations';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Offline Mutation Queue Support
export const getOfflineQueue = (): any[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToOfflineQueue = (mutation: any): void => {
  try {
    const queue = getOfflineQueue();
    queue.push({ ...mutation, queuedAt: new Date().toISOString() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to queue offline mutation:', e);
  }
};

export const clearOfflineQueue = (): void => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (!navigator.onLine || err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error('OFFLINE_NETWORK_ERROR');
    }
    throw err;
  }
}

export const api = {
  // ---------------- AUTHENTICATION & PERSONAL USER ---------------- //

  getPersonalUser: async () => {
    return await request<{ 
      token: string; 
      user: UserProfile; 
      stats: UserStats; 
      chapters: Chapter[]; 
      dayLogs: Record<number, DayLog>; 
      tasks: DailyTask[]; 
      timerSessions: TimerSession[]; 
      mockTests: MockTest[] 
    }>('/api/auth/personal-user');
  },

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
  },

  login: async (identifier: string, password: string) => {
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
  },

  loginWithFirebase: async (idToken: string) => {
    return await request<{ 
      token: string; 
      user: UserProfile; 
      stats: UserStats; 
      chapters: Chapter[]; 
      dayLogs: Record<number, DayLog>; 
      tasks: DailyTask[]; 
      timerSessions: TimerSession[]; 
      mockTests: MockTest[] 
    }>('/api/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  getCurrentUser: async () => {
    return await request<{ 
      user: UserProfile; 
      stats: UserStats; 
      chapters: Chapter[]; 
      dayLogs: Record<number, DayLog>; 
      tasks: DailyTask[]; 
      timerSessions: TimerSession[]; 
      mockTests: MockTest[] 
    }>('/api/auth/me');
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    return await request<{ user: UserProfile; stats: UserStats }>('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return await request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  resetPassword: async (data: { identifier: string; newPassword: string }) => {
    return await request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ---------------- CLOUD FULL SYNCHRONIZATION & BACKUP ---------------- //

  syncFullCloud: async (payload: {
    profile?: Partial<UserProfile>;
    chapters?: Chapter[];
    dayLogs?: Record<number, DayLog> | DayLog[];
    tasks?: DailyTask[];
    timerSessions?: TimerSession[];
    mockTests?: MockTest[];
  }) => {
    return await request<{
      success: boolean;
      user: UserProfile;
      stats: UserStats;
      chapters: Chapter[];
      dayLogs: Record<number, DayLog>;
      tasks: DailyTask[];
      timerSessions: TimerSession[];
      mockTests: MockTest[];
      syncedAt: string;
    }>('/api/cloud/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  exportCloudData: async () => {
    return await request<any>('/api/cloud/export');
  },

  importCloudData: async (backupData: any) => {
    return await request<{
      success: boolean;
      message: string;
      user: UserProfile;
      stats: UserStats;
      chapters: Chapter[];
      dayLogs: Record<number, DayLog>;
      tasks: DailyTask[];
      timerSessions: TimerSession[];
      mockTests: MockTest[];
    }>('/api/cloud/import', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  },

  // ---------------- CHAPTERS ---------------- //

  addChapter: async (chapter: Omit<Chapter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return await request<{ chapter: Chapter; stats: UserStats }>('/api/chapters', {
      method: 'POST',
      body: JSON.stringify(chapter),
    });
  },

  updateChapter: async (id: string, updates: Partial<Chapter>) => {
    return await request<{ chapter: Chapter; stats: UserStats }>(`/api/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteChapter: async (id: string) => {
    return await request<{ success: boolean; stats: UserStats }>(`/api/chapters/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- DAY LOGS & ROUTINE ---------------- //

  saveDayLog: async (dayNumber: number, logData: Partial<DayLog>) => {
    return await request<{ dayLog: DayLog; stats: UserStats }>(`/api/day-logs/${dayNumber}`, {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  // ---------------- TASKS ---------------- //

  saveTask: async (task: Omit<DailyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    return await request<{ task: DailyTask }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  deleteTask: async (id: string) => {
    return await request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- TIMER SESSIONS ---------------- //

  logTimerSession: async (session: Omit<TimerSession, 'id' | 'userId' | 'createdAt'>) => {
    return await request<{ session: TimerSession; stats: UserStats; dayLog?: DayLog }>('/api/timer-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // ---------------- MOCK TESTS ---------------- //

  saveMockTest: async (mockTest: Omit<MockTest, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    return await request<{ mockTest: MockTest }>('/api/mock-tests', {
      method: 'POST',
      body: JSON.stringify(mockTest),
    });
  },

  deleteMockTest: async (id: string) => {
    return await request<{ success: boolean }>(`/api/mock-tests/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- PUBLIC COMMUNITY ---------------- //

  getPublicProfile: async (username: string) => {
    return await request<PublicProfileData>(`/api/public/profile/${encodeURIComponent(username.replace(/^@/, ''))}`);
  },

  getLeaderboard: async (sortBy: string = 'studyHours') => {
    return await request<{ leaderboard: LeaderboardUser[] }>(`/api/public/leaderboard?sortBy=${sortBy}`);
  },

  searchPublicUsers: async (query: string) => {
    return await request<{ results: { name: string; username: string }[] }>(`/api/public/search?q=${encodeURIComponent(query)}`);
  },

  compareUsers: async (u1: string, u2: string) => {
    return await request<{ user1: PublicProfileData | null; user2: PublicProfileData | null }>(`/api/public/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`);
  },
};
