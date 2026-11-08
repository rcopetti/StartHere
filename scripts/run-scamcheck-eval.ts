/**
 * Developer Evaluation Runner: Scam Check Benchmark Suite
 * Evaluates 30 labeled samples (15 scams, 15 legitimate messages)
 * against the configured AI provider and scores recall and specificity.
 *
 * Benchmark Gating Criteria:
 * - Scam Recall: >= 14/15 (>= 93.3%)
 * - Legit Specificity: >= 12/15 (>= 80.0%)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  analyzeWithAi,
  heuristicVerdict,
  resolveAiConfig,
  type AiConfig,
  type ScamCheckVerdict,
} from './scamcheck-ai';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

interface TestSample {
  id: string;
  label: 'scam' | 'legit';
  preferred: string;
  acceptable: string[];
  channel: string;
  category: string;
  difficulty: string;
  text: string;
  keyRedFlags: string;
}

interface RunCounters {
  aiCalls: number;
  aiFailures: number;
  heuristicCalls: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadDataset(): TestSample[] {
  const csvPath = path.join(
    projectRoot,
    'foundation/starthere-dev-handoff/scamcheck-testset.csv'
  );
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const samples: TestSample[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length >= 8) {
      samples.push({
        id: cols[0],
        label: cols[1] as 'scam' | 'legit',
        preferred: cols[2],
        acceptable: cols[3].split('|').map((s) => s.trim().replace('be_careful', 'caution')),
        channel: cols[4],
        category: cols[5],
        difficulty: cols[6],
        text: cols[7],
        keyRedFlags: cols[8] || '',
      });
    }
  }
  return samples;
}

async function evaluateSample(
  sample: TestSample,
  config: AiConfig,
  counters: RunCounters
): Promise<ScamCheckVerdict> {
  if (config.provider === 'heuristic') {
    counters.heuristicCalls += 1;
    return heuristicVerdict(sample.text, sample.category);
  }

  try {
    const result = await analyzeWithAi(config, sample.text);
    counters.aiCalls += 1;
    return result;
  } catch (error) {
    counters.aiFailures += 1;
    counters.heuristicCalls += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${sample.id}] AI call failed (${config.provider}/${config.model}): ${message}`);
    return heuristicVerdict(sample.text, sample.category);
  }
}

async function runBenchmark() {
  const config = resolveAiConfig();

  console.log('===============================================================');
  console.log('   STARTHERE SCAM CHECK BENCHMARK EVALUATION (30 SAMPLES)       ');
  console.log('===============================================================\n');
  console.log(`Provider: ${config.provider} | Model: ${config.model}`);
  console.log(`Endpoint: ${config.baseUrl || 'provider default'}\n`);

  const dataset = loadDataset();
  const totalScams = dataset.filter((s) => s.label === 'scam').length;
  const totalLegit = dataset.filter((s) => s.label === 'legit').length;
  console.log(
    `Loaded ${dataset.length} labeled samples (${totalScams} scam, ${totalLegit} legit).\n`
  );

  const counters: RunCounters = { aiCalls: 0, aiFailures: 0, heuristicCalls: 0 };
  let scamHits = 0;
  let legitHits = 0;

  for (const sample of dataset) {
    const { verdict, riskScore } = await evaluateSample(sample, config, counters);
    const passed = sample.acceptable.includes(verdict);

    if (sample.label === 'scam' && (verdict === 'likely_scam' || verdict === 'caution')) {
      scamHits++;
    }
    if (sample.label === 'legit' && verdict === 'looks_safe') {
      legitHits++;
    }

    const icon = passed ? '✅' : '❌';
    console.log(
      `[${sample.id}] ${sample.label.toUpperCase().padEnd(5)} | Pred: ${verdict.padEnd(11)} (Score: ${String(riskScore).padStart(2)}) | Target: ${sample.acceptable.join('/')} ${icon}`
    );
  }

  const scamRecall = (scamHits / totalScams) * 100;
  const legitSpecificity = (legitHits / totalLegit) * 100;

  console.log('\n===============================================================');
  console.log('                     FINAL BENCHMARK RESULTS                   ');
  console.log('===============================================================');
  console.log(
    `Scam Recall:       ${scamHits}/${totalScams} (${scamRecall.toFixed(1)}%) — Pass Criteria: >= 14/15 (93.3%) -> ${
      scamHits >= 14 ? '✅ PASSED' : '❌ FAILED'
    }`
  );
  console.log(
    `Legit Specificity: ${legitHits}/${totalLegit} (${legitSpecificity.toFixed(1)}%) — Pass Criteria: >= 12/15 (80.0%) -> ${
      legitHits >= 12 ? '✅ PASSED' : '❌ FAILED'
    }`
  );
  console.log(
    `AI calls: ${counters.aiCalls} | Heuristic fallbacks: ${counters.heuristicCalls} | AI failures: ${counters.aiFailures}`
  );
  console.log('===============================================================\n');

  if (counters.aiFailures > 0) {
    console.error(
      'AI failures occurred. The scores above include heuristic fallbacks and are not a valid model benchmark.'
    );
    process.exitCode = 1;
  }

  if (scamHits >= 14 && legitHits >= 12) {
    console.log('🎉 BENCHMARK SUITE PASSED ALL ACCURACY CRITERIA!');
  } else {
    console.log('⚠️ BENCHMARK SUITE DID NOT MEET ALL THRESHOLDS.');
    process.exitCode = 1;
  }
}

runBenchmark().catch((error) => {
  console.error(
    '\nBenchmark could not run:',
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
