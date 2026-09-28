import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileInk } from '../scripts/ink.ts';
import { apply, createRun, rates, type State, stepTo } from '../src/core/index.ts';
import { parseTag } from '../src/core/story.ts';
import { START_YEAR, YEAR } from '../src/data/index.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
/** Runs the trial to the weir beat, set up as its guide says, taking the first choice on every earlier card. */
function atTheWeir(): State {
  let s = ok(apply(createRun('trial', 1), { type: 'choose', option: 0 }));
  s = ok(apply(s, { type: 'workers', building: 'salt_pan', delta: 2 }));
  s = ok(apply(s, { type: 'porters', zone: 'marsh', delta: 1 }));
  s = stepTo(s, 40);
  s = ok(apply(s, { type: 'build', building: 'tide_pool' }));
  s = ok(apply(s, { type: 'workers', building: 'tide_pool', delta: 1 }));
  s = stepTo(s, 60);
  expect(s.events[0]?.title).toBe('The eel rent');
  s = ok(apply(s, { type: 'choose', option: 0 }));
  s = stepTo(s, 120);
  expect(s.events[0]?.title).toBe('The weir');
  return s;
}

describe('story', () => {
  it('ships compiled ink that matches its source (run `pnpm ink` if this fails)', () => {
    const src = readFileSync(new URL('../src/content/eels.ink', import.meta.url), 'utf8');
    const json = readFileSync(new URL('../src/content/eels.json', import.meta.url), 'utf8');
    expect(json.trim()).toBe(compileInk(src));
  });

  it('parses effect tags', () => {
    expect(parseTag('res:bread:+15')).toEqual({ kind: 'res', good: 'bread', n: 15, perSecond: false });
    expect(parseTag('res:silver:-30s')).toEqual({ kind: 'res', good: 'silver', n: -30, perSecond: true });
    expect(parseTag('mod:tide_pool:vis:0.8:600')).toEqual({
      kind: 'mod',
      id: 'tide_pool',
      good: 'vis',
      mult: 0.8,
      secs: 600,
    });
    expect(parseTag('block:experiment:aldric:60')).toEqual({ kind: 'block', what: 'experiment:aldric', secs: 60 });
    expect(parseTag('unlock:eel_weir')).toEqual({ kind: 'unlock', id: 'eel_weir' });
    expect(parseTag('destroy:salt_pan:4')).toEqual({ kind: 'destroy', building: 'salt_pan', n: 4 });
    expect(parseTag('destroy:tide_pool')).toEqual({ kind: 'destroy', building: 'tide_pool', n: 1 });
    expect(() => parseTag('summon:dragon')).toThrow();
  });

  it('paying for the weir unlocks it and cuts the Tide Pool to 80% for 600 s', () => {
    const before = atTheWeir();
    const vis = rates(before).byBuilding.tide_pool?.vis ?? 0;
    const s = ok(apply(before, { type: 'choose', option: 0 }));
    expect(s.res.silver).toBeCloseTo(before.res.silver - 20);
    expect(s.unlocked).toContain('eel_weir');
    expect(s.story.eel_level).toBe(2);
    expect(rates(s).byBuilding.tide_pool?.vis).toBeCloseTo(vis * 0.8);
    expect(s.mods).toContainEqual({ id: 'tide_pool', good: 'vis', mult: 0.8, until: s.t + 600 });
    expect(s.chronicle.at(-1)?.text).toMatch(/^The weir\. The weir goes in by May/);
  });

  it('looking at the channel first idles the lab for 60 s and spares the Tide Pool', () => {
    const before = atTheWeir();
    expect(before.events[0]?.options).toHaveLength(3);
    const s = ok(apply(before, { type: 'choose', option: 2 }));
    expect(rates(s).byBuilding.tide_pool?.vis).toBeCloseTo(rates(before).byBuilding.tide_pool?.vis ?? 0);
    expect(apply(s, { type: 'experiment', magus: 'aldric', recipe: 'study_vis', extra: 0 })).toEqual({
      error: 'Aldric is away from the lab',
    });
  });

  it('plays the eels through the full run to the flood and its epilogue', () => {
    let s = ok(apply(createRun('grow', 1), { type: 'choose', option: 0 }));
    s.buildings.salt_pan = { count: 6, workers: 0 };
    /** Jumps to `y`, expects the card `title`, and takes the choice whose label starts with `pick`. */
    const beat = (y: number, title: string, pick: string) => {
      s.t = Math.max(s.t, 60, (y - START_YEAR) * YEAR);
      s.res.bread = 200;
      s = stepTo(s, s.t + 1);
      while (s.events[0] && !s.events[0].knot) s = ok(apply(s, { type: 'choose', option: 0 })); // unlock cards
      expect(s.events[0]?.title).toBe(title);
      const i = s.events[0]?.options.findIndex((o) => o.label.startsWith(pick)) ?? -1;
      s = ok(apply(s, { type: 'choose', option: i }));
    };
    beat(1220, 'The eel rent', 'Salt them');
    beat(1221, 'The weir', 'Let them build');
    beat(1224, 'The font', 'Tell him');
    beat(1229, 'Eels in the brine', 'Leave it');
    beat(1235, 'The Dol road', 'Tell him');
    beat(1241, 'The spring tide', 'Buy her');
    beat(1245, 'The flood', 'Burn them');
    expect(s.story.eels_state).toBe(4);
    expect(s.buildings.salt_pan?.count).toBe(2);
    beat(1248, 'The eel rent', 'Let her');
    expect(s.events).toHaveLength(0);
  });
});
