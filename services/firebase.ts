import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Define config strictly from environment variables.
// NEVER hardcode API keys here.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
    // Check if critical keys are present
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
        console.error("Firebase Configuration Missing. Please check your .env file.");
        console.error("Ensure variables like VITE_FIREBASE_API_KEY are set in .env and exposed in vite.config.ts");
    } else {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Firebase initialization error:", error);
        }
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