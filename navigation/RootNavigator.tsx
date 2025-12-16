import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { AppView, WorkoutPlan } from '../types';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import WorkoutGenerator from '../components/WorkoutGenerator';
import { WorkoutSession } from '../components/WorkoutSession';
import NutritionPlanner from '../components/NutritionPlanner';
import ChatTrainer from '../components/ChatTrainer';
import WorkoutHistory from '../components/WorkoutHistory';
import { Marketplace } from '../components/Marketplace';
import { Profile } from '../components/Profile';
import { Community } from '../components/Community';

// Types for Navigation State
type AuthView = 'ONBOARDING' | 'LOGIN' | 'REGISTER';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user, workoutHistory } = useGlobalContext();
  
  // Auth Navigation State
  const [authView, setAuthView] = useState<AuthView>('ONBOARDING');
  const [onboardingData, setOnboardingData] = useState<any>(null);

  // Main App Navigation State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);

  // --- Auth Flow ---
  if (!isAuthenticated) {
    if (authView === 'ONBOARDING') {
      return (
        <OnboardingScreen 
          onLogin={() => setAuthView('LOGIN')}
          onComplete={(data) => {
            setOnboardingData(data);
            setAuthView('REGISTER');
          }}
        />
      );
    }
    if (authView === 'LOGIN') {
      return (
        <LoginScreen 
            onRegister={() => setAuthView('ONBOARDING')} // Reset to onboarding to capture data if needed, or go straight to register
            onBack={() => setAuthView('ONBOARDING')}
        />
      );
    }
    if (authView === 'REGISTER') {
      return (
        <RegisterScreen 
          onLogin={() => setAuthView('LOGIN')}
          onBack={() => setAuthView('ONBOARDING')}
          onboardingData={onboardingData || { name: 'User', goal: 'Fitness', activityLevel: 'Beginner' }}
        />
      );
    }
  }

  // --- Verification Flow ---
  if (user && !user.isVerified) {
    return <VerificationScreen />;
  }

  // --- Main App Flow ---
  
  // Handlers for Workout Session
  const startWorkoutSession = (plan: WorkoutPlan) => {
    setActivePlan(plan);
    setCurrentView(AppView.WORKOUT_SESSION);
  };

  const finishWorkoutSession = () => {
    setActivePlan(null);
    setCurrentView(AppView.HISTORY);
  };

  const cancelWorkoutSession = () => {
    if (window.confirm("End workout without saving?")) {
        setActivePlan(null);
        setCurrentView(AppView.WORKOUTS);
    }
  };

  if (currentView === AppView.WORKOUT_SESSION && activePlan) {
      return (
          <WorkoutSession 
              plan={activePlan} 
              onComplete={finishWorkoutSession}
              onCancel={cancelWorkoutSession}
          />
      );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 overflow-auto w-full relative">
        <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8 max-w-7xl">
          <div style={{ display: currentView === AppView.DASHBOARD ? 'block' : 'none' }}>
            <Dashboard onChangeView={setCurrentView} isVisible={currentView === AppView.DASHBOARD} />
          </div>
          <div style={{ display: currentView === AppView.WORKOUTS ? 'block' : 'none' }}>
            <WorkoutGenerator onStartSession={startWorkoutSession} />
          </div>
          <div style={{ display: currentView === AppView.NUTRITION ? 'block' : 'none' }}>
            <NutritionPlanner />
          </div>
          <div style={{ display: currentView === AppView.CHAT ? 'block' : 'none' }}>
            <ChatTrainer />
          </div>
          <div style={{ display: currentView === AppView.HISTORY ? 'block' : 'none' }}>
            <WorkoutHistory history={workoutHistory} isVisible={currentView === AppView.HISTORY} />
          </div>
          <div style={{ display: currentView === AppView.COMMUNITY ? 'block' : 'none' }}>
            <Community />
          </div>
          <div style={{ display: currentView === AppView.MARKET ? 'block' : 'none' }}>
            <Marketplace />
          </div>
          <div style={{ display: currentView === AppView.PROFILE ? 'block' : 'none' }}>
            <Profile />
          </div>
        </div>
      </main>
    </div>
  );
};
