/**
 * Scam Check API Client
 * Sends a suspicious message, photo, or file to the StartHere FastAPI service
 * with the signed-in user's Firebase ID token.
 */

import type { ScamCheckResult } from '../types';

const REQUEST_TIMEOUT_MS = 30000;

export type ScamCheckChannel =
  | 'sms'
  | 'email'
  | 'link'
  | 'call'
  | 'photo'
  | 'file'
  | 'unknown';

/**
 * `VITE_API_BASE_URL="/"` (or `same-origin`) keeps requests on the current host,
 * which the Vite dev proxy forwards to the backend. An absolute URL calls the
 * backend directly. Empty means the API is not configured.
 */
export function resolveScamCheckApiBase(configured?: string): {
  base: string;
  sameOrigin: boolean;
} {
  const raw = (configured ?? '').trim();
  if (raw === '/' || raw.toLowerCase() === 'same-origin') {
    return { base: '', sameOrigin: true };
  }
  return { base: raw.replace(/\/+$/, ''), sameOrigin: false };
}

const API = resolveScamCheckApiBase(import.meta.env?.VITE_API_BASE_URL);
const API_BASE_URL = API.base;

export interface ScamCheckInput {
  text?: string;
  imageBase64?: string;
  imageMime?: string;
  file?: File;
  channel?: ScamCheckChannel;
}

interface ApiSuccessResponse {
  ok: true;
  result: ScamCheckResult;
}

interface ApiErrorResponse {
  ok: false;
  error: { code: string; message: string };
}

export class ScamCheckApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ScamCheckApiError';
    this.code = code;
  }
}

export function isScamCheckApiConfigured(): boolean {
  return API.sameOrigin || Boolean(API_BASE_URL);
}

export function buildScamCheckForm(input: ScamCheckInput): FormData {
  const form = new FormData();
  const text = input.text?.trim();

  if (text) {
    form.append('text', text);
  }

  if (input.file) {
    form.append('file', input.file, input.file.name);
  } else if (input.imageBase64) {
    const mime = input.imageMime || 'image/jpeg';
    const base64 = input.imageBase64.replace(/^data:[^;]+;base64,/, '');
    form.append(
      'file',
      base64ToBlob(base64, mime),
      mime === 'image/png' ? 'photo.png' : 'photo.jpg'
    );
  }

  form.append('channel', input.channel ?? resolveChannel(input));
  return form;
}

export async function checkScamWithApi(
  input: ScamCheckInput,
  idToken: string
): Promise<ScamCheckResult> {
  if (!isScamCheckApiConfigured()) {
    throw new ScamCheckApiError('not_configured', 'Scam Check API is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/scam-check`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      body: buildScamCheckForm(input),
      signal: controller.signal,
    });

    const payload = (await readJson(response)) as ApiSuccessResponse | ApiErrorResponse;

    if (!response.ok || !isSuccess(payload)) {
      const failure = payload as ApiErrorResponse;
      throw new ScamCheckApiError(
        failure?.error?.code || 'request_failed',
        failure?.error?.message || 'The check could not be completed.'
      );
    }

    return payload.result;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Turns an API or network failure into calm, plain-language copy. The reader is
 * never told to ignore the message; she is told not to reply yet.
 */
export function scamCheckErrorMessage(error: unknown): string {
  if (error instanceof ScamCheckApiError) {
    switch (error.code) {
      case 'missing_token':
      case 'invalid_token':
        return 'Your sign-in has expired. Please sign in again, then check the message.';
      case 'rate_limited':
        return 'You have checked a lot of messages in the last hour. Please try again a little later.';
      case 'file_too_large':
        return 'That file is too big. Please share a smaller photo or file.';
      case 'unsupported_file':
        return 'Please share a photo, a PDF, a Word document, or a text file.';
      case 'unreadable_file':
        return "We couldn't read any words from that file. Try a clearer photo or another file.";
      case 'empty_text':
      case 'missing_input':
        return 'Please paste a message or choose a photo or file first.';
      case 'check_unavailable':
        return "I can't check right now because the check service is not answering. Don't reply to the message yet. Please try again in a moment.";
      default:
        break;
    }
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return "The check took too long. Don't reply to the message yet. Please try again in a moment.";
  }

  if (error instanceof TypeError) {
    return "I can't check right now because the check service is not answering. Don't reply to the message yet. Please try again in a moment.";
  }

  return "I can't check this right now. Don't reply to the message yet. Please try again in a moment.";
}

function resolveChannel(input: ScamCheckInput): ScamCheckChannel {
  if (input.file) {
    return input.file.type.startsWith('image/') ? 'photo' : 'file';
  }
  if (input.imageBase64) return 'photo';
  return 'unknown';
}

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ScamCheckApiError('bad_response', 'The check service sent an unreadable reply.');
  }
}

function isSuccess(payload: unknown): payload is ApiSuccessResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { ok?: unknown }).ok === true &&
    typeof (payload as { result?: unknown }).result === 'object' &&
    (payload as { result?: unknown }).result !== null
  );
}
