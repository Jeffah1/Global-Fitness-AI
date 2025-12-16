import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from './UserContext';

interface PremiumContextType {
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useUser();

  const upgradeToPremium = async () => {
    // Placeholder for Stripe logic
    await new Promise(r => setTimeout(r, 1000));
    updateUserProfile({ isPremium: true });
  };

  return (
    <PremiumContext.Provider value={{ 
      isPremium: !!user?.isPremium, 
      upgradeToPremium 
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) throw new Error("usePremium must be used within PremiumProvider");
  return context;
};