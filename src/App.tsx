import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MissionProvider, useMission } from './context/MissionContext';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { Mission148Calendar } from './components/Mission148Calendar';
import { DailyTrackerView } from './components/DailyTrackerView';
import { SubjectDashboardView } from './components/SubjectDashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { MockTestView } from './components/MockTestView';
import { LeaderboardView } from './components/LeaderboardView';
import { CompareUsersView } from './components/CompareUsersView';
import { StudyTimerWidget } from './components/StudyTimerWidget';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AuthModal } from './components/AuthModal';
import { Timer, AlertCircle, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeDayNumber, setActiveDayNumber, isTimerRunning, timerSeconds, timerSubject } = useMission();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [compareTargetUsername, setCompareTargetUsername] = useState<string>('');

  const handleOpenDayTracker = (dayNumber: number) => {
    setActiveDayNumber(dayNumber);
    setActiveTab('daily_tracker');
  };

  const handleCompareWithUser = (username: string) => {
    setCompareTargetUsername(username);
    setActiveTab('compare');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <div className="font-mono text-xs font-bold tracking-widest uppercase">
          INITIALIZING MISSION 148...
        </div>
      </div>
    );
  }

  const formatTimerMinSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top and Navbars */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuthModal={() => setIsAuthModalOpen(true)} 
      />

      {/* Floating Active Timer Pill (Shows on non-timer screens if stopwatch is running) */}
      {isTimerRunning && activeTab !== 'timer' && activeTab !== 'dashboard' && (
        <div 
          onClick={() => setActiveTab('timer')}
          className="fixed bottom-20 right-6 z-40 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform animate-pulse"
        >
          <Timer className="w-4 h-4 fill-slate-950" />
          <span>{timerSubject.toUpperCase()}: {formatTimerMinSec(timerSeconds)}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'mission_148' && (
          <Mission148Calendar onOpenDayTracker={handleOpenDayTracker} />
        )}

        {activeTab === 'daily_tracker' && (
          <DailyTrackerView dayNumber={activeDayNumber} />
        )}

        {activeTab === 'physics' && (
          <SubjectDashboardView subject="physics" />
        )}

        {activeTab === 'chemistry' && (
          <SubjectDashboardView subject="chemistry" />
        )}

        {activeTab === 'mathematics' && (
          <SubjectDashboardView subject="mathematics" />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'mock_tests' && (
          <MockTestView />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView onCompareWithUser={handleCompareWithUser} />
        )}

        {activeTab === 'compare' && (
          <CompareUsersView />
        )}

        {activeTab === 'timer' && (
          <div className="py-4">
            <StudyTimerWidget isFullScreen={true} />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileSettingsView />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-bold tracking-wider">JEE 2027 — MISSION 148</span>
            <span className="text-slate-400">| 148 DAYS. ONE MISSION.</span>
          </div>
          <div>
            <span>DAY 1: 24 AUG 2026 • DAY 148: 18 JAN 2027 • JEE MAIN: 21 JAN 2027</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MissionProvider>
        <MainLayout />
      </MissionProvider>
    </AuthProvider>
  );
}
