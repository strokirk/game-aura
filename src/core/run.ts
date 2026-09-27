// The headless game. Deterministic: same scenario + seed + action log => same state.
// No DOM, no Date, no Math.random in here.
import {
  BASELINE_INSIGHT,
  type BuildingDef,
  type BuildingId,
  COST_GROWTH,
  type Condition,
  type Cost,
  DEFS,
  type Effect,
  type EventDef,
  EXPERIMENT,
  GOOD_INFO,
  GOODS,
  type GoodId,
  HALL_HOUSING,
  HAND_FOOD,
  MAGI,
  type MagusId,
  NOTICE_K,
  RECIPES,
  type RecipeId,
  SANCTUM_ASSIST,
  SCENARIOS,
  type ScenarioDef,
  type ScenarioId,
  START_YEAR,
  YEAR,
  ZONES,
  type ZoneId,
} from '../data/index.ts';
import { nextRandom, type RngState, seedRng } from './rng.ts';
import { chooseInKnot, type InkOutputs, playKnot } from './story.ts';

export const DT = 0.25;
const B: Record<BuildingId, BuildingDef> = DEFS;

export interface Experiment {
  recipe: RecipeId;
  extra: number;
  start: number;
  end: number;
  insight: number;
  botch: number;
}
export interface MagusState {
  id: MagusId;
  lt: number;
  sanctum: boolean;
  exp: Experiment | null;
}
export interface Outcome {
  kind: 'win' | 'loss';
  cause: string;
  t: number;
}
export type Action =
  | { type: 'build'; building: BuildingId }
  | { type: 'workers'; building: BuildingId; delta: number }
  | { type: 'porters'; zone: ZoneId; delta: number }
  | { type: 'experiment'; magus: MagusId; recipe: RecipeId; extra: number }
  | { type: 'study'; magus: MagusId }
  | { type: 'choose'; option: number };
export interface LogEntry {
  t: number;
  action: Action;
}
export interface State {
  v: 1;
  scenario: ScenarioId;
  seed: number;
  rng: RngState;
  /** Game seconds, always a multiple of DT. */
  t: number;
  /** Real-time remainder not yet ticked. Not part of the simulation. */
  acc: number;
  res: Record<GoodId, number>;
  hands: number;
  growT: number;
  hungerT: number;
  buildings: Partial<Record<BuildingId, { count: number; workers: number }>>;
  porters: Partial<Record<ZoneId, number>>;
  magi: MagusState[];
  notice: number;
  events: EventDef[];
  /** Ink's saved story state (JSON), null before the first knot. */
  ink: string | null;
  /** Story beats already played. */
  fired: string[];
  story: InkOutputs;
  mods: { id: string; good: GoodId; mult: number; until: number | null }[];
  /** Action key → game time it's blocked until. */
  blocks: Record<string, number>;
  unlocked: string[];
  chronicle: { t: number; text: string }[];
  outcome: Outcome | null;
  log: LogEntry[];
  stats: { insightMade: number; peakNotice: number; experiments: number; botches: number; discoveries: number };
}
export type Result = State | { error: string };

const keys = <K extends string>(o: Partial<Record<K, unknown>>) => Object.keys(o) as K[];
const zeroGoods = () => Object.fromEntries(GOODS.map((g) => [g, 0])) as Record<GoodId, number>;
export const scenarioOf = (s: State): ScenarioDef => SCENARIOS[s.scenario];
export const magusName = (id: MagusId) => MAGI.find((m) => m.id === id)?.name ?? id;
export const year = (s: State) => START_YEAR + Math.floor(s.t / YEAR);

// ─── Setup ──────────────────────────────────────────────────────────

export function createRun(scenario: ScenarioId, seed: number): State {
  const sc: ScenarioDef = SCENARIOS[scenario];
  const res = zeroGoods();
  for (const g of keys(sc.start.res)) res[g] = sc.start.res[g] ?? 0;
  return {
    v: 1,
    scenario,
    seed,
    rng: seedRng(seed),
    t: 0,
    acc: 0,
    res,
    hands: sc.start.hands,
    growT: 0,
    hungerT: 0,
    buildings: structuredClone(sc.start.buildings) as State['buildings'],
    porters: { ...sc.start.porters },
    magi: sc.start.magi.map((m) => ({ id: m.id, lt: 10, sanctum: m.sanctum, exp: null })),
    notice: 0,
    events: sc.intro ? [structuredClone(sc.intro) as EventDef] : [],
    ink: null,
    fired: [],
    story: { eel_level: 0, eels_state: 0 },
    mods: [],
    blocks: {},
    unlocked: [],
    chronicle: [{ t: 0, text: `Founded in spring ${START_YEAR}.` }],
    outcome: null,
    log: [],
    stats: { insightMade: 0, peakNotice: 0, experiments: 0, botches: 0, discoveries: 0 },
  };
}

