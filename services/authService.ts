import { auth, googleProvider } from './firebase';
import firebase from 'firebase/compat/app';

// Helper to map Firebase error codes to user-friendly messages
const getErrorMessage = (error: any) => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
      return 'Invalid credentials provided.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
    default:
      return error.message || 'An unknown error occurred.';
  }
};

export const authService = {
  auth,

  register: async (email: string, pass: string) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
      if (userCredential.user) {
        await userCredential.user.sendEmailVerification();
      }
      return userCredential.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  login: async (email: string, pass: string) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, pass);
      return userCredential.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Changed to Redirect to avoid Cross-Origin-Opener-Policy errors in some environments
  loginWithGoogle: async () => {
    try {
      await auth.signInWithRedirect(googleProvider);
      // The result is handled in the onAuthStateChanged or getRedirectResult in UserContext
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  logout: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  resendVerification: async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.sendEmailVerification();
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    }
  },
  
  resetPassword: async (email: string) => {
      try {
        await auth.sendPasswordResetEmail(email);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
  },

  onAuthStateChanged: (callback: (user: firebase.User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  },

  // Helper to check if we are returning from a redirect flow
  getRedirectResult: async () => {
      try {
          const result = await auth.getRedirectResult();
          return result.user;
      } catch (error) {
          throw new Error(getErrorMessage(error));
      }
  }
};