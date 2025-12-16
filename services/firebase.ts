import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const shouldUseMock = !process.env.FIREBASE_API_KEY;

// --- MOCK IMPLEMENTATIONS ---

// Global In-Memory State for the Mock DB
const mockDbState: Record<string, any[]> = {
    'community_posts': [
        {
            id: 'post-1',
            authorId: 'trainer',
            authorName: 'Global Fitness Coach',
            authorFitnessLevel: 'Advanced',
            content: 'Welcome to the community! 💪\nThis is the place to share your progress, ask questions, and get motivated.',
            imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
            likes: ['mock-user-123'],
            commentsCount: 0,
            timestamp: new Date().toISOString()
        }
    ]
};

const listeners: Record<string, Function[]> = {};

const notifyListeners = (collectionPath: string) => {
    if (listeners[collectionPath]) {
        const docs = mockDbState[collectionPath] || [];
        // Default sort: timestamp desc
        const sortedDocs = [...docs].sort((a, b) => {
            const tA = new Date(a.timestamp || 0).getTime();
            const tB = new Date(b.timestamp || 0).getTime();
            // Ascending for comments, Descending for posts? 
            // The service uses orderBy, but for simple mock we can check path
            if (collectionPath.includes('comments')) return tA - tB;
            return tB - tA;
        });

        const snapshot = {
            docs: sortedDocs.map(d => ({
                id: d.id,
                data: () => d
            }))
        };
        listeners[collectionPath].forEach(cb => cb(snapshot));
    }
};

class MockAuth {
  currentUser: any = null;
  listeners: any[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('gfa_user');
      if (saved) {
        this.currentUser = { ...JSON.parse(saved), uid: 'mock-user-123', emailVerified: true };
      }
    } catch(e) {}
  }

  onAuthStateChanged(cb: any) {
    this.listeners.push(cb);
    cb(this.currentUser);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const user = { uid: 'mock-user-123', email, emailVerified: true };
    this.currentUser = user;
    this.notify();
    return { user };
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const user = { 
        uid: 'mock-user-123', 
        email, 
        emailVerified: false,
        sendEmailVerification: async () => console.log("Mock verification sent")
    };
    this.currentUser = user;
    this.notify();
    return { user };
  }

  async signOut() {
    this.currentUser = null;
    this.notify();
  }

  async sendPasswordResetEmail(email: string) {
      console.log("Mock password reset sent to", email);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }
}

class MockFirestore {
  collection(path: string) { return new MockCollection(path); }
  batch() { return new MockBatch(); }
}

class MockCollection {
  path: string;
  constructor(path: string) { this.path = path; }
  
  doc(id?: string) { return new MockDoc(this.path, id || `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`); }
  
