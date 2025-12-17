import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { dbService } from '../services/dbService';
import { useApp } from './AppContext';

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerUser: (email: string, password: string, name: string, goal: any, level: any) => Promise<void>;
  verifyUserEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { setError } = useApp();

  // Listen for real-time auth changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserProfile = async (firebaseUser: any) => {
    // User is signed in, fetch profile from Firestore
    let profile = await dbService.getUserProfile(firebaseUser.uid);
    
    // If Google Login (first time), profile might not exist yet, create it
    if (!profile) {
      const newProfile: UserProfile = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        isVerified: firebaseUser.emailVerified,
        isPremium: false,
        fitnessLevel: 'Beginner', // Default
        goal: 'Improve Health', // Default
        stats: { age: 0, weight: 0, height: 0, gender: 'Male' },
        streak: 0,
        waterIntake: 0
      };
      await dbService.createUserProfile(firebaseUser.uid, newProfile);
      profile = newProfile;
    }

    // Always sync the emailVerified status from Auth to Profile
    if (profile.isVerified !== firebaseUser.emailVerified) {
         profile.isVerified = firebaseUser.emailVerified;
         // Update DB quietly
         dbService.updateUserProfile(firebaseUser.uid, { isVerified: firebaseUser.emailVerified });
    }

    setUser(profile);
  };

  const loginUser = async (email: string, pass: string) => {
    await authService.login(email, pass);
  };

  const loginWithGoogle = async () => {
    // With Popup flow, we get the result immediately
    const firebaseUser = await authService.loginWithGoogle();
    if (firebaseUser) {
        await syncUserProfile(firebaseUser);
    }
  };

  const registerUser = async (email: string, password: string, name: string, goal: any, level: any) => {
    const firebaseUser = await authService.register(email, password);
    if (firebaseUser) {
      const newUser: UserProfile = {
        name,
        email,
        isVerified: false,
        isPremium: false,
        fitnessLevel: level,
        goal: goal,
        stats: { age: 0, weight: 0, height: 0, gender: 'Male' },
        streak: 0,
        waterIntake: 0
      };
      await dbService.createUserProfile(firebaseUser.uid, newUser);
    }
  };

  const verifyUserEmail = async () => {
    if (authService.auth.currentUser) {
        await authService.auth.currentUser.reload();
        const updatedUser = authService.auth.currentUser;
        if (updatedUser?.emailVerified && user) {
            updateUserProfile({ isVerified: true });
        }
    }
  };

  const resetPassword = async (email: string) => {
      await authService.resetPassword(email);
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (authService.auth.currentUser && user) {
        // Optimistic update
        setUser({ ...user, ...updates });
        // DB update
        dbService.updateUserProfile(authService.auth.currentUser.uid, updates);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loginUser, 
      loginWithGoogle,
      registerUser, 
      verifyUserEmail, 
      resetPassword,
      logoutUser, 
      updateUserProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};