import { type Action, apply, createRun, type State, step } from '../src/core/index.ts';
import type { ScenarioId } from '../src/data/index.ts';
import type { Strategy } from './strategies.ts';

/**
 * Calls the core without the action log, then puts the log back in front of any new entries.
 * The core clones the whole state on every call, and late in a run the log is most of it.
 */
function lean<R extends State | { error: string }>(s: State, f: (bare: State) => R): R {
  const r = f({ ...s, log: [] });
  if ('log' in r) r.log = s.log.concat(r.log);
  return r;
}
const act = (s: State, a: Action) => lean(s, (x) => apply(x, a));

/** Plays a whole run headlessly: the strategy acts once per game second; a card takes the strategy's `choose`, else its first option. */
export function simulate(scenario: ScenarioId, seed: number, strategy: Strategy, maxT = 100_000): State {
  let s = createRun(scenario, seed);
  while (!s.outcome && s.t < maxT) {
    while (s.events.length) {
      const pick = strategy(s).find((a) => a.type === 'choose');
      const r = pick && act(s, pick);
      s = r && !('error' in r) ? r : (act(s, { type: 'choose', option: 0 }) as State);
    }
    for (const a of strategy(s)) {
      const r = act(s, a);
      if (!('error' in r)) s = r;
    }
    s = lean(s, (x) => step(x, 1));
  }
  return s;
}
