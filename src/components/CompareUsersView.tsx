import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ArrowRightLeft, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  Clock, 
  RotateCw, 
  Atom, 
  FlaskConical, 
  Calculator,
  Sparkles
} from 'lucide-react';
import { PublicProfileData } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CompareUsersView: React.FC = () => {
  const { user } = useAuth();
  const [user1Search, setUser1Search] = useState<string>(user?.username ? user.username.replace(/^@/, '') : 'nibir148');
  const [user2Search, setUser2Search] = useState<string>('arjun_iit');

  const [profile1, setProfile1] = useState<PublicProfileData | null>(null);
  const [profile2, setProfile2] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchComparison = async (u1: string, u2: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.compareUsers(u1, u2);
      setProfile1(res.user1);
      setProfile2(res.user2);
      if (!res.user1 && !res.user2) {
        setError('Neither user was found or marked public.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(user1Search, user2Search);
  }, []);

  const handleCompareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComparison(user1Search, user2Search);
  };

  const renderComparisonBar = (label: string, val1: number, val2: number, unit: string = '', isPercent: boolean = false) => {
    const total = (val1 + val2) || 1;
    const p1 = Math.round((val1 / total) * 100);
    const p2 = 100 - p1;

    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className={`font-bold ${val1 >= val2 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {val1}{unit}
          </span>
          <span className="text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
          <span className={`font-bold ${val2 >= val1 ? 'text-cyan-400' : 'text-slate-300'}`}>
            {val2}{unit}
          </span>
        </div>

        {/* Dual Split Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800/80">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500" 
            style={{ width: `${p1}%` }} 
          />
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500" 
            style={{ width: `${p2}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div id="compare-users-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            COMPARE PREPARATION ANALYTICS
          </h2>
          <p className="text-xs text-cyan-400 font-mono">
            Side-by-side study tracking comparison between public peers
          </p>
        </div>
      </div>

      {/* Notice Banner (Spec 20) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400 font-mono">
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          Activity Metrics Comparison: Activity metrics track preparation volume and consistency only. Higher activity is not a guarantee of JEE rank.
        </span>
      </div>

      {/* User Search & Selector Form */}
      <form onSubmit={handleCompareSubmit} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
              User 1 (@username)
            </label>
            <input
              type="text"
              placeholder="e.g. nibir148"
              value={user1Search}
              onChange={(e) => setUser1Search(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
              User 2 (@username)
            </label>
            <input
              type="text"
              placeholder="e.g. arjun_iit, priya_rank1"
              value={user2Search}
              onChange={(e) => setUser2Search(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isLoading ? 'Comparing Profiles...' : 'Compare Side-by-Side'}</span>
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Comparison Cards & Side-by-side Table */}
      {profile1 && profile2 && (
        <div className="space-y-5 animate-fadeIn">
          {/* User Headers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center uppercase mb-3">
                {profile1.user.name.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-white truncate">{profile1.user.name}</h3>
              <p className="text-xs text-emerald-400 font-mono">{profile1.user.username}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                Target: {profile1.user.targets.jeeMainPercentile} Percentile
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-500/30">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center uppercase mb-3">
                {profile2.user.name.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-white truncate">{profile2.user.name}</h3>
              <p className="text-xs text-cyan-400 font-mono">{profile2.user.username}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                Target: {profile2.user.targets.jeeMainPercentile} Percentile
              </div>
            </div>
          </div>

          {/* Metric Comparison Bars (Mandatory Spec 20 Table) */}
          <div className="space-y-3">
            {renderComparisonBar('Mission Progress', profile1.stats.missionProgressPercent, profile2.stats.missionProgressPercent, '%', true)}
            {renderComparisonBar('Study Hours', profile1.stats.totalStudyHours, profile2.stats.totalStudyHours, 'h')}
            {renderComparisonBar('Chapters Completed', profile1.stats.completedChapters, profile2.stats.completedChapters)}
            {renderComparisonBar('Lectures Completed', profile1.stats.completedLectures, profile2.stats.completedLectures)}
            {renderComparisonBar('PYQs Completed', profile1.stats.completedPYQs, profile2.stats.completedPYQs)}
            {renderComparisonBar('Revisions Count', profile1.stats.totalRevisions, profile2.stats.totalRevisions, '×')}
            {renderComparisonBar('Physics Progress', profile1.stats.physics.progressPercent, profile2.stats.physics.progressPercent, '%', true)}
            {renderComparisonBar('Chemistry Progress', profile1.stats.chemistry.progressPercent, profile2.stats.chemistry.progressPercent, '%', true)}
            {renderComparisonBar('Mathematics Progress', profile1.stats.mathematics.progressPercent, profile2.stats.mathematics.progressPercent, '%', true)}
            {renderComparisonBar('Current Streak', profile1.stats.currentStreak, profile2.stats.currentStreak, ' Days')}
          </div>
        </div>
      )}
    </div>
  );
};
