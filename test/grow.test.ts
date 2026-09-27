import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';
import {
  almsCost,
  apply,
  cap,
  createRun,
  dikeCost,
  housing,
  idleHands,
  rates,
  replay,
  type State,
  stepTo,
  terraces,
  toSave,
  zoneSlots,
  zoneUsed,
} from '../src/core/index.ts';
import { FISH_SHARE, HAND_FOOD, ZONES } from '../src/data/index.ts';

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
    const before = rates(s0).byBuilding.salt_pan?.salt ?? 0;
    const s = ok(apply(s0, { type: 'research', id: 'salt_rakes' }));
    expect(s.res.insight).toBe(10);
    expect(rates(s).byBuilding.salt_pan?.salt).toBeCloseTo(before * 1.5);
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

  it('a full Bocage reveals dikes; each dike wins 2 Polder plots at a rising price', () => {
    let s = begin();
    s.buildings.farm = { count: ZONES.bocage.slots, workers: 0 };
    s = stepTo(s, s.t + 1);
    expect(s.events[0]?.title).toBe('Land from the sea');
    s = ok(apply(s, { type: 'choose', option: 0 }));
    expect(zoneSlots(s, 'polder')).toBe(0);
    s.res.stone = 200;
    s.res.bread = 200;
    s = ok(apply(s, { type: 'dike' }));
    expect(zoneSlots(s, 'polder')).toBe(2);
    expect(dikeCost(s)).toEqual({ stone: 150, bread: 150 });
    s.res.silver = 100;
    s = ok(apply(s, { type: 'build', building: 'salt_meadow' }));
    expect(zoneUsed(s, 'polder')).toBe(1);
  });

  it('quarrying cuts terraces that open Hearth plots, each after 1.6x more Stone, up to 10', () => {
    const s = ok(apply(createRun('gate', 1), { type: 'choose', option: 0 }));
    expect(zoneUsed(s, 'hearth')).toBe(ZONES.hearth.slots);
    expect(apply(s, { type: 'build', building: 'quarry' })).toEqual({ error: 'The Hearth is full' });
    s.quarried = 2000 + 3200 - 1;
    expect(terraces(s)).toEqual({ n: 1, next: 1 });
    s.quarried = 1e9;
    expect(terraces(s).n).toBe(10);
    expect(zoneSlots(s, 'hearth')).toBe(ZONES.hearth.slots + 10);
    // The Gate stage starts above the tax line; let the collector call first.
    const t = stepTo({ ...s, quarried: 1999, noticeFired: ['tax', 'strike'] }, s.t + 5);
    expect(terraces(t).n).toBe(1);
  });
});

describe('goods with more than one use', () => {
  const stage = () => ok(apply(createRun('middle', 1), { type: 'choose', option: 0 }));

  it('sells Salt at the Hall by default, and keeps it to preserve food when asked', () => {
    let s = stage();
    const sold = rates(s);
    expect(sold.net.salt).toBe(0);
    s = ok(apply(s, { type: 'keepSalt' }));
    const kept = rates(s);
    expect(kept.net.salt).toBeGreaterThan(0);
    expect(kept.net.silver).toBeCloseTo(sold.net.silver - kept.net.salt);
    const cap0 = cap(s, 'bread');
    s.res.salt = 100;
    expect(cap(s, 'bread')).toBe(cap0 + 20);
    s = ok(apply(s, { type: 'keepSalt' }));
    expect(s.res.salt).toBe(0);
  });

  it('eats Eels on fish days, up to a third of the food', () => {
    const s = stage();
    const food = s.hands * HAND_FOOD;
    const without = rates(s).net.bread;
    s.res.eels = 50;
    const r = rates(s);
    expect(r.net.eels).toBeCloseTo(-food * FISH_SHARE);
    expect(r.net.bread).toBeCloseTo(without + food * FISH_SHARE);
  });

  it('alms trade Bread for less Notice, doubling in price', () => {
    let s = stage();
    s.res.bread = 200;
    const gen = rates(s).noticeGen;
    s = ok(apply(s, { type: 'alms' }));
    expect(s.res.bread).toBe(0);
    expect(rates(s).noticeGen).toBeLessThan(gen);
    expect(almsCost(s)).toEqual({ bread: 400 });
  });

  it('the hostel turns Bread into Silver, and stands idle without Bread', () => {
    let s = stage();
    s.res.stone = 150;
    s = ok(apply(s, { type: 'build', building: 'hostel' }));
    s.hands += 1;
    s = ok(apply(s, { type: 'workers', building: 'hostel', delta: 1 }));
    const r = rates(s);
    expect(r.byBuilding.hostel?.silver).toBeGreaterThan(0);
    s.res.bread = 0;
    expect(rates(s).byBuilding.hostel?.silver ?? 0).toBe(0);
  });
});
