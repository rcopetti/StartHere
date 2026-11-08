import { Router } from 'express';
import { analyzeScam, analyzeWithRules } from './scamCore';
import { runScamBenchmark } from './evaluator';
import evalSamples from './evalSamples.json';

const router = Router();

// Core Scam Check Endpoint
router.post('/scamCheck', async (req, res) => {
  try {
    const { text, imageBase64, imageMimeType, seniorUid, seniorName, autoAlert, rulesOnly } = req.body;

    if (!text && !imageBase64) {
      res.status(400).json({
        ok: false,
        error: 'Either text or imageBase64 is required for scam analysis.',
      });
      return;
    }

    const outcome = rulesOnly === true && typeof text === 'string' && text.trim()
      ? { ok: true, result: analyzeWithRules(text.trim()), error: undefined }
      : await analyzeScam({
          text,
          imageBase64,
          imageMimeType,
        });

    if (!outcome.ok || !outcome.result) {
      res.status(500).json({
        ok: false,
        error: outcome.error || 'Scam analysis failed safely. Do not click links.',
      });
      return;
    }

    let alertDispatched = false;
    if (autoAlert && outcome.result.verdict === 'likely_scam') {
      alertDispatched = true;
      console.log(
        `[SCAM ALERT AUTO-DISPATCH] Senior: ${seniorName || 'Eleanor'} (${seniorUid || 'unknown'}), Verdict: ${outcome.result.verdict}, Headline: ${outcome.result.headline}`
      );
    }

    res.json({
      ok: true,
      result: outcome.result,
      alertDispatched,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API /scamCheck error:', error);
    res.status(500).json({
      ok: false,
      error: 'Security scan could not complete. Please assume caution and do not tap links.',
    });
  }
});

// Curated Test Samples for Quick Evaluation
router.get('/scamCheck/samples', (_req, res) => {
  res.json({
    ok: true,
    samples: evalSamples.map((s) => ({
      id: s.id,
      category: s.category,
      expectedVerdict: s.expectedVerdict,
      text: s.text,
    })),
  });
});

// Run 30-Sample Evaluation Benchmark
router.post('/scamCheck/eval', async (_req, res) => {
  try {
    const report = await runScamBenchmark();
    res.json({ ok: true, report });
  } catch (error) {
    console.error('API /scamCheck/eval error:', error);
    res.status(500).json({ ok: false, error: 'Benchmark execution failed.' });
  }
});

export default router;
