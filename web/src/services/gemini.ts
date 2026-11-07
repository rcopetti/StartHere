/**
 * Gemini AI Integration Service
 * Model: gemini-3.8-flash via @google/genai
 * Applies pre-AI sensitive PII guards, jargon blocklists, and strict 1-2 sentence clamps.
 */

import { GoogleGenAI } from '@google/genai';
import type { ScamCheckResult, ScamVerdict } from '../types';

// API Key resolution (injected by AI Studio runtime)
const apiKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  '';

const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

// Safety Interceptor: Regex for SSN, 13-16 digit cards, and passwords
const SSN_REGEX = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
const CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/;
const PASSWORD_REGEX = /\b(?:password|passcode|pin\s*code|bank\s*pin)\s*[:=]?\s*\S+\b/i;

export const SENSITIVE_GUARD_REPLY =
  "For your privacy and security, please never share passwords, cards, or personal numbers. Your information is safe with you, and I will never ask for them.";

// Jargon terms forbidden in senior replies
const FORBIDDEN_JARGON = [
  'cache',
  'url',
  'browser cookie',
  'cookie',
  'ram',
  'dns',
  'operating system',
  'api',
  'json',
  'bandwidth',
  'root directory',
];

export function containsSensitiveData(text: string): boolean {
  return SSN_REGEX.test(text) || CARD_REGEX.test(text) || PASSWORD_REGEX.test(text);
}

function sanitizeJargon(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_JARGON.some((word) => lower.includes(word));
}

/**
 * Instant Scam Check Analyzer
 * Evaluates suspicious text or image using Gemini Flash with deterministic temperature 0.1
 */
