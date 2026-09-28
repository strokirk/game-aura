import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';
import {
  activeTraits,
  almsCost,
  apply,
  cap,
  createRun,
  dikeCost,
  experimentPlan,
  giftCost,
  housing,
  idleHands,
  influence,
  labTotal,
  maxExtraVis,
  nextTribunal,
  rates,
  replay,
  type State,
  stepTo,
  terraces,
  toSave,
  zoneSlots,
  zoneUsed,
} from '../src/core/index.ts';
import { DECREES, FUEL_MULT, SCENARIOS, ZONES } from '../src/data/index.ts';

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
    expect(titles).toContain('The Hall is full');
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

  it('the careful strategy wins, and the run replays from its log', () => {
    // Careful tries many actions the core refuses; the sim applies them in place, so this also checks that a
    // refused action changes nothing.
    const live = simulate('grow', 1, STRATEGIES.careful!);
    expect(live.outcome?.kind).toBe('win');
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

  it('Bread fuels Quarries and Salt-works x1.5, burning 0.05 per worker', () => {
    const s = stage();
    const fed = rates(s);
    s.res.bread = 0;
    const unfed = rates(s);
    expect(fed.byBuilding.quarry?.stone).toBeCloseTo((unfed.byBuilding.quarry?.stone ?? 0) * FUEL_MULT);
    const burners = (s.buildings.quarry?.workers ?? 0) + (s.buildings.salt_pan?.workers ?? 0);
    expect(unfed.net.bread - fed.net.bread).toBeCloseTo(burners * 0.05);
  });

  it('eels for the monks lower Notice at once, at a rising price', () => {
    let s = stage();
    s.res.eels = 50;
    s = ok(apply(s, { type: 'gift' }));
    expect(s.notice).toBeCloseTo(45 - 15);
    expect(giftCost(s)).toEqual({ eels: 75 });
  });

  it('alms trade Bread for less Notice, at x1.5 the price each time', () => {
    let s = stage();
    s.res.bread = 100;
    const gen = rates(s).noticeGen;
    s = ok(apply(s, { type: 'alms' }));
    expect(s.res.bread).toBe(0);
    expect(rates(s).noticeGen).toBeLessThan(gen);
    expect(almsCost(s)).toEqual({ bread: 150 });
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

describe('warping and Twilight', () => {
  const stage = () => ok(apply(createRun('middle', 3), { type: 'choose', option: 0 }));
  /** Starts Study the Vis on Aldric, rigged to botch, and runs it out. */
  function botch(s0: State) {
    let s = ok(apply(s0, { type: 'experiment', magus: 'aldric', recipe: 'study_vis', extra: 0 }));
    s.magi[0]!.exp!.botch = 1;
    s = stepTo(s, s.magi[0]!.exp!.end + 0.5);
    return s;
  }

  it('a botch Warps the magus, raising the Lab Total', () => {
    const s = botch(stage());
    const m = s.magi[0]!;
    expect(m.warp).toBe(1);
    expect(labTotal(m)).toBe(m.lt + 1);
  });

  it('Twilight takes the magus away, then returns them with a timed trait', () => {
    const s0 = stage();
    s0.magi[0]!.warp = 9; // the 10th point makes Twilight certain
    let s = botch(s0);
    while (s.events.length) s = ok(apply(s, { type: 'choose', option: 0 }));
    const m = s.magi[0]!;
    expect(m.twilight).not.toBeNull();
    expect(apply(s, { type: 'experiment', magus: 'aldric', recipe: 'study_vis', extra: 0 })).toEqual({
      error: 'Aldric is in Twilight',
    });
    s = stepTo(s, (m.twilight ?? 0) + 1);
    expect(s.events[0]?.title).toMatch(/^Aldric returns: /);
    expect(s.magi[0]!.twilight).toBeNull();
    expect(activeTraits(s, s.magi[0]!)).toHaveLength(1);
  });

  it('a higher Lab Total enchants devices faster', () => {
    const s = stage();
    const slow = experimentPlan(s, 'aldric', 'device', 0).time;
    s.magi[0]!.warp = 10;
    expect(experimentPlan(s, 'aldric', 'device', 0).time).toBeLessThan(slow);
  });

  it('full Vis is the most extra Vis the stock pays for', () => {
    const s = stage();
    s.res.vis = 8;
    expect(maxExtraVis(s, 'aldric', 'study_vis')).toBe(3);
    s.res.vis = 4;
    expect(maxExtraVis(s, 'aldric', 'study_vis')).toBe(-1);
  });
});

describe('the Tribunal', () => {
  /** The full run on the eve of the 1227 Tribunal, with the eel beats already played. */
  function eve(notice: number, vis: number) {
    const s = ok(apply(createRun('grow', 5), { type: 'choose', option: 0 }));
    s.t = 7 * 120 - 1;
    s.yearDone = 1226;
    s.fired.push('eels_1_first_catch', 'eels_2_the_weir', 'eels_3_the_font');
    s.noticeFired = ['tax', 'strike', 'audit'];
    s.unlocksDone = (SCENARIOS.grow.unlocks ?? []).map((_, i) => i);
    s.notice = notice;
    s.res.vis = vis;
    return s;
  }

  it('meets in 1227: quiet and vis-rich means influence and gifts, and two decrees', () => {
    const s0 = eve(30, 30);
    expect(nextTribunal(s0)).toBe(1227);
    expect(influence(s0)).toBe(3 + 1);
    const s = stepTo(s0, s0.t + 1.5);
    expect(s.events.map((e) => e.title)).toContain('The Tribunal of 1227');
    expect(s.decrees).toHaveLength(2);
    expect(s.labTexts + Object.values(s.devices).reduce((a, n) => a + (n ?? 0), 0)).toBe(2);
    expect(nextTribunal(s)).toBe(1234);
  });

  it('a loud, vis-poor covenant gets no gifts', () => {
    const s = stepTo(eve(90, 0), 7 * 120 + 0.5);
    expect(s.events.map((e) => e.title)).toContain('The Tribunal of 1227');
    expect(s.labTexts).toBe(0);
  });

  it('a decree triples the Notice of its activity', () => {
    const s = eve(0, 0);
    const salt = DECREES.findIndex((d) => d.building === 'salt_pan');
    const before = rates(s).noticeGen;
    s.decrees = [salt];
    const one = 0.35 * (s.buildings.salt_pan?.count ?? 0) * 0.5; // Marsh factor 0.5
    expect(rates(s).noticeGen).toBeCloseTo(before + 2 * one);
  });
});
