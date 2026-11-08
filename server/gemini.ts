import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const MODEL_FLASH = 'gemini-3.8-flash';

export { ThinkingLevel, Type };
