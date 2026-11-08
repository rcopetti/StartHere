/**
 * Application Context & Global State Provider
 * Manages user profile, dynamic font scaling, high contrast, active scenario turns, and Firebase sync.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  UserProfile,
  TrustedContact,
  AlertItem,
  LessonDocument,
  LessonStep,
  ScenarioAnswer,
  ScamCheckResult,
  FontSizePreference,
  UserRole,
} from '../types';
import {
  observeAuth,
  completeGoogleRedirectSignIn,
  signInWithGoogle as signInWithGoogleService,
  signOutUser as signOutUserService,
  ensureUserProfile,
  subscribeToProfile,
  saveUserProfile,
  updateUserProfile,
  subscribeToAlerts,
  subscribeToTrustedContacts,
  sendFamilyAlert,
  acknowledgeAlert,
  generateInviteToken,
  seedLessonsIfEmpty,
  saveCoachSession,
  saveScamCheckRecord,
  auth,
} from '../services/firebase';
import { analyzeScamCheck } from '../services/scamCheckFallback';
import {
  ScamCheckApiError,
  checkScamWithApi,
  isScamCheckApiConfigured,
  scamCheckErrorMessage,
  type ScamCheckInput,
} from '../services/scamCheckApi';
import { resolveAuthStage, type AuthStage } from '../auth/authState';
import { firebaseErrorCode, signInErrorMessage } from '../auth/signInFlow';

/**
 * The FastAPI service is the primary check path so model choice and provider
 * keys stay on the server. The on-device check is used only when no API URL is
 * configured. API failures surface to the reader instead of guessing.
 */