  async add(data: any) {
    console.log(`[MockDB] Added to ${this.path}:`, data);
    const id = `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (!mockDbState[this.path]) mockDbState[this.path] = [];
    
    const newDoc = { id, ...data };
    mockDbState[this.path].push(newDoc);
    notifyListeners(this.path);
    
    return { id, ...data };
  }

  orderBy() { return this; }
  limit() { return this; }
  
  onSnapshot(cb: any) {
    if (!listeners[this.path]) listeners[this.path] = [];
    listeners[this.path].push(cb);
    
    // Initial call
    notifyListeners(this.path);

    return () => {
        listeners[this.path] = listeners[this.path].filter(l => l !== cb);
    };
  }
  
  async get() {
      const docs = mockDbState[this.path] || [];
      return { 
          docs: docs.map(d => ({ id: d.id, data: () => d })), 
          empty: docs.length === 0 
      };
  }
}

class MockDoc {
  path: string;
  id: string;
  
  constructor(path: string, id: string) { 
      this.path = path; 
      this.id = id; 
  }
  
  collection(subPath: string) { 
      return new MockCollection(`${this.path}/${this.id}/${subPath}`); 
  }
  
  // Helper to find document in array
  private findDoc() {
      const collection = mockDbState[this.path];
      if (!collection) return null;
      return collection.find(d => d.id === this.id);
  }

  async set(data: any, options?: any) {
    console.log(`[MockDB] Set ${this.path}/${this.id}:`, data);
    if (!mockDbState[this.path]) mockDbState[this.path] = [];
    
    const existingIndex = mockDbState[this.path].findIndex(d => d.id === this.id);
    if (existingIndex >= 0) {
        if (options?.merge) {
            mockDbState[this.path][existingIndex] = { ...mockDbState[this.path][existingIndex], ...data };
        } else {
            mockDbState[this.path][existingIndex] = { id: this.id, ...data };
        }
    } else {
        mockDbState[this.path].push({ id: this.id, ...data });
    }
    notifyListeners(this.path);
  }
  
  async update(data: any) {
    console.log(`[MockDB] Update ${this.path}/${this.id}:`, data);
    const collection = mockDbState[this.path];
    if (!collection) return;
    
    const doc = collection.find(d => d.id === this.id);
    if (doc) {
        // Handle field value operators
        Object.keys(data).forEach(key => {
            const val = data[key];
            if (val && typeof val === 'object' && val._method) {
                if (val._method === 'increment') {
                    doc[key] = (doc[key] || 0) + val._value;
                } else if (val._method === 'arrayUnion') {
                    if (!doc[key]) doc[key] = [];
                    if (!doc[key].includes(val._value)) doc[key].push(val._value);
                } else if (val._method === 'arrayRemove') {
                    if (doc[key]) doc[key] = doc[key].filter((i: any) => i !== val._value);
                }
            } else {
                doc[key] = val;
            }
        });
        notifyListeners(this.path);
    }
  }
  
  async delete() {
    console.log(`[MockDB] Delete ${this.path}/${this.id}`);
    if (mockDbState[this.path]) {
        mockDbState[this.path] = mockDbState[this.path].filter(d => d.id !== this.id);
        notifyListeners(this.path);
    }
  }
  
  async get() {
    const doc = this.findDoc();
    return { 
        exists: !!doc, 
        data: () => doc 
    };
  }
}

class MockBatch {
    ops: Function[] = [];

    set(ref: any, data: any) {
        this.ops.push(() => ref.set(data));
    }
    update(ref: any, data: any) {
        this.ops.push(() => ref.update(data));
    }
    delete(ref: any) {
        this.ops.push(() => ref.delete());
    }
    async commit() { 
        console.log("[MockDB] Batch committing..."); 
        for (const op of this.ops) {
            await op();
        }
    }
}

class MockStorage {
  ref(path: string) { return new MockStorageRef(path); }
}

class MockStorageRef {
  path: string;
  constructor(path: string) { this.path = path; }
  
  put(file: any) { 
      return Promise.resolve({ ref: this }); 
  }
  
  async getDownloadURL() {
      // Return a random placeholder image
      const images = [
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60"
      ];
      return images[Math.floor(Math.random() * images.length)];
  }
}

// --- INITIALIZATION ---

let auth: any;
let db: any;
let storage: any;
let fieldValue: any;

if (!shouldUseMock) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  fieldValue = firebase.firestore.FieldValue;
} else {
  console.warn("⚠️ Firebase API keys missing. Initializing Mock Firebase Services for demo mode.");
  auth = new MockAuth();
  db = new MockFirestore();
  storage = new MockStorage();
  
  // Custom mock for FieldValue
  fieldValue = {
      increment: (n: number) => ({ _method: 'increment', _value: n }),
      arrayUnion: (v: any) => ({ _method: 'arrayUnion', _value: v }),
      arrayRemove: (v: any) => ({ _method: 'arrayRemove', _value: v }),
      serverTimestamp: () => new Date().toISOString()
  };
}

export { auth, db, storage, fieldValue };
export default firebase;