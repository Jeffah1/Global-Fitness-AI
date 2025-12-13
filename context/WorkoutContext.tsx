import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog } from '../types';
import { useUser } from './UserContext';

interface WorkoutContextType {
  workoutHistory: WorkoutLog[];
  logWorkout: (workout: WorkoutLog) => void;
  groceryList: string[];
  addToGroceryList: (items: string[]) => void;
  removeFromGroceryList: (index: number) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useUser();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [groceryList, setGroceryList] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('gfa_history');
      const storedGroceries = localStorage.getItem('gfa_groceries');
      if (storedHistory) setWorkoutHistory(JSON.parse(storedHistory));
      if (storedGroceries) setGroceryList(JSON.parse(storedGroceries));
    } catch (e) {
      console.error("Failed to load workout data", e);
    }
  }, []);

  const saveHistory = (h: WorkoutLog[]) => {
    setWorkoutHistory(h);
    localStorage.setItem('gfa_history', JSON.stringify(h));
  };

  const saveGroceries = (g: string[]) => {
    setGroceryList(g);
    localStorage.setItem('gfa_groceries', JSON.stringify(g));
  };

  const logWorkout = (workout: WorkoutLog) => {
    const newHistory = [workout, ...workoutHistory];
    saveHistory(newHistory);
    if (user) {
        updateUserProfile({ streak: (user.streak || 0) + 1 });
    }
  };

  const addToGroceryList = (items: string[]) => {
    const newList = [...new Set([...groceryList, ...items])];
    saveGroceries(newList);
  };

  const removeFromGroceryList = (index: number) => {
    const newList = [...groceryList];
    newList.splice(index, 1);
    saveGroceries(newList);
  };

  return (
    <WorkoutContext.Provider value={{ 
      workoutHistory, 
      logWorkout, 
      groceryList, 
      addToGroceryList, 
      removeFromGroceryList 
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error("useWorkout must be used within WorkoutProvider");
  return context;
};