// pnpm sim --scenario trial --strategy sensible --seed 7
import { parseArgs } from 'node:util';
import { SCENARIOS, type ScenarioId } from '../src/data/index.ts';
import { simulate } from './run.ts';
import { STRATEGIES } from './strategies.ts';

const { values } = parseArgs({
  options: {
    scenario: { type: 'string', default: 'trial' },
    strategy: { type: 'string', default: 'sensible' },
    seed: { type: 'string', default: '1' },
    seeds: { type: 'string' },
  },
});
const scenario = values.scenario as ScenarioId;
const strategy = STRATEGIES[values.strategy];
if (!SCENARIOS[scenario] || !strategy) {
  console.error(`scenarios: ${Object.keys(SCENARIOS).join(', ')}; strategies: ${Object.keys(STRATEGIES).join(', ')}`);
  process.exit(1);
}
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

if (values.seeds) {
  // Summary over many seeds: pnpm sim --seeds 50
  const n = Number(values.seeds);
  const start = performance.now();
  const runs = Array.from({ length: n }, (_, i) => simulate(scenario, i + 1, strategy));
  const ms = (performance.now() - start) / n;
  const wins = runs
    .filter((r) => r.outcome?.kind === 'win')
    .map((r) => r.outcome!.t)
    .sort((a, b) => a - b);
  const ends: Record<string, number> = {};
  for (const r of runs)
    if (r.outcome?.kind !== 'win')
      ends[r.outcome?.cause ?? 'unfinished'] = (ends[r.outcome?.cause ?? 'unfinished'] ?? 0) + 1;
  console.log(`${values.strategy} on ${scenario}: ${wins.length}/${n} wins, ${Math.round(ms)} ms a run`);
  if (wins.length)
    console.log(`win time min ${mmss(wins[0]!)} median ${mmss(wins[wins.length >> 1]!)} max ${mmss(wins.at(-1)!)}`);
  for (const [cause, k] of Object.entries(ends)) console.log(`${k} × ${cause}`);
} else {
  const s = simulate(scenario, Number(values.seed), strategy);
  for (const e of s.log) console.log(`${mmss(e.t)}  ${JSON.stringify(e.action)}`);
  console.log('--- chronicle');
  for (const c of s.chronicle) console.log(`${mmss(c.t)}  ${c.text}`);
  console.log('--- outcome', s.outcome?.kind, `at ${mmss(s.outcome?.t ?? s.t)}`, s.stats);
}
