import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';
import { replay, type State, toSave } from '../src/core/index.ts';

const strip = ({ acc: _acc, ...rest }: State) => rest;

describe('the random strategy (a fuzzer)', () => {
  // A random grow run lasts the full 80 minutes, so it gets one seed.
  for (const [scenario, seeds] of [
    ['trial', [1, 2, 3]],
    ['grow', [1]],
  ] as const)
    it(`ends every ${scenario} run, and each run replays exactly from its log`, { timeout: 30_000 }, () => {
      for (const seed of seeds) {
        const live = simulate(scenario, seed, STRATEGIES.random!);
        expect(live.outcome).toBeDefined();
        expect(live.log.length).toBeGreaterThan(0);
        expect(strip(replay(toSave(live)))).toEqual(strip(live));
      }
    });
});
