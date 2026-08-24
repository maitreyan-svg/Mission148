import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Target, 
  Flame, 
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register, resetPassword, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [jeeMainPercentile, setJeeMainPercentile] = useState<string>('96+');
  const [jeeAdvancedAir, setJeeAdvancedAir] = useState<string>('< 10,000');

  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!username.trim() || !password) {
          setError('Please enter your username/email and password.');
          setIsSubmitting(false);
          return;
        }
        await login(username.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim() || !username.trim() || !email.trim() || !password) {
          setError('Please fill in all required fields.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await register({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          targets: {
            jeeMainPercentile: jeeMainPercentile.trim() || '96+',
            jeeAdvancedAir: jeeAdvancedAir.trim() || '< 10,000',
            dailyStudyHoursGoal: 10,
            dailyWaterGoalMl: 3000,
          }
        });
        onClose();
      } else if (mode === 'forgot') {
        const identifier = email.trim() || username.trim();
        if (!identifier) {
          setError('Please enter your registered username or email.');
          setIsSubmitting(false);
          return;
        }
        if (!newPassword) {
          setError('Please enter your new password.');
          setIsSubmitting(false);
          return;
        }
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (confirmPassword && newPassword !== confirmPassword) {
          setError('New passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        await resetPassword({
          identifier,
          newPassword,
        });
        setSuccessMsg('✓ Password reset successfully! You can now log in.');
        setUsername(identifier);
        setPassword(newPassword);
        setTimeout(() => {
          setMode('login');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="auth-modal"
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 relative custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            {mode === 'login' && 'Sign In to Mission 148'}
            {mode === 'register' && 'Create Aspirant Account'}
            {mode === 'forgot' && 'Reset Mission Password'}
          </h3>
          <p className="text-xs font-mono text-emerald-400">
            148 DAYS. ONE MISSION. JEE 2027
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Nibir Paul"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                {mode === 'login' ? 'Username or Email *' : 'Username (Handle) *'}
              </label>
              <div className="relative">
                <span className="text-slate-500 font-mono text-xs absolute left-3.5 top-3">@</span>
                <input
                  type="text"
                  placeholder={mode === 'login' ? 'username or email (e.g. nibir148)' : 'nibir148'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="aspirant@jee2027.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Registered Username or Email *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. nibir148 or yourname@gmail.com"
                  value={email || username}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setUsername(e.target.value);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">New Password * (Min 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono text-cyan-400 mb-1">🎯 JEE Main Goal</label>
                <input
                  type="text"
                  value={jeeMainPercentile}
                  onChange={(e) => setJeeMainPercentile(e.target.value)}
                  placeholder="e.g. 96+, 99+"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-amber-400 mb-1">🏆 Advanced Goal</label>
                <input
                  type="text"
                  value={jeeAdvancedAir}
                  onChange={(e) => setJeeAdvancedAir(e.target.value)}
                  placeholder="e.g. < 10,000"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer mt-2 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Mission</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Join Mission 148</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Set New Password</span>
              </>
            )}
          </button>

          {/* Alternative Google Sign In */}
          {mode !== 'forgot' && (
            <>
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
              </button>
            </>
          )}
        </form>

        {/* Mode Switchers */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-2 text-xs font-mono">
          {mode === 'login' && (
            <>
              <div>
                <span className="text-slate-500">Don't have an account? </span>
                <button
                  onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
              <div>
                <button
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                  className="text-slate-400 hover:text-slate-300 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              <span className="text-slate-500">Already registered? </span>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
