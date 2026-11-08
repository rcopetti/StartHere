import evalSamples from './evalSamples.json';
import { analyzeScam } from './scamCore';

export interface EvalSampleResult {
  id: string;
  category: string;
  expectedVerdict: string;
  actualVerdict: string;
  headline: string;
  riskScore: number;
  passed: boolean;
}

export interface EvalReport {
  timestamp: string;
  totalSamples: number;
  scamsTested: number;
  scamsPassed: number;
  scamRecallPct: number;
  legitTested: number;
  legitPassed: number;
  legitSpecificityPct: number;
  overallPassed: boolean;
  results: EvalSampleResult[];
}

export async function runScamBenchmark(): Promise<EvalReport> {
  const samplePromises = evalSamples.map(async (sample) => {
    const outcome = await analyzeScam({ text: sample.text });
    const actualVerdict = outcome.ok && outcome.result ? outcome.result.verdict : 'error';
    const headline = outcome.ok && outcome.result ? outcome.result.headline : 'Error';
    const riskScore = outcome.ok && outcome.result ? outcome.result.riskScore : -1;

    let passed = false;
    if (sample.expectedVerdict === 'likely_scam') {
      passed = actualVerdict === 'likely_scam' || actualVerdict === 'caution';
    } else {
      passed = actualVerdict === 'looks_safe';
    }

    return {
      id: sample.id,
      category: sample.category,
      expectedVerdict: sample.expectedVerdict,
      actualVerdict,
      headline,
      riskScore,
      passed,
    };
  });

  const results = await Promise.all(samplePromises);

  const scamsPassed = results.filter(
    (r) => r.expectedVerdict === 'likely_scam' && r.passed
  ).length;
  const legitPassed = results.filter(
    (r) => r.expectedVerdict === 'looks_safe' && r.passed
  ).length;

  const scamsTested = 15;
  const legitTested = 15;
  const scamRecallPct = Math.round((scamsPassed / scamsTested) * 100);
  const legitSpecificityPct = Math.round((legitPassed / legitTested) * 100);
  const overallPassed = scamsPassed >= 14 && legitPassed >= 12;

  return {
    timestamp: new Date().toISOString(),
    totalSamples: evalSamples.length,
    scamsTested,
    scamsPassed,
    scamRecallPct,
    legitTested,
    legitPassed,
    legitSpecificityPct,
    overallPassed,
    results,
  };
}
