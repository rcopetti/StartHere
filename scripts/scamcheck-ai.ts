/**
 * Scam Check AI Provider Adapter
 * Resolves the configured provider (Gemini, local Ollama, or heuristic) and
 * returns a normalized verdict for the benchmark runner.
 */

import { GoogleGenAI } from '@google/genai';

export type ScamVerdict = 'likely_scam' | 'caution' | 'looks_safe';
export type AiProvider = 'gemini' | 'ollama' | 'heuristic';

export interface ScamCheckVerdict {
  verdict: ScamVerdict;
  riskScore: number;
  headline?: string;
  explanation?: string;
  action?: string;
  signals?: string[];
}

export interface AiConfig {
  provider: AiProvider;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  timeoutMs: number;
}

const SYSTEM_PROMPT = `You are StartHere's Instant Scam Check expert for older adults (seniors).
Analyze the untrusted message provided and determine if it is:
1. "likely_scam": High risk of fraud, phishing, theft, or impersonation (riskScore 70-100).
2. "caution": Ambiguous or unverified sender requiring manual verification (riskScore 35-69).
3. "looks_safe": Standard routine, legitimate communication (riskScore 0-34).

Output JSON adhering strictly to:
{
  "verdict": "likely_scam" | "caution" | "looks_safe",
  "headline": string,
  "explanation": string,
  "action": string,
  "signals": string[],
  "riskScore": number
}`;

const PLACEHOLDER_KEYS = new Set(['MY_GEMINI_API_KEY', 'YOUR_API_KEY', 'CHANGEME']);

export function resolveAiConfig(
  env: Record<string, string | undefined> = process.env
): AiConfig {
  const requestedProvider = (env.SCAMCHECK_AI_PROVIDER || 'gemini').trim().toLowerCase();

  if (
    requestedProvider !== 'gemini' &&
    requestedProvider !== 'ollama' &&
    requestedProvider !== 'heuristic'
  ) {
    throw new Error(
      `Unknown SCAMCHECK_AI_PROVIDER "${env.SCAMCHECK_AI_PROVIDER}". Use gemini, ollama, or heuristic.`
    );
  }

  const provider: AiProvider = requestedProvider;
  const apiKey = env.GEMINI_API_KEY?.trim();

  if (provider === 'gemini' && (!apiKey || PLACEHOLDER_KEYS.has(apiKey))) {
    throw new Error(
      'SCAMCHECK_AI_PROVIDER=gemini needs a real GEMINI_API_KEY. ' +
        'Set SCAMCHECK_AI_PROVIDER=ollama to run against a local Ollama server, ' +
        'or SCAMCHECK_AI_PROVIDER=heuristic for an offline run.'
    );
  }

  const defaultModel =
    provider === 'ollama'
      ? 'llama3.2'
      : provider === 'gemini'
        ? 'gemini-2.5-flash'
        : 'heuristic';
  const model = env.SCAMCHECK_AI_MODEL?.trim() || defaultModel;

  const configuredBaseUrl = env.SCAMCHECK_AI_BASE_URL?.trim();
  const baseUrl =
    configuredBaseUrl ||
    (provider === 'ollama' ? normalizeOllamaHost(env.OLLAMA_HOST?.trim()) : undefined);

  const timeoutMs = Number(env.SCAMCHECK_AI_TIMEOUT_MS || 60000);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('SCAMCHECK_AI_TIMEOUT_MS must be a positive number of milliseconds.');
  }

  return { provider, model, baseUrl, apiKey, timeoutMs };
}

function normalizeOllamaHost(host?: string): string {
  if (!host) return 'http://localhost:11434';
  return /^https?:\/\//i.test(host) ? host : `http://${host}`;
}

export function normalizeVerdict(payload: unknown): ScamCheckVerdict {
  const data = (payload ?? {}) as Record<string, unknown>;
  const rawScore = typeof data.riskScore === 'number' ? data.riskScore : Number(data.riskScore);
  const riskScore = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 0;

  const rawVerdict = typeof data.verdict === 'string' ? data.verdict : '';
  const verdict: ScamVerdict =
    rawVerdict === 'likely_scam' || rawVerdict === 'caution' || rawVerdict === 'looks_safe'
      ? rawVerdict
      : riskScore >= 70
        ? 'likely_scam'
        : riskScore >= 35
          ? 'caution'
          : 'looks_safe';

  return {
    verdict,
    riskScore,
    ...(typeof data.headline === 'string' ? { headline: data.headline } : {}),
    ...(typeof data.explanation === 'string' ? { explanation: data.explanation } : {}),
    ...(typeof data.action === 'string' ? { action: data.action } : {}),
    ...(Array.isArray(data.signals)
      ? { signals: data.signals.filter((signal): signal is string => typeof signal === 'string') }
      : {}),
  };
}

export function heuristicVerdict(text: string, category = ''): ScamCheckVerdict {
  const lower = text.toLowerCase();
  const isLegitExplicit =
    lower.includes('never ask') || lower.includes('stop to opt out') || lower.includes('g-');
  const isScam =
    !isLegitExplicit &&
    (lower.includes('locked') ||
      lower.includes('$1.99') ||
      lower.includes('gift card') ||
      lower.includes('warrant') ||
      lower.includes('suspended') ||
      lower.includes('virus') ||
      lower.includes('medicare number') ||
      lower.includes('refund desk') ||
      lower.includes('western union') ||
      lower.includes('sweepstakes') ||
      lower.includes('toll') ||
      lower.includes('crypto') ||
      lower.includes('zelle') ||
      lower.includes('bail') ||
      lower.includes('wrong number') ||
      (lower.includes('code') && (lower.includes('send') || lower.includes('read that code'))));

  const isCaution = !isScam && category === 'wrong-number opener';
  const verdict: ScamVerdict = isScam ? 'likely_scam' : isCaution ? 'caution' : 'looks_safe';

  return {
    verdict,
    riskScore: isScam ? 85 : isCaution ? 45 : 15,
  };
}

export async function analyzeWithAi(config: AiConfig, text: string): Promise<ScamCheckVerdict> {
  if (config.provider === 'heuristic') return heuristicVerdict(text);
  if (config.provider === 'ollama') return callOllama(config, text);
  return callGemini(config, text);
}

function wrapUntrusted(text: string): string {
  return `<<<BEGIN UNTRUSTED USER CONTENT>>>\n${text}\n<<<END UNTRUSTED USER CONTENT>>>`;
}

async function callGemini(config: AiConfig, text: string): Promise<ScamCheckVerdict> {
  if (!config.apiKey) throw new Error('Gemini API key is missing.');

  const ai = new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: {
      timeout: config.timeoutMs,
      ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
    },
  });

  const response = await ai.models.generateContent({
    model: config.model,
    contents: wrapUntrusted(text),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  return normalizeVerdict(JSON.parse(response.text || '{}'));
}

async function callOllama(config: AiConfig, text: string): Promise<ScamCheckVerdict> {
  const baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: wrapUntrusted(text) },
        ],
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Ollama responded ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as { message?: { content?: string } };
    const content = payload.message?.content;
    if (!content) throw new Error('Ollama returned an empty message.');

    return normalizeVerdict(JSON.parse(content));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Ollama request timed out after ${config.timeoutMs}ms at ${baseUrl}.`);
    }
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(`Could not reach Ollama at ${baseUrl}. Is "ollama serve" running?`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
