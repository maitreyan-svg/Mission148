import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserStats, Chapter, DayLog, DailyTask, TimerSession, MockTest } from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../services/api';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

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

export type SyncStatusType = 'saved' | 'syncing' | 'error' | 'offline';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  stats: UserStats | null;
  isLoading: boolean;
  syncStatus: SyncStatusType;
  lastSyncedAt: string | null;
  login: (identifier: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterParams) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldP: string, newP: string) => Promise<void>;
  resetPassword: (data: { identifier: string; newPassword: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  forceCloudSync: () => Promise<void>;
  exportBackup: () => Promise<void>;
  importBackup: (backupData: any) => Promise<void>;
  setSyncStatus: (status: SyncStatusType) => void;
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
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('saved');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [initialChapters, setInitialChapters] = useState<Chapter[]>([]);
  const [initialDayLogs, setInitialDayLogs] = useState<Record<number, DayLog>>({});
  const [initialTasks, setInitialTasks] = useState<DailyTask[]>([]);
  const [initialTimerSessions, setInitialTimerSessions] = useState<TimerSession[]>([]);
  const [initialMockTests, setInitialMockTests] = useState<MockTest[]>([]);

  const handleStateHydration = (data: {
    user: UserProfile;
    stats: UserStats;
    chapters: Chapter[];
    dayLogs: Record<number, DayLog>;
    tasks: DailyTask[];
    timerSessions: TimerSession[];
    mockTests: MockTest[];
  }) => {
    setUser(data.user);
    setStats(data.stats);
    setInitialChapters(data.chapters || []);
    setInitialDayLogs(data.dayLogs || {});
    setInitialTasks(data.tasks || []);
    setInitialTimerSessions(data.timerSessions || []);
    setInitialMockTests(data.mockTests || []);
    setSyncStatus('saved');
    setLastSyncedAt(new Date().toISOString());
  };

  const refreshUserData = useCallback(async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      setSyncStatus('syncing');
      const data = await api.getCurrentUser();
      handleStateHydration(data);
    } catch (err: any) {
      if (err.message === 'OFFLINE_NETWORK_ERROR') {
        setSyncStatus('offline');
      } else {
        console.warn('Could not refresh remote session, clearing token:', err);
        clearAuthToken();
        setToken(null);
        setUser(null);
        setSyncStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to network online / offline events for cross-device sync
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      refreshUserData();
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshUserData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshUserData]);

  const login = async (identifier: string, pass: string) => {
    setSyncStatus('syncing');
    try {
      const res = await api.login(identifier, pass);
      setAuthToken(res.token);
      setToken(res.token);
      handleStateHydration(res);
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setSyncStatus('syncing');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.loginWithFirebase(idToken);
      setAuthToken(res.token);
      setToken(res.token);
      handleStateHydration(res);
    } catch (err: any) {
      setSyncStatus('error');
      console.error('Google Sign-In Error:', err);
      throw new Error(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const register = async (data: RegisterParams) => {
    setSyncStatus('syncing');
    try {
      const res = await api.register(data);
      setAuthToken(res.token);
      setToken(res.token);
      handleStateHydration(res);
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
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
    setSyncStatus('saved');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setSyncStatus('syncing');
    try {
      const res = await api.updateProfile(data);
      setUser(res.user);
      if (res.stats) setStats(res.stats);
      setSyncStatus('saved');
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      setSyncStatus('error');
      throw err;
    }
  };

  const changePassword = async (oldP: string, newP: string) => {
    await api.changePassword(oldP, newP);
  };

  const resetPassword = async (data: { identifier: string; newPassword: string }) => {
    await api.resetPassword(data);
  };

  const forceCloudSync = async () => {
    if (!token) return;
    setSyncStatus('syncing');
    try {
      const res = await api.getCurrentUser();
      handleStateHydration(res);
    } catch (err: any) {
      if (err.message === 'OFFLINE_NETWORK_ERROR') {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
      }
      throw err;
    }
  };

  const exportBackup = async () => {
    try {
      const backup = await api.exportCloudData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mission148_cloud_backup_${user?.username?.replace('@', '') || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      throw new Error('Failed to export backup data.');
    }
  };

  const importBackup = async (backupData: any) => {
    setSyncStatus('syncing');
    try {
      const res = await api.importCloudData(backupData);
      handleStateHydration(res);
    } catch (err) {
      setSyncStatus('error');
      throw err;
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
        syncStatus,
        lastSyncedAt,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        refreshUserData,
        forceCloudSync,
        exportBackup,
        importBackup,
        setSyncStatus,
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
