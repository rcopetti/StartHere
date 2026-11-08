/**
 * Offline Scam Check Fallback
 * Used only when VITE_API_BASE_URL is not configured. The browser never holds
 * an AI provider key; the FastAPI service is the primary check path.
 */

import type { ScamCheckResult } from '../types';

const SSN_REGEX = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
const CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/;
const PASSWORD_REGEX = /\b(?:password|passcode|pin\s*code|bank\s*pin)\s*[:=]?\s*\S+\b/i;

const REDACTION = '[hidden]';

const STOP_HINTS: Array<[string, string[]]> = [
  ['gift_cards', ['gift card', 'itunes card', 'google play card']],
  ['crypto', ['bitcoin', 'crypto', 'usdt', 'ethereum']],
  ['verification_code', ['verification code', '6-digit code', 'send the code']],
  ['family_impostor', ['grandson', 'granddaughter', 'in jail', 'bail money']],
  ['money_transfer', ['wire transfer', 'western union', 'zelle', 'venmo', 'send money']],
  ['bank_account', ['bank account', 'routing number', 'social security']],
];

const SUSPICIOUS_HINTS = [
  'pin',
  'code',
  'gift card',
  'urgent',
  'locked',
  'suspended',
  'wire',
  'bail',
  '$1.99',
];

export interface OfflineScamCheckInput {
  text?: string;
  imageBase64?: string;
  imageMime?: string;
}

export function containsSensitiveData(text: string): boolean {
  return SSN_REGEX.test(text) || CARD_REGEX.test(text) || PASSWORD_REGEX.test(text);
}

export function redactSensitive(text: string): string {
  return text
    .replace(PASSWORD_REGEX, REDACTION)
    .replace(CARD_REGEX, REDACTION)
    .replace(SSN_REGEX, REDACTION);
}

export function inferRiskCategories(text: string): string[] {
  const lower = text.toLowerCase();
  return STOP_HINTS.filter(([, keywords]) => keywords.some((word) => lower.includes(word))).map(
    ([category]) => category
  );
}

/**
 * Deterministic, fail-closed check. It never reports "looks safe" when it is
 * unsure, and it never leaves the device.
 */
export function analyzeScamCheck(input: OfflineScamCheckInput): ScamCheckResult {
  const rawText = input.text?.trim() || 'Screenshot verification';
  const inputType = input.imageBase64 ? 'image' : 'text';
  const previewText = redactSensitive(rawText).slice(0, 120);
  const base = {
    id: `scam-${Date.now()}`,
    previewText,
    inputType,
    createdAt: Date.now(),
  } as const;

  if (containsSensitiveData(rawText)) {
    return {
      ...base,
      verdict: 'likely_scam',
      headline: 'This asks for private details',
      explanation:
        'This message mentions a password, card, or personal number. Real companies never ask for those in a message.',
      action:
        'Do not reply or send anything. Delete this message and call the company using the number on your card.',
      signals: ['Mentions private details', 'Asks you to share a secret'],
      riskScore: 95,
      stopScreenRequired: true,
      riskCategories: ['bank_account', ...inferRiskCategories(rawText)],
    };
  }

  const lower = rawText.toLowerCase();
  const isSuspicious = SUSPICIOUS_HINTS.some((hint) => lower.includes(hint));
  const riskCategories = inferRiskCategories(rawText);

  if (isSuspicious) {
    return {
      ...base,
      verdict: 'likely_scam',
      headline: 'This looks like a scam',
      explanation:
        'This message asks for urgent action, a fee, or a secret code. Real services do not ask that way.',
      action: 'Do not reply or tap anything. Delete this message now.',
      signals: ['Urgent pressure', 'Unexpected request for money or codes'],
      riskScore: 80,
      stopScreenRequired: riskCategories.length > 0,
      riskCategories,
    };
  }

  return {
    ...base,
    verdict: 'caution',
    headline: 'We could not fully check this',
    explanation:
      'The check service is not connected right now, so we could not look for warning signs.',
    action: 'Do not tap any link. Call the company using the number on your card or bill.',
    signals: ['Not checked yet'],
    riskScore: 45,
    stopScreenRequired: false,
    riskCategories,
  };
}
