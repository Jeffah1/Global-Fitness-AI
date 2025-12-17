import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle, AlertTriangle, ChevronRight, Activity, Ruler, Scale, ArrowLeft } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useGlobalContext();
  const [mode, setMode] = useState<'LOGIN' | 'ONBOARDING'>('LOGIN');
  const [step, setStep] = useState(0); // 0: Welcome, 1: Info, 2: Goals, 3: Account
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Muscle Gain');
  const [level, setLevel] = useState('Beginner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name, goal, level);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // --- LOGIN VIEW ---
  if (mode === 'LOGIN') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#00FF9C] rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-slate-900 shadow-[0_0_20px_rgba(0,255,156,0.3)]">
                        G
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Login to your personal AI coach.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            required
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Password"
                            required
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-4 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                        Login
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <button onClick={() => { setMode('ONBOARDING'); setStep(0); }} className="text-[#00FF9C] text-sm font-medium hover:underline">
                        Create an Account
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- ONBOARDING FLOW ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative animate-fade-in">
            {step > 0 && (
                <button onClick={prevStep} className="absolute top-8 left-8 text-slate-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
            )}

            {/* Step 0: Welcome */}
            {step === 0 && (
                <div className="text-center py-8 space-y-6 animate-fade-in">
                     <div className="w-20 h-20 bg-[#00FF9C] rounded-3xl mx-auto flex items-center justify-center text-4xl font-bold text-slate-900 shadow-[0_0_30px_rgba(0,255,156,0.4)]">
                        G
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Global Fitness AI</h1>
                        <p className="text-slate-400 text-lg">Your personal AI coach for workouts, meals & body transformation.</p>
                    </div>
                    <button 
                        onClick={nextStep}
                        className="w-full bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20"
                    >
                        Get Started <ArrowRight size={20} />
                    </button>
                    <button onClick={() => setMode('LOGIN')} className="text-slate-400 hover:text-white text-sm">
                        I already have an account
                    </button>
                </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Tell us about you</h2>
                        <p className="text-slate-400 text-sm">This helps AI personalize your plan.</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none" placeholder="John Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
                                <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none" placeholder="25" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Height (cm)</label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-3.5 text-slate-500" size={16} />
                                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none" placeholder="175" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Weight (kg)</label>
                                <div className="relative">
                                    <Scale className="absolute left-3 top-3.5 text-slate-500" size={16} />
                                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none" placeholder="70" />
                                </div>
                            </div>
                        </div>
                        <button onClick={nextStep} disabled={!name} className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all mt-4">
                            Next Step
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">What is your goal?</h2>
                        <p className="text-slate-400 text-sm">We will build your program around this.</p>
                    </div>
                    <div className="grid gap-3">
                        {['Lose Weight', 'Build Muscle', 'Get Toned', 'Improve Health'].map((g) => (
                            <button 
                                key={g} 
                                onClick={() => setGoal(g)}
                                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                                    goal === g 
                                    ? 'bg-[#00FF9C]/10 border-[#00FF9C] text-white' 
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                <span className="font-bold">{g}</span>
                                {goal === g && <CheckCircle size={20} className="text-[#00FF9C]" />}
                            </button>
                        ))}
                    </div>
                     <div className="mt-4">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Experience Level</label>
                        <div className="flex bg-slate-900 p-1 rounded-xl mt-1 border border-slate-700">
                            {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                <button 
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                        level === l ? 'bg-[#00FF9C] text-slate-900' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={nextStep} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all mt-4">
                        Next Step
                    </button>
                </div>
            )}

            {/* Step 3: Account */}
            {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                        <p className="text-slate-400 text-sm">Secure your data and start your journey.</p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                         <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="password" 
                                placeholder="Password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#00FF9C] outline-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-4 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                            Complete Registration
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export const VerificationScreen: React.FC = () => {
    const { user, verifyEmail, logout } = useGlobalContext();
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async () => {
        setVerifying(true);
        await verifyEmail();
        setVerifying(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
             <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-[#00FF9C]/10 rounded-full flex items-center justify-center mx-auto text-[#00FF9C]">
                    <Mail size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verify your Email</h2>
                    <p className="text-slate-400 text-sm">
                        We sent a verification link to <span className="text-white font-medium">{user?.email}</span>. 
                        Please check your inbox.
                    </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 text-left">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-xs text-yellow-200">
                        You must verify your email to access the full Global Fitness AI dashboard.
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleVerify}
                        disabled={verifying}
                        className="w-full bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {verifying ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        I Verified My Email
                    </button>
                    <button 
                        onClick={logout}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all"
                    >
                        Sign Out / Change Email
                    </button>
                </div>
             </div>
        </div>
    );
};