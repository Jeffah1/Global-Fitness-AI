import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/Input';
import { useGlobalContext } from '../../context/GlobalContext';
import { useApp } from '../../context/AppContext';

interface RegisterScreenProps {
  onLogin: () => void;
  onBack: () => void;
  onboardingData: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onLogin, onBack, onboardingData }) => {
  const { register } = useGlobalContext();
  const { setError, error } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
        await register(
            email, 
            password,
            onboardingData.name, 
            onboardingData.goal, 
            onboardingData.activityLevel
        );
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto animate-fade-in relative">
      <button onClick={onBack} className="absolute top-8 left-6 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-slate-400">Save your personalized plan & track progress.</p>
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
        <InputField 
          icon={<Lock size={20} />}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputField 
          icon={<Lock size={20} />}
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        )}

        <Button type="submit" isLoading={loading}>
          Create Account & Verify
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button onClick={onLogin} className="text-[#00FF9C] font-bold hover:underline">
          Login
        </button>
      </div>
    </div>
  );
};