import { type Action, experimentPlan, idleHands, rates, type State, workerSlots } from '../src/core/index.ts';
import { EXPERIMENT } from '../src/data/index.ts';

/** A scripted player: called once per simulated second, returns the actions to try. */
export type Strategy = (s: State) => Action[];

export const STRATEGIES: Record<string, Strategy> = {
  /** Does nothing but dismiss cards. Must lose the trial. */
  idle: () => [],

  /** Staffs the Tide Pool, keeps the Marsh carried, runs experiments with all spare Vis. */
  sensible: (s) => {
    const out: Action[] = [];
    if (idleHands(s) > 0) {
      const r = rates(s);
      const tide = s.buildings.tide_pool;
      if (tide && tide.workers < workerSlots(s, 'tide_pool'))
        out.push({ type: 'workers', building: 'tide_pool', delta: 1 });
      else if (r.zones.marsh.factor < 1) out.push({ type: 'porters', zone: 'marsh', delta: 1 });
      else out.push({ type: 'workers', building: 'salt_pan', delta: 1 });
    }
    for (const m of s.magi) {
      if (!m.sanctum || m.exp) continue;
      const extra = Math.max(0, Math.min(EXPERIMENT.maxExtraVis, Math.floor(s.res.vis) - 5));
      if (s.res.vis >= experimentPlan(s, m.id, 'study_vis', 0).cost.vis!) {
        out.push({ type: 'experiment', magus: m.id, recipe: 'study_vis', extra });
      }
    }
    return out;
  },
};
