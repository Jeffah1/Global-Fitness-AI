import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Define config with environment variables and fallbacks
// NOTE: storageBucket usually ends in .appspot.com for the default bucket
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAvadBNMDisnngwDp4TXB6rrvsfRfpHqZM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "global-fitness-ai-7d97d.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "global-fitness-ai-7d97d",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "global-fitness-ai-7d97d.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "821777817112",
  appId: process.env.FIREBASE_APP_ID || "1:821777817112:web:26d7df3e8978608910ed6d"
};

// Log config to debug (excluding sensitive keys)
console.log('Firebase Config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '***' : 'missing'
});

// Initialize Firebase
if (!firebase.apps.length) {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-key') {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Firebase initialization error:", error);
        }
    } else {
        console.error("Critical: Missing Firebase Configuration Keys. App will not function correctly.");
    }
}

const auth = firebase.auth();
const db = firebase.firestore();

// ENABLE OFFLINE PERSISTENCE
try {
  db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firebase persistence failed: Multiple tabs open');
      } else if (err.code == 'unimplemented') {
        console.warn('Firebase persistence not supported by browser');
      }
    });
} catch (e) {
  console.warn("Persistence setup error", e);
}

const storage = firebase.storage();
const fieldValue = firebase.firestore.FieldValue;
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, storage, fieldValue, googleProvider };
export default firebase;