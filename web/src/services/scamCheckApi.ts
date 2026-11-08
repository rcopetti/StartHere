/**
 * Scam Check API Client
 * Sends a suspicious message, photo, or file to the StartHere FastAPI service
 * with the signed-in user's Firebase ID token.
 */

import type { ScamCheckResult } from '../types';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 30000;

export interface ScamCheckInput {
  text?: string;
  imageBase64?: string;
  imageMime?: string;
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
  return Boolean(API_BASE_URL);
}

export function buildScamCheckForm(input: ScamCheckInput): FormData {
  const form = new FormData();
  const text = input.text?.trim();

  if (text) {
    form.append('text', text);
  }

  if (input.imageBase64) {
    const mime = input.imageMime || 'image/jpeg';
    const base64 = input.imageBase64.replace(/^data:[^;]+;base64,/, '');
    form.append(
      'file',
      base64ToBlob(base64, mime),
      mime === 'image/png' ? 'photo.png' : 'photo.jpg'
    );
  }

  form.append('channel', input.imageBase64 ? 'photo' : 'unknown');
  return form;
}

export async function checkScamWithApi(
  input: ScamCheckInput,
  idToken: string
): Promise<ScamCheckResult> {
  if (!API_BASE_URL) {
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
