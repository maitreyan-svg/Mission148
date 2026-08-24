import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  RotateCw, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Chapter } from '../types';
import { useMission } from '../context/MissionContext';

interface ChapterCardProps {
  chapter: Chapter;
  onEdit: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onEdit }) => {
  const { 
    toggleLectureCompleted, 
    setChapterPYQ, 
    toggleShortNotes, 
    adjustRevisionCount, 
    deleteChapter 
  } = useMission();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const completedLecturesCount = chapter.completedLectures?.length || 0;
  const totalLectures = chapter.totalLectures || 1;
  const lecturePercent = Math.min(100, Math.round((completedLecturesCount / totalLectures) * 100));

  const pyqDone = chapter.pyq.isDone || (chapter.pyq.completed > 0 && chapter.pyq.completed >= chapter.pyq.total);
  const shortNotesDone = chapter.shortNotesMade;

  // Chapter is fully complete if Lectures 100%, PYQ Done, and Short Notes Made
  const isChapterComplete = (completedLecturesCount >= totalLectures) && pyqDone && shortNotesDone;

  // Calculate overall chapter progress %
  const calcProgress = () => {
    let p = 0;
    p += (completedLecturesCount / totalLectures) * 50; // Lectures 50%
    if (pyqDone) p += 35; // PYQs 35%
    else if (chapter.pyq.isDetailed && chapter.pyq.total > 0) {
      p += (chapter.pyq.completed / chapter.pyq.total) * 35;
    }
    if (shortNotesDone) p += 15; // Short Notes 15%
    return Math.min(100, Math.round(p));
  };

  const progressPercent = calcProgress();

  const getSubjectColor = () => {
    switch (chapter.subject) {
      case 'physics':
        return { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', progress: 'from-blue-500 to-cyan-400' };
      case 'chemistry':
        return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', progress: 'from-emerald-500 to-teal-400' };
      case 'mathematics':
        return { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-400', progress: 'from-indigo-500 to-purple-400' };
      default:
        return { border: 'border-slate-700', bg: 'bg-slate-800', text: 'text-slate-300', progress: 'from-indigo-500 to-cyan-400' };
    }
  };

  const colors = getSubjectColor();

  return (
    <div 
      id={`chapter-card-${chapter.id}`}
      className={`rounded-3xl border bg-slate-900/90 backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden ${
        isChapterComplete 
          ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900 to-emerald-950/20' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Main Row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                {chapter.subject.toUpperCase()}
              </span>

              {isChapterComplete && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>MASTERED</span>
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white mt-1.5 truncate tracking-tight">
              {chapter.title}
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-black font-mono text-white">
                {progressPercent}%
              </div>
              <div className="text-[10px] font-mono text-slate-500">Progress</div>
            </div>

            {/* Menu options */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-9 z-20 w-36 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-1.5 text-xs font-mono animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(chapter);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Chapter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      deleteChapter(chapter.id);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 mt-3.5">
          <div 
            className={`h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Bento Stats Bar */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">Lectures</div>
            <div className="text-xs font-bold font-mono text-white mt-0.5">
              {completedLecturesCount}/{totalLectures}
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">PYQs</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${pyqDone ? 'text-emerald-400' : 'text-slate-300'}`}>
              {pyqDone ? 'Done' : (chapter.pyq.isDetailed ? `${chapter.pyq.completed}/${chapter.pyq.total}` : 'Pending')}
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">Short Notes</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${shortNotesDone ? 'text-emerald-400' : 'text-slate-500'}`}>
              {shortNotesDone ? 'Made ✓' : 'No'}
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">Revisions</div>
            <div className="text-xs font-bold font-mono text-indigo-400 mt-0.5">
              {chapter.revisionCount}x
            </div>
          </div>
        </div>

        {/* Expand / Collapse Details Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-slate-400 hover:text-slate-200 text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-800/60"
        >
          <span>{isExpanded ? 'Hide Chapter Checklist' : 'Expand Lecture & PYQ Checklist'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Deep Checklist Drawer */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 bg-slate-950/90 border-t border-slate-800 space-y-4 animate-fadeIn">
          {/* 1. Lectures Multi-Checkbox Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Lecture Checkboxes (1 to {totalLectures})</span>
              <span className="text-indigo-400">{completedLecturesCount} of {totalLectures} watched</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: totalLectures }, (_, i) => i + 1).map((lecNum) => {
                const isChecked = chapter.completedLectures?.includes(lecNum);
                return (
                  <button
                    key={lecNum}
                    type="button"
                    onClick={() => toggleLectureCompleted(chapter.id, lecNum)}
                    className={`py-2 px-1 rounded-2xl border text-xs font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850 hover:text-slate-300'
                    }`}
                  >
                    <span>L{lecNum}</span>
                    <span className="text-[9px] mt-0.5">{isChecked ? '✓' : '○'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PYQ Section Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Previous Years Questions (PYQs)</span>
              <button
                type="button"
                onClick={() => setChapterPYQ(chapter.id, { isDone: !chapter.pyq.isDone })}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  chapter.pyq.isDone 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {chapter.pyq.isDone ? '✓ PYQs Marked Done' : 'Mark PYQs Done'}
              </button>
            </div>

            {/* Detailed counters */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[10px] text-slate-500 block">Total Assigned</label>
                <input
                  type="number"
                  min="0"
                  value={chapter.pyq.total}
                  onChange={(e) => setChapterPYQ(chapter.id, { total: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-1 bg-transparent text-white font-bold focus:outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[10px] text-slate-500 block">Completed</label>
                <input
                  type="number"
                  min="0"
                  value={chapter.pyq.completed}
                  onChange={(e) => setChapterPYQ(chapter.id, { completed: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-1 bg-transparent text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[10px] text-slate-500 block">Correct</label>
                <input
                  type="number"
                  min="0"
                  value={chapter.pyq.correct || 0}
                  onChange={(e) => setChapterPYQ(chapter.id, { correct: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-1 bg-transparent text-indigo-400 font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Short Notes & Revision Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Short Notes */}
            <button
              type="button"
              onClick={() => toggleShortNotes(chapter.id)}
              className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                shortNotesDone
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="font-bold">Formula Short Notes</span>
              </div>
              <span className="text-[11px] font-bold">{shortNotesDone ? '✓ Completed' : 'Pending'}</span>
            </button>

            {/* Revision Counter */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-300">
                <RotateCw className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">Revision Count: {chapter.revisionCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => adjustRevisionCount(chapter.id, -1)}
                  disabled={chapter.revisionCount <= 0}
                  className="w-7 h-7 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => adjustRevisionCount(chapter.id, 1)}
                  className="w-7 h-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
