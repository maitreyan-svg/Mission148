import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Award, 
  Eye, 
  EyeOff, 
  ArrowRightLeft, 
  Sparkles,
  Search
} from 'lucide-react';
import { PublicProfileData } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LeaderboardViewProps {
  onCompareWithUser: (username: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onCompareWithUser }) => {
  const { user, updateProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<PublicProfileData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleTogglePublic = async () => {
    if (!user) return;
    const newStatus = !user.isPublic;
    await updateProfile({ isPublic: newStatus });
    fetchLeaderboard();
  };

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return entry.user.name.toLowerCase().includes(q) || entry.user.username.toLowerCase().includes(q);
  });

  return (
    <div id="leaderboard-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              MISSION 148 LEADERBOARD
            </h2>
            <p className="text-xs text-amber-400 font-mono">
              Public Aspirants Community • Ranked by Verified Study Consistency
            </p>
          </div>
        </div>

        {/* User Privacy Control Toggle */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl self-start sm:self-auto">
          <div className="text-xs font-mono">
            <span className="text-slate-400">Your Status: </span>
            <span className={user?.isPublic ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
              {user?.isPublic ? 'PUBLIC' : 'PRIVATE'}
            </span>
          </div>
          <button
            onClick={handleTogglePublic}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              user?.isPublic 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {user?.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{user?.isPublic ? 'Make Private' : 'Make Public'}</span>
          </button>
        </div>
      </div>

      {/* Community Search */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Showing {filteredLeaderboard.length} Public JEE Aspirants</span>
        </div>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search aspirants by name or @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Aspirant</th>
                <th className="py-3.5 px-4 text-center">Mission Progress</th>
                <th className="py-3.5 px-4 text-center">Study Hours</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4 text-center">Badges</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredLeaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.user.username === user.username;
                return (
                  <tr 
                    key={entry.user.id || index}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isCurrentUser ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      {index === 0 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black inline-flex items-center justify-center text-sm shadow-md">
                          🥇
                        </span>
                      ) : index === 1 ? (
                        <span className="w-7 h-7 rounded-xl bg-slate-400/20 border border-slate-400/40 text-slate-300 font-black inline-flex items-center justify-center text-sm">
                          🥈
                        </span>
                      ) : index === 2 ? (
                        <span className="w-7 h-7 rounded-xl bg-orange-700/20 border border-orange-700/40 text-orange-400 font-black inline-flex items-center justify-center text-sm">
                          🥉
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500">#{index + 1}</span>
                      )}
                    </td>

                    {/* Aspirant Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-white font-bold flex items-center justify-center uppercase">
                          {entry.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{entry.user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20">YOU</span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">{entry.user.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-cyan-400">{entry.stats.missionProgressPercent}%</span>
                        <div className="w-16 h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 rounded-full" 
                            style={{ width: `${entry.stats.missionProgressPercent}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Study Hours */}
                    <td className="py-4 px-4 text-center font-bold text-emerald-400">
                      {entry.stats.totalStudyHours}h
                    </td>

                    {/* Streak */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        <span>{entry.stats.currentStreak}d</span>
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1 flex-wrap gap-1">
                        {entry.badges && entry.badges.map((b) => (
                          <span 
                            key={b.id} 
                            title={b.description} 
                            className="text-sm cursor-help bg-slate-900 border border-slate-800 p-1 rounded-lg"
                          >
                            {b.icon}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Compare Button */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onCompareWithUser(entry.user.username)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center space-x-1 inline-flex transition-colors cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Compare</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
