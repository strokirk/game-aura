import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run.ts';
import { STRATEGIES } from '../sim/strategies.ts';
import { apply, createRun, replay, type State, step, toSave } from '../src/core/index.ts';

const ok = (r: ReturnType<typeof apply>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};
const strip = ({ acc: _acc, ...rest }: State) => rest;

describe('core', () => {
  it('is deterministic: same seed and strategy give the same run', () => {
    const a = simulate('trial', 42, STRATEGIES.sensible!);
    const b = simulate('trial', 42, STRATEGIES.sensible!);
    expect(strip(a)).toEqual(strip(b));
  });

  it('replays a saved run from seed and action log', () => {
    const live = simulate('trial', 7, STRATEGIES.sensible!);
    expect(strip(replay(toSave(live)))).toEqual(strip(live));
  });

  it('pauses while an event card is waiting, and rejects other actions', () => {
    const s = createRun('trial', 1);
    expect(s.events).toHaveLength(1);
    expect(step(s, 10).t).toBe(0);
    expect(apply(s, { type: 'study', magus: 'aldric' })).toEqual({ error: 'An event is waiting' });
    expect(ok(apply(s, { type: 'choose', option: 0 })).events).toHaveLength(0);
  });

  it('refuses to assign hands that are not idle', () => {
    let s = ok(apply(createRun('trial', 1), { type: 'choose', option: 0 }));
    s = ok(apply(s, { type: 'porters', zone: 'marsh', delta: 1 })); // the one idle hand
    expect(apply(s, { type: 'workers', building: 'tide_pool', delta: 1 })).toEqual({ error: 'No idle hands' });
  });

  it('throttles Marsh output to what porters carry', () => {
    let s = ok(apply(createRun('trial', 1), { type: 'choose', option: 0 }));
    s = ok(apply(s, { type: 'porters', zone: 'marsh', delta: -1 }));
    const before = s.res.silver;
    s = step(s, 10);
    expect(s.res.silver).toBe(before);
  });

  it('pays for an experiment and resolves it when the timer ends', () => {
    let s = ok(apply(createRun('trial', 1), { type: 'choose', option: 0 }));
    s = ok(apply(s, { type: 'experiment', magus: 'aldric', recipe: 'study_vis', extra: 0 }));
    expect(s.res.vis).toBe(0);
    s = step(s, 60);
    expect(s.magi[0]!.exp).toBeNull();
    expect(s.stats.insightMade > 0 || s.stats.botches === 1).toBe(true); // success or botch, never neither
  });
});
