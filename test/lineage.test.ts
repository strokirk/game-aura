import { describe, expect, it } from 'vitest';
import {
  apply,
  apprenticeBoost,
  aura,
  auraBoosts,
  cap,
  createRun,
  divine,
  nameOf,
  nextLegacy,
  offerCost,
  rates,
  replay,
  type State,
  stepTo,
  toSave,
  visibleResearch,
  zoneSlots,
} from '../src/core/index.ts';
import { APPRENTICE, AURA, EEL_RENT, EXPAND, SCENARIOS, STORE_MULT, YEAR } from '../src/data/index.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
const begin = (legacy?: Parameters<typeof createRun>[2]) =>
  ok(apply(createRun('grow', 1, legacy), { type: 'choose', option: 0 }));
/** Steps to t, taking the first choice on every card on the way. */
function run(s: State, t: number) {
  while (s.t < t && !s.outcome) {
    s = stepTo(s, t);
    while (s.events.length) s = ok(apply(s, { type: 'choose', option: 0 }));
  }
  return s;
}

describe('the Tide Remembers', () => {
  it('has no deadline in the full run', () => {
    const losses: readonly { when: { kind: string } }[] = SCENARIOS.grow.loss;
    expect(losses.some((l) => l.when.kind === 'time')).toBe(false);
  });

  it('a new hand costs eels, and none come without them', () => {
    const s0 = { ...begin(), buildings: {}, porters: {}, res: { ...begin().res, eels: 0 } } as State;
    expect(run(s0, 60).hands).toBe(s0.hands);
    const s1 = { ...s0, res: { ...s0.res, eels: 50 } } as State;
    const s = run(s1, 21);
    expect(s.hands).toBe(s0.hands + 1);
    expect(s.res.eels).toBeCloseTo(50 - EEL_RENT);
  });

  it('storage multiplies caps, so it always outgrows its price; land can be bought', () => {
    const s0 = begin();
    const s = { ...s0, buildings: { ...s0.buildings, storehouse: { count: 2, workers: 0 } } } as State;
    expect(cap(s, 'silver')).toBe(Math.floor(500 * STORE_MULT ** 2));
    expect(cap(s, 'insight')).toBe(1000);
    const rich = { ...s0, res: { ...s0.res, silver: 500, stone: 200 } } as State;
    const x = ok(apply(rich, { type: 'expand', zone: 'hearth' }));
    expect(zoneSlots(x, 'hearth')).toBe(zoneSlots(rich, 'hearth') + EXPAND.slots);
  });

  it('raising the aura boosts the labs and costs Notice; Endowing and the friars bring the Dominion', () => {
    const s0 = {
      ...begin(),
      unlocked: ['research'],
      research: { salt_rakes: 1, plough: 1, mule_trains: 1, accounts: 1 },
      res: { ...begin().res, insight: 1000, vis: 30 },
    } as State;
    const s = ok(apply(s0, { type: 'research', id: 'raise_aura' }));
    expect(aura(s)).toBe(AURA.base + 1);
    expect(auraBoosts(s).insight).toBeCloseTo(1 + AURA.insight);
    expect(rates(s).noticeGen - rates(s0).noticeGen).toBeCloseTo(AURA.raiseNotice);
    expect(divine({ ...s, endowments: 2 } as State)).toBe(1);
    expect(divine({ ...s, t: AURA.friars } as State)).toBe(1);
  });

  it('an apprentice slows the master at first and helps later', () => {
    const s0 = { ...begin(), unlocked: ['apprentices'], res: { ...begin().res, silver: 200 } } as State;
    const s = ok(apply(s0, { type: 'apprentice', magus: 'aldric' }));
    expect(apprenticeBoost(s, 'aldric')).toBeCloseTo(APPRENTICE.start);
    expect(apprenticeBoost({ ...s, t: s.t + APPRENTICE.ramp } as State, 'aldric')).toBeCloseTo(APPRENTICE.end);
  });

  it('a magus dies of age, and a journeyman takes the chair and the name', () => {
    const s0 = begin();
    const old = { ...s0.magi[0]!, age: 90, decrepitude: 4 };
    const s1 = {
      ...s0,
      magi: [old],
      apprentices: [{ chair: 'aldric', start: -APPRENTICE.gauntlet, ready: true }],
    } as State;
    const s = run(s1, YEAR * 3);
    expect(s.stats.deaths).toBe(1);
    expect(s.magi.map(nameOf)).toEqual(['Aldric II']);
    expect(s.magi[0]!.age).toBeLessThan(APPRENTICE.age + 3);
  });

  it('with no magus and no apprentice, the line is broken', () => {
    const s = run({ ...begin(), magi: [] } as State, 1);
    expect(s.outcome?.cause).toMatch(/no apprentice/);
  });

  it('offerings double in price within a year', () => {
    const s0 = {
      ...begin(),
      unlocked: ['faerie'],
      buildings: { ...begin().buildings, regio_spring: { count: 1, workers: 0 } },
      res: { ...begin().res, vis: 30 },
    } as State;
    const s = ok(apply(s0, { type: 'offer' }));
    expect(s.events[0]?.title).toMatch(/offering/);
    expect(offerCost(s).vis).toBe(20);
  });

  it('legacies stack, and a new covenant starts from them', () => {
    const s0 = begin();
    const end = {
      ...s0,
      aura: { ...s0.aura, peak: AURA.base + 4 },
      stats: { ...s0.stats, labTextsWritten: 5 },
      devices: { quarry: 3 },
    } as State;
    const lg = nextLegacy(end);
    expect(lg).toMatchObject({ covenants: 1, magic: 2, labTexts: 5, heirlooms: ['quarry'], gens: { aldric: 1 } });
    const s = begin(lg);
    expect(s.aura.magic).toBe(AURA.base + 2);
    expect(s.devices.quarry).toBe(1);
    expect(nameOf(s.magi[0]!)).toBe('Aldric II');
    expect(visibleResearch(s)[0]).toBe('dig_library');
    expect(s.chronicle[0]!.text).toMatch(/second covenant/);
    expect(nextLegacy({ ...end, legacy: lg } as State).magic).toBe(4);
    const { acc: _a, ...a } = s;
    const { acc: _b, ...b } = replay(toSave(s));
    expect(b).toEqual(a);
  });
});
