import React, { ReactNode } from 'react';
import { AppProvider, useApp } from './AppContext';
import { UserProvider, useUser } from './UserContext';
import { PremiumProvider, usePremium } from './PremiumContext';
import { WorkoutProvider, useWorkout } from './WorkoutContext';

// The GlobalProvider now acts as a wrapper for all specialized providers
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <UserProvider>
        <PremiumProvider>
          <WorkoutProvider>
            {children}
          </WorkoutProvider>
        </PremiumProvider>
      </UserProvider>
    </AppProvider>
  );
};

// Facade hook to maintain backward compatibility with existing components
// while utilizing the new split context architecture.
export const useGlobalContext = () => {
  const app = useApp();
  const userContext = useUser();
  const premium = usePremium();
  const workout = useWorkout();

  return {
    // State
    user: userContext.user,
    isAuthenticated: userContext.isAuthenticated,
    isLoading: app.isLoading,
    workoutHistory: workout.workoutHistory,
    groceryList: workout.groceryList,

    // Auth Actions
    login: async (email: string, password: string) => {
        app.setLoading(true);
        try {
            await userContext.loginUser(email, password);
        } finally {
            app.setLoading(false);
        }
    },
    register: async (email: string, password: string, name: string, goal: any, level: any) => {
        app.setLoading(true);
        try {
            await userContext.registerUser(email, password, name, goal, level);
        } finally {
            app.setLoading(false);
        }
    },
    verifyEmail: async () => {
        app.setLoading(true);
        try {
            await userContext.verifyUserEmail();
        } finally {
            app.setLoading(false);
        }
    },
    logout: userContext.logoutUser,

    // Data Actions
    logWorkout: workout.logWorkout,
    addToGroceryList: workout.addToGroceryList,
    removeFromGroceryList: workout.removeFromGroceryList,
    toggleGroceryItem: workout.toggleGroceryItem,
    updateGroceryItem: workout.updateGroceryItem,
    clearCheckedItems: workout.clearCheckedItems,
    
    updateProfile: userContext.updateUserProfile,
    upgradeToPremium: premium.upgradeToPremium,
    
    // Additional Profile Actions
    updateWater: (amount: number) => {
        if (userContext.user) {
             const newVal = Math.max(0, userContext.user.waterIntake + amount);
             userContext.updateUserProfile({ waterIntake: newVal });
        }
    }
  };
};