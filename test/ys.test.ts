import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileInk } from '../scripts/ink.ts';
import { apply, bells, createRun, dark, rates, type State, stepTo, zoneSlots } from '../src/core/index.ts';
import { GATE, YEAR } from '../src/data/index.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
/** Dismisses cards by their first choice. */
const clear = (s: State) => {
  while (s.events.length) s = ok(apply(s, { type: 'choose', option: 0 }));
  return s;
};
/** The Gate stage with Notice low, ready to ring. */
const gate = () => {
  const s = clear(createRun('gate', 1));
  s.notice = 0;
  return s;
};
/** Fills the Gate with the next bell's price and rings it, then plays its story by the first choice. */
const ring = (s0: State) => {
  let s = ok(apply(s0, { type: 'devFill' }));
  s = ok(apply(s, { type: 'gate', op: 'bell' }));
  s = stepTo(s, s.t + 0.25);
  return s;
};

describe('the Seven Bells of Ys', () => {
  it('ships compiled ink that matches its source (run `pnpm ink` if this fails)', () => {
    const src = readFileSync(new URL('../src/content/ys.ink', import.meta.url), 'utf8');
    const json = readFileSync(new URL('../src/content/ys.json', import.meta.url), 'utf8');
    expect(json.trim()).toBe(compileInk(src));
  });

  it('a bell is paid from the Gate and plays its story', () => {
    let s = gate();
    expect(apply(s, { type: 'gate', op: 'bell' })).toEqual({ error: 'The Gate does not hold enough' });
    s = ring(s);
    expect(bells(s)).toBe(1);
    expect(s.events[0]?.title).toBe('The drowned forest');
    s = clear(s);
    expect(zoneSlots(s, 'scissy')).toBe(GATE.scissySlots);
    expect(s.unlocked).toContain('bog_camp');
  });

  it('pouring sends a good to the Gate instead of the Hall', () => {
    let s = gate();
    const before = rates(s).net.salt + rates(s).net.silver;
    s = ok(apply(s, { type: 'pour', good: 'salt' }));
    const r = rates(s);
    expect(r.gate.salt).toBeGreaterThan(0);
    expect(r.net.silver + r.gate.salt).toBeCloseTo(before);
  });

  it('Blood makes the Salt-works a Vis source; Darkness hides an hour', () => {
    let s = gate();
    for (let i = 0; i < 4; i++) s = clear(ring(s));
    expect(rates(s).byBuilding.salt_pan?.vis).toBeGreaterThan(0);
    s = stepTo(s, Math.ceil(s.t / GATE.darkness.period) * GATE.darkness.period + 1);
    s = clear(s);
    expect(dark(s)).toBe(true);
    expect(rates(s).noticeGen).toBe(0);
  });

  it('the Pit raises the Knight, and a year later something comes after him', () => {
    let s = gate();
    for (let i = 0; i < 5; i++) s = clear(ring(s));
    expect(s.magi.find((m) => m.id === 'knight')?.lt).toBe(GATE.knightLT);
    s = stepTo(s, (Math.floor(s.t / YEAR) + 1) * YEAR + 0.25);
    expect(s.events.map((e) => e.title)).toContain('Things from the Pit');
  });

  it('the seventh bell wins once its story is told, and only below Notice 50', () => {
    let s = gate();
    for (let i = 0; i < 6; i++) s = clear(ring(s));
    s.notice = 60;
    s = ok(apply(s, { type: 'devFill' }));
    expect(apply(s, { type: 'gate', op: 'bell' })).toEqual({ error: 'Notice must be under 50' });
    s.notice = 10;
    s = stepTo(ok(apply(s, { type: 'gate', op: 'bell' })), s.t + 0.25);
    expect(s.events[0]?.title).toBe('No more sea');
    s = ok(apply(s, { type: 'choose', option: 0 }));
    expect(s.outcome?.kind).toBe('win');
  });
});