async function requestScamCheck(input: ScamCheckInput): Promise<ScamCheckResult> {
  if (!isScamCheckApiConfigured()) {
    return analyzeScamCheck(input);
  }
  if (!auth.currentUser) {
    throw new ScamCheckApiError('missing_token', 'Sign in again to check a message.');
  }
  const idToken = await auth.currentUser.getIdToken();
  return checkScamWithApi(input, idToken);
}

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  authStage: AuthStage;
  authError: string | null;
  allLessons: LessonDocument[];
  activeLesson: LessonDocument | null;
  activeStepIndex: number;
  currentStep: LessonStep | null;
  scenarioAnswers: ScenarioAnswer[];
  latestAnswer: ScenarioAnswer | null;
  activeScamResult: ScamCheckResult | null;
  alerts: AlertItem[];
  trustedContacts: TrustedContact[];
  fontSize: FontSizePreference;
  highContrast: boolean;
  role: UserRole;
  isScenarioAnswered: boolean;
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  completeOnboarding: (preferences: {
    displayName: string;
    email?: string;
    phone?: string;
    fontSizePreference: FontSizePreference;
    highContrast: boolean;
    autoAlertOnScam: boolean;
  }) => Promise<void>;
  setFontSize: (size: FontSizePreference) => void;
  setHighContrast: (enabled: boolean) => void;
  setRole: (role: UserRole) => void;
  toggleAutoAlert: (enabled: boolean) => void;
  startLesson: (lesson: LessonDocument) => void;
  answerScenario: (selectedAnswer: 'legit' | 'scam') => void;
  nextScenario: () => boolean;
  exitLesson: () => void;
  runScamCheck: (input: ScamCheckInput) => Promise<ScamCheckResult>;
  scamCheckError: string | null;
  clearScamCheckError: () => void;
  triggerEmergencyHelp: () => Promise<void>;
  acknowledgeFamilyAlert: (alertId: string) => Promise<void>;
  inviteFamilyMember: (name: string, relationship: string, phone: string) => Promise<TrustedContact>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStage, setAuthStage] = useState<AuthStage>('loading');
  const [authError, setAuthError] = useState<string | null>(null);
  // Kept in a ref so the auth listener can show a redirect failure no matter
  // which resolves first: the listener or getRedirectResult.
  const redirectErrorRef = useRef<string | null>(null);
  const [allLessons, setAllLessons] = useState<LessonDocument[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonDocument | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [scenarioAnswers, setScenarioAnswers] = useState<ScenarioAnswer[]>([]);
  const [latestAnswer, setLatestAnswer] = useState<ScenarioAnswer | null>(null);
  const [isScenarioAnswered, setIsScenarioAnswered] = useState<boolean>(false);
  const [activeScamResult, setActiveScamResult] = useState<ScamCheckResult | null>(null);
  const [scamCheckError, setScamCheckError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);

  // Local preferences synced to user state
  const fontSize = user?.fontSizePreference || 'large';
  const highContrast = user?.highContrast || false;
  const role = user?.role || 'senior';

  const loading = authStage === 'loading';

  // Initialize Auth, Profile, and Lessons
  useEffect(() => {
    let cancelled = false;

    void completeGoogleRedirectSignIn().then((outcome) => {
      if (cancelled || !outcome.attempted || outcome.user || auth.currentUser) return;
      const message = signInErrorMessage(outcome.errorCode ?? 'auth/redirect-no-result');
      redirectErrorRef.current = message;
      setAuthError(message);
      setAuthStage('signed_out');
    });

    const unsubscribeAuth = observeAuth(async (fbUser) => {
      if (cancelled) return;

      if (!fbUser) {
        setUser(null);
        setAuthError(redirectErrorRef.current);
        setAuthStage('signed_out');
        return;
      }

      redirectErrorRef.current = null;
      setAuthStage('loading');
      setAuthError(null);

      try {
        const profile = await ensureUserProfile(fbUser);
        if (cancelled) return;
        setUser(profile);
        setAuthStage(resolveAuthStage({
          authReady: true,
          hasFirebaseUser: true,
          profileLoaded: true,
          onboarded: profile.onboarded,
        }));
      } catch (err) {
        if (cancelled) return;
        console.error('Unable to load the user profile:', err);
        setUser(null);
        setAuthError("You're signed in, but StartHere could not open your profile. Please try again in a moment.");
        setAuthStage('signed_out');
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (authStage !== 'ready' || !user?.uid) {
      setAlerts([]);
      setTrustedContacts([]);
      return;
    }

    let active = true;
    const uid = user.uid;

    const unsubscribeProfile = subscribeToProfile(uid, (profile) => {
      if (active && profile) setUser(profile);
    });

    const unsubscribeAlerts = subscribeToAlerts(uid, (incomingAlerts) => {
      if (active) setAlerts(incomingAlerts);
    });

    const unsubscribeContacts = subscribeToTrustedContacts(uid, (contacts) => {
      if (active) setTrustedContacts(contacts);
    });

    seedLessonsIfEmpty()
      .then((lessons) => {
        if (active) setAllLessons(lessons);
      })
      .catch((err) => console.warn('Unable to load lessons:', err));

    return () => {
      active = false;
      unsubscribeProfile();
      unsubscribeAlerts();
      unsubscribeContacts();
    };
  }, [authStage, user?.uid]);

  const signInWithGoogle = async () => {
    redirectErrorRef.current = null;
    setAuthError(null);
    try {
      await signInWithGoogleService();
    } catch (err) {
      const code = firebaseErrorCode(err);
      if (code === 'auth/cancelled-popup-request') return;
      if (import.meta.env.DEV) {
        console.warn('Google sign-in did not complete:', code, window.location.host);
      }
      setAuthError(signInErrorMessage(code));
    }
  };

  const signOutUser = async () => {
    await signOutUserService();
    setUser(null);
    setAlerts([]);
    setTrustedContacts([]);
    setActiveScamResult(null);
    setAuthError(null);
    setAuthStage('signed_out');
  };

  const completeOnboarding = async (preferences: {
    displayName: string;
    email?: string;
    phone?: string;
    fontSizePreference: FontSizePreference;
    highContrast: boolean;
    autoAlertOnScam: boolean;
  }) => {
    if (!user) throw new Error('You must be signed in to finish setup.');

    const next: UserProfile = {
      ...user,
      ...preferences,
      role: 'senior',
      onboarded: true,
      updatedAt: Date.now(),
    };

    await saveUserProfile(next);
    setUser(next);
    setAuthStage('ready');
  };

  const setFontSize = (size: FontSizePreference) => {
    if (!user) return;
    setUser({ ...user, fontSizePreference: size });
    updateUserProfile(user.uid, { fontSizePreference: size });
  };

  const setHighContrast = (enabled: boolean) => {
    if (!user) return;
    setUser({ ...user, highContrast: enabled });
    updateUserProfile(user.uid, { highContrast: enabled });
  };

  const setRole = (newRole: UserRole) => {
    if (!user) return;
    setUser({ ...user, role: newRole });
    updateUserProfile(user.uid, { role: newRole });
  };

  const toggleAutoAlert = (enabled: boolean) => {
    if (!user) return;
    setUser({ ...user, autoAlertOnScam: enabled });
    updateUserProfile(user.uid, { autoAlertOnScam: enabled });
  };

  const startLesson = (lesson: LessonDocument) => {
    setActiveLesson(lesson);
    setActiveStepIndex(0);
    setScenarioAnswers([]);
    setLatestAnswer(null);
    setIsScenarioAnswered(false);
  };

  const currentStep: LessonStep | null =
    activeLesson && activeLesson.steps && activeLesson.steps[activeStepIndex]
      ? activeLesson.steps[activeStepIndex]
      : null;

  const answerScenario = (selectedAnswer: 'legit' | 'scam') => {
    if (!currentStep || isScenarioAnswered) return;

    const isCorrect = selectedAnswer === currentStep.correctAnswer;
    const answerRecord: ScenarioAnswer = {
      stepOrder: currentStep.order,
      selectedAnswer,
      correctAnswer: currentStep.correctAnswer,
      isCorrect,
      timestamp: Date.now(),
    };

    const updated = [...scenarioAnswers, answerRecord];
    setScenarioAnswers(updated);
    setLatestAnswer(answerRecord);
    setIsScenarioAnswered(true);
  };

  const nextScenario = (): boolean => {
    if (!activeLesson) return false;

    const nextIndex = activeStepIndex + 1;
    if (nextIndex < activeLesson.steps.length) {
      setActiveStepIndex(nextIndex);
      setIsScenarioAnswered(false);
      setLatestAnswer(null);
      return false;
    }

    // Finished all scenarios in this lesson
    const score = scenarioAnswers.filter((a) => a.isCorrect).length;
    if (user) {
      saveCoachSession({
        id: `session-${Date.now()}`,
        seniorUid: user.uid,
        lessonId: activeLesson.lessonId,
        lessonTitle: activeLesson.title,
        currentStep: activeLesson.steps.length,
        totalSteps: activeLesson.steps.length,
        status: 'completed',
        scenarioAnswers,
        score,
        startedAt: Date.now() - 120000,
        completedAt: Date.now(),
      });
    }
    return true;
  };

  const exitLesson = () => {
    setActiveLesson(null);
    setActiveStepIndex(0);
    setIsScenarioAnswered(false);
    setLatestAnswer(null);
  };

  const runScamCheck = async (input: ScamCheckInput) => {
    setScamCheckError(null);

    let result: ScamCheckResult;
    try {
      result = await requestScamCheck(input);
    } catch (error) {
      setScamCheckError(scamCheckErrorMessage(error));
      throw error;
    }

    setActiveScamResult(result);

    if (user) {
      saveScamCheckRecord(result, user.uid);

      // Auto-alert family if enabled and high-risk scam
      if (user.autoAlertOnScam && result.verdict === 'likely_scam') {
        await sendFamilyAlert(
          user,
          'scam_detected',
          `Scam Detected: ${result.headline}`,
          `${user.displayName} received a message flagged as high-risk fraud: "${result.previewText}"`,
          result.action,
          'likely_scam'
        );
        result.alertSent = true;
      }
    }

    return result;
  };

  const clearScamCheckError = () => setScamCheckError(null);

  const triggerEmergencyHelp = async () => {
    if (!user) return;
    await sendFamilyAlert(
      user,
      'manual_help_request',
      `Urgent: ${user.displayName} asked for help`,
      `${user.displayName} pressed the emergency help button and requests assistance right away.`,
      `Please call ${user.displayName} or check that they are safe.`
    );
  };

  const acknowledgeFamilyAlert = async (alertId: string) => {
    const familyName = user?.displayName || 'Sarah (Daughter)';
    await acknowledgeAlert(alertId, familyName);
  };

  const inviteFamilyMember = async (name: string, relationship: string, phone: string) => {
    if (!user) throw new Error('User not loaded');
    return await generateInviteToken(user.uid, name, relationship, phone);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        authStage,
        authError,
        allLessons,
        activeLesson,
        activeStepIndex,
        currentStep,
        scenarioAnswers,
        latestAnswer,
        activeScamResult,
        alerts,
        trustedContacts,
        fontSize,
        highContrast,
        role,
        isScenarioAnswered,
        signInWithGoogle,
        signOutUser,
        completeOnboarding,
        setFontSize,
        setHighContrast,
        setRole,
        toggleAutoAlert,
        startLesson,
        answerScenario,
        nextScenario,
        exitLesson,
        runScamCheck,
        scamCheckError,
        clearScamCheckError,
        triggerEmergencyHelp,
        acknowledgeFamilyAlert,
        inviteFamilyMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