// ─── Selectors ──────────────────────────────────────────────────────

export const cap = (_s: State, g: GoodId) => GOOD_INFO[g].cap;
export const count = (s: State, id: BuildingId) => s.buildings[id]?.count ?? 0;
export const workerSlots = (s: State, id: BuildingId) => count(s, id) * B[id].slots;
export const assigned = (s: State) =>
  keys(s.buildings).reduce((a, id) => a + (s.buildings[id]?.workers ?? 0), 0) +
  keys(s.porters).reduce((a, z) => a + (s.porters[z] ?? 0), 0);
export const idleHands = (s: State) => s.hands - assigned(s);
export const housing = (s: State) =>
  HALL_HOUSING + keys(s.buildings).reduce((a, id) => a + count(s, id) * (B[id].housing ?? 0), 0);
export const zoneUsed = (s: State, z: ZoneId) =>
  keys(s.buildings).reduce((a, id) => a + (B[id].zone === z && !isSite(id) ? count(s, id) : 0), 0);
const isSite = (id: BuildingId) => !!B[id].site;
const maxOf = (id: BuildingId) => B[id].max ?? Number.POSITIVE_INFINITY;

export function buildCost(s: State, id: BuildingId): Cost {
  const c: Cost = {};
  const base = B[id].cost;
  for (const g of keys(base)) c[g] = Math.ceil((base[g] ?? 0) * COST_GROWTH ** count(s, id));
  return c;
}
export const canAfford = (s: State, c: Cost) => keys(c).every((g) => s.res[g] >= (c[g] ?? 0) - 1e-9);
function pay(s: State, c: Cost) {
  for (const g of keys(c)) s.res[g] -= c[g] ?? 0;
}
/** Seconds until affordable at current net rates: 0 if affordable now, Infinity if never. */
export function timeToAfford(s: State, c: Cost, r = rates(s)): number {
  let t = 0;
  for (const g of keys(c)) {
    const short = (c[g] ?? 0) - s.res[g];
    if (short <= 0) continue;
    if ((c[g] ?? 0) > cap(s, g)) return Number.POSITIVE_INFINITY;
    t = Math.max(t, r.net[g] > 1e-9 ? short / r.net[g] : Number.POSITIVE_INFINITY);
  }
  return t;
}

const assistMult = (s: State) => {
  const n = count(s, 'sanctum');
  return 1 + (n ? (SANCTUM_ASSIST * (s.buildings.sanctum?.workers ?? 0)) / n : 0);
};
export const studyCost = (m: MagusState): Cost => ({ insight: Math.ceil(20 * 1.35 ** (m.lt - 10)) });

export function experimentPlan(s: State, magus: MagusId, recipe: RecipeId, extra: number) {
  const m = s.magi.find((x) => x.id === magus);
  const def = RECIPES[recipe];
  const cost: Cost = { ...def.cost };
  cost.vis = (cost.vis ?? 0) + extra;
  return {
    cost,
    time: (def.time * (1 + EXPERIMENT.extraTime * extra)) / assistMult(s),
    insight: def.insightPerLT * (m?.lt ?? 10) * (1 + EXPERIMENT.extraYield * extra),
    botch: EXPERIMENT.botch + EXPERIMENT.extraBotch * extra,
    discovery: EXPERIMENT.discovery,
  };
}

export interface Rates {
  net: Record<GoodId, number>;
  byBuilding: Partial<Record<BuildingId, Cost>>;
  zones: Record<ZoneId, { made: number; capacity: number; factor: number }>;
  hungry: boolean;
  /** Notice generated per minute. */
  noticeGen: number;
}

