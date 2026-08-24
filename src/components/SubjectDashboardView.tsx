import React, { useState } from 'react';
import { 
  Atom, 
  FlaskConical, 
  Calculator, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  RotateCw, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { SubjectType, Chapter } from '../types';
import { useMission } from '../context/MissionContext';
import { ChapterCard } from './ChapterCard';
import { AddChapterModal } from './AddChapterModal';
import { EditChapterModal } from './EditChapterModal';

interface SubjectDashboardViewProps {
  subject: SubjectType;
}

export const SubjectDashboardView: React.FC<SubjectDashboardViewProps> = ({ subject }) => {
  const { chapters, stats } = useMission();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'in_progress'>('all');

  const subjectChapters = chapters.filter(c => c.subject === subject);

  const getSubjectMeta = () => {
    switch (subject) {
      case 'physics':
        return {
          title: 'PHYSICS',
          symbol: '⚛',
          icon: Atom,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500/20 via-slate-900/60 to-slate-950',
          border: 'border-cyan-500/30',
          stats: stats?.physics,
          badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          btnBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950',
          accent: 'cyan'
        };
      case 'chemistry':
        return {
          title: 'CHEMISTRY',
          symbol: '🧪',
          icon: FlaskConical,
          color: 'text-emerald-400',
          gradient: 'from-emerald-500/20 via-slate-900/60 to-slate-950',
          border: 'border-emerald-500/30',
          stats: stats?.chemistry,
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950',
          accent: 'emerald'
        };
      case 'mathematics':
        return {
          title: 'MATHEMATICS',
          symbol: '📐',
          icon: Calculator,
          color: 'text-amber-400',
          gradient: 'from-amber-500/20 via-slate-900/60 to-slate-950',
          border: 'border-amber-500/30',
          stats: stats?.mathematics,
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          btnBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950',
          accent: 'amber'
        };
    }
  };

  const meta = getSubjectMeta();
  const Icon = meta.icon;
  const subStats = meta.stats;

  // Calculate totals
  const totalChapters = subjectChapters.length;
  const completedChapters = subjectChapters.filter(c => {
    const lecDone = c.totalLectures > 0 ? (c.completedLectures?.length || 0) >= c.totalLectures : true;
    const pyqDone = c.pyq.isDone || (c.pyq.isDetailed && c.pyq.completed >= c.pyq.total && c.pyq.total > 0);
    return lecDone && pyqDone && c.shortNotesMade;
  }).length;

  const totalLectures = subjectChapters.reduce((acc, c) => acc + (c.totalLectures || 0), 0);
  const completedLectures = subjectChapters.reduce((acc, c) => acc + (c.completedLectures?.length || 0), 0);

  const totalPYQs = subjectChapters.reduce((acc, c) => {
    if (c.pyq.isDetailed) return acc + (c.pyq.completed || 0);
    return acc + (c.pyq.isDone ? 1 : 0);
  }, 0);

  const totalRevisions = subjectChapters.reduce((acc, c) => acc + (c.revisionCount || 0), 0);

  const progressPercent = subStats?.progressPercent || (totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0);

  // Filtered chapter list
  const filteredChapters = subjectChapters.filter(c => {
    const isComp = (c.completedLectures?.length || 0) >= c.totalLectures && (c.pyq.isDone || (c.pyq.completed > 0 && c.pyq.completed >= c.pyq.total)) && c.shortNotesMade;
    if (filterMode === 'completed' && !isComp) return false;
    if (filterMode === 'in_progress' && isComp) return false;

    if (searchQuery.trim()) {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div id={`subject-dashboard-${subject}`} className="space-y-6">
      {/* Subject Banner & Metrics Header */}
      <div className={`relative overflow-hidden rounded-3xl border ${meta.border} bg-gradient-to-br ${meta.gradient} p-6 md:p-8 shadow-2xl backdrop-blur-xl`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${meta.border} ${meta.badgeBg}`}>
              {meta.symbol}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                  CORE SUBJECT
                </span>
                <span className="text-xs text-slate-400 font-mono">148 DAYS TARGET</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
                {meta.title} DASHBOARD
              </h2>
            </div>
          </div>

          {/* + ADD CHAPTER Button */}
          <button
            id={`btn-add-chapter-${subject}`}
            onClick={() => setIsAddModalOpen(true)}
            className={`px-5 py-3 rounded-2xl ${meta.btnBg} font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xl shadow-slate-950/50 transition-all cursor-pointer self-start md:self-auto hover:scale-105`}
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD CHAPTER</span>
          </button>
        </div>

        {/* Mandatory Subject Stats (Spec 17) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">Overall Progress</div>
            <div className={`text-xl md:text-2xl font-black font-mono ${meta.color} mt-1`}>
              {progressPercent}%
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">Chapters</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-1">
              {completedChapters} / {totalChapters}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {totalChapters > 0 ? `${Math.round((completedChapters/totalChapters)*100)}% Mastered` : '0 Added'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">Lectures</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-1">
              {completedLectures} / {totalLectures}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {totalLectures > 0 ? `${Math.round((completedLectures/totalLectures)*100)}% Done` : '0 Lectures'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">PYQs Solved</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-1">
              {totalPYQs}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Past Year Questions</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-mono text-slate-400">Revisions</div>
            <div className="text-xl md:text-2xl font-black font-mono text-white mt-1">
              {totalRevisions}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Total Cycles</div>
          </div>
        </div>
      </div>

      {/* Chapters Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {[
            { id: 'all' as const, label: `All (${totalChapters})` },
            { id: 'in_progress' as const, label: `In Progress (${totalChapters - completedChapters})` },
            { id: 'completed' as const, label: `Completed (${completedChapters})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                filterMode === tab.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={`Search ${meta.title} chapters...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Chapters List */}
      <div className="space-y-3">
        {filteredChapters.map((ch) => (
          <ChapterCard
            key={ch.id}
            chapter={ch}
            onEdit={(chap) => setEditingChapter(chap)}
          />
        ))}

        {/* Empty State / Prompt to Add Chapters (Mandatory Requirement 7 & 30) */}
        {subjectChapters.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-3xl">
              {meta.symbol}
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Chapters Added Yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                You decide which {meta.title.toLowerCase()} chapters to prepare. Add your customized chapter syllabus to start tracking lectures, PYQs, short notes, and revisions.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`px-6 py-2.5 rounded-2xl ${meta.btnBg} font-black text-xs uppercase tracking-wider inline-flex items-center space-x-2 shadow-lg cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD FIRST {meta.title} CHAPTER</span>
            </button>
          </div>
        )}

        {subjectChapters.length > 0 && filteredChapters.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-slate-500 rounded-2xl bg-slate-900/30 border border-slate-800">
            No {meta.title.toLowerCase()} chapters found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Modals */}
      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSubject={subject}
      />

      <EditChapterModal
        isOpen={!!editingChapter}
        chapter={editingChapter}
        onClose={() => setEditingChapter(null)}
      />
    </div>
  );
};
