import React, { useState } from 'react';
import { X, Plus, Atom, FlaskConical, Calculator } from 'lucide-react';
import { SubjectType } from '../types';
import { useMission } from '../context/MissionContext';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: SubjectType;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'physics'
}) => {
  const { addChapter } = useMission();
  const [subject, setSubject] = useState<SubjectType>(defaultSubject);
  const [name, setName] = useState<string>('');
  const [totalLectures, setTotalLectures] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a chapter name.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await addChapter(subject, name.trim(), Number(totalLectures) || 10);
      setName('');
      setTotalLectures(10);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add chapter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions: { id: SubjectType; label: string; icon: any; color: string }[] = [
    { id: 'physics', label: 'Physics', icon: Atom, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'mathematics', label: 'Mathematics', icon: Calculator, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="modal-add-chapter"
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white">Add New Chapter</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Subject
            </label>
            <div className="grid grid-cols-3 gap-2">
              {subjectOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = subject === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSubject(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? opt.color
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Chapter Name
            </label>
            <input
              id="input-chapter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kinematics, Chemical Bonding, Quadratic Equations"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              required
              autoFocus
            />
          </div>

          {/* Total Lectures */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Total Lectures to Complete
            </label>
            <input
              id="input-total-lectures"
              type="number"
              min="1"
              max="100"
              value={totalLectures}
              onChange={(e) => setTotalLectures(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              You will be able to check off individual lectures (e.g. Lecture 1, Lecture 2).
            </p>
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
              id="btn-submit-add-chapter"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Adding...' : '+ Add Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
