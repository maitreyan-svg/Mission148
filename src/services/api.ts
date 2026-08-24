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

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (data: { name: string; username: string; email: string; password: string; securityQuestion?: string; securityAnswer?: string }) => 
    request<{ token: string; user: UserProfile; stats: UserStats; chapters: Chapter[]; dayLogs: Record<number, DayLog>; tasks: DailyTask[]; timerSessions: TimerSession[]; mockTests: MockTest[] }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (identifier: string, password: string) =>
    request<{ token: string; user: UserProfile; stats: UserStats; chapters: Chapter[]; dayLogs: Record<number, DayLog>; tasks: DailyTask[]; timerSessions: TimerSession[]; mockTests: MockTest[] }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  getCurrentUser: () =>
    request<{ user: UserProfile; stats: UserStats; chapters: Chapter[]; dayLogs: Record<number, DayLog>; tasks: DailyTask[]; timerSessions: TimerSession[]; mockTests: MockTest[] }>('/api/auth/me'),

  updateProfile: (data: Partial<UserProfile>) =>
    request<{ user: UserProfile; stats: UserStats }>('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),

  resetPassword: (data: { identifier: string; newPassword: string; securityAnswer?: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chapters
  addChapter: (chapter: Omit<Chapter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    request<{ chapter: Chapter; stats: UserStats }>('/api/chapters', {
      method: 'POST',
      body: JSON.stringify(chapter),
    }),

  updateChapter: (id: string, updates: Partial<Chapter>) =>
    request<{ chapter: Chapter; stats: UserStats }>(`/api/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteChapter: (id: string) =>
    request<{ success: boolean; stats: UserStats }>(`/api/chapters/${id}`, {
      method: 'DELETE',
    }),

  // Day Logs
  saveDayLog: (dayNumber: number, logData: Partial<DayLog>) =>
    request<{ dayLog: DayLog; stats: UserStats }>(`/api/day-logs/${dayNumber}`, {
      method: 'POST',
      body: JSON.stringify(logData),
    }),

  // Tasks
  saveTask: (task: Omit<DailyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) =>
    request<{ task: DailyTask }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  deleteTask: (id: string) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Timer
  logTimerSession: (session: Omit<TimerSession, 'id' | 'userId' | 'createdAt'>) =>
    request<{ session: TimerSession; stats: UserStats; dayLog?: DayLog }>('/api/timer-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    }),

  // Mock Tests
  saveMockTest: (mockTest: Omit<MockTest, 'id' | 'userId' | 'createdAt'> & { id?: string }) =>
    request<{ mockTest: MockTest }>('/api/mock-tests', {
      method: 'POST',
      body: JSON.stringify(mockTest),
    }),

  deleteMockTest: (id: string) =>
    request<{ success: boolean }>(`/api/mock-tests/${id}`, {
      method: 'DELETE',
    }),

  // Public Community
  getPublicProfile: (username: string) =>
    request<PublicProfileData>(`/api/public/profile/${encodeURIComponent(username.replace(/^@/, ''))}`),

  getLeaderboard: (sortBy: string = 'studyHours') =>
    request<{ leaderboard: LeaderboardUser[] }>(`/api/public/leaderboard?sortBy=${sortBy}`),

  searchPublicUsers: (query: string) =>
    request<{ results: { name: string; username: string }[] }>(`/api/public/search?q=${encodeURIComponent(query)}`),

  compareUsers: (u1: string, u2: string) =>
    request<{ user1: PublicProfileData | null; user2: PublicProfileData | null }>(`/api/public/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`),
};
