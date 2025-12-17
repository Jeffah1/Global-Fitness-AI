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
  deleteAccount: () => Promise<void>;
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
    let profile: UserProfile | null = null;
    
    try {
        profile = await dbService.getUserProfile(firebaseUser.uid);
    } catch (error: any) {
        console.warn("Failed to fetch user profile from DB:", error);
        // If permission denied (common with default Firestore rules), notify but allow login
        if (error.code === 'permission-denied') {
            setError("Warning: Database access denied. Please update Firestore Security Rules to 'allow read, write: if request.auth != null;'. Running in offline mode.");
        }
    }
    
    // If profile doesn't exist (New Google User) or DB fetch failed, create a new/fallback one
    if (!profile) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
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

      try {
          // Attempt to save to DB
          await dbService.createUserProfile(firebaseUser.uid, newProfile);
          profile = newProfile;
      } catch (error: any) {
          console.warn("Failed to create profile in DB:", error);
          // If write fails (permissions), use the in-memory profile so user isn't blocked
          profile = newProfile;
      }
    } else {
         // Profile existed, ensure UID is attached locally just in case
         profile.uid = firebaseUser.uid;

         // Sync critical auth fields like verification
         if (profile.isVerified !== firebaseUser.emailVerified) {
             profile.isVerified = firebaseUser.emailVerified;
             // Try to update DB, but don't block if it fails
             try {
                dbService.updateUserProfile(firebaseUser.uid, { isVerified: firebaseUser.emailVerified });
             } catch (e) {
                 console.warn("Failed to sync verification status to DB", e);
             }
         }
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
        uid: firebaseUser.uid,
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
      // We try to create profile here, but syncUserProfile will also catch it if this fails or if auth state changes triggers first
      try {
        await dbService.createUserProfile(firebaseUser.uid, newUser);
      } catch (error: any) {
          console.error("Register profile creation error:", error);
      }
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

  const deleteAccount = async () => {
    if (user && authService.auth.currentUser) {
      const uid = user.uid || authService.auth.currentUser.uid;
      // 1. Delete Firestore Data
      try {
        await dbService.deleteUserProfile(uid);
      } catch (e) {
        console.warn("Failed to delete user profile from DB", e);
      }
      
      // 2. Delete Auth Account
      // This might throw 'requires-recent-login'
      await authService.deleteAccount();
      
      setUser(null);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (authService.auth.currentUser && user) {
        // Optimistic update
        setUser({ ...user, ...updates });
        // DB update
        try {
            dbService.updateUserProfile(authService.auth.currentUser.uid, updates);
        } catch (e) {
            console.warn("Failed to update profile in DB", e);
        }
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
      deleteAccount,
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