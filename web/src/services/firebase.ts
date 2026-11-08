/**
 * Firebase Service Initialization & Firestore Synchronization
 * Target Project: starthere-3e5dc
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  Auth,
  User,
} from 'firebase/auth';
import type {
  UserProfile,
  TrustedContact,
  AlertItem,
  CoachSession,
  LessonDocument,
  ScamCheckResult,
} from '../types';
import lessonsData from '../../../foundation/starthere-dev-handoff/lessons.json';

// Configuration injected by ProvisionFirebase
const firebaseConfig = {
  projectId: "starthere-3e5dc",
  appId: "1:508232394857:web:dcdc07ce7bfec8fc4a5af8",
  apiKey: "AIzaSyAbNeeGQ5h4eHHstNBz4Gx9JACGkuKo4GY",
  authDomain: "starthere-3e5dc.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-starthereseniort-d5bbff61-0c13-49da-bde7-6558da3396b5",
  storageBucket: "starthere-3e5dc.firebasestorage.app",
  messagingSenderId: "508232394857",
  oAuthClientId: "508232394857-35bbbirf0h6tuokre6u8oc4d5rjcktfe.apps.googleusercontent.com",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

/**
 * Validates Firestore server connection on startup as mandated by Firebase integration rules.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline connection check failed.');
      return false;
    }
    // Document missing on server is a normal successful roundtrip
    return true;
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function completeGoogleRedirectSignIn(): Promise<void> {
  try {
    await getRedirectResult(auth);
  } catch {
    // The auth listener surfaces the failure; nothing else to do here.
  }
}

export async function signInWithGoogle(): Promise<void> {
  await setPersistence(auth, browserLocalPersistence);
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

function defaultProfile(fbUser: User): UserProfile {
  return {
    uid: fbUser.uid,
    role: 'senior',
    displayName: fbUser.displayName?.trim() || 'Friend',
    email: fbUser.email ?? undefined,
    onboarded: false,
    fontSizePreference: 'large',
    highContrast: false,
    autoAlertOnScam: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function ensureUserProfile(fbUser: User): Promise<UserProfile> {
  const ref = doc(db, 'users', fbUser.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const existing = snapshot.data() as Partial<UserProfile>;
    if (typeof existing.onboarded === 'boolean') {
      return existing as UserProfile;
    }

    const normalized: UserProfile = {
      ...defaultProfile(fbUser),
      ...existing,
      uid: fbUser.uid,
      createdAt: existing.createdAt ?? Date.now(),
      onboarded: false,
      updatedAt: Date.now(),
    };
    await setDoc(ref, normalized);
    return normalized;
  }

  const profile = defaultProfile(fbUser);
  await setDoc(ref, profile);
  return profile;
}

export function subscribeToProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => callback(snapshot.exists() ? (snapshot.data() as UserProfile) : null),
    (err) => {
      console.warn('Profile snapshot listener error:', err);
    }
  );
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    updatedAt: Date.now(),
  });
}

/**
 * Seeds the 10 micro-lessons into Firestore if empty
 */
export async function seedLessonsIfEmpty(): Promise<LessonDocument[]> {
  try {
    const lessonsSnap = await getDocs(collection(db, 'lessons'));
    const lessons = (lessonsData as unknown as { lessons: LessonDocument[] }).lessons;

    if (lessonsSnap.empty) {
      for (const lesson of lessons) {
        await setDoc(doc(db, 'lessons', lesson.lessonId), lesson);
      }
    }
    return lessons;
  } catch (err) {
    console.warn('Using local lessons data:', err);
    return (lessonsData as unknown as { lessons: LessonDocument[] }).lessons;
  }
}

/**
 * Updates user profile settings
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, updates);
  } catch (err) {
    console.warn('Failed to update user profile in Firestore:', err);
  }
}

/**
 * Subscribes to live alerts
 */
export function subscribeToAlerts(seniorUid: string, callback: (alerts: AlertItem[]) => void) {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('seniorUid', '==', seniorUid),
      orderBy('sentAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const items: AlertItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as AlertItem));
      callback(items);
    }, (err) => {
      console.warn('Alerts snapshot listener error:', err);
    });
  } catch {
    return () => {};
  }
}

/**
 * Subscribes to a senior's trusted contacts
 */
export function subscribeToTrustedContacts(
  seniorUid: string,
  callback: (contacts: TrustedContact[]) => void
) {
  try {
    const q = collection(db, 'users', seniorUid, 'trustedContacts');
    return onSnapshot(q, (snapshot) => {
      const items: TrustedContact[] = [];
      snapshot.forEach((d) => items.push(d.data() as TrustedContact));
      callback(items);
    }, (err) => {
      console.warn('Trusted contacts listener error:', err);
    });
  } catch {
    return () => {};
  }
}

/**
 * Dispatches a high-priority alert to family
 */
export async function sendFamilyAlert(
  senior: UserProfile,
  type: 'scam_detected' | 'manual_help_request',
  headline: string,
  summary: string,
  actionTaken: string,
  verdict?: 'likely_scam' | 'caution' | 'looks_safe'
): Promise<AlertItem> {
  const alertId = `alert-${Date.now()}`;
  const alertItem: AlertItem = {
    id: alertId,
    seniorUid: senior.uid,
    seniorName: senior.displayName,
    seniorPhone: senior.phone,
    type,
    verdict,
    headline,
    summary,
    actionTaken,
    sentAt: Date.now(),
  };

  try {
    await setDoc(doc(db, 'alerts', alertId), alertItem);
  } catch (err) {
    console.warn('Failed to record alert in Firestore:', err);
  }

  return alertItem;
}

/**
 * Family member acknowledges alert ("I've got it")
 */
export async function acknowledgeAlert(alertId: string, familyName: string): Promise<void> {
  try {
    const ref = doc(db, 'alerts', alertId);
    await updateDoc(ref, {
      ackAt: Date.now(),
      acknowledgedBy: familyName,
    });
  } catch (err) {
    console.warn('Failed to acknowledge alert in Firestore:', err);
  }
}

/**
 * Generates single-use 32-character invite token for new family member
 */
export async function generateInviteToken(
  seniorUid: string,
  name: string,
  relationship: string,
  phone: string
): Promise<TrustedContact> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz';
  const randomValues = new Uint32Array(32);
  crypto.getRandomValues(randomValues);
  const token = Array.from(randomValues, (value) => chars.charAt(value % chars.length)).join('');

  const contactId = `contact-${Date.now()}`;
  const newContact: TrustedContact = {
    id: contactId,
    seniorUid,
    name,
    relationship,
    phone,
    status: 'invited',
    inviteToken: token,
  };

  try {
    await setDoc(doc(db, 'users', seniorUid, 'trustedContacts', contactId), newContact);
  } catch (err) {
    console.warn('Failed to save invite contact:', err);
  }

  return newContact;
}

/**
 * Records completed or progress of a scenario coaching session
 */
export async function saveCoachSession(session: CoachSession): Promise<void> {
  try {
    await setDoc(doc(db, 'users', session.seniorUid, 'sessions', session.id), session);
  } catch (err) {
    console.warn('Failed to save session in Firestore:', err);
  }
}

/**
 * Saves a scam check evaluation record
 */
export async function saveScamCheckRecord(record: ScamCheckResult, seniorUid: string): Promise<void> {
  try {
    await setDoc(doc(db, 'scamChecks', record.id), {
      ...record,
      seniorUid,
    });
  } catch (err) {
    console.warn('Failed to save scam check in Firestore:', err);
  }
}
