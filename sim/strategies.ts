import {
  type Action,
  apply,
  bellStatus,
  buildable,
  buildCost,
  canAfford,
  canAffordResearch,
  canExpand,
  cap,
  count,
  endowCost,
  expandCost,
  experimentPlan,
  faerieNeed,
  giftCost,
  guideStep,
  has,
  housing,
  idleHands,
  isMaxed,
  offerCost,
  present,
  rates,
  recipeOpen,
  researchCost,
  type State,
  studyCost,
  visibleResearch,
  workerSlots,
  zoneFull,
} from '../src/core/index.ts';
import { nextRandom, seedRng } from '../src/core/rng.ts';
import {
  APPRENTICE,
  AURA,
  type BuildingId,
  DEFS,
  EEL_RENT,
  EXPERIMENT,
  GOODS,
  type GuideStep,
  NOTICE,
  RECIPES,
  RESEARCH,
  RESEARCH_DEFS,
  type RecipeId,
  type ResearchId,
  ZONES,
} from '../src/data/index.ts';

const AGING_AT = 45;
void APPRENTICE;
void AURA;

/** A scripted player: called once per simulated second, returns the actions to try. */
export type Strategy = (s: State) => Action[];

const keys = <K extends string>(o: Partial<Record<K, unknown>>) => Object.keys(o) as K[];
const deltas = [1, -1];

/**
 * Every action the random player can take, by type: each entry lists the candidates in a state.
 * Keyed by `Action['type']`, so tsc fails until a new action type gets its one line here.
 */
const CANDIDATES: { [K in Action['type']]: (s: State) => Extract<Action, { type: K }>[] } = {
  build: () => keys(DEFS).map((building) => ({ type: 'build', building })),
  dike: () => [{ type: 'dike' }],
  expand: () => keys(ZONES).map((zone) => ({ type: 'expand', zone })),
  offer: () => [{ type: 'offer' }],
  apprentice: (s) => s.magi.map((m) => ({ type: 'apprentice', magus: m.id })),
  workers: (s) =>
    keys(s.buildings).flatMap((building) => deltas.map((delta) => ({ type: 'workers', building, delta }))),
  porters: () => keys(ZONES).flatMap((zone) => deltas.map((delta) => ({ type: 'porters', zone, delta }))),
  gatePorters: () => deltas.map((delta) => ({ type: 'gatePorters', delta })),
  experiment: (s) =>
    s.magi.flatMap((m) =>
      keys<RecipeId>(RECIPES).flatMap((recipe) =>
        [0, EXPERIMENT.maxExtraVis].flatMap((extra) =>
          RECIPES[recipe].result === 'device'
            ? keys(s.buildings).map((target) => ({ type: 'experiment' as const, magus: m.id, recipe, extra, target }))
            : [{ type: 'experiment' as const, magus: m.id, recipe, extra }],
        ),
      ),
    ),
  study: (s) => s.magi.map((m) => ({ type: 'study', magus: m.id })),
  research: () => [...keys<ResearchId>(RESEARCH), 'dig_library' as const].map((id) => ({ type: 'research', id })),
  endow: () => [{ type: 'endow' }],
  bribe: () => [{ type: 'bribe' }],
  alms: () => [{ type: 'alms' }],
  keepSalt: () => [{ type: 'keepSalt' }],
  gift: () => [{ type: 'gift' }],
  gate: () => (['found', 'bell'] as const).map((op) => ({ type: 'gate', op })),
  pour: () => GOODS.map((good) => ({ type: 'pour', good })),
  couesnon: () => keys(ZONES).map((zone) => ({ type: 'couesnon', zone })),
  devFill: () => [], // a cheat, never played
  choose: (s) => (s.events[0]?.options ?? []).map((_, option) => ({ type: 'choose', option })),
};
const KINDS = keys(CANDIDATES);

