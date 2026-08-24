import React, { useState } from 'react';
import { 
  Atom, 
  FlaskConical, 
  Calculator, 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Target,
  BarChart3,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { SubjectType, ActiveTab, Chapter } from '../types';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { MissionHeader } from './MissionHeader';
import { StudyTimerWidget } from './StudyTimerWidget';
import { DailyTasksWidget } from './DailyTasksWidget';
import { DailyRoutineWidget } from './DailyRoutineWidget';
import { AddChapterModal } from './AddChapterModal';
import { EditChapterModal } from './EditChapterModal';
import { ChapterCard } from './ChapterCard';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { 
    activeDayNumber, 
    chapters, 
    stats, 
    dayLogs 
  } = useMission();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addSubject, setAddSubject] = useState<SubjectType>('physics');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const physicsChapters = chapters.filter(c => c.subject === 'physics');
  const chemistryChapters = chapters.filter(c => c.subject === 'chemistry');
  const mathChapters = chapters.filter(c => c.subject === 'mathematics');

  const currentLog = dayLogs[activeDayNumber];
  const targetHours = user?.targets?.dailyStudyHoursGoal || 10;
  const actualHours = currentLog?.actualHours || 0;
  const targetWater = user?.targets?.dailyWaterGoalMl || 3000;
  const waterMl = currentLog?.waterMl || 0;
  const mealsLogged = currentLog?.meals ? [currentLog.meals.breakfast, currentLog.meals.lunch, currentLog.meals.dinner].filter(Boolean).length : 0;

  // Past 7 days calculation for Bento velocity bar graph
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const recentDays = [1, 2, 3, 4, 5, 6, 7].map((offset, index) => {
    const dayNum = Math.max(1, activeDayNumber - 6 + index);
    const log = dayLogs[dayNum];
    const hrs = log?.actualHours || 0;
    const heightPercent = Math.min(100, Math.max(15, Math.round((hrs / targetHours) * 90)));
    return {
      dayNum,
      label: weekDays[index % 7],
      hours: hrs,
      heightPercent,
      isCurrentDay: dayNum === activeDayNumber
    };
  });

  const subjectCards: {
    id: SubjectType;
    tab: ActiveTab;
    title: string;
    symbol: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    chapters: Chapter[];
    stats: any;
  }[] = [
    {
      id: 'physics',
      tab: 'physics',
      title: 'PHYSICS',
      symbol: '⚛',
      icon: Atom,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 hover:bg-blue-500/15',
      border: 'border-blue-500/30',
      chapters: physicsChapters,
      stats: stats?.physics,
    },
    {
      id: 'chemistry',
      tab: 'chemistry',
      title: 'CHEMISTRY',
      symbol: '🧪',
      icon: FlaskConical,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
      border: 'border-emerald-500/30',
      chapters: chemistryChapters,
      stats: stats?.chemistry,
    },
    {
      id: 'mathematics',
      tab: 'mathematics',
      title: 'MATH',
      symbol: '📐',
      icon: Calculator,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
      border: 'border-indigo-500/30',
      chapters: mathChapters,
      stats: stats?.mathematics,
    },
  ];

  return (
    <div id="mission-dashboard-view" className="space-y-6">
      {/* 1. Bento Header Row: Timeline, Targets, and Streak */}
      <MissionHeader />

      {/* 2. Bento Secondary Grid: Three Subjects, Analytics, and Add Chapter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 3 Core Subject Bento Cards */}
        {subjectCards.map((subj) => {
          const chCount = subj.chapters.length;
          const compCount = subj.stats?.completedChapters || 0;
          const lecCount = subj.stats?.completedLectures || 0;
          const totalLec = subj.stats?.totalLectures || 0;
          const pyqCount = subj.stats?.completedPYQs || 0;
          const lecProgress = totalLec > 0 ? Math.min(100, Math.round((lecCount / totalLec) * 100)) : (chCount > 0 ? 30 : 0);

          return (
            <div
              key={subj.id}
              id={`bento-subject-card-${subj.id}`}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-slate-700"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 ${subj.bg} ${subj.color} border ${subj.border} rounded-xl text-xs font-mono font-bold uppercase tracking-wider`}>
                  {subj.title}
                </span>
                <span className="text-2xl">{subj.symbol}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black font-mono text-white">
                    {String(chCount).padStart(2, '0')} <span className="text-slate-500 text-sm font-normal">Chapters</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Lectures Completed</span>
                    <span className="text-white font-bold">{lecCount}/{totalLec || (chCount * 8)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${subj.id === 'physics' ? 'bg-blue-500' : subj.id === 'chemistry' ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full transition-all duration-500`} 
                      style={{ width: `${lecProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                  <span>Solved PYQs:</span>
                  <span className="font-bold text-white">{pyqCount} Completed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setAddSubject(subj.id);
                    setIsAddModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+ Chapter</span>
                </button>
                <button
                  onClick={() => onNavigateTab(subj.tab)}
                  className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bento Analytics & Add Chapter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preparation Analytics Bar Chart (Col Span 2) */}
        <div 
          id="bento-analytics-card"
          className="col-span-1 md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono">
              Preparation Analytics & Velocity
            </h2>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11px] font-mono text-slate-300">
                Total Hours: <span className="text-indigo-300 font-bold">{stats?.totalStudyHours ? stats.totalStudyHours.toFixed(1) : '0'}h</span>
              </div>
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11px] font-mono text-slate-300">
                PYQs: <span className="text-emerald-300 font-bold">{stats?.totalPYQsCompleted || 0}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Velocity Bar Graph */}
          <div className="flex items-end justify-between h-28 gap-2 px-2">
            {recentDays.map((d) => (
              <div key={d.dayNum} className="w-full flex flex-col items-center gap-2 h-full justify-end">
                <div 
                  className={`w-full rounded-t-xl transition-all relative group cursor-pointer ${
                    d.isCurrentDay 
                      ? 'bg-indigo-500 shadow-md shadow-indigo-500/30' 
                      : d.hours > 0 ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800/80 hover:bg-slate-700'
                  }`}
                  style={{ height: `${d.heightPercent}%` }}
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {d.hours > 0 ? `${d.hours.toFixed(1)}h` : 'Day ' + d.dayNum}
                  </div>
                </div>
                <span className={`text-[11px] font-mono font-bold ${d.isCurrentDay ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-4 mt-2 border-t border-slate-800/80">
            <span>7-Day Study Trend</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Analytics Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Add Chapter Direct Bento Action (Col Span 1) */}
        <div 
          id="bento-add-chapter-action"
          onClick={() => {
            setAddSubject('physics');
            setIsAddModalOpen(true);
          }}
          className="col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-3xl p-6 flex flex-col justify-center items-center text-center cursor-pointer shadow-xl shadow-indigo-600/20 border border-indigo-400/30 transition-all duration-200 group"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 text-3xl font-light text-white group-hover:scale-110 transition-transform">
            +
          </div>
          <p className="text-base font-black text-white uppercase tracking-wider font-mono">
            Add Chapter
          </p>
          <p className="text-xs text-indigo-100/90 mt-1 font-mono">
            Update Preparation Mission
          </p>
        </div>
      </div>

      {/* 4. Core Widgets Bento Layout: Study Timer, Routine, and Daily Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Timer & Routine) */}
        <div className="lg:col-span-7 space-y-6">
          <StudyTimerWidget />
          <DailyRoutineWidget dayNumber={activeDayNumber} />
        </div>

        {/* Right Column (Tasks & Mission Record Quick Banner) */}
        <div className="lg:col-span-5 space-y-6">
          <DailyTasksWidget dayNumber={activeDayNumber} />

          {/* Quick Action / Day Tracker Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Mission Day {activeDayNumber} Tracker</span>
              </span>
              <button
                onClick={() => onNavigateTab('daily_tracker')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Full Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Log today's lecture completion checkboxes, exact PYQs, short notes status, and strategy reflection.
            </p>

            <button
              onClick={() => onNavigateTab('daily_tracker')}
              className="w-full py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Open Day {activeDayNumber} Full Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Active Chapters List */}
      {chapters.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                Active Chapter Syllabus & Progress
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {chapters.length} total chapters configured
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.slice(0, 4).map((ch) => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                onEdit={(chap) => setEditingChapter(chap)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSubject={addSubject}
      />

      <EditChapterModal
        isOpen={!!editingChapter}
        chapter={editingChapter}
        onClose={() => setEditingChapter(null)}
      />
    </div>
  );
};
