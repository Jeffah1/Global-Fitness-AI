import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
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
  const { error } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
        await register(
            email, 
            password,
            onboardingData.name, 
            onboardingData.goal, 
            onboardingData.activityLevel
        );
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto animate-fade-in">
      <button onClick={onBack} className="absolute top-8 left-6 text-slate-400 hover:text-white">
        <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-slate-400">Save your personalized plan.</p>
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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" isLoading={loading}>
          Register
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