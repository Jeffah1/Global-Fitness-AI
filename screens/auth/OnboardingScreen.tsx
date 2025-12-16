import React, { useState } from 'react';
import { ArrowRight, Ruler, Scale, CheckCircle, Activity, ChevronLeft, Target, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { InputField, SelectField } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

interface OnboardingProps {
  onComplete: (data: any) => void;
  onLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete, onLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    activityLevel: 'Intermediate',
    goal: 'Build Muscle'
  });

  const updateData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-lg mx-auto p-6 relative z-10">
        {/* Header / Progress */}
        <div className="flex justify-between items-center mb-8">
            {step > 1 ? (
                <button 
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            ) : (
                <div className="w-10"></div> // Spacer
            )}
            
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                    step >= i ? 'w-8 bg-[#00FF9C] shadow-[0_0_10px_rgba(0,255,156,0.5)]' : 'w-2 bg-slate-700'
                    }`}
                />
                ))}
            </div>
            
            <div className="w-10"></div> // Spacer
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
            <div className="text-center space-y-8 animate-fade-in">
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-[#00FF9C] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-[#00FF9C] to-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-5xl font-bold text-slate-900 shadow-2xl transform transition-transform group-hover:scale-105 duration-300 border-4 border-slate-900/10">
                        <Sparkles size={48} className="text-slate-900" />
                    </div>
                </div>
            
                <div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
                        Global Fitness AI
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                        Your intelligent companion for <span className="text-[#00FF9C]">workouts</span>, <span className="text-blue-400">nutrition</span>, and <span className="text-purple-400">progress</span>.
                    </p>
                </div>

                <div className="pt-8 space-y-4">
                    <Button 
                        onClick={handleNext} 
                        icon={<ArrowRight />} 
                        className="w-full py-5 text-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                    >
                        Start Your Journey
                    </Button>
                    <Button variant="ghost" onClick={onLogin} className="w-full">
                        I already have an account
                    </Button>
                </div>
            </div>
        )}

        {/* Screen 2: Personal Info */}
        {step === 2 && (
            <div className="space-y-6 animate-slide-up bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 shadow-xl">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Activity className="text-[#00FF9C]" size={24} />
                    Profile Setup
                </h2>
                <p className="text-slate-400 text-sm">Calibrating your AI trainer...</p>
            </div>

            <InputField 
                label="Full Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => updateData('name', e.target.value)}
                autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
                <InputField 
                label="Age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => updateData('age', e.target.value)}
                />
                <SelectField 
                label="Gender"
                options={['Male', 'Female', 'Other']}
                value={formData.gender}
                onChange={(e) => updateData('gender', e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputField 
                label="Height (cm)"
                type="number"
                placeholder="175"
                icon={<Ruler size={16} />}
                value={formData.height}
                onChange={(e) => updateData('height', e.target.value)}
                />
                <InputField 
                label="Weight (kg)"
                type="number"
                placeholder="70"
                icon={<Scale size={16} />}
                value={formData.weight}
                onChange={(e) => updateData('weight', e.target.value)}
                />
            </div>

            <SelectField 
                label="Activity Level"
                options={['Beginner', 'Intermediate', 'Advanced', 'Athlete']}
                value={formData.activityLevel}
                onChange={(e) => updateData('activityLevel', e.target.value)}
            />

            <Button 
                onClick={handleNext} 
                disabled={!formData.name}
                className="mt-6 w-full"
            >
                Next Step
            </Button>
            </div>
        )}

        {/* Screen 3: Goals */}
        {step === 3 && (
            <div className="space-y-6 animate-slide-up bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 shadow-xl">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Target className="text-red-400" size={24} />
                    Primary Goal
                </h2>
                <p className="text-slate-400 text-sm">What are we crushing today?</p>
            </div>

            <div className="space-y-3">
                {[
                    { id: 'Lose Weight', desc: 'Burn fat & get lean' }, 
                    { id: 'Build Muscle', desc: 'Gain mass & strength' }, 
                    { id: 'Get Toned', desc: 'Definition & stamina' }, 
                    { id: 'Improve Health', desc: 'Longevity & wellness' }
                ].map((item) => (
                <Card 
                    key={item.id} 
                    onClick={() => updateData('goal', item.id)}
                    isActive={formData.goal === item.id}
                    className={`flex items-center justify-between p-4 transition-all duration-200 group ${
                        formData.goal === item.id ? 'bg-[#00FF9C]/10 border-[#00FF9C]' : 'hover:bg-slate-700/50'
                    }`}
                >
                    <div>
                        <span className={`font-bold block ${formData.goal === item.id ? 'text-white' : 'text-slate-200'}`}>
                            {item.id}
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400">{item.desc}</span>
                    </div>
                    {formData.goal === item.id && (
                        <div className="bg-[#00FF9C] rounded-full p-1 shadow-[0_0_10px_rgba(0,255,156,0.5)]">
                            <CheckCircle className="text-slate-900" size={16} />
                        </div>
                    )}
                </Card>
                ))}
            </div>

            <Button onClick={handleNext} className="mt-8 w-full py-5 text-lg" icon={<CheckCircle />}>
                Complete Setup
            </Button>
            </div>
        )}
      </div>
    </div>
  );
};