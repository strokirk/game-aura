import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';
import {
  apply,
  createRun,
  housing,
  idleHands,
  rates,
  replay,
  type State,
  stepTo,
  toSave,
  zoneUsed,
} from '../src/core/index.ts';
import { ZONES } from '../src/data/index.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
const begin = () => ok(apply(createRun('grow', 1), { type: 'choose', option: 0 }));

describe('the full run', () => {
  it('reveals Farms when Bread runs low, with a card', () => {
    let s = begin();
    expect(apply(s, { type: 'build', building: 'farm' })).toEqual({ error: "Farm isn't available here" });
    const titles: string[] = [];
    while (s.t < 400 && !s.unlocked.includes('farm')) {
      s = stepTo(s, 400);
      while (s.events.length) {
        titles.push(s.events[0]!.title);
        s = ok(apply(s, { type: 'choose', option: 0 }));
      }
    }
    expect(titles).toContain('The hands are hungry');
    expect(s.unlocked).toContain('farm');
  });

  it('research costs Insight, applies its multiplier and reveals the next tier', () => {
    const s0 = { ...begin(), unlocked: ['research'], res: { ...begin().res, insight: 60 } } as State;
    const before = rates(s0).byBuilding.salt_pan?.silver ?? 0;
    const s = ok(apply(s0, { type: 'research', id: 'salt_rakes' }));
    expect(s.res.insight).toBe(10);
    expect(rates(s).byBuilding.salt_pan?.silver).toBeCloseTo(before * 1.5);
  });

  it('a strike stops the busiest porters, and paying ends it', () => {
    let s = { ...begin(), notice: 76, noticeFired: ['tax'] } as State;
    s = stepTo(s, 1);
    expect(s.events[0]?.title).toBe('The porters strike');
    expect(rates(s).zones.marsh.capacity).toBe(0);
    s = ok(apply(s, { type: 'choose', option: 0 }));
    expect(rates(s).zones.marsh.capacity).toBeGreaterThan(0);
  });

  it('losing the last hand ends the run loudly', () => {
    const s = stepTo({ ...begin(), hands: 0, porters: {}, buildings: {} } as State, 1);
    expect(s.outcome?.cause).toMatch(/last hand/);
  });

  it('the careful strategy reaches the Gate, and the run replays from its log', () => {
    const live = simulate('grow', 1, STRATEGIES.careful!);
    expect(live.gate?.raised).toBe(true);
    const { acc: _a, ...a } = live;
    const { acc: _b, ...b } = replay(toSave(live));
    expect(b).toEqual(a);
  }, 60_000);

  it.each(['middle', 'gate'] as const)('the %s stage starts with every line running', (id) => {
    const s = createRun(id, 1);
    const r = rates(s);
    expect(idleHands(s)).toBeGreaterThanOrEqual(0);
    expect(s.hands).toBeLessThanOrEqual(housing(s));
    for (const z of ['hearth', 'bocage', 'marsh'] as const) expect(zoneUsed(s, z)).toBeLessThanOrEqual(ZONES[z].slots);
    expect(r.net.bread).toBeGreaterThan(0);
    expect(r.zones.marsh.factor).toBe(1);
    expect(r.zones.bocage.factor).toBe(1);
    expect(s.magi.every((m) => m.sanctum)).toBe(true);
  });
});
