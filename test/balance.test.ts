import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

describe('balance: trial', () => {
  it('a player who follows the guide wins in 2:30–5:00 in at least 90% of seeds, median at least 3:00', () => {
    const times = SEEDS.map((seed) => simulate('trial', seed, STRATEGIES.sensible!).outcome)
      .filter((o) => o?.kind === 'win')
      .map((o) => o!.t)
      .sort((a, b) => a - b);
    expect(times.length).toBeGreaterThanOrEqual(45);
    expect(times[0]).toBeGreaterThanOrEqual(150);
    expect(times.at(-1)).toBeLessThanOrEqual(300);
    expect(times[times.length >> 1]).toBeGreaterThanOrEqual(180);
  });

  it('an idle player never wins', () => {
    for (const seed of SEEDS.slice(0, 10)) expect(simulate('trial', seed, STRATEGIES.idle!).outcome?.kind).toBe('loss');
  });
});
