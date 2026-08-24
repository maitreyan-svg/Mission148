import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  RotateCw, 
  FileText, 
  Sparkles,
  Save
} from 'lucide-react';
import { DayStatus } from '../types';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { getMissionDayInfo, TOTAL_MISSION_DAYS } from '../utils/missionDates';
import { DailyTasksWidget } from './DailyTasksWidget';
import { DailyRoutineWidget } from './DailyRoutineWidget';
import { StudyTimerWidget } from './StudyTimerWidget';

interface DailyTrackerViewProps {
  dayNumber: number;
}

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({ dayNumber }) => {
  const { user } = useAuth();
  const { 
    activeDayNumber, 
    setActiveDayNumber, 
    dayLogs, 
    updateDayLog, 
    chapters 
  } = useMission();

  const dayInfo = getMissionDayInfo(activeDayNumber);
  const currentLog = dayLogs[activeDayNumber] || {
    dayNumber: activeDayNumber,
    date: dayInfo.dateStr,
    targetHours: user?.targets.dailyStudyHoursGoal || 10,
    actualHours: 0,
    status: 'not_started',
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
  const [lecturesCount, setLecturesCount] = useState<number>(currentLog.lecturesCompletedCount || 0);
  const [pyqsCount, setPyqsCount] = useState<number>(currentLog.pyqsCompletedCount || 0);
  const [revisionsCount, setRevisionsCount] = useState<number>(currentLog.revisionsLoggedCount || 0);
  const [shortNotesCount, setShortNotesCount] = useState<number>(currentLog.shortNotesLoggedCount || 0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state when day changes
  React.useEffect(() => {
    const log = dayLogs[activeDayNumber];
    if (log) {
      setStatus(log.status);
      setStudyHours(log.actualHours || 0);
      setNotes(log.notes || '');
      setLecturesCount(log.lecturesCompletedCount || 0);
      setPyqsCount(log.pyqsCompletedCount || 0);
      setRevisionsCount(log.revisionsLoggedCount || 0);
      setShortNotesCount(log.shortNotesLoggedCount || 0);
    } else {
      setStatus('not_started');
      setStudyHours(0);
      setNotes('');
      setLecturesCount(0);
      setPyqsCount(0);
      setRevisionsCount(0);
      setShortNotesCount(0);
    }
  }, [activeDayNumber, dayLogs]);

  const targetHours = user?.targets.dailyStudyHoursGoal || 10;
  const completionPercent = targetHours > 0 ? Math.min(100, Math.round((studyHours / targetHours) * 100)) : 0;

  const handleSaveDayLog = async () => {
    setIsSaving(true);
    try {
      await updateDayLog(activeDayNumber, {
        status,
        actualHours: Number(studyHours) || 0,
        notes,
        lecturesCompletedCount: Number(lecturesCount) || 0,
        pyqsCompletedCount: Number(pyqsCount) || 0,
        revisionsLoggedCount: Number(revisionsCount) || 0,
        shortNotesLoggedCount: Number(shortNotesCount) || 0,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="daily-tracker-view" className="space-y-6">
      {/* Day Navigator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                DAY {activeDayNumber}
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {dayInfo.formattedDate.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {dayInfo.dayOfWeek} • {dayInfo.daysRemainingInMission} Days Remaining in Mission
            </p>
          </div>
        </div>

        {/* Previous / Next Day Steppers */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveDayNumber(Math.max(1, activeDayNumber - 1))}
            disabled={activeDayNumber <= 1}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center space-x-1 text-xs font-mono transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Day</span>
          </button>
          
          <select
            value={activeDayNumber}
            onChange={(e) => setActiveDayNumber(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none"
          >
            {Array.from({ length: TOTAL_MISSION_DAYS }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Day {idx + 1} ({getMissionDayInfo(idx + 1).shortDate})
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveDayNumber(Math.min(TOTAL_MISSION_DAYS, activeDayNumber + 1))}
            disabled={activeDayNumber >= TOTAL_MISSION_DAYS}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center space-x-1 text-xs font-mono transition-colors"
          >
            <span className="hidden sm:inline">Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TODAY'S TARGET CARD (Mandatory Spec 11) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              TODAY'S TARGET & STATUS
            </h3>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-[11px] font-mono text-slate-400 hidden sm:inline">Day Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DayStatus)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="not_started">⚪ Not Started</option>
              <option value="planned">🔵 Planned</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="completed">🟢 Completed</option>
              <option value="partially_completed">🟠 Partially Completed</option>
              <option value="missed">🔴 Missed</option>
            </select>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">Study Target</div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {targetHours}h
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Configured in Profile</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">Actual Hours Studied</div>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={studyHours}
                onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xl font-mono font-bold text-emerald-400"
              />
              <span className="font-mono text-sm text-slate-400">hours</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Auto-accumulates from timer</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-mono text-slate-400">Target Completion</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              {completionPercent}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {studyHours >= targetHours ? '✓ Goal Exceeded!' : `${Math.max(0, targetHours - studyHours).toFixed(1)}h left`}
            </div>
          </div>
        </div>

        {/* Daily Preparation Accomplishments (Lectures, PYQs, Notes, Revisions) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Day {activeDayNumber} Preparation Output Counters
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Lectures Done</span>
              </div>
              <input
                type="number"
                min="0"
                value={lecturesCount}
                onChange={(e) => setLecturesCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>PYQs Solved</span>
              </div>
              <input
                type="number"
                min="0"
                value={pyqsCount}
                onChange={(e) => setPyqsCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>Notes Made</span>
              </div>
              <input
                type="number"
                min="0"
                value={shortNotesCount}
                onChange={(e) => setShortNotesCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <RotateCw className="w-3 h-3 text-purple-400" />
                <span>Revisions</span>
              </div>
              <input
                type="number"
                min="0"
                value={revisionsCount}
                onChange={(e) => setRevisionsCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Daily Reflection / Notes */}
        <div className="mt-4">
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Day {activeDayNumber} Notes & Strategy Reflection
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write key takeaways, weak areas identified, or formulas to remember..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Save Button */}
        <div className="mt-4 flex items-center justify-end space-x-3">
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-400 animate-fadeIn">
              ✓ Day {activeDayNumber} Log Saved!
            </span>
          )}
          <button
            id="btn-save-day-log"
            onClick={handleSaveDayLog}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Day Record'}</span>
          </button>
        </div>
      </div>

      {/* Daily Tasks & Routine Tracker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTasksWidget dayNumber={activeDayNumber} />
        <DailyRoutineWidget dayNumber={activeDayNumber} />
      </div>
    </div>
  );
};
