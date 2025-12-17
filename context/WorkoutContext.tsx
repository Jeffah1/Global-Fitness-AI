import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog, GroceryItem } from '../types';
import { useUser } from './UserContext';

interface WorkoutContextType {
  workoutHistory: WorkoutLog[];
  logWorkout: (workout: WorkoutLog) => void;
  groceryList: GroceryItem[];
  addToGroceryList: (items: (string | { name: string; price?: number })[]) => void;
  toggleGroceryItem: (id: string) => void;
  updateGroceryItem: (id: string, updates: Partial<GroceryItem>) => void;
  removeFromGroceryList: (id: string) => void;
  clearCheckedItems: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useUser();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('gfa_history');
      const storedGroceries = localStorage.getItem('gfa_groceries');
      
      if (storedHistory) setWorkoutHistory(JSON.parse(storedHistory));
      
      if (storedGroceries) {
        const parsed = JSON.parse(storedGroceries);
        // Migration: If old string array, convert to objects
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
           const migrated: GroceryItem[] = parsed.map((item: string) => ({
               id: Math.random().toString(36).substr(2, 9),
               name: item,
               checked: false,
               addedAt: new Date().toISOString()
           }));
           setGroceryList(migrated);
        } else {
           setGroceryList(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load workout data", e);
    }
  }, []);

  const saveHistory = (h: WorkoutLog[]) => {
    setWorkoutHistory(h);
    localStorage.setItem('gfa_history', JSON.stringify(h));
  };

  const saveGroceries = (g: GroceryItem[]) => {
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

  const addToGroceryList = (items: (string | { name: string; price?: number })[]) => {
    const newItems: GroceryItem[] = items.map(item => {
        const isString = typeof item === 'string';
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: isString ? item : item.name,
            price: isString ? 0 : item.price,
            checked: false,
            addedAt: new Date().toISOString()
        };
    });
    
    // Check for duplicates by name before adding
    const existingNames = new Set(groceryList.map(g => g.name.toLowerCase()));
    const uniqueNewItems = newItems.filter(i => !existingNames.has(i.name.toLowerCase()));

    const newList = [...groceryList, ...uniqueNewItems];
    saveGroceries(newList);
  };

  const toggleGroceryItem = (id: string) => {
      const newList = groceryList.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      saveGroceries(newList);
  };

  const updateGroceryItem = (id: string, updates: Partial<GroceryItem>) => {
      const newList = groceryList.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      saveGroceries(newList);
  };

  const removeFromGroceryList = (id: string) => {
    const newList = groceryList.filter(item => item.id !== id);
    saveGroceries(newList);
  };

  const clearCheckedItems = () => {
      const newList = groceryList.filter(item => !item.checked);
      saveGroceries(newList);
  };

  return (
    <WorkoutContext.Provider value={{ 
      workoutHistory, 
      logWorkout, 
      groceryList, 
      addToGroceryList, 
      removeFromGroceryList,
      toggleGroceryItem,
      updateGroceryItem,
      clearCheckedItems
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