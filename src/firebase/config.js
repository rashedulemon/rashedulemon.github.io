import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let db = null;
let auth = null;
let isFirebaseSupported = false;

// Check if we have at least the critical config elements
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseSupported = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Failed to initialize Firebase:", error.message);
  }
} else {
  console.warn("Firebase credentials are missing or placeholder. Running in Local Storage/Static fallback mode.");
}

const googleProvider = auth ? new GoogleAuthProvider() : null;
const githubProvider = auth ? new GithubAuthProvider() : null;

export { db, auth, isFirebaseSupported, googleProvider, githubProvider };
