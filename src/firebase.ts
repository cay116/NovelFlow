import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Vercel / Production Firebase Configuration
const vercelConfig = {
  apiKey: "AIzaSyCwCLMarz38NJd1ZZgpCGZ4CHeEDZgVFyM",
  authDomain: "novelflow-73d1b.firebaseapp.com",
  projectId: "novelflow-73d1b",
  storageBucket: "novelflow-73d1b.firebasestorage.app",
  messagingSenderId: "1014027586810",
  appId: "1:1014027586810:web:540a7967bbdcaa09cecd43",
  measurementId: "G-DEXZ78TJWE"
};

// Detect if running in Vercel environment vs Local Dev environment
const isVercelEnv = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('.vercel.app') || 
  !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
);

// Choose config based on host
const activeConfig = isVercelEnv ? vercelConfig : firebaseConfig;

// Detect placeholder config
export const isFirebaseConfigured = 
  activeConfig.apiKey && 
  !activeConfig.apiKey.includes('__PLACEHOLDER__') && 
  activeConfig.projectId && 
  !activeConfig.projectId.includes('__PLACEHOLDER__');

let app;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    const dbId = (activeConfig as any).firestoreDatabaseId;
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    if (typeof window !== 'undefined') {
      console.log("[Firebase Debug] Current origin is:", window.location.origin);
      console.log("[Firebase Debug] If you see 'auth/unauthorized-domain', make sure you have added this hostname to your Firebase Auth settings:", window.location.hostname);
    }
    
    // Validate connection to Firestore as required by SKILL.md
    const testConnection = async () => {
      // Print friendly debug message for Domain Whitelisting in Firebase Auth
      if (typeof window !== 'undefined') {
        console.log(`[Firebase Debug] If you see 'auth/unauthorized-domain', make sure you have added this hostname to your Firebase Auth settings: ${window.location.hostname}`);
      }
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('the client is offline')) {
            console.warn("Please check your Firebase configuration: Client is offline.");
          } else if (
            error.message.includes('Database') && 
            (error.message.includes('not found') || error.message.includes('default'))
          ) {
            console.error(
              "[Firebase Config Error] The Firestore database '(default)' was not found.\n" +
              "Please make sure you have initialized the Firestore Database in your Firebase Console (Build -> Firestore Database -> Create database)."
            );
          }
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.log("Firebase is not configured. Falling back to high-fidelity Sandbox Local Storage Mode.");
}

export { app, db, auth, googleProvider };

// SKILL.md Required Error Handling Pattern
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
