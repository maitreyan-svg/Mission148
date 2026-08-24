import React from 'react';
import { Target, Trophy, Calendar, Clock, ChevronLeft, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { getMissionDayInfo, getExamCountdownDays, TOTAL_MISSION_DAYS } from '../utils/missionDates';

export const MissionHeader: React.FC = () => {
  const { user } = useAuth();
  const { activeDayNumber, setActiveDayNumber, stats } = useMission();

  const dayInfo = getMissionDayInfo(activeDayNumber);
  const examDaysRemaining = getExamCountdownDays(activeDayNumber);
  const progressPercent = ((activeDayNumber / TOTAL_MISSION_DAYS) * 100).toFixed(1);

  const mainPercentileTarget = user?.targets?.jeeMainPercentile || '96+';
  const advAirTarget = user?.targets?.jeeAdvancedAIR || '< 10,000';
  const streak = stats?.currentStreak || 0;
  const bestStreak = stats?.longestStreak || streak || 0;

  const handlePrevDay = () => {
    if (activeDayNumber > 1) {
      setActiveDayNumber(activeDayNumber - 1);
    }
  };

  const handleNextDay = () => {
    if (activeDayNumber < TOTAL_MISSION_DAYS) {
      setActiveDayNumber(activeDayNumber + 1);
    }
  };

  return (
    <div id="bento-mission-header-cluster" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Bento Status: Current Mission Status (Col Span 2) */}
      <div 
        id="bento-card-mission-status" 
        className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden group"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono">
                Current Mission Status
              </h2>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                DAY {activeDayNumber}
              </p>
              <span className="text-slate-500 font-light text-2xl font-mono">/ 148</span>
            </div>
            <p className="text-xs text-indigo-300 font-mono mt-1 font-semibold">
              {dayInfo.formattedDate.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400 font-mono">Started: 24 AUG 2026</p>
              <p className="text-xs text-indigo-400 font-bold font-mono">
                {dayInfo.daysRemainingInMission} DAYS REMAINING
              </p>
            </div>

            {/* Quick Day Navigator Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
              <button
                id="btn-bento-prev-day"
                onClick={handlePrevDay}
                disabled={activeDayNumber <= 1}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-indigo-300 px-2">
                DAY {activeDayNumber}
              </span>
              <button
                id="btn-bento-next-day"
                onClick={handleNextDay}
                disabled={activeDayNumber >= TOTAL_MISSION_DAYS}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar with mathematical styling */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">Mission Timeline Progress</span>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Bento Targets Card */}
      <div 
        id="bento-card-targets"
        className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl"
      >
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono mb-4">
          Personal Targets
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
              🎯
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">JEE MAIN</p>
              <p className="text-base font-bold text-white font-mono">{mainPercentileTarget} Percentile</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
              🏆
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">JEE ADVANCED</p>
              <p className="text-base font-bold text-white font-mono">AIR {advAirTarget}</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-mono text-slate-500 mt-2 italic">
          Consistent daily execution builds top percentiles.
        </p>
      </div>

      {/* 3. Bento Streak Card */}
      <div 
        id="bento-card-streak"
        className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-xl backdrop-blur-xl"
      >
        <div className="w-full flex items-center justify-between">
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono text-left">
            Activity Streak
          </h2>
          <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
        </div>

        <div className="relative py-3">
          <div className="text-5xl font-black font-mono text-orange-500 drop-shadow-[0_0_16px_rgba(249,115,22,0.4)]">
            {streak}
          </div>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mt-1">
            Days On Fire
          </p>
        </div>

        <div className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-full">
          Best Record: <span className="text-white font-bold">{bestStreak} Days</span>
        </div>
      </div>
    </div>
  );
};
