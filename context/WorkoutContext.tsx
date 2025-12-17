import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog, GroceryItem } from '../types';
import { useUser } from './UserContext';
import { dbService } from '../services/dbService';

interface WorkoutContextType {
  workoutHistory: WorkoutLog[];
  logWorkout: (workout: WorkoutLog) => void;
  groceryList: GroceryItem[];
  addToGroceryList: (items: (string | Partial<GroceryItem>)[]) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load (Local Storage)
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('gfa_history');
      const storedGroceries = localStorage.getItem('gfa_groceries');
      
      if (storedHistory) setWorkoutHistory(JSON.parse(storedHistory));
      if (storedGroceries) {
        const parsed = JSON.parse(storedGroceries);
        // Migration check for old string-only arrays
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
             setGroceryList(parsed.map((item: string) => ({
                 id: Math.random().toString(36).substr(2, 9),
                 name: item,
                 checked: false,
                 addedAt: new Date().toISOString()
             })));
        } else {
             setGroceryList(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }
    setIsInitialized(true);
  }, []);

  // 2. Cloud Sync Load (When User Logs In)
  useEffect(() => {
    if (user && isInitialized) {
        const loadCloudData = async () => {
            try {
                // Fetch History
                const cloudHistory = await dbService.getWorkoutHistory(user.uid!);
                if (cloudHistory.length > 0) {
                    // Merge logic: prefer cloud, but keep local if cloud is empty? 
                    // Simple logic: Cloud acts as source of truth if available
                    setWorkoutHistory(cloudHistory);
                    localStorage.setItem('gfa_history', JSON.stringify(cloudHistory));
                }

                // Fetch Smart Plan
                const cloudGroceries = await dbService.getGroceryList(user.uid!);
                if (cloudGroceries.length > 0) {
                    setGroceryList(cloudGroceries);
                    localStorage.setItem('gfa_groceries', JSON.stringify(cloudGroceries));
                }
            } catch (e) {
                console.error("Cloud sync failed", e);
            }
        };
        loadCloudData();
    }
  }, [user, isInitialized]);

  // Helper to save to both LocalStorage and Firestore
  const saveHistory = (h: WorkoutLog[]) => {
    setWorkoutHistory(h);
    localStorage.setItem('gfa_history', JSON.stringify(h));
    
    // Sync new item to cloud if logged in
    // Note: For history we usually append one by one in logWorkout, but here we just ensure state is right.
    // The actual DB write happens in logWorkout for the specific new log.
  };

  const saveGroceries = (g: GroceryItem[]) => {
    setGroceryList(g);
    localStorage.setItem('gfa_groceries', JSON.stringify(g));
    
    // Full list sync for groceries
    if (user?.uid) {
        dbService.saveGroceryList(user.uid, g).catch(e => console.error("Failed to save groceries to cloud", e));
    }
  };

  const logWorkout = (workout: WorkoutLog) => {
    const newHistory = [workout, ...workoutHistory];
    setWorkoutHistory(newHistory);
    localStorage.setItem('gfa_history', JSON.stringify(newHistory));
    
    if (user?.uid) {
        updateUserProfile({ streak: (user.streak || 0) + 1 });
        dbService.saveWorkoutLog(user.uid, workout).catch(e => console.error("Failed to save log to cloud", e));
    }
  };

  const addToGroceryList = (items: (string | Partial<GroceryItem>)[]) => {
    const newItems: GroceryItem[] = items.map(item => {
        const isString = typeof item === 'string';
        const baseItem = isString ? { name: item } : item;
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: baseItem.name || 'Unknown Item',
            price: baseItem.price || 0,
            checked: false,
            addedAt: new Date().toISOString(),
            category: baseItem.category || 'Uncategorized',
            estimatedRange: baseItem.estimatedRange,
            aiTip: baseItem.aiTip
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