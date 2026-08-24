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
import { StudyTimerWidget } from './components/StudyTimerWidget';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { RightSideSlideDrawer } from './components/RightSideSlideDrawer';
import { Timer, CalendarDays, FileCheck2, ChevronLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { activeDayNumber, setActiveDayNumber, isTimerRunning, timerSeconds, timerSubject, dayLogs } = useMission();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Right Slide-Over Drawer State
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'mission_148' | 'daily_tracker'>('mission_148');

  const handleOpenRightDrawer = (tab: 'mission_148' | 'daily_tracker') => {
    setDrawerInitialTab(tab);
    setIsRightDrawerOpen(true);
  };

  const handleOpenDayTracker = (dayNumber: number) => {
    setActiveDayNumber(dayNumber);
    setActiveTab('daily_tracker');
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

  const currentLog = dayLogs[activeDayNumber];
  const isTodayDone = currentLog?.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 relative">
      {/* Top and Navbars */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuthModal={() => setActiveTab('profile')}
        onOpenRightDrawer={handleOpenRightDrawer}
      />

      {/* Floating Right-Side Persistent Slide Access Dock (Always accessible in vertical & landscape modes) */}
      <div 
        id="right-side-floating-dock"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end space-y-2 group"
      >
        {/* Mission 148 Slide Tab Handle */}
        <button
          onClick={() => handleOpenRightDrawer('mission_148')}
          className="flex items-center space-x-2 pl-3 pr-2.5 py-2.5 rounded-l-2xl bg-indigo-950/90 hover:bg-indigo-900 border-y border-l border-indigo-500/50 text-indigo-200 hover:text-white shadow-2xl backdrop-blur-md font-mono text-xs font-bold transition-all transform hover:-translate-x-1.5 cursor-pointer"
          title="Slide open Mission 148 Calendar (Day 1..148)"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <CalendarDays className="w-4 h-4 text-indigo-400" />
          <span className="hidden lg:inline">Mission 148</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            D{activeDayNumber}
          </span>
        </button>

        {/* Daily Tracker Slide Tab Handle */}
        <button
          onClick={() => handleOpenRightDrawer('daily_tracker')}
          className="flex items-center space-x-2 pl-3 pr-2.5 py-2.5 rounded-l-2xl bg-emerald-950/90 hover:bg-emerald-900 border-y border-l border-emerald-500/50 text-emerald-200 hover:text-white shadow-2xl backdrop-blur-md font-mono text-xs font-bold transition-all transform hover:-translate-x-1.5 cursor-pointer"
          title="Slide open Daily Study Tracker & Tasks"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Daily Tracker</span>
          {isTodayDone ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              ✓
            </span>
          ) : currentLog?.actualHours ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {currentLog.actualHours}h
            </span>
          ) : null}
        </button>
      </div>

      {/* Floating Active Timer Pill */}
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 md:py-8">
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

        {activeTab === 'timer' && (
          <div className="py-4">
            <StudyTimerWidget isFullScreen={true} />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileSettingsView />
        )}
      </main>

      {/* Right-Side Slide Drawer Modal */}
      <RightSideSlideDrawer
        isOpen={isRightDrawerOpen}
        onClose={() => setIsRightDrawerOpen(false)}
        initialTab={drawerInitialTab}
        onNavigateFullView={(tab) => {
          setActiveTab(tab);
          setIsRightDrawerOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-5 px-4 text-center text-xs font-mono text-slate-400">
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

