import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole, FontSizePreference } from '../dashboardTypes';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: (role: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  completeOnboarding: (preferences: {
    role: UserRole;
    displayName: string;
    phone?: string;
    fontSizePreference: FontSizePreference;
    highContrast: boolean;
    autoAlertOnScam: boolean;
  }) => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile>) => Promise<void>;
  deleteMyData: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Demo user fallback mode if needed for previewing
  const [demoMode, setDemoMode] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      setUser(currentUser);
      setProfileError(null);

      if (!currentUser) {
        if (!demoMode) setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(null);
      setLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (snapshot) => {
          setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
          setLoading(false);
        },
        (err) => {
          console.error('Unable to load Firestore profile:', err);
          setProfileError('You signed in, but StartHere could not load your profile. Try reloading the page.');
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribe();
      unsubscribeProfile?.();
    };
  }, [demoMode]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const code = (err as { code?: string })?.code;

      if (code === 'auth/popup-closed-by-user') {
        setError('The Google sign-in window was closed before completing. You can tap "Sign in with Google" again, or explore instantly with Eleanor or Sarah below.');
      } else if (code === 'auth/popup-blocked') {
        setError('The Google sign-in window was blocked by your browser. Please allow popups, or tap Eleanor / Sarah below.');
      } else if (code === 'auth/cancelled-popup-request') {
        setError(null);
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google sign-in is disabled for this app. Ask the app administrator to enable Google in Firebase Authentication.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Google sign-in is unavailable on this host. Ask the app administrator to add it to the authorized domains in Firebase Authentication.');
      } else {
        const message = err instanceof Error ? err.message : 'Unable to complete sign-in. Please try again.';
        setError(message);
      }
      setLoading(false);
    }
  };

  const signInAsDemoUser = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    setDemoMode(true);

    const isSenior = role === 'senior';
    const demoProfile: UserProfile = {
      uid: isSenior ? 'demo-senior-eleanor' : 'demo-family-sarah',
      role,
      displayName: isSenior ? 'Eleanor Vance' : 'Sarah Vance',
      email: isSenior ? 'eleanor.demo@starthere.local' : 'sarah.demo@starthere.local',
      phone: isSenior ? '(555) 234-5678' : '(555) 876-5432',
      onboarded: true,
      fontSizePreference: isSenior ? 'large' : 'standard',
      highContrast: false,
      autoAlertOnScam: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedSeniors: !isSenior ? {
        'demo-senior-eleanor': {
          seniorName: 'Eleanor Vance',
          seniorPhone: '(555) 234-5678',
          linkedAt: new Date().toISOString()
        }
      } : undefined
    };

    setProfile(demoProfile);
    setLoading(false);
  };

  const completeOnboarding = async (preferences: {
    role: UserRole;
    displayName: string;
    phone?: string;
    fontSizePreference: FontSizePreference;
    highContrast: boolean;
    autoAlertOnScam: boolean;
  }) => {
    if (!user) {
      if (demoMode && profile) {
        setProfile({
          ...profile,
          ...preferences,
          onboarded: true,
          updatedAt: new Date().toISOString()
        });
        return;
      }
      throw new Error('You must be signed in to complete profile setup.');
    }

    const path = `users/${user.uid}`;
    const newProfile: UserProfile = {
      uid: user.uid,
      role: preferences.role,
      displayName: preferences.displayName || user.displayName || 'Friend',
      email: user.email || undefined,
      phone: preferences.phone || '',
      onboarded: true,
      fontSizePreference: preferences.fontSizePreference,
      highContrast: preferences.highContrast,
      autoAlertOnScam: preferences.autoAlertOnScam,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile>) => {
    if (!user) {
      if (demoMode && profile) {
        setProfile({
          ...profile,
          ...preferences,
          updatedAt: new Date().toISOString()
        });
        return;
      }
      return;
    }

    const path = `users/${user.uid}`;
    try {
      const updated = {
        ...preferences,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'users', user.uid), updated);
      if (profile) {
        setProfile({ ...profile, ...updated });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteMyData = async () => {
    if (!user) {
      if (demoMode) {
        setProfile(null);
        setDemoMode(false);
      }
      return;
    }

    const path = `users/${user.uid}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const signOutUser = async () => {
    if (demoMode) {
      setDemoMode(false);
      setProfile(null);
      return;
    }
    await signOut(auth);
    setProfile(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileError,
        error,
        signInWithGoogle,
        signInAsDemoUser,
        signOutUser,
        completeOnboarding,
        updatePreferences,
        deleteMyData,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
