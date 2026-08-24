import React, { useState } from 'react';
import { 
  Download, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Droplets, 
  BookOpen, 
  Atom, 
  FlaskConical, 
  Calculator, 
  Award,
  Share2,
  Utensils
} from 'lucide-react';
import { DayLog, DailyTask, UserProfile } from '../types';
import { getMissionDayInfo, TOTAL_MISSION_DAYS } from '../utils/missionDates';
import { exportElementAsImage } from '../utils/exportTargetImage';

interface DailyTargetImageCardProps {
  dayNumber: number;
  user: UserProfile | null;
  dayLog?: DayLog;
  tasks: DailyTask[];
  onClose?: () => void;
  isModal?: boolean;
}

export const DailyTargetImageCard: React.FC<DailyTargetImageCardProps> = ({
  dayNumber,
  user,
  dayLog,
  tasks,
  onClose,
  isModal = false,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const dayInfo = getMissionDayInfo(dayNumber);
  const targetHours = dayLog?.targetHours || user?.targets.dailyStudyHoursGoal || 10;
  const actualHours = dayLog?.actualHours || 0;
  const pct = targetHours > 0 ? Math.round((actualHours / targetHours) * 100) : 0;
  
  const dayTasks = tasks.filter(t => t.dayNumber === dayNumber);
  const completedTasks = dayTasks.filter(t => t.completed);
  const isGoalMet = actualHours >= targetHours && targetHours > 0;
  const isCompleted = dayLog?.status === 'completed' || isGoalMet;

  const cardElementId = `daily-target-export-card-${dayNumber}`;

  const handleDownloadImage = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    const filename = `JEE2027_Day_${dayNumber}_Targets_${user?.username?.replace('@', '') || 'Aspirant'}`;
    const success = await exportElementAsImage(cardElementId, filename);
    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Download Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono">Day {dayNumber} Targets Image Card</h4>
            <p className="text-[10px] text-slate-400 font-mono">Export high-resolution PNG for your records & daily progress</p>
          </div>
        </div>

        <button
          onClick={handleDownloadImage}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs font-mono shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Generating PNG...</span>
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Saved to Gallery!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>Save Image (.png)</span>
            </>
          )}
        </button>
      </div>

      {/* The Printable Target Card (Rendered & Captured by html2canvas) */}
      <div 
        id={cardElementId}
        className="w-full max-w-xl mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-7 text-slate-100 shadow-2xl relative overflow-hidden font-sans space-y-5"
        style={{ minWidth: '320px' }}
      >
        {/* Glow Accent Background Orbs */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Top Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-600/40">
              M
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
                  MISSION 148
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  JEE 2027
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                DAILY STUDY & TARGET REPORT
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-bold text-emerald-400">
              {user?.username || '@aspirant2027'}
            </span>
            <p className="text-[9px] text-slate-500 uppercase">
              {user?.name || 'JEE Aspirant'}
            </p>
          </div>
        </div>

        {/* Day & Date Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black text-white tracking-tight font-mono">
                DAY {dayNumber} / {TOTAL_MISSION_DAYS}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {isCompleted ? '✓ COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{dayInfo.formattedDate} • {dayInfo.dayOfWeek}</span>
            </p>
          </div>

          <div className="sm:text-right font-mono">
            <span className="text-xs text-cyan-400 font-bold block">
              {dayInfo.daysRemainingInMission} DAYS TO EXAM
            </span>
            <span className="text-[10px] text-slate-500">
              Target: {user?.targets.jeeMainPercentile || '96+'}%ile
            </span>
          </div>
        </div>

        {/* Target Study Hours Progress Metric */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>STUDY HOURS TARGET</span>
            </span>
            <span className="text-white font-bold">
              <strong className="text-emerald-400 text-sm">{actualHours}h</strong> / {targetHours}h ({pct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all ${
                pct >= 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : pct >= 60 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          {/* Subject Distribution if present */}
          {dayLog?.subjectHours && (
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                <span className="text-cyan-400 flex items-center space-x-1">
                  <Atom className="w-3 h-3" />
                  <span>Physics</span>
                </span>
                <span className="text-white font-bold">{dayLog.subjectHours.physics || 0}h</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-400 flex items-center space-x-1">
                  <FlaskConical className="w-3 h-3" />
                  <span>Chem</span>
                </span>
                <span className="text-white font-bold">{dayLog.subjectHours.chemistry || 0}h</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-amber-500/20 flex items-center justify-between">
                <span className="text-amber-400 flex items-center space-x-1">
                  <Calculator className="w-3 h-3" />
                  <span>Math</span>
                </span>
                <span className="text-white font-bold">{dayLog.subjectHours.mathematics || 0}h</span>
              </div>
            </div>
          )}
        </div>

        {/* Daily Target Tasks Checklist */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>TARGET CHAPTERS & TASKS</span>
            </span>
            <span className="text-indigo-300 text-[11px] font-bold">
              {completedTasks.length} / {dayTasks.length || 0} Done
            </span>
          </div>

          {dayTasks.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {dayTasks.slice(0, 5).map((task, idx) => (
                <div 
                  key={task.id || idx}
                  className={`flex items-center justify-between p-2 rounded-xl font-mono text-xs ${
                    task.completed 
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                      task.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-500'
                    }`}>
                      {task.completed ? '✓' : ''}
                    </span>
                    <span className={`truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0 ml-2">
                    {task.subject}
                  </span>
                </div>
              ))}
              {dayTasks.length > 5 && (
                <p className="text-[10px] text-slate-500 font-mono text-center pt-0.5">
                  +{dayTasks.length - 5} more tasks in plan
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono italic py-2">
              No specific task items logged for Day {dayNumber}.
            </p>
          )}
        </div>

        {/* Daily Routine & Hydration */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {/* Hydration */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Water Intake</p>
                <p className="font-bold text-white text-xs">{dayLog?.waterMl || 0} / 3000 ml</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
              {Math.min(100, Math.round(((dayLog?.waterMl || 0) / 3000) * 100))}%
            </span>
          </div>

          {/* Routine Meals */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Meals</p>
                <p className="font-bold text-white text-xs">
                  {dayLog?.meals?.breakfast ? 'B✓ ' : 'B- '}
                  {dayLog?.meals?.lunch ? 'L✓ ' : 'L- '}
                  {dayLog?.meals?.dinner ? 'D✓' : 'D-'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {[dayLog?.meals?.breakfast, dayLog?.meals?.lunch, dayLog?.meals?.dinner].filter(Boolean).length}/3
            </span>
          </div>
        </div>

        {/* Notes / Quote if logged */}
        {dayLog?.notes && (
          <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl text-xs font-mono text-slate-300 italic">
            "{dayLog.notes}"
          </div>
        )}

        {/* Card Footer Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
          <span>MISSION 148 • 148 DAYS. ONE MISSION.</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <Flame className="w-3 h-3 fill-emerald-400" />
            <span>DISCIPLINE BEATS MOTIVATION</span>
          </span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-2xl w-full relative shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Day {dayNumber} Targets Image Preview</span>
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-mono px-2"
              >
                ✕ Close
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
