import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  RotateCw, 
  FileText, 
  Save,
  ImageIcon,
  Atom,
  FlaskConical,
  Calculator,
  RotateCcw,
  Sliders,
  Plus,
  Minus,
  CheckCircle,
  Play,
  Check,
  Edit3
} from 'lucide-react';
import { DayStatus, SubjectType, DailyBacklogSlot } from '../types';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { getMissionDayInfo, TOTAL_MISSION_DAYS } from '../utils/missionDates';
import { DailyTasksWidget } from './DailyTasksWidget';
import { DailyRoutineWidget } from './DailyRoutineWidget';
import { DailyTargetImageCard } from './DailyTargetImageCard';

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
    updateDailyTargetHours,
    updateSubjectTargetHours,
    updateBacklogSlot,
    setTimerSubject,
    startTimer,
    tasks 
  } = useMission();

  const dayInfo = getMissionDayInfo(activeDayNumber);
  const currentLog = dayLogs[activeDayNumber] || {
    dayNumber: activeDayNumber,
    date: dayInfo.dateStr,
    targetHours: user?.targets?.dailyStudyHoursGoal || 15,
    actualHours: 0,
    status: 'not_started',
    notes: '',
    meals: { breakfast: false, lunch: false, dinner: false },
    waterMl: 0,
    subjectHours: { physics: 0, chemistry: 0, mathematics: 0, backlog: 0 },
    subjectTargetHours: { physics: 4.5, chemistry: 4.5, mathematics: 4.5, backlog: 1.5 },
    backlogSlot: { title: '', completed: false, notes: '', hours: 0 },
    lecturesCompletedCount: 0,
    pyqsCompletedCount: 0,
    revisionsLoggedCount: 0,
    shortNotesLoggedCount: 0,
  };

  const [status, setStatus] = useState<DayStatus>(currentLog.status);
  const [studyHours, setStudyHours] = useState<number>(currentLog.actualHours || 0);
  const [dailyTarget, setDailyTarget] = useState<number>(currentLog.targetHours || 15);
  const [notes, setNotes] = useState<string>(currentLog.notes || '');
  const [lecturesCount, setLecturesCount] = useState<number>(currentLog.lecturesCompletedCount || 0);
  const [pyqsCount, setPyqsCount] = useState<number>(currentLog.pyqsCompletedCount || 0);
  const [revisionsCount, setRevisionsCount] = useState<number>(currentLog.revisionsLoggedCount || 0);
  const [shortNotesCount, setShortNotesCount] = useState<number>(currentLog.shortNotesLoggedCount || 0);

  // Subject actual hours state
  const [physicsHours, setPhysicsHours] = useState<number>(currentLog.subjectHours?.physics || 0);
  const [chemHours, setChemHours] = useState<number>(currentLog.subjectHours?.chemistry || 0);
  const [mathHours, setMathHours] = useState<number>(currentLog.subjectHours?.mathematics || 0);
  const [backlogHours, setBacklogHours] = useState<number>(currentLog.subjectHours?.backlog || 0);

  // Subject target hours state
  const [physicsTarget, setPhysicsTarget] = useState<number>(currentLog.subjectTargetHours?.physics || 4.5);
  const [chemTarget, setChemTarget] = useState<number>(currentLog.subjectTargetHours?.chemistry || 4.5);
  const [mathTarget, setMathTarget] = useState<number>(currentLog.subjectTargetHours?.mathematics || 4.5);
  const [backlogTarget, setBacklogTarget] = useState<number>(currentLog.subjectTargetHours?.backlog || 1.5);

  // Backlog Slot state
  const [backlogTitle, setBacklogTitle] = useState<string>(currentLog.backlogSlot?.title || '');
  const [backlogCompleted, setBacklogCompleted] = useState<boolean>(currentLog.backlogSlot?.completed || false);
  const [backlogNotes, setBacklogNotes] = useState<string>(currentLog.backlogSlot?.notes || '');
  const [backlogSlotHours, setBacklogSlotHours] = useState<number>(currentLog.backlogSlot?.hours || 0);

  const [showSplitAdjuster, setShowSplitAdjuster] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showImageCardModal, setShowImageCardModal] = useState<boolean>(false);

  // Sync state when day changes
  useEffect(() => {
    const log = dayLogs[activeDayNumber];
    if (log) {
      setStatus(log.status);
      setStudyHours(log.actualHours || 0);
      setDailyTarget(log.targetHours || user?.targets?.dailyStudyHoursGoal || 15);
      setNotes(log.notes || '');
      setLecturesCount(log.lecturesCompletedCount || 0);
      setPyqsCount(log.pyqsCompletedCount || 0);
      setRevisionsCount(log.revisionsLoggedCount || 0);
      setShortNotesCount(log.shortNotesLoggedCount || 0);

      setPhysicsHours(log.subjectHours?.physics || 0);
      setChemHours(log.subjectHours?.chemistry || 0);
      setMathHours(log.subjectHours?.mathematics || 0);
      setBacklogHours(log.subjectHours?.backlog || 0);

      setPhysicsTarget(log.subjectTargetHours?.physics ?? 4.5);
      setChemTarget(log.subjectTargetHours?.chemistry ?? 4.5);
      setMathTarget(log.subjectTargetHours?.mathematics ?? 4.5);
      setBacklogTarget(log.subjectTargetHours?.backlog ?? 1.5);

      setBacklogTitle(log.backlogSlot?.title || '');
      setBacklogCompleted(log.backlogSlot?.completed || false);
      setBacklogNotes(log.backlogSlot?.notes || '');
      setBacklogSlotHours(log.backlogSlot?.hours || log.subjectHours?.backlog || 0);
    } else {
      setStatus('not_started');
      setStudyHours(0);
      setDailyTarget(user?.targets?.dailyStudyHoursGoal || 15);
      setNotes('');
      setLecturesCount(0);
      setPyqsCount(0);
      setRevisionsCount(0);
      setShortNotesCount(0);

      setPhysicsHours(0);
      setChemHours(0);
      setMathHours(0);
      setBacklogHours(0);

      setPhysicsTarget(4.5);
      setChemTarget(4.5);
      setMathTarget(4.5);
      setBacklogTarget(1.5);

      setBacklogTitle('');
      setBacklogCompleted(false);
      setBacklogNotes('');
      setBacklogSlotHours(0);
    }
  }, [activeDayNumber, dayLogs, user]);

  const targetHours = dailyTarget || 15;
  const completionPercent = targetHours > 0 ? Math.min(100, Math.round((studyHours / targetHours) * 100)) : 0;

  const handleAdjustDailyTarget = (newTarget: number) => {
    const valid = Math.max(1, Math.min(24, Math.round(newTarget * 10) / 10));
    setDailyTarget(valid);
    // Proportionally adjust default targets if they haven't been heavily customized
    const ratio = valid / 15;
    setPhysicsTarget(Number((4.5 * ratio).toFixed(1)));
    setChemTarget(Number((4.5 * ratio).toFixed(1)));
    setMathTarget(Number((4.5 * ratio).toFixed(1)));
    setBacklogTarget(Number((1.5 * ratio).toFixed(1)));
  };

  const handleSaveDayLog = async () => {
    setIsSaving(true);
    try {
      const updatedSubjectHours = {
        physics: Number(physicsHours) || 0,
        chemistry: Number(chemHours) || 0,
        mathematics: Number(mathHours) || 0,
        backlog: Number(backlogHours) || Number(backlogSlotHours) || 0,
      };

      const updatedSubjectTargetHours = {
        physics: Number(physicsTarget) || 4.5,
        chemistry: Number(chemTarget) || 4.5,
        mathematics: Number(mathTarget) || 4.5,
        backlog: Number(backlogTarget) || 1.5,
      };

      const updatedBacklogSlot: DailyBacklogSlot = {
        title: backlogTitle.trim(),
        completed: backlogCompleted,
        notes: backlogNotes.trim(),
        hours: Number(backlogSlotHours) || Number(backlogHours) || 0,
      };

      // Sum actual hours if subjects were edited
      const sumSubjectHours = Number(
        (updatedSubjectHours.physics + updatedSubjectHours.chemistry + updatedSubjectHours.mathematics + updatedSubjectHours.backlog).toFixed(1)
      );
      const totalActual = Math.max(Number(studyHours) || 0, sumSubjectHours);

      await updateDayLog(activeDayNumber, {
        status,
        targetHours: Number(dailyTarget) || 15,
        actualHours: totalActual,
        notes,
        subjectHours: updatedSubjectHours,
        subjectTargetHours: updatedSubjectTargetHours,
        backlogSlot: updatedBacklogSlot,
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

  const handleStartBacklogTimer = () => {
    setTimerSubject('backlog');
    startTimer();
  };

  return (
    <div id="daily-tracker-view" className="space-y-6">
      {/* Day Navigator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-mono">
                DAY {activeDayNumber}
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {dayInfo.formattedDate.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {dayInfo.dayOfWeek} • {dayInfo.daysRemainingInMission} Days Remaining in Mission 2026
            </p>
          </div>
        </div>

        {/* Previous / Next Day Steppers */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveDayNumber(Math.max(1, activeDayNumber - 1))}
            disabled={activeDayNumber <= 1}
            className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center space-x-1.5 text-xs font-mono transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Day</span>
          </button>
          
          <select
            value={activeDayNumber}
            onChange={(e) => setActiveDayNumber(parseInt(e.target.value, 10))}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
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
            className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 flex items-center space-x-1.5 text-xs font-mono transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TODAY'S TARGET & ADJUSTABLE STUDY HOURS (User Request 1 & 2) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 md:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-white">
                Daily Study Target & Goal
              </h3>
              <p className="text-xs text-slate-400 font-mono">Adjust study target & track progress in real-time</p>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-[11px] font-mono text-slate-400 hidden sm:inline">Day Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DayStatus)}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
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

        {/* 3 Metric Summary Boxes with Target Adjuster */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Target Hours Box with Custom Adjuster */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Daily Target</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Adjustable
                </span>
              </div>

              <div className="flex items-center space-x-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleAdjustDailyTarget(dailyTarget - 1)}
                  className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  title="Decrease Target Hour"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-baseline space-x-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={dailyTarget}
                    onChange={(e) => handleAdjustDailyTarget(parseFloat(e.target.value) || 15)}
                    className="w-20 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-2xl font-black font-mono text-white text-center focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="font-mono text-sm text-slate-400 font-bold">hours</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustDailyTarget(dailyTarget + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  title="Increase Target Hour"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-1.5 mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
              {[12, 14, 15, 16, 18].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAdjustDailyTarget(preset)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    dailyTarget === preset 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

          {/* Actual Hours Studied */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Actual Hours Studied</span>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-2xl font-black font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
                <span className="font-mono text-sm text-slate-400 font-bold">hours</span>
              </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              Auto-syncs with timer & subject breakdown below
            </p>
          </div>

          {/* Target Completion Progress */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Goal Completion</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{completionPercent}%</span>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mt-3 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    studyHours >= dailyTarget 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, completionPercent)}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 mt-2">
              {studyHours >= dailyTarget ? (
                <span className="text-emerald-400 font-bold">✓ Daily Goal Achieved! (Exceeded by {(studyHours - dailyTarget).toFixed(1)}h)</span>
              ) : (
                <span>{Math.max(0, dailyTarget - studyHours).toFixed(1)}h remaining to hit {dailyTarget}h goal</span>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- PER-SUBJECT TIME GIVEN HOURS BREAKDOWN (User Request 1 & 2) ---------------- */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <span>Per-Subject Study Hours & Time Breakdown</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Target vs Actual
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Track how your {dailyTarget}h target is distributed across Physics, Chemistry, Math & Backlog Slot
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSplitAdjuster(!showSplitAdjuster)}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-indigo-300 flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showSplitAdjuster ? 'Hide Target Adjuster' : 'Customize Subject Targets'}</span>
            </button>
          </div>

          {/* Optional Inline Target Split Adjuster */}
          {showSplitAdjuster && (
            <div className="mb-5 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-300">
                  Adjust Daily Subject Targets (Total: {(physicsTarget + chemTarget + mathTarget + backlogTarget).toFixed(1)}h)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const ratio = dailyTarget / 15;
                    setPhysicsTarget(Number((4.5 * ratio).toFixed(1)));
                    setChemTarget(Number((4.5 * ratio).toFixed(1)));
                    setMathTarget(Number((4.5 * ratio).toFixed(1)));
                    setBacklogTarget(Number((1.5 * ratio).toFixed(1)));
                  }}
                  className="text-[10px] font-mono text-indigo-400 underline hover:text-indigo-300 cursor-pointer"
                >
                  Reset to Standard (4.5h / 4.5h / 4.5h / 1.5h)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-mono text-blue-400 font-bold block">Physics Target (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={physicsTarget}
                    onChange={(e) => setPhysicsTarget(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-white"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-mono text-emerald-400 font-bold block">Chemistry Target (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={chemTarget}
                    onChange={(e) => setChemTarget(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-white"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-mono text-indigo-400 font-bold block">Math Target (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={mathTarget}
                    onChange={(e) => setMathTarget(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-white"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-mono text-amber-400 font-bold block">Backlog Slot Target (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={backlogTarget}
                    onChange={(e) => setBacklogTarget(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4 Subject Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Physics Card */}
            <div className="p-4 rounded-2xl bg-blue-950/10 border border-blue-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Atom className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-300">PHYSICS</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400/80">Target: {physicsTarget}h</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Actual Hours:</span>
                  <span className="font-bold text-white">{physicsHours}h / {physicsTarget}h</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-blue-900/40">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${physicsTarget > 0 ? Math.min(100, Math.round((physicsHours / physicsTarget) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Log:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={physicsHours}
                  onChange={(e) => setPhysicsHours(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] font-mono text-slate-500">hours</span>
              </div>
            </div>

            {/* Chemistry Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-300">CHEMISTRY</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/80">Target: {chemTarget}h</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Actual Hours:</span>
                  <span className="font-bold text-white">{chemHours}h / {chemTarget}h</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-emerald-900/40">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${chemTarget > 0 ? Math.min(100, Math.round((chemHours / chemTarget) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Log:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={chemHours}
                  onChange={(e) => setChemHours(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] font-mono text-slate-500">hours</span>
              </div>
            </div>

            {/* Mathematics Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-indigo-300">MATHEMATICS</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400/80">Target: {mathTarget}h</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Actual Hours:</span>
                  <span className="font-bold text-white">{mathHours}h / {mathTarget}h</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-indigo-900/40">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${mathTarget > 0 ? Math.min(100, Math.round((mathHours / mathTarget) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Log:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={mathHours}
                  onChange={(e) => setMathHours(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] font-mono text-slate-500">hours</span>
              </div>
            </div>

            {/* Backlog Slot Breakdown Card */}
            <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">BACKLOG SLOT</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80">Target: {backlogTarget}h</span>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Actual Hours:</span>
                  <span className="font-bold text-white">{backlogHours}h / {backlogTarget}h</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-amber-900/40">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${backlogTarget > 0 ? Math.min(100, Math.round((backlogHours / backlogTarget) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-mono text-slate-400">Log:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={backlogHours}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setBacklogHours(val);
                    setBacklogSlotHours(val);
                  }}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] font-mono text-slate-500">hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- DAILY BACKLOG SLOT TRACKER CARD (User Request 1 & 2) ---------------- */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Daily Backlog Slot Tracker
                  </h4>
                  {backlogCompleted && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Slot Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Dedicated daily slot to clear backlogs, missed questions, and revision gaps
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleStartBacklogTimer}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Start Stopwatch for Backlog"
              >
                <Play className="w-3 h-3 text-amber-400" />
                <span>Start Backlog Timer</span>
              </button>

              <button
                type="button"
                onClick={() => setBacklogCompleted(!backlogCompleted)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                  backlogCompleted 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${backlogCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{backlogCompleted ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backlog Topic / Focus Title */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Backlog Topic / Chapter Focus</span>
              </label>
              <input
                type="text"
                value={backlogTitle}
                onChange={(e) => setBacklogTitle(e.target.value)}
                placeholder="e.g. Rotational Motion backlog questions, Thermodynamics PYQ backlog..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Backlog Hours */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Hours Invested in Backlog</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={backlogSlotHours}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setBacklogSlotHours(val);
                    setBacklogHours(val);
                  }}
                  className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs font-mono text-slate-400">hours logged (Target: {backlogTarget}h)</span>
              </div>
            </div>
          </div>

          {/* What I Have Done in Backlog Slot Reflection */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>What I Accomplished in This Backlog Slot</span>
            </label>
            <textarea
              rows={2}
              value={backlogNotes}
              onChange={(e) => setBacklogNotes(e.target.value)}
              placeholder="e.g. Cleared 25 backlog PYQs from 2023, revised notes for moments of inertia, cleared pending lecture 4..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Daily Preparation Accomplishments (Lectures, PYQs, Notes, Revisions) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Day {activeDayNumber} Preparation Output Counters
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-medium">Lectures Done</span>
              </div>
              <input
                type="number"
                min="0"
                value={lecturesCount}
                onChange={(e) => setLecturesCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white font-bold"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-medium">PYQs Solved</span>
              </div>
              <input
                type="number"
                min="0"
                value={pyqsCount}
                onChange={(e) => setPyqsCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white font-bold"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-medium">Notes Made</span>
              </div>
              <input
                type="number"
                min="0"
                value={shortNotesCount}
                onChange={(e) => setShortNotesCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white font-bold"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono font-medium">Revisions</span>
              </div>
              <input
                type="number"
                min="0"
                value={revisionsCount}
                onChange={(e) => setRevisionsCount(parseInt(e.target.value, 10) || 0)}
                className="w-full mt-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Daily Reflection / Notes */}
        <div className="mt-5">
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Day {activeDayNumber} Notes & Strategy Reflection
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write key takeaways, weak areas identified, or formulas to remember..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons: Save Day Record & Save Targets Image */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowImageCardModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer shadow-sm hover:text-white"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Export Targets as Image</span>
          </button>

          <div className="flex items-center space-x-3">
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 animate-fadeIn font-bold">
                ✓ Day {activeDayNumber} Target & Breakdown Saved!
              </span>
            )}
            <button
              id="btn-save-day-log"
              onClick={handleSaveDayLog}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : `Save Day ${activeDayNumber} Record`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Target as Image Modal */}
      {showImageCardModal && (
        <DailyTargetImageCard
          dayNumber={activeDayNumber}
          user={user}
          dayLog={currentLog}
          tasks={tasks}
          onClose={() => setShowImageCardModal(false)}
          isModal={true}
        />
      )}

      {/* Daily Tasks & Routine Tracker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTasksWidget dayNumber={activeDayNumber} />
        <DailyRoutineWidget dayNumber={activeDayNumber} />
      </div>
    </div>
  );
};
