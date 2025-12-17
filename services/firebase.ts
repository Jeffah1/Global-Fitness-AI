import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Define config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Log warning if keys are missing (helps debug 'auth/api-key-not-valid' errors)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-key') {
  console.warn(
    'Firebase Config Error: API Key is missing or invalid. Check your .env file.', 
    'Current Config:', firebaseConfig
  );
}

// Initialize Firebase
// We check apps.length to avoid double-initialization in hot-reload environments
if (!firebase.apps.length) {
    // If config is missing keys, this might throw. We want it to throw here rather than
    // swallowing the error, so we know why the app failed to start.
    if (firebaseConfig.apiKey) {
        firebase.initializeApp(firebaseConfig);
    } else {
        // Initialize with a dummy config to prevent "No Firebase App" crash on import,
        // allowing the UI to render an error state instead of white screen.
        console.error("Initializing Firebase with dummy config due to missing keys.");
        firebase.initializeApp({
            apiKey: "demo-key",
            authDomain: "demo.firebaseapp.com",
            projectId: "demo-project"
        });
    }
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const fieldValue = firebase.firestore.FieldValue;
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, storage, fieldValue, googleProvider };
export default firebase;