/** Every per-second rate in the game, computed in one place. The UI shows exactly what tick() applies. */
export function rates(s: State): Rates {
  const hungry = s.res.bread <= 0;
  const hunger = hungry ? 0.5 : 1;
  const net = zeroGoods();
  const byBuilding: Rates['byBuilding'] = {};
  const zones = Object.fromEntries(keys(ZONES).map((z) => [z, { made: 0, capacity: 0, factor: 1 }])) as Rates['zones'];
  let noticeSum = 0;
  for (const id of keys(s.buildings)) {
    const def = B[id];
    noticeSum += count(s, id) * ZONES[def.zone].noticeFactor;
    const pw: Cost = def.perWorker ?? {};
    const w = Math.min(s.buildings[id]?.workers ?? 0, workerSlots(s, id));
    const out: Cost = {};
    for (const g of keys(pw)) {
      out[g] = w * (pw[g] ?? 0) * hunger * modMult(s, id, g);
      zones[def.zone].made += out[g];
    }
    byBuilding[id] = out;
  }
  for (const z of keys(ZONES)) {
    const zone = zones[z];
    if (ZONES[z].carry === 0) continue;
    zone.capacity = (s.porters[z] ?? 0) * ZONES[z].carry;
    zone.factor = zone.made > 0 ? Math.min(1, zone.capacity / zone.made) : 1;
  }
  for (const id of keys(byBuilding)) {
    const out = byBuilding[id] as Cost;
    const f = zones[B[id].zone].factor;
    for (const g of keys(out)) {
      out[g] = (out[g] ?? 0) * f;
      net[g] += out[g];
    }
  }
  for (const m of s.magi) if (m.sanctum && !m.exp) net.insight += BASELINE_INSIGHT * m.lt * assistMult(s) * hunger;
  net.bread -= s.hands * HAND_FOOD;
  return { net, byBuilding, zones, hungry, noticeGen: NOTICE_K * noticeSum };
}

// ─── Simulation ─────────────────────────────────────────────────────

const log = (s: State, text: string) => s.chronicle.push({ t: s.t, text });
/** Allowed by the scenario, or unlocked in play. */
export const buildable = (s: State, id: BuildingId) =>
  (scenarioOf(s).allowed as readonly string[]).includes(id) || s.unlocked.includes(id);
export const isBlocked = (s: State, key: string) => (s.blocks[key] ?? 0) > s.t;
/** Product of the live multipliers on `good` from building `id`. */
function modMult(s: State, id: BuildingId, good: GoodId) {
  let m = id === 'eel_weir' && s.story.eels_state === 0 ? 1 + 0.5 * s.story.eel_level : 1;
  for (const x of s.mods)
    if (x.good === good && (x.id === id || !(x.id in B)) && (x.until === null || x.until > s.t)) m *= x.mult;
  return m;
}

function addRes(s: State, g: GoodId, n: number) {
  s.res[g] = Math.min(cap(s, g), Math.max(0, s.res[g] + n));
}

function loseHand(s: State) {
  s.hands--;
  if (idleHands(s) >= 0) return;
  // Take the hand from the biggest job.
  let best: { n: number; take: () => void } | undefined;
  for (const id of keys(s.buildings)) {
    const b = s.buildings[id];
    if (b && b.workers > (best?.n ?? 0))
      best = {
        n: b.workers,
        take: () => {
          b.workers--;
        },
      };
  }
  for (const z of keys(s.porters)) {
    const n = s.porters[z] ?? 0;
    if (n > (best?.n ?? 0))
      best = {
        n,
        take: () => {
          s.porters[z] = n - 1;
        },
      };
  }
  best?.take();
}

function resolveExperiment(s: State, m: MagusState, e: Experiment) {
  const name = magusName(m.id);
  const roll = nextRandom(s.rng);
  m.exp = null;
  if (roll < e.botch) {
    s.stats.botches++;
    s.notice += EXPERIMENT.botchNotice;
    log(s, `${name}'s experiment goes wrong. The tower smokes for a day and Dol talks about it.`);
    return;
  }
  // ponytail: a discovery doubles the yield; the spec's trait choice arrives with traits.
  const discovery = roll >= 1 - EXPERIMENT.discovery;
  const gain = e.insight * (discovery ? 2 : 1);
  addRes(s, 'insight', gain);
  s.stats.insightMade += gain;
  if (discovery) {
    s.stats.discoveries++;
    log(s, `${name} finds something nobody wrote down before: ${Math.round(gain)} Insight.`);
  }
}

