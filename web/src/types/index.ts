/**
 * StartHere TypeScript Types & Domain Interfaces
 */

export type UserRole = 'senior' | 'family';
export type FontSizePreference = 'standard' | 'large' | 'extra_large';
export type ScamVerdict = 'likely_scam' | 'caution' | 'looks_safe';
export type LessonTrack = 'basics' | 'everyday' | 'safety';

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  email?: string;
  phone?: string;
  onboarded: boolean;
  fontSizePreference: FontSizePreference;
  highContrast: boolean;
  autoAlertOnScam: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface TrustedContact {
  id: string;
  seniorUid: string;
  name: string;
  relationship: string;
  phone: string;
  status: 'invited' | 'active';
  inviteToken?: string;
  linkedUid?: string;
  linkedAt?: number;
}

export interface AlertItem {
  id: string;
  seniorUid: string;
  seniorName: string;
  seniorPhone?: string;
  type: 'scam_detected' | 'manual_help_request';
  verdict?: ScamVerdict;
  headline: string;
  summary: string;
  actionTaken: string;
  sentAt: number;
  ackAt?: number;
  acknowledgedBy?: string;
}

export interface ScenarioScene {
  type: 'sms' | 'whatsapp' | 'email' | 'popup' | 'phone_call';
  sender: string;
  senderDetail: string;
  content: string;
}

export interface ScenarioOption {
  id: 'legit' | 'scam';
  label: string;
}

export interface LessonStep {
  order: number;
  scene: ScenarioScene;
  question: string;
  options: ScenarioOption[];
  correctAnswer: 'legit' | 'scam';
  explanation: string;
  warningSigns: string[];
  safeAction: string;
  instruction?: string;
  checkQuestion?: string;
  successHint?: string;
}

export interface LessonDocument {
  lessonId: string;
  order: number;
  title: string;
  track: LessonTrack;
  cardIcon: string;
  minutes: number;
  mvp: boolean;
  goal: string;
  steps: LessonStep[];
  finishTemplate: string;
  coachNote?: string;
  version: number;
}

export interface ScenarioAnswer {
  stepOrder: number;
  selectedAnswer: 'legit' | 'scam';
  correctAnswer: 'legit' | 'scam';
  isCorrect: boolean;
  timestamp: number;
}

export interface CoachSession {
  id: string;
  seniorUid: string;
  lessonId: string;
  lessonTitle: string;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed' | 'abandoned';
  scenarioAnswers: ScenarioAnswer[];
  score: number;
  startedAt: number;
  completedAt?: number;
}

export interface ScamCheckResult {
  id: string;
  verdict: ScamVerdict;
  headline: string;
  explanation: string;
  action: string;
  signals: string[];
  riskScore: number;
  previewText: string;
  inputType: 'text' | 'image';
  createdAt: number;
  alertSent?: boolean;
}

export type ScreenId =
  | 'onboarding'
  | 'home'
  | 'catalog'
  | 'scenario'
  | 'lesson-complete'
  | 'scam-check'
  | 'scam-verdict'
  | 'family'
  | 'family-portal'
  | 'settings';
