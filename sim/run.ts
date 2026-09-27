import { apply, createRun, type State, step } from '../src/core/index.ts';
import type { ScenarioId } from '../src/data/index.ts';
import type { Strategy } from './strategies.ts';

/** Plays a whole run headlessly: the strategy acts once per game second; cards take their first option. */
export function simulate(scenario: ScenarioId, seed: number, strategy: Strategy, maxT = 100_000): State {
  let s = createRun(scenario, seed);
  while (!s.outcome && s.t < maxT) {
    while (s.events.length) s = apply(s, { type: 'choose', option: 0 }) as State;
    for (const a of strategy(s)) {
      const r = apply(s, a);
      if (!('error' in r)) s = r;
    }
    s = step(s, 1);
  }
  return s;
}
