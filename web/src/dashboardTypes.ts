export type UserRole = 'senior' | 'family';
export type FontSizePreference = 'standard' | 'large' | 'extra_large';

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
  fcmTokens?: string[];
  linkedSeniors?: {
    [seniorUid: string]: {
      seniorName: string;
      seniorPhone?: string;
      linkedAt: string;
    };
  };
  createdAt: string;
  updatedAt: string;
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
  linkedAt?: string;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  seniorUid: string;
  seniorName: string;
  seniorPhone?: string;
  contactUid?: string;
  contactName?: string;
  contactPhone?: string;
  type: 'scam_detected' | 'manual_help_request';
  verdict?: 'likely_scam' | 'caution' | 'looks_safe';
  headline: string;
  summary?: string;
  actionTaken?: string;
  screenshotUrl?: string;
  sentAt: string;
  ackAt?: string;
  acknowledgedBy?: string;
}
