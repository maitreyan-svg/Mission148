import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  RotateCw, 
  FileText, 
  Calendar, 
  Target,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { TOTAL_MISSION_DAYS } from '../utils/missionDates';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { stats, dayLogs, activeDayNumber } = useMission();

  const totalHours = stats?.totalStudyHours || 0;
  const avgDailyHours = stats?.averageDailyStudyHours || 0;
  const weeklyHours = stats?.weeklyStudyHours || 0;

  const physicsProgress = stats?.physics.progressPercent || 0;
  const chemistryProgress = stats?.chemistry.progressPercent || 0;
  const mathProgress = stats?.mathematics.progressPercent || 0;
  const overallSubjectAvg = Math.round((physicsProgress + chemistryProgress + mathProgress) / 3);

  // Generate 14-day activity trend window for chart
  const startDay = Math.max(1, Math.min(TOTAL_MISSION_DAYS - 13, activeDayNumber > 14 ? activeDayNumber - 13 : 1));
  const recentDays = Array.from({ length: 14 }).map((_, idx) => {
    const dayNum = startDay + idx;
    const log = dayLogs[dayNum];
    const hrs = log ? log.actualHours : 0;
    const target = log ? log.targetHours : (user?.targets.dailyStudyHoursGoal || 10);
    return {
      dayNum,
      hours: hrs,
      target,
    };
  });

  const maxChartHours = Math.max(12, ...recentDays.map(d => Math.max(d.hours, d.target)));

  return (
    <div id="analytics-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            MISSION PREPARATION ANALYTICS
          </h2>
          <p className="text-xs text-emerald-400 font-mono">
            Objective Tracked Data • 148-Day Performance Metrics
          </p>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: MISSION */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>MISSION</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {stats?.missionProgressPercent || 0}%
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Current Day</span>
              <span className="font-bold text-white">Day {stats?.currentMissionDay || 1}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Days Completed</span>
              <span className="font-bold text-emerald-400">
                {(Object.values(dayLogs) as any[]).filter(l => l && (l.actualHours > 0 || l.status === 'completed')).length} Days
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Days Remaining</span>
              <span className="font-bold text-slate-300">
                {TOTAL_MISSION_DAYS - (stats?.currentMissionDay || 1)} Days
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Mission Progress</span>
              <span className="font-bold text-cyan-400">{stats?.missionProgressPercent || 0}%</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: STUDY HOURS */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>STUDY HOURS</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {totalHours}h Total
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Total Study Hours</span>
              <span className="font-bold text-white">{totalHours}h</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Avg Daily Study Hours</span>
              <span className="font-bold text-emerald-400">{avgDailyHours}h / day</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Weekly Pace</span>
              <span className="font-bold text-cyan-400">{weeklyHours}h / week</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Current Streak</span>
              <span className="font-bold text-amber-400 flex items-center space-x-1">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{stats?.currentStreak || 0} Days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 3: PREPARATION */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>PREPARATION</span>
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {stats?.completedChapters || 0} / {stats?.totalChapters || 0} Ch.
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Chapters Completed</span>
              <span className="font-bold text-white">{stats?.completedChapters || 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Lectures Completed</span>
              <span className="font-bold text-emerald-400">
                {stats?.completedLectures || 0} / {stats?.totalLectures || 0}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">PYQs Solved</span>
              <span className="font-bold text-cyan-400">{stats?.completedPYQs || 0}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Total Revisions</span>
              <span className="font-bold text-purple-400">{stats?.totalRevisions || 0}×</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: SUBJECTS SPLIT */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>SUBJECTS</span>
            </span>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {overallSubjectAvg}% Avg
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Physics */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyan-400">Physics</span>
                <span className="text-white font-bold">{physicsProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${physicsProgress}%` }} />
              </div>
            </div>

            {/* Chemistry */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-400">Chemistry</span>
                <span className="text-white font-bold">{chemistryProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${chemistryProgress}%` }} />
              </div>
            </div>

            {/* Mathematics */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-400">Mathematics</span>
                <span className="text-white font-bold">{mathProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${mathProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 14-Day Study Velocity Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Study Hours Velocity (14-Day Trajectory)</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Actual hours logged vs Daily target line</p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Actual Hours</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-t border-dashed" />
              <span className="text-slate-400">Target (10h)</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="mt-6 h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800/80">
          {recentDays.map((d) => {
            const barHeightPercent = Math.min(100, Math.round((d.hours / maxChartHours) * 100));
            const isToday = d.dayNum === activeDayNumber;
            return (
              <div key={d.dayNum} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-white pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  Day {d.dayNum}: {d.hours}h studied
                </div>

                {/* Hours bar */}
                <div 
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                    isToday 
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 ring-2 ring-emerald-400/40' 
                      : d.hours >= d.target 
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                      : d.hours > 0 
                      ? 'bg-gradient-to-t from-teal-700 to-cyan-500' 
                      : 'bg-slate-900 border border-slate-800/50'
                  }`}
                  style={{ height: `${Math.max(6, barHeightPercent)}%` }}
                />

                {/* Day label */}
                <span className={`text-[10px] font-mono mt-2 ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  D{d.dayNum}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>14 Days Ago</span>
          <span>Target Consistency: {avgDailyHours >= 10 ? '🔥 On Target' : '📈 Steady Progression'}</span>
          <span>Today (Day {activeDayNumber})</span>
        </div>
      </div>
    </div>
  );
};
