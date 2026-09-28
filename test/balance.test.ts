import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { guided, STRATEGIES } from '../sim/strategies.ts';

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

describe('balance: trial', () => {
  it('a player who follows the guide to the letter, a click every 8 s, wins by 6:30 in at least 90% of seeds', () => {
    const wins = SEEDS.map((seed) => simulate('trial', seed, guided(8)).outcome).filter((o) => o?.kind === 'win');
    expect(wins.length).toBeGreaterThanOrEqual(45);
    expect(Math.max(...wins.map((o) => o!.t))).toBeLessThanOrEqual(390);
  });

  it('an efficient player wins in 2:30–5:00 in at least 90% of seeds, median at least 3:00', () => {
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

describe('balance: the full run', () => {
  it('a careful player wins in at least 90% of 20 seeds, median 60–75 min, none after 100 min; each run under 1 s', () => {
    const start = performance.now();
    const runs = SEEDS.slice(0, 20).map((seed) => simulate('grow', seed, STRATEGIES.careful!).outcome);
    const perRun = (performance.now() - start) / 20;
    const times = runs
      .filter((o) => o?.kind === 'win')
      .map((o) => o!.t / 60)
      .sort((a, b) => a - b);
    expect(times.length).toBeGreaterThanOrEqual(18);
    expect(times[times.length >> 1]).toBeGreaterThanOrEqual(60);
    expect(times[times.length >> 1]).toBeLessThanOrEqual(75);
    expect(times.at(-1)).toBeLessThanOrEqual(100);
    expect(perRun).toBeLessThan(1000);
  }, 60_000);
});
