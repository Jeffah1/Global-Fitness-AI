import React, { useState } from 'react';
import { ArrowRight, Ruler, Scale, CheckCircle, Activity } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-fade-in">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step >= i ? 'w-8 bg-[#00FF9C]' : 'w-2 bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Screen 1: Welcome */}
      {step === 1 && (
        <div className="text-center space-y-8 w-full animate-fade-in">
           <div className="w-24 h-24 bg-[#00FF9C] rounded-3xl mx-auto flex items-center justify-center text-4xl font-bold text-slate-900 shadow-[0_0_40px_rgba(0,255,156,0.4)]">
              G
          </div>
          <div>
              <h1 className="text-4xl font-bold text-white mb-3">Global Fitness AI</h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Your personal AI coach for workouts, meals & body transformation.
              </p>
          </div>
          <div className="pt-8 space-y-4">
            <Button onClick={handleNext} icon={<ArrowRight />}>
              Get Started
            </Button>
            <Button variant="ghost" onClick={onLogin}>
              I already have an account
            </Button>
          </div>
        </div>
      )}

      {/* Screen 2: Personal Info */}
      {step === 2 && (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Tell us about you</h2>
            <p className="text-slate-400">This helps AI personalize your plan.</p>
          </div>

          <InputField 
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => updateData('name', e.target.value)}
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
            className="mt-6"
          >
            Next Step
          </Button>
        </div>
      )}

      {/* Screen 3: Goals */}
      {step === 3 && (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">What is your goal?</h2>
            <p className="text-slate-400">We will build your program around this.</p>
          </div>

          <div className="space-y-4">
            {['Lose Weight', 'Build Muscle', 'Get Toned', 'Improve Health'].map((g) => (
              <Card 
                key={g} 
                onClick={() => updateData('goal', g)}
                isActive={formData.goal === g}
                className="flex items-center justify-between p-5"
              >
                <span className="font-bold text-white">{g}</span>
                {formData.goal === g && <CheckCircle className="text-[#00FF9C]" size={20} />}
              </Card>
            ))}
          </div>

          <Button onClick={handleNext} className="mt-8">
            Finish Setup
          </Button>
        </div>
      )}
    </div>
  );
};