/** A generator seeded from the run's seed and the moment, so the random player replays exactly without touching `s.rng`. */
function momentRng(s: State): () => number {
  const h =
    Math.imul(s.seed ^ 0x5bd1e995, 0x9e3779b1) ^ Math.imul(Math.round(s.t * 4) + 1, 0x85ebca6b) ^ s.events.length;
  const r = seedRng(h);
  return () => nextRandom(r);
}
const pickOf = <T>(xs: readonly T[], rnd: () => number): T | undefined => xs[Math.floor(rnd() * xs.length)];
/** Whether apply() accepts the action. The log is left out: legality never reads it, and cloning it is most of apply()'s cost. */
const legal = (s: State, a: Action) => !('error' in apply({ ...s, log: [] }, a));
/** Applies actions in order to a copy, keeping those the core accepts: the strategy sees the effect of its own moves. */
function plan(s: State, pick: (x: State) => Action | undefined, max = 60): Action[] {
  const out: Action[] = [];
  let x: State = { ...s, log: [] };
  for (let i = 0; i < max; i++) {
    const a = pick(x);
    if (!a) break;
    const r = apply(x, a);
    if ('error' in r) break;
    x = r;
    out.push(a);
  }
  return out;
}

/** Where a hand can go now: a worker slot with room, or a porter for a zone with anything to carry. */
function openJobs(s: State): Action[] {
  const jobs: Action[] = keys(s.buildings)
    .filter((id) => (s.buildings[id]?.workers ?? 0) < workerSlots(s, id))
    .map((building) => ({ type: 'workers', building, delta: 1 }));
  return jobs;
}

/**
 * Every idle hand to work. Porters first wherever goods are being lost; then the job with the lowest share of
 * its slots filled, so hands split evenly across everything the covenant has built.
 */
function placeHands(s: State, pick: (xs: Action[], x: State) => Action | undefined = evenly): Action[] {
  return plan(s, (x) => {
    if (idleHands(x) <= 0) return undefined;
    const r = rates(x);
    const short = keys(ZONES).find((z) => ZONES[z].carry > 0 && r.zones[z].made > r.zones[z].capacity + 1e-6);
    if (short) return { type: 'porters', zone: short, delta: 1 };
    return pick(openJobs(x), x);
  });
}
const fill = (s: State, id: BuildingId) => (s.buildings[id]?.workers ?? 0) / Math.max(1, workerSlots(s, id));
const evenly = (xs: Action[], s: State) =>
  xs
    .filter((a): a is Extract<Action, { type: 'workers' }> => a.type === 'workers')
    .filter((a) => a.building !== 'hostel' || s.res.bread > 0)
    .sort((a, b) => fill(s, a.building) - fill(s, b.building))[0];

/** The random player's "reorganize hands": everyone off their jobs, then every hand placed again at random. */
function reorganize(s: State, rnd: () => number): Action[] {
  const off: Action[] = [
    ...keys(s.buildings).flatMap((building) =>
      (s.buildings[building]?.workers ?? 0) > 0
        ? [{ type: 'workers' as const, building, delta: -(s.buildings[building]?.workers ?? 0) }]
        : [],
    ),
    ...keys(s.porters).flatMap((zone) =>
      (s.porters[zone] ?? 0) > 0 ? [{ type: 'porters' as const, zone, delta: -(s.porters[zone] ?? 0) }] : [],
    ),
  ];
  let x: State = { ...s, log: [] };
  for (const a of off) {
    const r = apply(x, a);
    if (!('error' in r)) x = r;
  }
  return [...off, ...placeHands(x, (xs) => pickOf(xs, rnd))];
}

/** What a player does to carry out a guide step: one click. The last step, with no condition, is "keep studying". */
function guideAction(s: State, done: GuideStep['done']): Action | undefined {
  switch (done?.kind) {
    case 'workers':
      return { type: 'workers', building: done.building, delta: 1 };
    case 'porters':
      return { type: 'porters', zone: done.zone, delta: 1 };
    case 'built':
      return { type: 'build', building: done.building };
    case 'researched':
      return visibleResearch(s).map((id): Action => ({ type: 'research', id }))[0];
    default:
      return undefined;
  }
}