export async function analyzeScamCheck(
  input: { text?: string; imageBase64?: string; imageMime?: string }
): Promise<ScamCheckResult> {
  const checkId = `scam-${Date.now()}`;
  const rawText = input.text || 'Screenshot verification';

  // 1. Pre-AI Sensitive Number Guard
  if (input.text && containsSensitiveData(input.text)) {
    return {
      id: checkId,
      verdict: 'likely_scam',
      headline: 'Contains Sensitive Banking or Personal Credentials',
      explanation:
        'This message appears to ask for or include private cards, PINs, or Social Security numbers. Legitimate companies never request passwords or PINs over text.',
      action: 'Do not reply, send codes, or tap any links. Delete this message immediately.',
      signals: [
        'Requests private credentials or PINs',
        'High financial identity theft risk',
      ],
      riskScore: 95,
      previewText: rawText.slice(0, 120),
      inputType: input.imageBase64 ? 'image' : 'text',
      createdAt: Date.now(),
    };
  }

  // 2. Prepare Gemini Prompt with untrusted envelope
  const systemPrompt = `You are StartHere's Instant Scam Check expert for older adults (seniors).
Analyze the untrusted message or screenshot provided below and determine if it is:
1. "likely_scam": High risk of fraud, phishing, theft, or impersonation (riskScore 70-100).
2. "caution": Ambiguous or unverified sender requiring manual verification (riskScore 35-69).
3. "looks_safe": Standard routine, legitimate communication (riskScore 0-34).

CRITICAL SENIOR ACCESSIBILITY RULES:
- Output MUST be valid JSON adhering strictly to the schema below.
- "headline": Short plain-language title (3-6 words, e.g. "Fake Delivery Fee Scam", "Legitimate Pharmacy Pickup").
- "explanation": Exactly TWO short, reassuring plain sentences explaining why. Never use tech jargon (no 'URL', 'cache', 'domain', 'API', 'phishing algorithm').
- "action": Exactly ONE clear, direct action step (e.g. "Do not tap the link. Delete this message now.").
- "signals": 2-3 short bullet point clues found (e.g. ["Asks for gift cards", "Urgent 24-hour threat"]).
- "riskScore": integer from 0 to 100.`;

  const contents: any[] = [];

  if (input.imageBase64) {
    contents.push({
      inlineData: {
        data: input.imageBase64,
        mimeType: input.imageMime || 'image/jpeg',
      },
    });
  }

  const promptText = `<<<BEGIN UNTRUSTED USER CONTENT>>>
${rawText}
<<<END UNTRUSTED USER CONTENT>>>

Output JSON with schema:
{
  "verdict": "likely_scam" | "caution" | "looks_safe",
  "headline": string,
  "explanation": string,
  "action": string,
  "signals": string[],
  "riskScore": number
}`;

  contents.push(promptText);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    const verdict: ScamVerdict =
      parsed.verdict === 'likely_scam' || parsed.verdict === 'caution' || parsed.verdict === 'looks_safe'
        ? parsed.verdict
        : parsed.riskScore >= 70
        ? 'likely_scam'
        : parsed.riskScore >= 35
        ? 'caution'
        : 'looks_safe';

    return {
      id: checkId,
      verdict,
      headline: parsed.headline || 'Suspicious Communication Notice',
      explanation: parsed.explanation || 'We found signs of unexpected pressure or unusual payment requests.',
      action: parsed.action || 'Do not click links or send money. Check with your family circle first.',
      signals: Array.isArray(parsed.signals) ? parsed.signals : ['Unfamiliar sender', 'Artificial urgency'],
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : verdict === 'likely_scam' ? 85 : 20,
      previewText: rawText.slice(0, 120),
      inputType: input.imageBase64 ? 'image' : 'text',
      createdAt: Date.now(),
    };
  } catch (err) {
    console.warn('Scam check AI call failed, falling back to deterministic heuristic:', err);

    // Safe fallback (fail-closed heuristic)
    const lower = rawText.toLowerCase();
    const isSuspicious =
      lower.includes('pin') ||
      lower.includes('code') ||
      lower.includes('gift card') ||
      lower.includes('urgent') ||
      lower.includes('locked') ||
      lower.includes('suspended') ||
      lower.includes('wire') ||
      lower.includes('bail') ||
      lower.includes('$1.99');

    return {
      id: checkId,
      verdict: isSuspicious ? 'likely_scam' : 'caution',
      headline: isSuspicious ? 'High Risk Unverified Notice' : 'Unconfirmed Message Notice',
      explanation: isSuspicious
        ? 'This message asks for urgent actions, fees, or codes. Real services do not demand secret codes or gift cards.'
        : 'We could not completely verify this sender. Call the company using a phone number you already have saved on an old bill.',
      action: isSuspicious
        ? 'Do not reply or tap links. Delete the message now.'
        : 'Do not tap links. Call the sender on a known trusted number.',
      signals: isSuspicious ? ['Urgent pressure', 'Unexpected link or code request'] : ['Unverified sender'],
      riskScore: isSuspicious ? 80 : 45,
      previewText: rawText.slice(0, 120),
      inputType: input.imageBase64 ? 'image' : 'text',
      createdAt: Date.now(),
    };
  }
}

/**
 * Open Coach Tech Q&A
 * Clamped strictly to 1-2 short, everyday sentences. Retries if jargon detected.
 */
export async function askPatientCoach(question: string): Promise<string> {
  // Pre-AI sensitive number guard
  if (containsSensitiveData(question)) {
    return SENSITIVE_GUARD_REPLY;
  }

  const systemPrompt = `You are StartHere's Patient Tech Coach for older adults (seniors).
The senior has asked you a smartphone or technology question.
RULES:
1. Explain in exactly 1 or 2 short, calm sentences.
2. ZERO TECHNICAL JARGON: never use words like 'cache', 'url', 'cookie', 'ram', 'dns', 'api', 'operating system', 'bandwidth'.
3. Always be warm, patient, and encouraging.
4. If they ask about money or medicine, advise them to check with a real expert.`;

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
      },
    });

    let reply = (res.text || '').trim();

    // Jargon retry check
    if (sanitizeJargon(reply)) {
      const retryRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Please rephrase this without any tech jargon, in 1-2 simple sentences for an older grandmother: "${reply}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });
      reply = (retryRes.text || reply).trim();
    }

    return reply || "I'm right here with you. Take your time, and tap the back button whenever you're ready.";
  } catch {
    return "I'm right here with you. Take your time, and tap the back button whenever you're ready.";
  }
}
