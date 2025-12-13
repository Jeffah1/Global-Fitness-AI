import { db } from './firebase';
import { UserProfile, WorkoutLog } from '../types';

export const dbService = {
  // --- USER OPERATIONS ---
  createUserProfile: async (uid: string, data: UserProfile) => {
    await db.collection('users').doc(uid).set({
      ...data,
      uid,
      createdAt: new Date().toISOString()
    });
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

  // --- GROCERY / NUTRITION OPERATIONS ---
  saveGroceryList: async (uid: string, items: string[]) => {
    await db.collection('nutrition').doc(uid).set({ groceryList: items }, { merge: true });
  },

  getGroceryList: async (uid: string): Promise<string[]> => {
    const docSnap = await db.collection('nutrition').doc(uid).get();
    if (docSnap.exists) {
      return docSnap.data()?.groceryList || [];
    }
    return [];
  }
};