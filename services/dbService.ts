import { db } from './firebase';
import { UserProfile, WorkoutLog, GroceryItem } from '../types';

export const dbService = {
  // --- USER OPERATIONS ---
  createUserProfile: async (uid: string, data: UserProfile) => {
    // Use set with merge true to avoid overwriting if it exists, or update timestamp
    await db.collection('users').doc(uid).set({
      ...data,
      uid,
      createdAt: new Date().toISOString()
    }, { merge: true });
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const docSnap = await db.collection('users').doc(uid).get();
    if (docSnap.exists) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    await db.collection('users').doc(uid).update(data);
  },

  deleteUserProfile: async (uid: string) => {
    // Delete main profile
    await db.collection('users').doc(uid).delete();
    // Note: Subcollections (workouts/history) must be deleted manually or via Cloud Functions in a production app
    // For this level of app, we leave them as orphaned documents usually.
  },

  // --- WORKOUT OPERATIONS ---
  saveWorkoutLog: async (uid: string, log: WorkoutLog) => {
    // Using log.id as document ID
    await db.collection('workouts').doc(uid).collection('history').doc(log.id).set(log);
  },

  getWorkoutHistory: async (uid: string): Promise<WorkoutLog[]> => {
    const querySnapshot = await db.collection('workouts').doc(uid).collection('history')
        .orderBy('completedAt', 'desc')
        .get();
    return querySnapshot.docs.map(doc => doc.data() as WorkoutLog);
  },

  // --- SMART PLAN / NUTRITION OPERATIONS ---
  saveGroceryList: async (uid: string, items: GroceryItem[]) => {
    // Firestore cannot store custom class instances, ensure plain objects
    const cleanItems = items.map(item => ({...item})); 
    await db.collection('nutrition').doc(uid).set({ groceryList: cleanItems }, { merge: true });
  },

  getGroceryList: async (uid: string): Promise<GroceryItem[]> => {
    const docSnap = await db.collection('nutrition').doc(uid).get();
    if (docSnap.exists) {
      return (docSnap.data()?.groceryList as GroceryItem[]) || [];
    }
    return [];
  }
};