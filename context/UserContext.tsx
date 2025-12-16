import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginUser: (email: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string, goal: any, level: any) => Promise<void>;
  verifyUserEmail: () => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gfa_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to load user", e);
    }
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) localStorage.setItem('gfa_user', JSON.stringify(u));
    else localStorage.removeItem('gfa_user');
  };

  const loginUser = async (email: string) => {
    // Placeholder API call
    await new Promise(r => setTimeout(r, 1000));
    const mockUser: UserProfile = {
      name: email.split('@')[0],
      email,
      isVerified: true,
      isPremium: false,
      fitnessLevel: 'Intermediate',
      goal: 'Muscle Gain',
      stats: { age: 25, weight: 70, height: 175, gender: 'Male' },
      streak: 0,
      waterIntake: 0
    };
    saveUser(mockUser);
  };

  const registerUser = async (email: string, password: string, name: string, goal: any, level: any) => {
    // Placeholder API call
    await new Promise(r => setTimeout(r, 1000));
    const newUser: UserProfile = {
      name,
      email,
      isVerified: false,
      isPremium: false,
      fitnessLevel: level,
      goal: goal,
      stats: { age: 30, weight: 75, height: 180, gender: 'Male' },
      streak: 1,
      waterIntake: 0
    };
    saveUser(newUser);
  };

  const verifyUserEmail = async () => {
    await new Promise(r => setTimeout(r, 1500));
    if (user) saveUser({ ...user, isVerified: true });
  };

  const logoutUser = () => {
    saveUser(null);
    localStorage.clear();
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) saveUser({ ...user, ...updates });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loginUser, 
      registerUser, 
      verifyUserEmail, 
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