function met(s: State, c: Condition) {
  if (c.kind === 'res') return s.res[c.good] >= c.atLeast;
  if (c.kind === 'time') return s.t >= c.atLeast;
  return s.notice >= c.atLeast;
}
function checkOutcome(s: State) {
  if (s.outcome) return;
  const sc = scenarioOf(s);
  const w = sc.win.find((x) => met(s, x.when));
  const l = w ? undefined : sc.loss.find((x) => met(s, x.when));
  const hit = w ?? l;
  if (hit) {
    s.outcome = { kind: w ? 'win' : 'loss', cause: hit.cause, t: s.t };
    log(s, hit.cause);
  }
}

/** Advances exactly one fixed tick, mutating s. */
function tick(s: State) {
  const r = rates(s);
  for (const g of GOODS) addRes(s, g, r.net[g] * DT);
  if (r.net.insight > 0) s.stats.insightMade += r.net.insight * DT;

  if (s.res.bread <= 0) {
    s.hungerT += DT;
    if (s.hungerT >= 30 && s.hands > 0) {
      s.hungerT = 0;
      loseHand(s);
      log(s, 'A hand walks down the hill to Dol. There is no bread.');
    }
  } else s.hungerT = 0;
  if (s.hands < housing(s) && s.res.bread > 0 && r.net.bread >= 0) {
    s.growT += DT;
    if (s.growT >= 20) {
      s.growT = 0;
      s.hands++;
    }
  } else s.growT = 0;

  s.notice = Math.max(0, s.notice + ((r.noticeGen - 0.1 * s.notice) / 60) * DT);
  s.t += DT;
  for (const m of s.magi) if (m.exp && s.t >= m.exp.end - 1e-9) resolveExperiment(s, m, m.exp);
  s.stats.peakNotice = Math.max(s.stats.peakNotice, s.notice);
  checkOutcome(s);
  if (!s.outcome) startStory(s);
}

/** Queues the first story beat whose condition is met. Beats fire once, one at a time. */
function startStory(s: State) {
  const beat = scenarioOf(s).story?.find((b) => !s.fired.includes(b.knot) && met(s, b.when));
  if (!beat) return;
  const r = rates(s);
  const { event, saved } = playKnot(s.ink, s.seed, beat, {
    year: year(s),
    notice: Math.floor(s.notice),
    silver: Math.floor(s.res.silver),
    silver_rate: Math.max(1, r.net.silver),
    vis: Math.floor(s.res.vis),
    salt_pans: count(s, 'salt_pan'),
    has_sabine: s.magi.some((m) => m.id === 'sabine'),
    has_herve: s.magi.some((m) => m.id === 'herve'),
    sinking_magus: s.magi.find((m) => m.sanctum)?.id ?? 'aldric',
  });
  s.fired.push(beat.knot);
  s.ink = saved;
  s.events.push(event);
}

const blocked = (s: State) => !!s.outcome || s.events.length > 0;

/** Advances by dt real game-seconds, in fixed ticks. Pending events pause the game. */
export function step(s0: State, dt: number): State {
  if (blocked(s0)) return s0;
  const n = Math.floor((s0.acc + dt) / DT + 1e-9);
  if (n === 0) return { ...s0, acc: s0.acc + dt };
  const s = structuredClone(s0);
  s.acc = s0.acc + dt - n * DT;
  for (let i = 0; i < n && !blocked(s); i++) tick(s);
  return s;
}

/** Ticks until game time t (or until something blocks). */
export function stepTo(s0: State, t: number): State {
  if (s0.t >= t || blocked(s0)) return s0;
  const s = structuredClone(s0);
  while (s.t < t - 1e-9 && !blocked(s)) tick(s);
  return s;
}

// ─── Actions ────────────────────────────────────────────────────────

function applyEffects(s: State, effects: readonly Effect[]) {
  const net = rates(s).net;
  for (const e of effects) {
    if (e.kind === 'res') addRes(s, e.good, e.perSecond ? e.n * Math.max(1, net[e.good]) : e.n);
    else if (e.kind === 'notice') s.notice = Math.max(0, s.notice + e.n);
    else if (e.kind === 'mod')
      s.mods.push({ id: e.id, good: e.good, mult: e.mult, until: e.secs ? s.t + e.secs : null });
    else if (e.kind === 'block') s.blocks[e.what] = Math.max(s.blocks[e.what] ?? 0, s.t + e.secs);
    else if (!s.unlocked.includes(e.id)) s.unlocked.push(e.id);
  }
}

