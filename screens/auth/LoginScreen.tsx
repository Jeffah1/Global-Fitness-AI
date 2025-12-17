import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/Input';
import { useUser } from '../../context/UserContext';
import { useApp } from '../../context/AppContext';

interface LoginScreenProps {
  onRegister: () => void;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onRegister, onBack }) => {
  const { loginWithGoogle, loginUser, resetPassword } = useUser(); 
  const { setError, error } = useApp();
  
  const [view, setView] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          await loginWithGoogle();
      } catch (err: any) {
          setError(err.message);
          setLoading(false);
      }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Please enter your email address.");
          return;
      }
      setLoading(true);
      setError(null);
      try {
          await resetPassword(email);
          setResetSent(true);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  // --- FORGOT PASSWORD VIEW ---
  if (view === 'FORGOT') {
      return (
        <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto animate-fade-in relative">
            <button onClick={() => setView('LOGIN')} className="absolute top-8 left-6 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <Lock size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-slate-400">Enter your email to receive a reset link.</p>
            </div>

            {resetSent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-fade-in">
                    <CheckCircle className="mx-auto text-emerald-400 mb-4" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                    <p className="text-slate-400 mb-6">We have sent a password reset link to <span className="text-white font-medium">{email}</span>.</p>
                    <Button onClick={() => setView('LOGIN')}>
                        Return to Login
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <InputField 
                        icon={<Mail size={20} />}
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                     {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    <Button type="submit" isLoading={loading}>
                        Send Reset Link
                    </Button>
                </form>
            )}
        </div>
      );
  }

  // --- LOGIN VIEW ---
  return (
    <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto animate-fade-in relative">
      {onBack && (
        <button onClick={onBack} className="absolute top-8 left-6 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}

      <div className="text-center mb-8">
         <div className="w-16 h-16 bg-[#00FF9C] rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-slate-900 shadow-[0_0_20px_rgba(0,255,156,0.2)]">
            G
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-slate-400">Login to continue your fitness journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField 
          icon={<Mail size={20} />}
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-2">
            <InputField 
            icon={<Lock size={20} />}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <div className="text-right">
                <button 
                    type="button" 
                    onClick={() => setView('FORGOT')}
                    className="text-xs text-[#00FF9C] hover:underline"
                >
                    Forgot Password?
                </button>
            </div>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        )}

        <Button type="submit" isLoading={loading}>
          Login
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
          <div className="h-[1px] bg-slate-700 flex-1"></div>
          <span className="text-slate-500 text-sm">OR</span>
          <div className="h-[1px] bg-slate-700 flex-1"></div>
      </div>

      <button 
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button onClick={onRegister} className="text-[#00FF9C] font-bold hover:underline">
          Create Account
        </button>
      </div>
    </div>
  );
};