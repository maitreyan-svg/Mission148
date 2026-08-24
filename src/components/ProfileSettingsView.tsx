import React, { useState, useRef } from 'react';
import { 
  User, 
  Settings, 
  Target, 
  Award, 
  Clock, 
  Droplets, 
  Shield, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Save, 
  LogOut,
  Sparkles,
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SyncStatusBadge } from './SyncStatusBadge';

export const ProfileSettingsView: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    resetPassword, 
    logout, 
    exportBackup, 
    importBackup, 
    forceCloudSync,
    syncStatus,
    lastSyncedAt 
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [jeeMainPercentile, setJeeMainPercentile] = useState<string>(user?.targets.jeeMainPercentile || '96+');
  const [jeeAdvancedAir, setJeeAdvancedAir] = useState<string>(user?.targets.jeeAdvancedAir || '< 10,000');
  const [dailyStudyGoal, setDailyStudyGoal] = useState<number>(user?.targets.dailyStudyHoursGoal || 10);
  const [dailyWaterGoal, setDailyWaterGoal] = useState<number>(user?.targets.dailyWaterGoalMl || 3000);
  const [isPublic, setIsPublic] = useState<boolean>(user?.isPublic ?? true);

  // Password fields
  const [useDirectReset, setUseDirectReset] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [backupMsg, setBackupMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        isPublic,
        targets: {
          jeeMainPercentile: jeeMainPercentile.trim(),
          jeeAdvancedAir: jeeAdvancedAir.trim(),
          dailyStudyHoursGoal: Number(dailyStudyGoal) || 10,
          dailyWaterGoalMl: Number(dailyWaterGoal) || 3000,
        },
      });
      setProfileMsg({ text: '✓ Profile updated and synchronized to Cloud SQL database!', type: 'success' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setBackupMsg(null);
    try {
      await forceCloudSync();
      setBackupMsg({ text: '✓ Successfully synchronized all records with Cloud SQL PostgreSQL!', type: 'success' });
      setTimeout(() => setBackupMsg(null), 3000);
    } catch (err: any) {
      setBackupMsg({ text: err.message || 'Cloud synchronization failed.', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportData = async () => {
    try {
      await exportBackup();
      setBackupMsg({ text: '✓ Cloud backup downloaded successfully!', type: 'success' });
      setTimeout(() => setBackupMsg(null), 3000);
    } catch (err: any) {
      setBackupMsg({ text: err.message || 'Export failed.', type: 'error' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setBackupMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const backupData = JSON.parse(content);
        await importBackup(backupData);
        setBackupMsg({ text: '✓ Backup successfully restored into Cloud SQL and refreshed!', type: 'success' });
        setTimeout(() => setBackupMsg(null), 4000);
      } catch (err: any) {
        setBackupMsg({ text: `Import failed: ${err.message || 'Invalid backup JSON file.'}`, type: 'error' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    try {
      if (useDirectReset && user) {
        await resetPassword({
          identifier: user.email || user.username,
          newPassword,
        });
        setPassMsg({ text: '✓ Password reset and updated successfully in cloud database!', type: 'success' });
      } else {
        await changePassword(currentPassword, newPassword);
        setPassMsg({ text: '✓ Password changed successfully!', type: 'success' });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(null), 3500);
    } catch (err: any) {
      setPassMsg({ text: err.message || 'Failed to change password.', type: 'error' });
    }
  };

  return (
    <div id="profile-settings-page" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              ACCOUNT & MISSION SETTINGS
            </h2>
            <p className="text-xs text-emerald-400 font-mono">
              Manage personal targets, cloud database persistence, and backup restoration
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900/60 text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Cloud Database & Backup Management Card */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-950/30 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>CLOUD DATABASE & PERSISTENT STORAGE</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Engine: Cloud SQL PostgreSQL • Region: asia-southeast1 • Real Multi-Device Sync
              </p>
            </div>
          </div>

          <SyncStatusBadge />
        </div>

        {backupMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-mono border ${
            backupMsg.type === 'success' 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            {backupMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Cloud Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold transition-all shadow-inner cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : 'text-indigo-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Force Cloud Sync'}</span>
          </button>

          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all shadow-inner cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export My Data (.json)</span>
          </button>

          {/* Import Data Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all shadow-inner cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{isImporting ? 'Restoring...' : 'Restore Backup (.json)'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Cross-Device Synchronization Active</span>
          </p>
          <p>
            Your JEE 2027 chapters, PYQs, daily logs, tasks, timer logs, and test series are tied directly to your unique user ID (<span className="text-indigo-300">{user?.id}</span>) and stored securely in Cloud SQL. When you log in from your phone, laptop, or tablet, your data will load instantly.
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 shadow-xl space-y-6">
        
        {/* Profile Card Intro */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {user?.username}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {profileMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-mono border ${
            profileMsg.type === 'success' 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            {profileMsg.text}
          </div>
        )}

        {/* Basic Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Targets & Goals */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Personal JEE 2027 Goals & Daily Targets
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 mb-1">
                🎯 JEE Main Target Percentile
              </label>
              <input
                type="text"
                value={jeeMainPercentile}
                onChange={(e) => setJeeMainPercentile(e.target.value)}
                placeholder="e.g. 96+, 99+"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-400 mb-1">
                🏆 JEE Advanced Target Rank
              </label>
              <input
                type="text"
                value={jeeAdvancedAir}
                onChange={(e) => setJeeAdvancedAir(e.target.value)}
                placeholder="e.g. AIR < 10,000, AIR < 2,000"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                ⏱ Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyStudyGoal}
                onChange={(e) => setDailyStudyGoal(parseInt(e.target.value, 10) || 10)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                💧 Daily Water Goal (ml)
              </label>
              <input
                type="number"
                step="250"
                min="500"
                max="6000"
                value={dailyWaterGoal}
                onChange={(e) => setDailyWaterGoal(parseInt(e.target.value, 10) || 3000)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Public Profile Visibility Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
              {isPublic ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              <span>Public Community Profile</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              When enabled, your preparation hours and badges show on the Mission 148 Leaderboard and comparison tool.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              isPublic
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isPublic ? 'PUBLIC (ON)' : 'PRIVATE (OFF)'}
          </button>
        </div>

        {/* Submit Profile */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              {useDirectReset ? 'Direct Password Reset' : 'Security & Change Password'}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              setUseDirectReset(!useDirectReset);
              setPassMsg(null);
            }}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            {useDirectReset ? 'Use Current Password mode' : 'Forgot current password? Reset directly'}
          </button>
        </div>

        {passMsg && (
          <div className={`p-3 rounded-xl text-xs font-mono border ${
            passMsg.type === 'success' 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            {passMsg.text}
          </div>
        )}

        <div className={`grid grid-cols-1 ${useDirectReset ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
          {!useDirectReset && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Current Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                required={!useDirectReset}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">New Password * (Min 6 chars)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Confirm New Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>{useDirectReset ? 'Reset & Save Password' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
