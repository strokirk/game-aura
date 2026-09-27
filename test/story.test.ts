import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileInk } from '../scripts/ink.ts';
import { apply, createRun, rates, type State, stepTo } from '../src/core/index.ts';
import { parseTag } from '../src/core/story.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
/** Runs the trial to the weir beat, taking the first choice on every earlier card. */
function atTheWeir(): State {
  let s = ok(apply(createRun('trial', 1), { type: 'choose', option: 0 }));
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
});
