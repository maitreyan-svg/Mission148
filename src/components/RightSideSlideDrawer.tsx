import React, { useState, useEffect } from 'react';
import { 
  X, 
  CalendarDays, 
  FileCheck2, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Droplet, 
  Utensils, 
  Save, 
  BookOpen,
  CheckSquare,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { getMissionDayInfo, TOTAL_MISSION_DAYS } from '../utils/missionDates';
import { ActiveTab, DayStatus, DayLog } from '../types';
import { DailyTasksWidget } from './DailyTasksWidget';
import { DailyRoutineWidget } from './DailyRoutineWidget';

interface RightSideSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'mission_148' | 'daily_tracker';
  onNavigateFullView: (tab: ActiveTab) => void;
}

export const RightSideSlideDrawer: React.FC<RightSideSlideDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'mission_148',
  onNavigateFullView,
}) => {
  const { user } = useAuth();
  const { 
    activeDayNumber, 
    setActiveDayNumber, 
    dayLogs, 
    updateDayLog,
    stats,
    chapters
  } = useMission();

  const [activeDrawerTab, setActiveDrawerTab] = useState<'mission_148' | 'daily_tracker'>(initialTab);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Sync drawer tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveDrawerTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Current active day log
  const dayInfo = getMissionDayInfo(activeDayNumber);
  const currentLog = dayLogs[activeDayNumber] || {
    dayNumber: activeDayNumber,
    date: dayInfo.dateStr,
    targetHours: user?.targets?.dailyStudyHoursGoal || 10,
    actualHours: 0,
    status: 'not_started' as DayStatus,
    notes: '',
    meals: { breakfast: false, lunch: false, dinner: false },
    waterMl: 0,
    subjectHours: { physics: 0, chemistry: 0, mathematics: 0 },
    lecturesCompletedCount: 0,
    pyqsCompletedCount: 0,
    revisionsLoggedCount: 0,
    shortNotesLoggedCount: 0,
  };

  const [status, setStatus] = useState<DayStatus>(currentLog.status);
  const [studyHours, setStudyHours] = useState<number>(currentLog.actualHours || 0);
  const [notes, setNotes] = useState<string>(currentLog.notes || '');

  // Keep local fields in sync when activeDayNumber changes
  useEffect(() => {
    const log = dayLogs[activeDayNumber];
    if (log) {
      setStatus(log.status);
      setStudyHours(log.actualHours || 0);
      setNotes(log.notes || '');
    } else {
      setStatus('not_started');
      setStudyHours(0);
      setNotes('');
    }
  }, [activeDayNumber, dayLogs]);

  const handleSaveDayLog = async () => {
    await updateDayLog(activeDayNumber, {
      status,
      actualHours: Number(studyHours) || 0,
      notes,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Days list for calendar
  const allDays = Array.from({ length: TOTAL_MISSION_DAYS }, (_, i) => i + 1);
  const filteredDays = allDays.filter((day) => {
    const log = dayLogs[day];
    const s = log ? log.status : 'not_started';
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return s === 'completed';
    if (filterStatus === 'in_progress') return s === 'in_progress';
    if (filterStatus === 'missed') return s === 'missed';
    if (filterStatus === 'not_started') return s === 'not_started';
    return true;
  });

  const logsArray = Object.values(dayLogs) as DayLog[];
  const completedCount = logsArray.filter(l => l && l.status === 'completed').length;
  const inProgressCount = logsArray.filter(l => l && l.status === 'in_progress').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div 
        id="right-side-slide-drawer"
        className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10"
      >
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* 1. Header Bar */}
          <div className="p-4 sm:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shrink-0 flex items-center justify-between gap-3">
            {/* Drawer Tab Switcher */}
            <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                id="drawer-tab-mission"
                onClick={() => setActiveDrawerTab('mission_148')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeDrawerTab === 'mission_148'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Mission 148</span>
              </button>

              <button
                id="drawer-tab-tracker"
                onClick={() => setActiveDrawerTab('daily_tracker')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeDrawerTab === 'daily_tracker'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Daily Tracker</span>
              </button>
            </div>

            {/* Actions: Maximize to Full View & Close */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onNavigateFullView(activeDrawerTab);
                  onClose();
                }}
                title="Open Full Screen View"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Page</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Drawer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            
            {/* ======================================================== */}
            {/* TAB 1: MISSION 148 (CALENDAR & TIMELINE QUICK DRAWER) */}
            {/* ======================================================== */}
            {activeDrawerTab === 'mission_148' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Mission Status Header Card */}
                <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">
                          148-Day Mission Roadmap
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white font-mono mt-1">
                        DAY {activeDayNumber} <span className="text-slate-500 text-base font-normal">/ 148</span>
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {dayInfo.formattedDate} • {dayInfo.daysRemainingInMission} Days to Go
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-cyan-400 font-bold block">
                        {completedCount} Completed
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">
                        {inProgressCount} In Progress
                      </span>
                    </div>
                  </div>

                  {/* Quick Filter Pill Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-3 border-t border-slate-800/80">
                    {[
                      { id: 'all', label: 'All (148)' },
                      { id: 'completed', label: `Done (${completedCount})` },
                      { id: 'in_progress', label: `Active (${inProgressCount})` },
                      { id: 'not_started', label: 'Remaining' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          filterStatus === f.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 148-Day Quick Calendar Matrix */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="text-slate-400">Select any day to view or edit:</span>
                    <span className="text-indigo-400 font-bold">Showing {filteredDays.length} days</span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {filteredDays.map((day) => {
                      const log = dayLogs[day];
                      const dayStatus = log ? log.status : 'not_started';
                      const isSelected = day === activeDayNumber;

                      let statusClass = 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700';
                      if (dayStatus === 'completed') {
                        statusClass = 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold';
                      } else if (dayStatus === 'in_progress') {
                        statusClass = 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold';
                      } else if (dayStatus === 'missed') {
                        statusClass = 'bg-rose-950/50 border-rose-800/50 text-rose-400';
                      }

                      if (isSelected) {
                        statusClass += ' ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-105';
                      }

                      return (
                        <button
                          key={`drawer-day-${day}`}
                          onClick={() => {
                            setActiveDayNumber(day);
                            setActiveDrawerTab('daily_tracker');
                          }}
                          className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer ${statusClass}`}
                          title={`Day ${day} (${dayStatus})`}
                        >
                          <span className="text-[11px] leading-tight">D{day}</span>
                          {log?.actualHours ? (
                            <span className="text-[9px] opacity-80">{log.actualHours}h</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Open Full Calendar Button */}
                <button
                  onClick={() => {
                    onNavigateFullView('mission_148');
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Open Full 148-Day Calendar View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: DAILY TRACKER (LOGGING, TASKS & ROUTINE DRAWER) */}
            {/* ======================================================== */}
            {activeDrawerTab === 'daily_tracker' && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Day Navigator Subheader */}
                <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <button
                    onClick={() => setActiveDayNumber(Math.max(1, activeDayNumber - 1))}
                    disabled={activeDayNumber <= 1}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <div className="text-base font-black font-mono text-white">
                      DAY {activeDayNumber} OF 148
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {dayInfo.formattedDate}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveDayNumber(Math.min(TOTAL_MISSION_DAYS, activeDayNumber + 1))}
                    disabled={activeDayNumber >= TOTAL_MISSION_DAYS}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Day Log Card */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Study Hours & Status</span>
                    </span>
                    
                    {/* Status Badge Selection */}
                    <div className="flex items-center space-x-1">
                      {(['completed', 'in_progress', 'missed'] as DayStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                            status === st
                              ? st === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : st === 'in_progress'
                                ? 'bg-amber-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours Stepper Input */}
                  <div className="grid grid-cols-2 gap-3 items-center bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Logged Hours</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={studyHours}
                          onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="font-mono text-xs text-slate-400">hours</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {[+1, +2, +3, +5].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => setStudyHours((prev) => Math.min(24, Math.max(0, prev + delta)))}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-300 rounded-lg cursor-pointer"
                        >
                          +{delta}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Day Log Notes & Retrospective:
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Solved 35 Kinematics PYQs, revised Redox reactions..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Save Log Button */}
                  <button
                    onClick={handleSaveDayLog}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black font-mono text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Day {activeDayNumber} Log</span>
                  </button>

                  {saveToast && (
                    <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono text-center flex items-center justify-center space-x-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Day {activeDayNumber} logged successfully!</span>
                    </div>
                  )}
                </div>

                {/* Daily Checklist Routine Widget */}
                <DailyRoutineWidget dayNumber={activeDayNumber} />

                {/* Daily Tasks Widget */}
                <DailyTasksWidget dayNumber={activeDayNumber} />

                {/* Open Full Tracker Button */}
                <button
                  onClick={() => {
                    onNavigateFullView('daily_tracker');
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Open Full Screen Daily Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* 3. Drawer Bottom Quick Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
            <span>JEE 2027 • DAY {activeDayNumber}</span>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white underline cursor-pointer"
            >
              Close Drawer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
