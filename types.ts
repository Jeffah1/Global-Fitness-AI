export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WORKOUTS = 'WORKOUTS',
  WORKOUT_SESSION = 'WORKOUT_SESSION',
  NUTRITION = 'NUTRITION',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
  MARKET = 'MARKET',
  PROFILE = 'PROFILE',
  PREMIUM = 'PREMIUM'
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  instructions: string;
  rest: string;
}

export interface WorkoutPlan {
  routineName: string;
  targetMuscleGroup: string;
  difficulty: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutLog extends WorkoutPlan {
  id: string;
  completedAt: string;
}

export interface MacroNutrients {
  protein: string;
  carbs: string;
  fats: string;
  calories: string;
}

export interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
  macros: MacroNutrients;
}

export interface MealPlan {
  planName: string;
  meals: Meal[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  isVerified: boolean;
  isPremium: boolean;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Flexibility';
  stats: {
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: 'Male' | 'Female' | 'Other';
  };
  streak: number;
  waterIntake: number; // glasses
}

export interface MarketItem {
  id: string;
  name: string;
  category: 'Supplement' | 'Equipment' | 'Apparel' | 'Grocery' | 'Plan';
  price: number;
  image?: string;
  description: string;
  isPremium?: boolean;
}