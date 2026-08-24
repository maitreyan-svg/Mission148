import React, { useState } from 'react';
import { X, Save, Edit3, CheckCircle2, Circle } from 'lucide-react';
import { Chapter } from '../types';
import { useMission } from '../context/MissionContext';

interface EditChapterModalProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  chapter,
  isOpen,
  onClose
}) => {
  const { updateChapter } = useMission();

  if (!isOpen || !chapter) return null;

  const [name, setName] = useState<string>(chapter.name);
  const [totalLectures, setTotalLectures] = useState<number>(chapter.totalLectures);
  const [isDetailedPyq, setIsDetailedPyq] = useState<boolean>(chapter.pyq.isDetailed);
  const [pyqDone, setPyqDone] = useState<boolean>(chapter.pyq.isDone);
  const [pyqTotal, setPyqTotal] = useState<number>(chapter.pyq.total || 100);
  const [pyqCompleted, setPyqCompleted] = useState<number>(chapter.pyq.completed || 0);
  const [pyqCorrect, setPyqCorrect] = useState<number>(chapter.pyq.correct || 0);
  const [pyqIncorrect, setPyqIncorrect] = useState<number>(chapter.pyq.incorrect || 0);
  const [shortNotesMade, setShortNotesMade] = useState<boolean>(chapter.shortNotesMade);
  const [revisionCount, setRevisionCount] = useState<number>(chapter.revisionCount || 0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateChapter(chapter.id, {
        name: name.trim(),
        totalLectures: Math.max(1, totalLectures),
        pyq: {
          isDone: pyqDone || (pyqCompleted > 0 && pyqCompleted >= pyqTotal),
          isDetailed: isDetailedPyq,
          total: pyqTotal,
          completed: pyqCompleted,
          correct: pyqCorrect,
          incorrect: pyqIncorrect,
        },
        shortNotesMade,
        revisionCount: Math.max(0, revisionCount),
      });
      onClose();
    } catch (err) {
      console.error('Failed to update chapter:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="modal-edit-chapter"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Edit3 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Chapter</h3>
              <p className="text-xs text-slate-400 font-mono capitalize">{chapter.subject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Chapter Name
            </label>
            <input
              id="edit-input-chapter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Total Lectures */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Total Lectures
            </label>
            <input
              id="edit-input-total-lectures"
              type="number"
              min="1"
              max="150"
              value={totalLectures}
              onChange={(e) => setTotalLectures(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* PYQ Tracking Section */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                PYQs (Past Year Questions)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDetailedPyq(!isDetailedPyq)}
                  className="text-[11px] text-cyan-400 font-mono hover:underline"
                >
                  {isDetailedPyq ? 'Switch to Simple Done/Not Done' : 'Switch to Detailed Counts'}
                </button>
              </div>
            </div>

            {!isDetailedPyq ? (
              <button
                type="button"
                onClick={() => setPyqDone(!pyqDone)}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                  pyqDone
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {pyqDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                <span>{pyqDone ? 'PYQs: Done ✓' : 'PYQs: Not Done'}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Total Target</label>
                  <input
                    type="number"
                    min="0"
                    value={pyqTotal}
                    onChange={(e) => setPyqTotal(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={pyqCompleted}
                    onChange={(e) => setPyqCompleted(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Correct</label>
                  <input
                    type="number"
                    min="0"
                    value={pyqCorrect}
                    onChange={(e) => setPyqCorrect(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Incorrect</label>
                  <input
                    type="number"
                    min="0"
                    value={pyqIncorrect}
                    onChange={(e) => setPyqIncorrect(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Short Notes & Revisions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Short Notes
              </label>
              <button
                type="button"
                onClick={() => setShortNotesMade(!shortNotesMade)}
                className={`w-full py-2 px-3 rounded-lg flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                  shortNotesMade
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {shortNotesMade ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                <span>{shortNotesMade ? '✓ Notes Made' : '☐ Not Made'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Revision Count
              </label>
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setRevisionCount(Math.max(0, revisionCount - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
                >
                  −
                </button>
                <span className="font-mono font-bold text-base text-white">
                  {revisionCount}×
                </span>
                <button
                  type="button"
                  onClick={() => setRevisionCount(revisionCount + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-edit-chapter"
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
