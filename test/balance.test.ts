import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

describe('balance: trial', () => {
  it('a sensible player wins in 1:30–4:00 in at least 90% of seeds, median at least 2:00', () => {
    const times = SEEDS.map((seed) => simulate('trial', seed, STRATEGIES.sensible!).outcome)
      .filter((o) => o?.kind === 'win')
      .map((o) => o!.t)
      .sort((a, b) => a - b);
    expect(times.length).toBeGreaterThanOrEqual(45);
    expect(times[0]).toBeGreaterThanOrEqual(90);
    expect(times.at(-1)).toBeLessThanOrEqual(240);
    expect(times[times.length >> 1]).toBeGreaterThanOrEqual(120);
  });

  it('an idle player never wins', () => {
    for (const seed of SEEDS.slice(0, 10)) expect(simulate('trial', seed, STRATEGIES.idle!).outcome?.kind).toBe('loss');
  });
});