function act(s: State, a: Action): string | undefined {
  switch (a.type) {
    case 'build': {
      const def = B[a.building];
      if (!buildable(s, a.building)) return `${def.name} isn't available here`;
      if (isBlocked(s, `build_${a.building}`)) return `No one will build a ${def.name} yet`;
      if (count(s, a.building) >= maxOf(a.building)) return `There is only one ${def.name}`;
      if (!isSite(a.building) && zoneUsed(s, def.zone) >= ZONES[def.zone].slots)
        return `The ${ZONES[def.zone].name} is full`;
      const c = buildCost(s, a.building);
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
      const b = s.buildings[a.building] ?? { count: 0, workers: 0 };
      b.count++;
      s.buildings[a.building] = b;
      return;
    }
    case 'workers': {
      const b = s.buildings[a.building];
      if (!b || !Number.isInteger(a.delta)) return 'Nothing to work';
      if (a.delta > idleHands(s)) return 'No idle hands';
      if (b.workers + a.delta > workerSlots(s, a.building)) return 'No room for more workers';
      if (b.workers + a.delta < 0) return 'No one to take off';
      b.workers += a.delta;
      return;
    }
    case 'porters': {
      if (ZONES[a.zone].carry === 0 || !Number.isInteger(a.delta)) return 'No porters needed there';
      const p = s.porters[a.zone] ?? 0;
      if (a.delta > idleHands(s)) return 'No idle hands';
      if (p + a.delta < 0) return 'No one to take off';
      s.porters[a.zone] = p + a.delta;
      return;
    }
    case 'experiment': {
      const m = s.magi.find((x) => x.id === a.magus);
      if (!m?.sanctum) return 'That magus has no Sanctum';
      if (m.exp) return 'Already experimenting';
      if (isBlocked(s, `experiment:${m.id}`) || isBlocked(s, 'experiment:all'))
        return `${magusName(m.id)} is away from the lab`;
      if (!Number.isInteger(a.extra) || a.extra < 0 || a.extra > EXPERIMENT.maxExtraVis) return 'Bad amount of Vis';
      const p = experimentPlan(s, a.magus, a.recipe, a.extra);
      if (!canAfford(s, p.cost)) return 'Not enough Vis';
      pay(s, p.cost);
      m.exp = { recipe: a.recipe, extra: a.extra, start: s.t, end: s.t + p.time, insight: p.insight, botch: p.botch };
      s.stats.experiments++;
      return;
    }
    case 'study': {
      const m = s.magi.find((x) => x.id === a.magus);
      if (!m) return 'No such magus';
      const c = studyCost(m);
      if (!canAfford(s, c)) return 'Not enough Insight';
      pay(s, c);
      m.lt++;
      return;
    }
    case 'choose': {
      const ev = s.events[0];
      const opt = ev?.options[a.option];
      if (!opt) return 'No such choice';
      if (ev.knot && s.ink) {
        const r = chooseInKnot(s.ink, a.option);
        if (!r) return 'No such choice';
        s.ink = r.saved;
        s.story = r.vars;
        applyEffects(s, r.effects);
        log(s, [ev.title, ...r.lines].join('. ').replace(/\.\. /g, '. '));
      } else applyEffects(s, opt.effects);
      s.events.shift();
      return;
    }
  }
}

export function apply(s0: State, a: Action): Result {
  if (s0.outcome) return { error: 'The run is over' };
  if (s0.events.length && a.type !== 'choose') return { error: 'An event is waiting' };
  const s = structuredClone(s0);
  const error = act(s, a);
  if (error) return { error };
  s.log.push({ t: s.t, action: a });
  checkOutcome(s);
  return s;
}

// ─── Saves ──────────────────────────────────────────────────────────

export interface Save {
  v: 1;
  scenario: ScenarioId;
  seed: number;
  t: number;
  log: LogEntry[];
}
export const toSave = (s: State): Save => ({ v: 1, scenario: s.scenario, seed: s.seed, t: s.t, log: s.log });

/** Rebuilds a run from its seed and action log. Throws if the log no longer fits the rules. */
export function replay(save: Save): State {
  let s = createRun(save.scenario, save.seed);
  for (const e of save.log) {
    s = stepTo(s, e.t);
    const r = apply(s, e.action);
    if ('error' in r) throw new Error(`Replay diverged at t=${e.t}: ${r.error}`);
    s = r;
  }
  return stepTo(s, save.t);
}
