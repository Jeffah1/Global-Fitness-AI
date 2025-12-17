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
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at one time.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This authentication method is not supported in this environment. Please try a different method.';
    case 'auth/requires-recent-login':
      return 'For security, please log out and log back in before deleting your account.';
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

  // Use Popup flow as it is more compatible with dev environments than Redirect
  loginWithGoogle: async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      return result.user;
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

  deleteAccount: async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.delete();
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
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
  }
};