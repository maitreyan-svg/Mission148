import React, { useRef } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Atom, 
  FlaskConical, 
  Calculator, 
  BarChart3, 
  Users, 
  Trophy, 
  Timer,
  FileCheck2,
  LogOut,
  UserCircle2,
  Sparkles,
  Flame,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { getExamCountdownDays, getMissionDayInfo } from '../utils/missionDates';
import { SyncStatusBadge } from './SyncStatusBadge';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: () => void;
  onOpenRightDrawer: (tab: 'mission_148' | 'daily_tracker') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenRightDrawer,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { activeDayNumber, stats, isTimerRunning, timerSeconds, dayLogs } = useMission();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const examDaysLeft = getExamCountdownDays(activeDayNumber);
  const dayInfo = getMissionDayInfo(activeDayNumber);
  const currentDayLog = dayLogs[activeDayNumber];
  const isTodayCompleted = currentDayLog?.status === 'completed';

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const navTabs: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'physics', label: 'Physics', icon: Atom, badge: stats?.physics.totalChapters },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, badge: stats?.chemistry.totalChapters },
    { id: 'mathematics', label: 'Mathematics', icon: Calculator, badge: stats?.mathematics.totalChapters },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'mock_tests', label: 'Mock Tests', icon: FileCheck2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div id="bento-navigation-header" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-2 space-y-3">
      {/* 1. Bento Header Card */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between bg-slate-900/70 border border-slate-800 rounded-3xl p-3.5 sm:px-5 sm:py-3.5 backdrop-blur-xl shadow-xl gap-3.5">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center justify-between gap-3">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black tracking-tight text-white leading-none">
                  MISSION 148
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300">
                  JEE 2027
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider">
                Day {activeDayNumber}/148 • {dayInfo.formattedDate}
              </p>
            </div>
          </div>

          {/* Mobile Right Drawer Quick Action Toggle */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={() => onOpenRightDrawer('mission_148')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] font-bold flex items-center space-x-1 cursor-pointer active:scale-95 transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>D{activeDayNumber}</span>
            </button>
            <button
              onClick={() => onOpenRightDrawer('daily_tracker')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold flex items-center space-x-1 cursor-pointer active:scale-95 transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tracker</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Slide Access Cluster for Mission 148 & Daily Tracker + Countdown + Account */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 sm:gap-4">
          
          {/* Dedicated Right-Side Slide-Out Buttons (Desktop / Tablet) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
            {/* Mission 148 Slide Trigger */}
            <button
              id="btn-nav-slide-mission148"
              onClick={() => onOpenRightDrawer('mission_148')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/30 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer group"
              title="Slide open Mission 148 148-Day Calendar"
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Mission 148</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Day {activeDayNumber}
              </span>
            </button>

            {/* Daily Tracker Slide Trigger */}
            <button
              id="btn-nav-slide-dailytracker"
              onClick={() => onOpenRightDrawer('daily_tracker')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/30 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer group"
              title="Slide open Daily Study Tracker & Checklist"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Daily Tracker</span>
              {isTodayCompleted ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Done
                </span>
              ) : currentDayLog?.actualHours ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  {currentDayLog.actualHours}h
                </span>
              ) : null}
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Active Timer Pill if stopwatch running */}
          {isTimerRunning && (
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs animate-pulse cursor-pointer hover:bg-emerald-900/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{formatTimer(timerSeconds)}</span>
            </button>
          )}

          {/* Exam Countdown Block */}
          <div className="hidden sm:block text-right pl-3 border-l border-slate-800">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono leading-tight">
              JEE MAIN 2027
            </p>
            <p className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1 leading-tight mt-0.5">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{examDaysLeft} DAYS</span>
            </p>
          </div>

          {/* Personal Username Badge */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <button
              onClick={() => setActiveTab('profile')}
              title="Personal Settings & Custom Username"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all cursor-pointer shadow-sm group"
            >
              <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-white">
                {user?.username || '@aspirant2027'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Bento Streamlined Navigation Ribbon with Smooth Horizontal Sliding */}
      <div className="relative flex items-center">
        {/* Scroll Left Button for small screens / landscape */}
        <button
          onClick={() => scrollNav('left')}
          aria-label="Scroll navigation left"
          className="absolute left-0 z-10 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white shadow-lg backdrop-blur-md hidden sm:flex items-center justify-center -ml-2 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <nav 
          ref={scrollContainerRef}
          id="bento-navigation-bar"
          className="w-full overflow-x-auto custom-scrollbar flex items-center gap-1.5 py-1 px-1 sm:px-4"
        >
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1 flex items-center gap-1 shadow-2xl backdrop-blur-xl shrink-0 mx-auto">
            {/* Quick access tab for Mission 148 */}
            <button
              onClick={() => onOpenRightDrawer('mission_148')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'mission_148'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/40'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Mission 148</span>
              <span className="text-[10px] px-1 rounded bg-indigo-500/20 text-indigo-300">
                148d
              </span>
            </button>

            {/* Quick access tab for Daily Tracker */}
            <button
              onClick={() => onOpenRightDrawer('daily_tracker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'daily_tracker'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Daily Tracker</span>
            </button>

            <span className="w-px h-5 bg-slate-800 mx-1" />

            {/* Subject and Module Tabs */}
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`bento-nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Scroll Right Button for small screens / landscape */}
        <button
          onClick={() => scrollNav('right')}
          aria-label="Scroll navigation right"
          className="absolute right-0 z-10 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white shadow-lg backdrop-blur-md hidden sm:flex items-center justify-center -mr-2 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

