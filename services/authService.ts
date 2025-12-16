import { auth } from './firebase';
import firebase from 'firebase/compat/app';

export const authService = {
  auth,
  register: async (email: string, pass: string) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    if (userCredential.user) {
        await userCredential.user.sendEmailVerification();
    }
    return userCredential.user;
  },

  login: async (email: string, pass: string) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    return userCredential.user;
  },

  logout: async () => {
    await auth.signOut();
  },

  resendVerification: async () => {
    if (auth.currentUser) {
      await auth.currentUser.sendEmailVerification();
    }
  },
  
  resetPassword: async (email: string) => {
      await auth.sendPasswordResetEmail(email);
  },

  onAuthStateChanged: (callback: (user: firebase.User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  }
};