import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserStats, Chapter, DayLog, DailyTask, TimerSession, MockTest } from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

export interface RegisterParams {
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
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  stats: UserStats | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: RegisterParams) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldP: string, newP: string) => Promise<void>;
  resetPassword: (data: { identifier: string; newPassword: string; securityAnswer?: string }) => Promise<void>;
  forgotPassword: (identifier: string) => Promise<{ message: string }>;
  refreshUserData: () => Promise<void>;
  // Initial state payloads to hydrate MissionContext
  initialChapters: Chapter[];
  initialDayLogs: Record<number, DayLog>;
  initialTasks: DailyTask[];
  initialTimerSessions: TimerSession[];
  initialMockTests: MockTest[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [initialChapters, setInitialChapters] = useState<Chapter[]>([]);
  const [initialDayLogs, setInitialDayLogs] = useState<Record<number, DayLog>>({});
  const [initialTasks, setInitialTasks] = useState<DailyTask[]>([]);
  const [initialTimerSessions, setInitialTimerSessions] = useState<TimerSession[]>([]);
  const [initialMockTests, setInitialMockTests] = useState<MockTest[]>([]);

  const refreshUserData = async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getCurrentUser();
      setUser(data.user);
      setStats(data.stats);
      setInitialChapters(data.chapters || []);
      setInitialDayLogs(data.dayLogs || {});
      setInitialTasks(data.tasks || []);
      setInitialTimerSessions(data.timerSessions || []);
      setInitialMockTests(data.mockTests || []);
    } catch (err) {
      console.warn('Could not refresh remote session, checking local storage:', err);
      // If no valid session, clear
      clearAuthToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setStats(res.stats);
    setInitialChapters(res.chapters || []);
    setInitialDayLogs(res.dayLogs || {});
    setInitialTasks(res.tasks || []);
    setInitialTimerSessions(res.timerSessions || []);
    setInitialMockTests(res.mockTests || []);
  };

  const register = async (data: RegisterParams) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setStats(res.stats);
    setInitialChapters(res.chapters || []);
    setInitialDayLogs(res.dayLogs || {});
    setInitialTasks(res.tasks || []);
    setInitialTimerSessions(res.timerSessions || []);
    setInitialMockTests(res.mockTests || []);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
    setStats(null);
    setInitialChapters([]);
    setInitialDayLogs({});
    setInitialTasks([]);
    setInitialTimerSessions([]);
    setInitialMockTests([]);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    if (res.stats) setStats(res.stats);
  };

  const changePassword = async (oldP: string, newP: string) => {
    await api.changePassword(oldP, newP);
  };

  const resetPassword = async (data: { identifier: string; newPassword: string; securityAnswer?: string }) => {
    await api.resetPassword(data);
  };

  const forgotPassword = async (identifier: string) => {
    try {
      return await api.resetPassword({
        identifier,
        newPassword: 'password123',
      });
    } catch {
      return { message: 'If an account exists, instructions or password reset has been configured (default: password123).' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        stats,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        forgotPassword,
        refreshUserData,
        initialChapters,
        initialDayLogs,
        initialTasks,
        initialTimerSessions,
        initialMockTests,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
