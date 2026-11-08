import { useState, type FormEvent } from 'react';
import type { ScamResult } from '../../../server/scamCore';

const verdictLabels = {
  likely_scam: 'Likely scam',
  caution: 'Use caution',
  looks_safe: 'No obvious warning signs',
};

export function ScamCheckForm() {
  const [text, setText] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScamResult | null>(null);

  async function checkMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status) return;
    setError('');
    setResult(null);

    try {
      let message = text.trim();
      if (screenshot) {
        setStatus('Reading the screenshot…');
        try {
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('eng');
          try {
            const { data } = await worker.recognize(screenshot);
            if (!data.text.trim() || data.confidence < 50) {
              setError('We couldn’t read the screenshot clearly. Try a clearer image or paste the message text.');
              return;
            }
            message = [message, data.text.trim()].filter(Boolean).join('\n');
          } finally {
            await worker.terminate();
          }
        } catch {
          setError('We couldn’t open or read the screenshot. Try another image or paste the message text.');
          return;
        }
      }

      setStatus('Checking the message…');
      const response = await fetch('/api/scamCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, rulesOnly: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.result) {
        throw new Error('ScamCheck request failed');
      }
      setResult(data.result);
    } catch {
      setError('ScamCheck couldn’t finish. Please try again and avoid opening suspicious links.');
    } finally {
      setStatus('');
    }
  }

  return (
    <form onSubmit={checkMessage} className="space-y-4">
      <fieldset disabled={Boolean(status)} className="space-y-4">
        <label className="block font-semibold">
          Message text
          <textarea
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-stone-300 p-4 font-normal"
          />
        </label>
        <label className="block font-semibold">
          Screenshot
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={!text.trim() && !screenshot}
          className="rounded-xl bg-stone-900 px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          Check for scams
        </button>
      </fieldset>
      <div role="status">{status}</div>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {result && (
        <div role="status" className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <h4 className="text-lg font-bold">{verdictLabels[result.verdict]} · {result.headline}</h4>
          <p>{result.explanation}</p>
          <p className="font-bold">{result.action}</p>
        </div>
      )}
    </form>
  );
}
