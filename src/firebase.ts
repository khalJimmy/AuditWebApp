import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Safe Analytics initialization for web environment
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics init error in non-browser/sandboxed environments
  });
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'config'));
    console.log('Firebase Firestore connection verified for project auxapp-d977e.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking fallback settings.');
    } else {
      console.log('Firebase initialized. Note:', error);
    }
  }
}

testConnection();