/**
 * A player who does exactly what the trial's guide line says and nothing more, one click every `delay` seconds:
 * the guide's own balance check. Studies with no extra Vis, never builds the Barrow, takes the first option on cards.
 */
export function guided(delay: number): Strategy {
  let last = Number.NEGATIVE_INFINITY;
  return (s) => {
    if (s.t < last) last = Number.NEGATIVE_INFINITY; // a new run
    if (s.events.length || s.t - last < delay) return [];
    const step = guideStep(s);
    const m = s.magi[0];
    const studying = !step?.done || step.done.kind === 'experiments' || step.done.kind === 'researched';
    const study: Action | undefined =
      m && present(m) && !m.exp && canAfford(s, experimentPlan(s, m.id, 'study_vis', 0).cost)
        ? { type: 'experiment', magus: m.id, recipe: 'study_vis', extra: 0 }
        : undefined;
    const a = guideAction(s, step?.done) ?? (studying ? study : undefined);
    const pick = a && legal(s, a) ? a : studying && study && legal(s, study) ? study : undefined;
    if (!pick) return [];
    last = s.t;
    return [pick];
  };
}

export const STRATEGIES: Record<string, Strategy> = {
  /** Follows the trial's guide to the letter, a click every 8 s. */
  guided: guided(8),
  /** Does nothing but dismiss cards. Must lose the trial. */
  idle: () => [],

  /** A fuzzer and a baseline: up to 3 legal actions a second, picked at random; a random option on each card. */
  random: (s) => {
    const rnd = momentRng(s);
    if (s.events.length) {
      const opts = CANDIDATES.choose(s).filter((a) => legal(s, a));
      const a = pickOf(opts, rnd);
      return a ? [a] : [];
    }
    const out: Action[] = [];
    const want = Math.floor(rnd() * 4);
    // Sample a handful of candidates rather than testing them all.
    for (let tries = 0; out.length < want && tries < 8; tries++) {
      const kind = pickOf(KINDS, rnd)!;
      const a = pickOf<Action>(CANDIDATES[kind](s), rnd);
      if (a && a.type !== 'choose' && legal(s, a)) out.push(a);
    }
    // Every now and then, reorganize: all hands off and placed again. Otherwise just put the idle to work.
    if (rnd() < 0.02) return [...out, ...reorganize(s, rnd)];
    let x: State = { ...s, log: [] };
    for (const a of out) {
      const r = apply(x, a);
      if (!('error' in r)) x = r;
    }
    return [...out, ...placeHands(x, (xs) => pickOf(xs, rnd))];
  },

  /**
   * Follows the trial's guide: 2 hands on the Salt-works, the Marsh carried, the Tide Pool bought and worked, Salt Rakes
   * learned, then the Barrow and the Sanctum's assistants. Runs experiments with all spare Vis.
   */
  sensible: (s) => {
    const out: Action[] = [];
    for (const id of ['tide_pool', 'knights_barrow'] as const)
      if (buildable(s, id) && !isMaxed(s, id) && canAfford(s, buildCost(s, id))) {
        out.push({ type: 'build', building: id });
        break;
      }
    for (const id of visibleResearch(s))
      if (!(s.research[id] ?? 0) && canAffordResearch(s, researchCost(s, id))) out.push({ type: 'research', id });
    const hands = plan(s, (x) => {
      if (idleHands(x) <= 0) return undefined;
      const r = rates(x);
      const room = (id: BuildingId) => count(x, id) > 0 && (x.buildings[id]?.workers ?? 0) < workerSlots(x, id);
      if (room('salt_pan') && (x.buildings.salt_pan?.workers ?? 0) < 2)
        return { type: 'workers', building: 'salt_pan', delta: 1 };
      if (r.zones.marsh.made > r.zones.marsh.capacity + 1e-6) return { type: 'porters', zone: 'marsh', delta: 1 };
      for (const id of ['tide_pool', 'knights_barrow', 'sanctum', 'salt_pan'] as const)
        if (room(id)) return { type: 'workers', building: id, delta: 1 };
      return undefined;
    });
    out.push(...hands);
    for (const m of s.magi) {
      if (!m.sanctum || m.exp) continue;
      const extra = Math.max(0, Math.min(EXPERIMENT.maxExtraVis, Math.floor(s.res.vis) - 5));
      if (s.res.vis >= experimentPlan(s, m.id, 'study_vis', 0).cost.vis!) {
        out.push({ type: 'experiment', magus: m.id, recipe: 'study_vis', extra });
      }
    }
    return out;
  },

  /**
   * Full run: first whatever brings more hands, every hand at work and split evenly across the jobs, the magi's lab
   * work in turn, and Notice kept under the strike line. Then the Gate and the bells.
   */
  careful: (s) => {
    const out: Action[] = [];
    const r = rates(s);
    const settles = r.noticeGen * 10;
    const has2 = (id: BuildingId) => buildable(s, id) && !isMaxed(s, id);
    const affordable = (id: BuildingId) =>
      has2(id) && (DEFS[id].site || !zoneFull(s, DEFS[id].zone)) && canAfford(s, buildCost(s, id));
    // 1. More hands: housing, and eels for the rent.
    const want: BuildingId[] = [];
    if (s.hands >= housing(s) - 1) want.push('cottage');
    if (has(s, 'eelRent') && r.net.eels < 0.3 && s.res.eels < EEL_RENT * 3) want.push('eel_weir');
    // 2. Jobs for idle hands, and what the covenant is short of.
    if (s.magi.some((m) => !m.sanctum && m.id !== 'knight')) want.push('sanctum');
    if (count(s, 'farm') < 2 || (r.net.bread < 0.3 && s.res.bread < 50)) want.push('farm');
    if (count(s, 'quarry') < 1) want.push('quarry');
    if (count(s, 'parchmenter') < 1) want.push('parchmenter');
    const costs = [
      ...visibleResearch(s)
        .filter((id) => !(s.research[id] ?? 0))
        .map((id) => researchCost(s, id)),
      ...keys(DEFS)
        .filter((id) => has2(id))
        .map((id) => buildCost(s, id)),
    ];
    const over = (g: 'insight' | 'vis' | 'silver' | 'stone' | 'vellum') => costs.some((c) => (c[g] ?? 0) > cap(s, g));
    if (over('insight') || over('vis')) want.push('library');
    if (over('silver') || over('stone') || over('vellum')) want.push('storehouse');
    want.push('knights_barrow', 'regio_spring');
    if (idleHands(s) > 0 && openJobs(s).length === 0)
      want.push('salt_pan', 'quarry', 'farm', 'eel_weir', 'parchmenter', 'salt_meadow', 'hostel');
    else if (settles < 55) want.push('salt_pan', 'quarry', 'parchmenter');
    const pick = want.find(
      (id) => affordable(id) && (settles < 60 || DEFS[id].site || ['sanctum', 'library', 'cottage'].includes(id)),
    );
    if (pick) out.push({ type: 'build', building: pick });
    // A full zone that's wanted: buy land.
    const blocked = want.find((id) => has2(id) && !DEFS[id].site && zoneFull(s, DEFS[id].zone));
    if (blocked) {
      const z = DEFS[blocked].zone;
      if (canExpand(s, z) && canAfford(s, expandCost(s, z))) out.push({ type: 'expand', zone: z });
    }
    // Research in order; the aura while Notice has room; the Form trees; Notice levers; the Gate.
    for (const id of visibleResearch(s))
      if (!(s.research[id] ?? 0) && id !== 'raise_aura' && canAffordResearch(s, researchCost(s, id)))
        out.push({ type: 'research', id });
    if (
      settles < 55 &&
      visibleResearch(s).includes('raise_aura') &&
      canAffordResearch(s, researchCost(s, 'raise_aura')) &&
      (s.research.raise_aura ?? 0) < 4
    )
      out.push({ type: 'research', id: 'raise_aura' });
    const insightOnHand = s.res.insight + (s.gate?.store.insight ?? 0);
    for (const id of visibleResearch(s))
      if (
        RESEARCH_DEFS[id].needs === 'trees' &&
        (researchCost(s, id).insight ?? 0) < insightOnHand / 4 &&
        canAffordResearch(s, researchCost(s, id))
      )
        out.push({ type: 'research', id });
    if (has(s, 'endow') && settles > 55 && canAfford(s, endowCost(s))) out.push({ type: 'endow' });
    if (has(s, 'endow') && s.notice > NOTICE.strike.at - 10 && canAfford(s, giftCost(s))) out.push({ type: 'gift' });
    if (has(s, 'endow') && s.notice > NOTICE.strike.at - 5) out.push({ type: 'bribe' });
    if (faerieNeed(s) && has(s, 'faerie') && canAfford(s, offerCost(s))) out.push({ type: 'offer' });
    if (has(s, 'gate') && !s.gate) out.push({ type: 'gate', op: 'found' });
    if (s.gate && !s.gate.raised && s.gate.porters < 3 && idleHands(s) > 0) out.push({ type: 'gatePorters', delta: 1 });
    const next = bellStatus(s).next;
    if (s.gate?.raised && next)
      for (const k of GOODS) if (s.gate.pour.includes(k) !== k in next.price) out.push({ type: 'pour', good: k });
    if (bellStatus(s).ready) out.push({ type: 'gate', op: 'bell' });
    // Heirs: every magus past 35 takes an apprentice.
    if (has(s, 'apprentices'))
      for (const m of s.magi)
        if (m.id !== 'knight' && m.age >= 35 && !s.apprentices.some((a) => a.chair === m.id))
          out.push({ type: 'apprentice', magus: m.id });
    // The lab, in turn: the Longevity Ritual for the old, then Study the Vis, Lab Texts and Devices round-robin.
    const reserve = Math.max(
      0,
      ...visibleResearch(s)
        .filter((id) => !(s.research[id] ?? 0) && id !== 'raise_aura' && !RESEARCH_DEFS[id].needs)
        .map((id) => researchCost(s, id).vis ?? 0),
    );
    const target = (['quarry', 'salt_pan', 'farm'] as BuildingId[]).find((b) => count(s, b) > 0);
    s.magi.forEach((m, i) => {
      if (!present(m) || m.exp) return;
      const turn: Action[] = [];
      if (!m.longevity && m.age >= AGING_AT && has(s, 'recipe:longevity'))
        turn.push({ type: 'experiment', magus: m.id, recipe: 'longevity', extra: 0 });
      const extra = Math.max(0, Math.min(EXPERIMENT.maxExtraVis, Math.floor(s.res.vis) - 5 - reserve));
      const lab: Action[] = [
        { type: 'experiment', magus: m.id, recipe: 'study_vis', extra },
        { type: 'experiment', magus: m.id, recipe: 'lab_text', extra: 0 },
        ...(target ? [{ type: 'experiment' as const, magus: m.id, recipe: 'device' as const, extra: 0, target }] : []),
      ];
      const k = s.stats.experiments + i;
      for (let j = 0; j < lab.length; j++) turn.push(lab[(k + j) % lab.length]!);
      const ok = turn.find(
        (a) =>
          a.type === 'experiment' &&
          recipeOpen(s, a.recipe) &&
          canAfford(s, experimentPlan(s, m.id, a.recipe, a.extra).cost) &&
          (a.recipe === 'longevity' ||
            s.res.vis - (experimentPlan(s, m.id, a.recipe, a.extra).cost.vis ?? 0) >= reserve),
      );
      if (ok) out.push(ok);
      if ((studyCost(m).insight ?? 0) < s.res.insight * 0.1) out.push({ type: 'study', magus: m.id });
    });
    // Last: every idle hand to work, split evenly.
    let x: State = { ...s, log: [] };
    for (const a of out) {
      const r2 = apply(x, a);
      if (!('error' in r2)) x = r2;
    }
    return [...out, ...placeHands(x)];
  },
};
