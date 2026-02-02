import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

// Firebase configuration - you'll need to add your own config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase only if config is provided
let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

export const initFirebase = () => {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("Firebase initialized successfully");
      return true;
    } catch (error) {
      console.error("Firebase initialization error:", error);
      return false;
    }
  }
  console.log("Firebase config not provided, using Lovable Cloud only");
  return false;
};

export interface FirebaseEmotionLog {
  userId: string;
  levelNumber: number;
  emotion: string;
  confidence: number;
  capturedAt: Timestamp;
}

export interface FirebaseProgress {
  userId: string;
  levelNumber: number;
  gameType: string;
  score: number;
  isCompleted: boolean;
  timeSpentSeconds: number;
  attempts: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

// Firebase operations
export const logEmotionToFirebase = async (data: Omit<FirebaseEmotionLog, 'capturedAt'>) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'emotion_logs'), {
      ...data,
      capturedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error logging emotion to Firebase:", error);
    return null;
  }
};

export const saveProgressToFirebase = async (data: Omit<FirebaseProgress, 'startedAt'>) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'student_progress'), {
      ...data,
      startedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving progress to Firebase:", error);
    return null;
  }
};

export const getEmotionLogsFromFirebase = async (userId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'emotion_logs'),
      where('userId', '==', userId),
      orderBy('capturedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (FirebaseEmotionLog & { id: string })[];
  } catch (error) {
    console.error("Error getting emotion logs from Firebase:", error);
    return [];
  }
};

export const getProgressFromFirebase = async (userId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'student_progress'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (FirebaseProgress & { id: string })[];
  } catch (error) {
    console.error("Error getting progress from Firebase:", error);
    return [];
  }
};

export { db };
