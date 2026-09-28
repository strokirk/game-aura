import { type Action, advance, applyInPlace, createRun, type State } from '../src/core/index.ts';
import type { ScenarioId } from '../src/data/index.ts';
import type { Strategy } from './strategies.ts';

/**
 * Plays a whole run headlessly: the strategy acts once per game second; a card takes the strategy's `choose`, else
 * the first option it can pay for. The sim owns its state, so it changes it in place instead of copying it on every call.
 * With no deadline, a run the strategy cannot finish stops at maxT: 150 minutes of play.
 */
export function simulate(scenario: ScenarioId, seed: number, strategy: Strategy, maxT = 9_000): State {
  const s = createRun(scenario, seed);
  while (!s.outcome && s.t < maxT) {
    while (s.events.length) {
      // The strategy's choice, else the first option the covenant can pay for.
      const tries: Action[] = [
        ...strategy(s).filter((a) => a.type === 'choose'),
        ...s.events[0]!.options.map((_, option) => ({ type: 'choose' as const, option })),
      ];
      if (!tries.some((a) => !applyInPlace(s, a))) throw new Error(`No option can be taken: ${s.events[0]!.title}`);
    }
    for (const a of strategy(s)) applyInPlace(s, a);
    advance(s, 1);
  }
  return s;
}
