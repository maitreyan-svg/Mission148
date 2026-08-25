import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Atom, 
  FlaskConical, 
  Calculator, 
  Zap,
  PlusCircle,
  Clock,
  Check
} from 'lucide-react';
import { SubjectType } from '../types';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';

interface StudyTimerWidgetProps {
  isFullScreen?: boolean;
}

export const StudyTimerWidget: React.FC<StudyTimerWidgetProps> = ({ isFullScreen = false }) => {
  const { user } = useAuth();
  const { 
    activeDayNumber, 
    isTimerRunning, 
    timerSeconds, 
    timerSubject, 
    setTimerSubject, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    saveTimerSession,
    addManualStudyTime,
    dayLogs 
  } = useMission();

  const [sessionNote, setSessionNote] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualHours, setManualHours] = useState<number>(1);
  const [manualMinutes, setManualMinutes] = useState<number>(30);
  const [manualSubject, setManualSubject] = useState<SubjectType | 'general' | 'backlog'>('physics');

  const currentLog = dayLogs[activeDayNumber];
  const targetHours = currentLog?.targetHours || user?.targets?.dailyStudyHoursGoal || 15;
  const actualHours = currentLog ? currentLog.actualHours : 0;
  const completionPercent = targetHours > 0 ? Math.min(100, Math.round((actualHours / targetHours) * 100)) : 0;

  const formatHoursMinutes = (decimalHours: number) => {
    const totalMinutes = Math.round(decimalHours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      hours: String(hrs).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    };
  };

  const timeParts = formatStopwatch(timerSeconds);

  const handleSaveSession = async () => {
    await saveTimerSession(sessionNote.trim());
    setSessionNote('');
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    await addManualStudyTime(activeDayNumber, manualSubject, Number(manualHours) || 0, Number(manualMinutes) || 0);
    setShowManualModal(false);
  };

  const subjectTabs: { id: SubjectType | 'general' | 'backlog'; label: string; icon: any; color: string }[] = [
    { id: 'physics', label: 'Physics', icon: Atom, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'mathematics', label: 'Math', icon: Calculator, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    { id: 'backlog', label: 'Backlog', icon: RotateCcw, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'general', label: 'General', icon: Zap, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
  ];

  return (
    <div id="study-timer-container" className="space-y-6">
      {/* Main Bento Timer Display Box */}
      <div className={`rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl backdrop-blur-xl ${isFullScreen ? 'max-w-2xl mx-auto' : ''}`}>
        
        {/* Header & Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white tracking-tight">Mission Study Timer</h3>
              <p className="text-xs text-slate-400 font-mono">Day {activeDayNumber} Stopwatch Session</p>
            </div>
          </div>

          <button
            id="btn-open-manual-time"
            onClick={() => setShowManualModal(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Manual Time</span>
          </button>
        </div>

        {/* Subject Tag Selection */}
        <div className="mt-5">
          <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            Assign Session Subject
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {subjectTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = timerSubject === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`timer-subject-btn-${tab.id}`}
                  onClick={() => setTimerSubject(tab.id)}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? tab.color
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stopwatch Display */}
        <div className="my-8 text-center">
          <div className="inline-flex items-center justify-center p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-inner font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-widest text-white">
            <span id="timer-hours">{timeParts.hours}</span>
            <span className="text-slate-600 animate-pulse px-1">:</span>
            <span id="timer-minutes">{timeParts.minutes}</span>
            <span className="text-slate-600 animate-pulse px-1">:</span>
            <span id="timer-seconds" className="text-indigo-400">{timeParts.seconds}</span>
          </div>

          <div className="flex items-center justify-center space-x-2 mt-3 text-xs font-mono text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{isTimerRunning ? `Actively recording study time for ${timerSubject.toUpperCase()}...` : 'Ready to start study session'}</span>
          </div>
        </div>

        {/* Controls: START / PAUSE / STOP / RESET */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isTimerRunning ? (
            <button
              id="btn-timer-start"
              onClick={startTimer}
              className="flex-1 min-w-[140px] py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START TIMER</span>
            </button>
          ) : (
            <button
              id="btn-timer-pause"
              onClick={pauseTimer}
              className="flex-1 min-w-[140px] py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>PAUSE</span>
            </button>
          )}

          <button
            id="btn-timer-stop-save"
            onClick={handleSaveSession}
            disabled={timerSeconds < 10}
            className="py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer"
            title="Save session to Day study hours"
          >
            <Square className="w-4 h-4 fill-emerald-400" />
            <span>STOP & SAVE</span>
          </button>

          <button
            id="btn-timer-reset"
            onClick={resetTimer}
            disabled={timerSeconds === 0}
            className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Session Note Input */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Optional session note (e.g. Kinematics HC Verma Q1-25)..."
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Target vs Actual Progress Bento Grid (Mandatory Requirement 13) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold">Today's Target</div>
              <div className="text-base sm:text-lg font-black font-mono text-white mt-1">{targetHours}h</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold">Today's Actual</div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-1">
                {formatHoursMinutes(actualHours)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold">Completion</div>
              <div className="text-base sm:text-lg font-black font-mono text-indigo-400 mt-1">{completionPercent}%</div>
            </div>
          </div>

          <div className="mt-3.5">
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Manual Time Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h4 className="text-base font-bold text-white">Manual Study Time Log</h4>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveManual} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Subject</label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                >
                  <option value="physics">⚛ Physics</option>
                  <option value="chemistry">🧪 Chemistry</option>
                  <option value="mathematics">📐 Mathematics</option>
                  <option value="backlog">🔄 Backlog Slot</option>
                  <option value="general">⚡ General Study</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={manualHours}
                    onChange={(e) => setManualHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer transition-colors"
                >
                  + Add to Day {activeDayNumber}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
