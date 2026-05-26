import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Detect placeholder config
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('__PLACEHOLDER__') && 
  firebaseConfig.projectId && 
  !firebaseConfig.projectId.includes('__PLACEHOLDER__');

let app;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Validate connection to Firestore as required by SKILL.md
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration: Client is offline.");
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
