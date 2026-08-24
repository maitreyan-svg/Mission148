import React from 'react';
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
  Clock
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { getExamCountdownDays, getMissionDayInfo } from '../utils/missionDates';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { activeDayNumber, stats, isTimerRunning, timerSeconds } = useMission();

  const examDaysLeft = getExamCountdownDays(activeDayNumber);
  const dayInfo = getMissionDayInfo(activeDayNumber);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const navTabs: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mission_148', label: 'Mission 148', icon: CalendarDays },
    { id: 'daily_tracker', label: 'Daily Tracker', icon: FileCheck2 },
    { id: 'physics', label: 'Physics', icon: Atom, badge: stats?.physics.totalChapters },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, badge: stats?.chemistry.totalChapters },
    { id: 'mathematics', label: 'Mathematics', icon: Calculator, badge: stats?.mathematics.totalChapters },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'mock_tests', label: 'Mock Tests', icon: FileCheck2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'compare', label: 'Compare', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div id="bento-navigation-header" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-4">
      {/* 1. Bento Header Card */}
      <header className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/60 border border-slate-800 rounded-3xl p-4 md:px-6 md:py-4 backdrop-blur-xl shadow-xl gap-4">
        {/* Left: Mission Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30 select-none">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-white leading-none">
                MISSION 148
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300">
                JEE 2027
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-mono tracking-wider">
              Preparation Command • Day {activeDayNumber}/148
            </p>
          </div>
        </div>

        {/* Right: Exam Countdown & User Info Bento Cluster */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 self-start md:self-auto">
          {/* Active Timer Pill if running */}
          {isTimerRunning && (
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs animate-pulse cursor-pointer hover:bg-emerald-900/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TIMER: {formatTimer(timerSeconds)}</span>
            </button>
          )}

          {/* Exam Countdown Block */}
          <div className="text-left md:text-right pl-3 border-l border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
              JEE MAIN EXAM
            </p>
            <p className="text-xs md:text-sm font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>21 JAN 2027 | {examDaysLeft} DAYS LEFT</span>
            </p>
          </div>

          {/* User Account / Profile Badge */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            {isAuthenticated && user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">@{user.username}</p>
                  <p className="text-[10px] font-mono text-emerald-400">
                    {user.isPublic ? 'PUBLIC PROFILE: ON' : 'PRIVATE PROFILE'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  title="Open Profile Settings"
                  className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm transition-all cursor-pointer shadow-inner"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                id="btn-nav-login"
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <UserCircle2 className="w-4 h-4" />
                <span>Log In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Bento Segmented Navigation Bar */}
      <nav 
        id="bento-navigation-bar"
        className="w-full overflow-x-auto custom-scrollbar flex justify-center py-1"
      >
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-xl shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`bento-nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
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
    </div>
  );
};
