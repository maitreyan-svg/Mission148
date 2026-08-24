import React, { useState } from 'react';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CircleDot, 
  HelpCircle, 
  XCircle,
  Filter,
  Flame,
  ArrowRight
} from 'lucide-react';
import { DayStatus } from '../types';
import { useMission } from '../context/MissionContext';
import { getAll148Days, formatReadableDate, TOTAL_MISSION_DAYS } from '../utils/missionDates';

interface Mission148CalendarProps {
  onOpenDayTracker: (dayNumber: number) => void;
}

export const Mission148Calendar: React.FC<Mission148CalendarProps> = ({ onOpenDayTracker }) => {
  const { dayLogs, activeDayNumber, setActiveDayNumber } = useMission();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allDays = getAll148Days();

  const getStatusBadge = (status: DayStatus, hours: number) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400'
        };
      case 'partially_completed':
        return {
          label: 'Partial',
          icon: CircleDot,
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-400'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: Clock,
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400'
        };
      case 'planned':
        return {
          label: 'Planned',
          icon: AlertCircle,
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400'
        };
      case 'missed':
        return {
          label: 'Missed',
          icon: XCircle,
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400'
        };
      case 'not_started':
      default:
        return {
          label: 'Not Started',
          icon: HelpCircle,
          color: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
          dot: 'bg-slate-600'
        };
    }
  };

  // Filter days
  const filteredDays = allDays.filter((day) => {
    const log = dayLogs[day.dayNumber];
    const status: DayStatus = log ? log.status : 'not_started';

    if (filterStatus !== 'all' && status !== filterStatus) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDay = `day ${day.dayNumber}`.includes(q) || `${day.dayNumber}` === q;
      const matchDate = day.formattedDate.toLowerCase().includes(q);
      if (!matchDay && !matchDate) return false;
    }

    return true;
  });

  // Calculate summary counts
  const completedCount = (Object.values(dayLogs) as any[]).filter(l => l && l.status === 'completed').length;

  return (
    <div id="mission-148-calendar-page" className="space-y-6">
      {/* Page Header Bento Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              MISSION 148 CALENDAR
            </h2>
            <p className="text-xs text-indigo-400 font-mono font-semibold">
              DAY 1 (24 AUG 2026) → DAY 148 (18 JAN 2027)
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <span className="font-bold">{completedCount}</span> / 148 Completed
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-400">
            <span className="font-bold text-white">{TOTAL_MISSION_DAYS - completedCount}</span> Days Remaining
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl backdrop-blur-xl">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Days' },
            { id: 'completed', label: 'Completed' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'partially_completed', label: 'Partial' },
            { id: 'planned', label: 'Planned' },
            { id: 'missed', label: 'Missed' },
            { id: 'not_started', label: 'Not Started' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search Day (e.g. Day 1, 24 Aug)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 148 Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filteredDays.map((day) => {
          const log = dayLogs[day.dayNumber];
          const status: DayStatus = log ? log.status : 'not_started';
          const actualHours = log ? log.actualHours : 0;
          const isViewingThis = activeDayNumber === day.dayNumber;
          const badge = getStatusBadge(status, actualHours);

          return (
            <div
              key={day.dayNumber}
              id={`calendar-day-card-${day.dayNumber}`}
              onClick={() => {
                setActiveDayNumber(day.dayNumber);
                onOpenDayTracker(day.dayNumber);
              }}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-xl ${
                isViewingThis
                  ? 'border-indigo-500 bg-slate-900 ring-2 ring-indigo-500/40'
                  : status === 'completed'
                  ? 'border-emerald-500/40 bg-slate-900/90 hover:border-emerald-500/70'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Day Number Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-white group-hover:text-indigo-400 transition-colors">
                    DAY {day.dayNumber}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                </div>

                <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                  {day.shortDate}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {day.dayOfWeek}
                </div>
              </div>

              {/* Status & Hours Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {actualHours > 0 ? `${actualHours}h` : '0h'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDays.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono text-sm">
          No mission days found matching filter "{filterStatus}".
        </div>
      )}
    </div>
  );
};
