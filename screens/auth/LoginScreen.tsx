import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/Input';
import { useGlobalContext } from '../../context/GlobalContext';
import { useApp } from '../../context/AppContext';

interface LoginScreenProps {
  onRegister: () => void;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onRegister, onBack }) => {
  const { login } = useGlobalContext();
  const { error } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto animate-fade-in">
      {onBack && (
        <button onClick={onBack} className="absolute top-8 left-6 text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
      )}

      <div className="text-center mb-10">
         <div className="w-16 h-16 bg-[#00FF9C] rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-slate-900 shadow-[0_0_20px_rgba(0,255,156,0.2)]">
            G
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-slate-400">Login to continue your journey.</p>
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
                <button type="button" className="text-xs text-[#00FF9C] hover:underline">
                    Forgot Password?
                </button>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" isLoading={loading}>
          Login
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button onClick={onRegister} className="text-[#00FF9C] font-bold hover:underline">
          Create Account
        </button>
      </div>
    </div>
  );
};