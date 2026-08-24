import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SyncStatusBadgeProps {
  compact?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ compact = false }) => {
  const { syncStatus, lastSyncedAt, forceCloudSync, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getStatusContent = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />,
          label: 'Saving to Cloud...',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
          dotClass: 'bg-cyan-400 animate-pulse',
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Offline (Local Cache)',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          dotClass: 'bg-amber-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Sync Error (Click Retry)',
          badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900/80 cursor-pointer',
          dotClass: 'bg-rose-400',
        };
      case 'saved':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Saved to Cloud',
          badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60',
          dotClass: 'bg-emerald-400',
        };
    }
  };

  const status = getStatusContent();

  const formattedTime = lastSyncedAt 
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <button
      id="cloud-sync-status-badge"
      onClick={forceCloudSync}
      title={`Cloud Database: PostgreSQL (asia-southeast1) • Last Synced: ${formattedTime} (Click to Sync Now)`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-semibold transition-all duration-200 active:scale-95 ${status.badgeClass}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotClass}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dotClass}`}></span>
      </span>
      
      {status.icon}
      
      {!compact && (
        <span className="whitespace-nowrap">
          {status.label}
        </span>
      )}
    </button>
  );
};
