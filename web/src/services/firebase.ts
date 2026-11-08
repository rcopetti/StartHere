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
  orderBy,
  onSnapshot,
  updateDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';
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

/**
 * Initializes anonymous user session and retrieves or provisions initial user profile
 */
export async function initAuthAndProfile(): Promise<{ user: User; profile: UserProfile }> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (currentUser) => {
      try {
        let activeUser = currentUser;
        if (!activeUser) {
          const cred = await signInAnonymously(auth);
          activeUser = cred.user;
        }

        const userDocRef = doc(db, 'users', activeUser.uid);
        const userDoc = await getDoc(userDocRef);

        let profile: UserProfile;
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
        } else {
          profile = {
            uid: activeUser.uid,
            role: 'senior',
            displayName: 'Eleanor Miller',
            phone: '(555) 345-6789',
            onboarded: true,
            fontSizePreference: 'large',
            highContrast: false,
            autoAlertOnScam: true,
            createdAt: Date.now(),
          };
          await setDoc(userDocRef, profile);

          // Seed default sample trusted contacts for Eleanor
          await seedDefaultContacts(activeUser.uid);
        }

        // Test connection in background
        testFirestoreConnection();

        resolve({ user: activeUser, profile });
      } catch (err) {
        console.error('Failed to initialize auth and profile:', err);
        // Fallback dummy profile for immediate offline resilience
        const fallbackProfile: UserProfile = {
          uid: 'senior-local-user',
          role: 'senior',
          displayName: 'Eleanor Miller',
          phone: '(555) 345-6789',
          onboarded: true,
          fontSizePreference: 'large',
          highContrast: false,
          autoAlertOnScam: true,
          createdAt: Date.now(),
        };
        resolve({
          user: { uid: 'senior-local-user' } as User,
          profile: fallbackProfile,
        });
      }
    });
  });
}

/**
 * Seeds sample family contacts for demo experience
 */
async function seedDefaultContacts(seniorUid: string) {
  try {
    const contactSarah: TrustedContact = {
      id: 'contact-sarah',
      seniorUid,
      name: 'Sarah Miller',
      relationship: 'Daughter',
      phone: '(555) 234-5678',
      status: 'active',
      linkedUid: 'family-member-sarah',
      linkedAt: Date.now() - 86400000,
    };
    const contactTom: TrustedContact = {
      id: 'contact-tom',
      seniorUid,
      name: 'Tom Miller',
      relationship: 'Son',
      phone: '(555) 876-5432',
      status: 'active',
      linkedUid: 'family-member-tom',
      linkedAt: Date.now() - 43200000,
    };
    await setDoc(doc(db, 'users', seniorUid, 'trustedContacts', contactSarah.id), contactSarah);
    await setDoc(doc(db, 'users', seniorUid, 'trustedContacts', contactTom.id), contactTom);
  } catch (err) {
    console.warn('Unable to seed default contacts:', err);
  }
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
export function subscribeToAlerts(callback: (alerts: AlertItem[]) => void) {
  try {
    const q = query(collection(db, 'alerts'), orderBy('sentAt', 'desc'));
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
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

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
