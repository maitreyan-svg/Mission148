import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Target, 
  Award, 
  Clock, 
  Droplets, 
  Save, 
  Sparkles,
  CheckCircle2,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { DailyTargetImageCard } from './DailyTargetImageCard';
import { TOTAL_MISSION_DAYS } from '../utils/missionDates';

export const ProfileSettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { activeDayNumber, dayLogs, tasks } = useMission();

  const [name, setName] = useState<string>(user?.name || 'Aspirant');
  const [username, setUsername] = useState<string>(user?.username?.replace(/^@/, '') || 'aspirant2027');
  const [jeeMainPercentile, setJeeMainPercentile] = useState<string>(user?.targets.jeeMainPercentile || '96+');
  const [jeeAdvancedAir, setJeeAdvancedAir] = useState<string>(user?.targets.jeeAdvancedAir || '< 10,000');
  const [dailyStudyGoal, setDailyStudyGoal] = useState<number>(user?.targets.dailyStudyHoursGoal || 15);
  const [dailyWaterGoal, setDailyWaterGoal] = useState<number>(user?.targets.dailyWaterGoalMl || 3000);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previewDay, setPreviewDay] = useState<number>(activeDayNumber || 1);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMsg(null);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '');
      await updateProfile({
        name: name.trim() || 'Aspirant',
        username: cleanUsername ? `@${cleanUsername}` : '@aspirant2027',
        isPublic: false,
        targets: {
          jeeMainPercentile: jeeMainPercentile.trim(),
          jeeAdvancedAir: jeeAdvancedAir.trim(),
          dailyStudyHoursGoal: Number(dailyStudyGoal) || 15,
          dailyWaterGoalMl: Number(dailyWaterGoal) || 3000,
        },
      });
      setProfileMsg({ text: '✓ Personal settings and targets saved!', type: 'success' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Failed to update personal settings.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-settings-page" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            PERSONAL PROFILE & MISSION TARGETS
          </h2>
          <p className="text-xs text-indigo-400 font-mono">
            Personal Use Dashboard • Customize Username, Daily Goals & Target Cards
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Personal Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun / Aspirant"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Personal Username
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="aspirant2027"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Used on your daily target report cards & streak exports.
                </p>
              </div>
            </div>
          </div>

          {/* Exam & Daily Targets */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>JEE 2027 Targets & Daily Benchmarks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target JEE Main Percentile</span>
                </label>
                <input
                  type="text"
                  value={jeeMainPercentile}
                  onChange={(e) => setJeeMainPercentile(e.target.value)}
                  placeholder="e.g. 96+ or 99.5"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target JEE Advanced AIR</span>
                </label>
                <input
                  type="text"
                  value={jeeAdvancedAir}
                  onChange={(e) => setJeeAdvancedAir(e.target.value)}
                  placeholder="e.g. < 10,000 or Top 1,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Daily Study Target (Hours)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  value={dailyStudyGoal}
                  onChange={(e) => setDailyStudyGoal(parseFloat(e.target.value) || 10)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  <span>Daily Hydration Goal (ml)</span>
                </label>
                <input
                  type="number"
                  step="250"
                  min="500"
                  max="6000"
                  value={dailyWaterGoal}
                  onChange={(e) => setDailyWaterGoal(parseInt(e.target.value, 10) || 3000)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Action Message and Save Button */}
          {profileMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Personal Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Target Image Preview & Exporter Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Save & Export Target Image</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generate and download your high-resolution mission card with your personal username
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400">Day:</span>
            <select
              value={previewDay}
              onChange={(e) => setPreviewDay(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {Array.from({ length: TOTAL_MISSION_DAYS }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Day {idx + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <DailyTargetImageCard
            dayNumber={previewDay}
            user={user}
            dayLog={dayLogs[previewDay]}
            tasks={tasks}
          />
        </div>
      </div>
    </div>
  );
};
