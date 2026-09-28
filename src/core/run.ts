// The headless game. Deterministic: same scenario + seed + action log => same state.
// No DOM, no Date, no Math.random in here.
import {
  AGING,
  APPRENTICE,
  AURA,
  BASELINE_INSIGHT,
  type BuildingDef,
  type BuildingId,
  COST_GROWTH,
  type Condition,
  type Cost,
  DEFS,
  EELS,
  type Effect,
  type EventDef,
  EXPERIMENT,
  FAERIE,
  GATE,
  GOOD_INFO,
  GOODS,
  type GoodId,
  HALL_HOUSING,
  HAND_FOOD,
  MAGI,
  type MagusId,
  type Modifier,
  NOTICE,
  NOTICE_K,
  RECIPES,
  RESEARCH_DEFS,
  RESEARCH_SHOWN,
  type RecipeDef,
  type RecipeId,
  type ResearchId,
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
  /** What was paid, for an abort's half refund. */
  paid: Cost;
  /** The building an Enchant a Device experiment improves. */
  target?: BuildingId;
  /** The halfway check-in has been offered. */
  checked: boolean;
}
export interface MagusState {
  /** The chair: the founder whose place this magus holds. */
  id: MagusId;
  /** Which holder of the chair: Aldric II is gen 2. */
  gen: number;
  /** Lab Total from Study, before aura and Decrepitude. */
  lt: number;
  /** Years, rising with game time. */
  age: number;
  decrepitude: number;
  longevity: boolean;
  sanctum: boolean;
  exp: Experiment | null;
}
/** An apprentice serves a chair and boosts whoever holds it. */
export interface Apprentice {
  chair: MagusId;
  start: number;
  /** Passed the Gauntlet: waits at full boost for a chair to fall vacant. */
  ready: boolean;
}
/** What every fallen covenant leaves to the next. It stacks. */
export interface Legacy {
  covenants: number;
  /** Starting Magic above the base. */
  magic: number;
  /** Lab Texts buried under the hill. */
  labTexts: number;
  /** One Device per fallen covenant, each on a building type. */
  heirlooms: BuildingId[];
  /** The last holder's numeral, per chair. */
  gens: Partial<Record<MagusId, number>>;
}
export const NO_LEGACY: Legacy = { covenants: 0, magic: 0, labTexts: 0, heirlooms: [], gens: {} };
export interface Outcome {
  kind: 'win' | 'loss';
  cause: string;
  t: number;
}
export interface GateState {
  /** Stone delivered while raising it. */
  stone: number;
  raised: boolean;
  /** Insight poured into the Gate. It has no cap. */
  insight: number;
  pour: boolean;
  /** Vis sites send their Vis to the Gate instead of the Hall. */
  visToGate: boolean;
  porters: number;
  rites: number;
  /** Stone and Vis delivered in each of the last GATE.window seconds, newest last. */
  history: { stone: number; vis: number }[];
  /** Deliveries in the second being counted. */
  now: { stone: number; vis: number; t: number };
}
export type Action =
  | { type: 'build'; building: BuildingId }
  | { type: 'demolish'; building: BuildingId }
  | { type: 'workers'; building: BuildingId; delta: number }
  | { type: 'porters'; zone: ZoneId; delta: number }
  | { type: 'experiment'; magus: MagusId; recipe: RecipeId; extra: number; target?: BuildingId }
  | { type: 'study'; magus: MagusId }
  | { type: 'research'; id: ResearchId }
  | { type: 'endow' }
  | { type: 'bribe' }
  | { type: 'gate'; op: 'found' | 'pour' | 'vis' | 'rite' }
  | { type: 'gatePorters'; delta: number }
  | { type: 'sellEels' }
  | { type: 'offer' }
  | { type: 'apprentice'; magus: MagusId }
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
  apprentices: Apprentice[];
  /** Chairs whose holder died, waiting for a journeyman. */
  vacant: { chair: MagusId; gen: number; sanctum: boolean }[];
  aura: {
    /** Magic before the Dominion; `start` is where this run began. */
    magic: number;
    start: number;
    peak: number;
    /** When each bribe's Infernal stain fades. */
    stains: number[];
    /** When the Aegis was cast: the friars stop counting from then. */
    aegisAt: number | null;
  };
  faerie: { level: number; t: number; year: number; offers: number };
  legacy: Legacy;
  notice: number;
  /** Notice events that have fired and not yet re-armed. */
  noticeFired: string[];
  endowments: number;
  bribes: number;
  research: Partial<Record<ResearchId, number>>;
  labTexts: number;
  devices: Partial<Record<BuildingId, number>>;
  gate: GateState | null;
  events: EventDef[];
  /** Ink's saved story state (JSON), null before the first knot. */
  ink: string | null;
  /** Story beats already played. */
  fired: string[];
  story: InkOutputs;
  mods: { id: string; good: GoodId; mult: number; until: number | null }[];
  /** Action key → game time it's blocked until. */
  blocks: Record<string, number>;
  /** Revealed buildings, recipes (`recipe:<id>`) and features (`research`, `notice`, `endow`, `gate`). */
  unlocked: string[];
  /** Scenario unlocks already applied, by index. */
  unlocksDone: number[];
  chronicle: { t: number; text: string }[];
  outcome: Outcome | null;
  log: LogEntry[];
  stats: {
    insightMade: number;
    peakNotice: number;
    experiments: number;
    botches: number;
    discoveries: number;
    labTextsWritten: number;
    deaths: number;
  };
}
export type Result = State | { error: string };

const keys = <K extends string>(o: Partial<Record<K, unknown>>) => Object.keys(o) as K[];
const zeroGoods = () => Object.fromEntries(GOODS.map((g) => [g, 0])) as Record<GoodId, number>;
export const scenarioOf = (s: State): ScenarioDef => SCENARIOS[s.scenario];
export const magusName = (id: MagusId) => MAGI.find((m) => m.id === id)?.name ?? id;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const roman = (n: number) => (n < ROMAN.length ? ROMAN[n] : String(n));
/** A chair's name with its numeral: Aldric, Aldric II. */
export const chairName = (id: MagusId, gen: number) => (gen > 1 ? `${magusName(id)} ${roman(gen)}` : magusName(id));
export const nameOf = (m: { id: MagusId; gen: number }) => chairName(m.id, m.gen);
function newMagus(id: MagusId, gen: number, o: { sanctum: boolean; lt?: number; age?: number }): MagusState {
  const age = o.age ?? MAGI.find((x) => x.id === id)?.age ?? 40;
  return { id, gen, lt: o.lt ?? 10, age, decrepitude: 0, longevity: false, sanctum: o.sanctum, exp: null };
}
export const year = (s: State) => START_YEAR + Math.floor(s.t / YEAR);

// ─── Setup ──────────────────────────────────────────────────────────

export function createRun(scenario: ScenarioId, seed: number, legacy: Legacy = NO_LEGACY): State {
  const sc: ScenarioDef = SCENARIOS[scenario];
  const res = zeroGoods();
  for (const g of keys(sc.start.res)) res[g] = sc.start.res[g] ?? 0;
  const lg = sc.legacy ? legacy : NO_LEGACY;
  const devices: State['devices'] = { ...sc.start.devices };
  for (const b of lg.heirlooms) devices[b] = (devices[b] ?? 0) + 1;
  const magic = AURA.base + lg.magic;
  const founded = lg.covenants
    ? `The ${ordinal(lg.covenants + 1)} covenant of Mont-Dol is founded in spring ${START_YEAR}, on the ruins of the last.`
    : `Founded in spring ${START_YEAR}.`;
  return {
    v: 1,
    scenario,
    seed,
    rng: seedRng(seed),
    t: sc.start.t ?? 0,
    acc: 0,
    res,
    hands: sc.start.hands,
    growT: 0,
    hungerT: 0,
    buildings: structuredClone(sc.start.buildings) as State['buildings'],
    porters: { ...sc.start.porters },
    magi: sc.start.magi.map((m) => newMagus(m.id, m.gen ?? (lg.gens[m.id] ?? 0) + 1, m)),
    apprentices: [],
    vacant: [],
    aura: { magic, start: magic, peak: magic, stains: [], aegisAt: sc.start.research?.aegis ? 0 : null },
    faerie: { level: 0, t: 0, year: 0, offers: 0 },
    legacy: lg,
    notice: sc.start.notice ?? 0,
    noticeFired: [],
    endowments: sc.start.endowments ?? 0,
    bribes: 0,
    research: { ...sc.start.research },
    labTexts: sc.start.labTexts ?? 0,
    devices,
    gate: sc.start.gate ? { ...sc.start.gate, history: [], now: { stone: 0, vis: 0, t: sc.start.t ?? 0 } } : null,
    events: sc.intro ? [structuredClone(sc.intro) as EventDef] : [],
    ink: null,
    fired: [],
    story: { eel_level: 0, eels_state: 0 },
    mods: [],
    blocks: {},
    unlocked: [...sc.unlocked],
    unlocksDone: [],
    chronicle: [{ t: sc.start.t ?? 0, text: founded }],
    outcome: null,
    log: [],
    stats: {
      insightMade: 0,
      peakNotice: 0,
      experiments: 0,
      botches: 0,
      discoveries: 0,
      labTextsWritten: 0,
      deaths: 0,
    },
  };
}
const ORD = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const ordinal = (n: number) => ORD[n] ?? `${n}th`;

// ─── Modifiers: every permanent bonus, gathered in one place ────────

function modifiers(s: State): Modifier[] {
  const out: Modifier[] = [];
  for (const id of keys(s.research))
    for (let i = 0; i < (s.research[id] ?? 0); i++) out.push(...RESEARCH_DEFS[id].effects);
  return out;
}
const product = (xs: number[]) => xs.reduce((a, x) => a * x, 1);

// ─── The aura ───────────────────────────────────────────────────────

/** Divine: each Endowment, plus the friars, who come every decade. */
export const friars = (s: State) => Math.floor(Math.min(s.t, s.aura.aegisAt ?? s.t) / AURA.friars);
export const divine = (s: State) => Math.floor(s.endowments / AURA.endowments) + friars(s);
export const stains = (s: State) => s.aura.stains.filter((t) => t > s.t).length;
/** Effective aura: Magic less the Dominion. */
export const aura = (s: State) => s.aura.magic - divine(s);
const above = (a: number, from: number) => Math.max(0, a - from + 1);
/** Every boost the aura gives at its current strength (`docs/proposals/tide-remembers.md`). */
export function auraBoosts(s: State) {
  const a = aura(s);
  return {
    insight: Math.max(AURA.insightFloor, 1 + AURA.insight * (a - AURA.base)),
    speed: 1 + AURA.speed * above(a, AURA.speedFrom),
    aging: Math.max(0, 1 - AURA.aging * above(a, AURA.agingFrom)),
    discovery: AURA.discovery * above(a, AURA.discoveryFrom),
    vis: 1 + AURA.vis * above(a, AURA.visFrom),
    lt: above(a, AURA.ltFrom),
  };
}
export const noticeDecay = (s: State) => 0.1 + FAERIE.decay * s.faerie.level;

// ─── Magi, age and apprentices ──────────────────────────────────────

/** The apprentice's boost to their chair's holder: −25% sliding to +25% over 4 years. */
export function apprenticeBoost(s: State, chair: MagusId) {
  const a = s.apprentices.find((x) => x.chair === chair);
  if (!a) return 0;
  return APPRENTICE.start + (APPRENTICE.end - APPRENTICE.start) * Math.min(1, (s.t - a.start) / APPRENTICE.ramp);
}
/** The Lab Total a magus works at: their own, less Decrepitude, plus the aura's top tier. */
export const labTotal = (s: State, m: MagusState) => Math.max(1, m.lt - m.decrepitude + auraBoosts(s).lt);
const insightMult = (s: State, m: MagusState) => auraBoosts(s).insight * (1 + apprenticeBoost(s, m.id));
export function agingChance(s: State, m: MagusState) {
  if (m.age < AGING.from) return 0;
  return Math.min(1, (m.age - AGING.from) * AGING.perYear * (m.longevity ? AGING.longevity : 1) * auraBoosts(s).aging);
}

function outputMult(s: State, mods: Modifier[], id: BuildingId, good: GoodId) {
  let m = product(mods.flatMap((x) => (x.kind === 'output' && x.building === id ? [x.mult] : [])));
  m *= 1 + EXPERIMENT.device * (s.devices[id] ?? 0);
  m *= AURA.stain ** stains(s);
  if (isSite(id)) m *= auraBoosts(s).vis;
  if (id === 'eel_weir' && s.story.eels_state === 0) m *= 1 + 0.5 * s.story.eel_level;
  for (const x of s.mods)
    if (x.good === good && (x.id === id || !(x.id in B)) && (x.until === null || x.until > s.t)) m *= x.mult;
  return m;
}
const carryMult = (mods: Modifier[], z: ZoneId) =>
  product(mods.flatMap((x) => (x.kind === 'carry' && (!x.zone || x.zone === z) ? [x.mult] : [])));
export function zoneNotice(s: State, z: ZoneId, mods = modifiers(s)) {
  const set = mods.find((x) => x.kind === 'zoneNotice' && x.zone === z);
  return set?.kind === 'zoneNotice' ? set.factor : ZONES[z].noticeFactor;
}
const botchMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'botch' ? [x.mult] : [])));
const baselineMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'baseline' ? [x.mult] : [])));
const noticeMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'noticeGen' ? [x.mult] : [])));
const extraAssistants = (mods: Modifier[]) => mods.reduce((a, x) => a + (x.kind === 'assistants' ? x.add : 0), 0);

// ─── Selectors ──────────────────────────────────────────────────────

export function cap(s: State, g: GoodId, mods = modifiers(s)) {
  let c = GOOD_INFO[g].cap;
  for (const id of keys(s.buildings)) c += count(s, id) * (B[id].caps?.[g] ?? 0);
  for (const x of mods) if (x.kind === 'cap' && x.good === g && x.mult) c *= x.mult;
  for (const x of mods) if (x.kind === 'cap' && x.good === g && x.add) c += x.add;
  return c;
}
export const count = (s: State, id: BuildingId) => s.buildings[id]?.count ?? 0;
export const workerSlots = (s: State, id: BuildingId) =>
  count(s, id) * (B[id].slots + (id === 'sanctum' ? extraAssistants(modifiers(s)) : 0));
export const assigned = (s: State) =>
  keys(s.buildings).reduce((a, id) => a + (s.buildings[id]?.workers ?? 0), 0) +
  keys(s.porters).reduce((a, z) => a + (s.porters[z] ?? 0), 0) +
  (s.gate?.porters ?? 0);
export const idleHands = (s: State) => s.hands - assigned(s);
export const housing = (s: State) =>
  HALL_HOUSING + keys(s.buildings).reduce((a, id) => a + count(s, id) * (B[id].housing ?? 0), 0);
export const zoneUsed = (s: State, z: ZoneId) =>
  keys(s.buildings).reduce((a, id) => a + (B[id].zone === z && !isSite(id) ? count(s, id) : 0), 0);
const isSite = (id: BuildingId) => !!B[id].site;
const maxOf = (s: State, id: BuildingId) =>
  id === 'sanctum' ? s.magi.length : (B[id].max ?? Number.POSITIVE_INFINITY);
export const isMaxed = (s: State, id: BuildingId) => count(s, id) >= maxOf(s, id);
/** A revealed feature, recipe or building. */
export const has = (s: State, what: string) => s.unlocked.includes(what);
/** Allowed by the scenario, or unlocked in play. */
export const buildable = (s: State, id: BuildingId) =>
  (scenarioOf(s).allowed as readonly string[]).includes(id) || has(s, id);
export const isBlocked = (s: State, key: string) => (s.blocks[key] ?? 0) > s.t;
export const recipeOpen = (s: State, r: RecipeId) => r === 'study_vis' || has(s, `recipe:${r}`);

/** Sanctums belong to their magus and the Vis sites are places, not buildings: neither can be pulled down. */
export const canDemolish = (s: State, id: BuildingId) => count(s, id) > 0 && id !== 'sanctum' && !isSite(id);
/** Pulling one down refunds half of what the last one cost. */
export function demolishRefund(s: State, id: BuildingId): Cost {
  const c: Cost = {};
  const base = B[id].cost;
  for (const g of keys(base)) c[g] = Math.floor(((base[g] ?? 0) * COST_GROWTH ** (count(s, id) - 1)) / 2);
  return c;
}
/** A zone with no free slot. */
export const zoneFull = (s: State, z: ZoneId) => zoneUsed(s, z) >= ZONES[z].slots;

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

/** Repeatable research doubles its Insight each time; its other costs stay. */
export function researchCost(s: State, id: ResearchId): Cost {
  const def = RESEARCH_DEFS[id];
  const n = def.repeatable ? (s.research[id] ?? 0) : 0;
  const c: Cost = {};
  for (const g of keys(def.cost))
    c[g] = Math.round((def.cost[g] ?? 0) * (g === 'insight' ? (def.growth ?? 2) ** n : 1));
  if (id === 'dig_library') c.insight = (c.insight ?? 0) * s.legacy.labTexts;
  return c;
}
/** What the Research tab lists: the Old Library if there is one, everything bought, plus the next few in order. */
export function visibleResearch(s: State): ResearchId[] {
  const out: ResearchId[] = s.legacy.labTexts > 0 ? ['dig_library'] : [];
  let fresh = 0;
  for (const id of keys(RESEARCH_DEFS).filter((x) => x !== 'dig_library')) {
    const bought = (s.research[id] ?? 0) > 0;
    if (bought || fresh < RESEARCH_SHOWN) out.push(id);
    if (!bought) fresh++;
  }
  return out;
}
export const endowCost = (s: State): Cost => ({ silver: NOTICE.endow.base * NOTICE.endow.growth ** s.endowments });
export const bribeCost = (s: State): Cost => ({ silver: NOTICE.bribe.base * NOTICE.bribe.growth ** s.bribes });

const assistMult = (s: State) => {
  const n = count(s, 'sanctum');
  return 1 + (n ? (SANCTUM_ASSIST * (s.buildings.sanctum?.workers ?? 0)) / n : 0);
};
/** Insight per second a magus makes reading in their Sanctum (none while experimenting). */
export function readingRate(s: State, m: MagusState, mods = modifiers(s)) {
  if (!m.sanctum) return 0;
  const hunger = s.res.bread <= 0 ? 0.5 : 1;
  return BASELINE_INSIGHT * labTotal(s, m) * assistMult(s) * hunger * baselineMult(mods) * insightMult(s, m);
}
export const studyCost = (m: MagusState): Cost => ({ insight: Math.ceil(20 * 1.35 ** (m.lt - 10)) });

export function experimentPlan(s: State, magus: MagusId, recipe: RecipeId, extra: number) {
  const m = s.magi.find((x) => x.id === magus);
  const def: RecipeDef = RECIPES[recipe];
  const cost: Cost = { ...def.cost };
  if (def.result === 'longevity') cost.vis = Math.ceil((m?.age ?? 40) / 5) + 5 * (m?.decrepitude ?? 0);
  cost.vis = (cost.vis ?? 0) + extra;
  const perLT = def.insightPerLT ?? 0;
  const boosts = auraBoosts(s);
  return {
    cost,
    time: (def.time * (1 + EXPERIMENT.extraTime * extra)) / assistMult(s) / boosts.speed,
    insight:
      perLT *
      (m ? labTotal(s, m) * insightMult(s, m) : 10) *
      (1 + EXPERIMENT.extraYield * extra) *
      (1 + EXPERIMENT.labText * s.labTexts),
    botch: (EXPERIMENT.botch + EXPERIMENT.extraBotch * extra) * botchMult(modifiers(s)),
    discovery: EXPERIMENT.discovery + boosts.discovery,
  };
}

export interface Rates {
  net: Record<GoodId, number>;
  byBuilding: Partial<Record<BuildingId, Cost>>;
  zones: Record<ZoneId, { made: number; capacity: number; factor: number; strike: boolean }>;
  hungry: boolean;
  /** Notice generated per minute. */
  noticeGen: number;
  /** Stone and Vis heading to the Gate per second, and Insight poured into it. */
  gate: { stone: number; vis: number; insight: number };
}

/** Every per-second rate in the game, computed in one place. The UI shows exactly what tick() applies. */
export function rates(s: State): Rates {
  const mods = modifiers(s);
  const hungry = s.res.bread <= 0;
  const hunger = hungry ? 0.5 : 1;
  const net = zeroGoods();
  const byBuilding: Rates['byBuilding'] = {};
  const zones = Object.fromEntries(
    keys(ZONES).map((z) => [z, { made: 0, capacity: 0, factor: 1, strike: isBlocked(s, `strike:${z}`) }]),
  ) as Rates['zones'];
  const gate = { stone: 0, vis: 0, insight: 0 };
  const visToGate = !!s.gate?.visToGate;
  let noticeSum = 0;
  for (const id of keys(s.buildings)) {
    const def = B[id];
    noticeSum += count(s, id) * zoneNotice(s, def.zone, mods);
    const pw: Cost = def.perWorker ?? {};
    const w = Math.min(s.buildings[id]?.workers ?? 0, workerSlots(s, id));
    const out: Cost = {};
    for (const g of keys(pw)) {
      out[g] = w * (pw[g] ?? 0) * hunger * outputMult(s, mods, id, g);
      if (visToGate && isSite(id)) gate.vis += out[g];
      else zones[def.zone].made += out[g];
    }
    byBuilding[id] = out;
  }
  for (const z of keys(ZONES)) {
    const zone = zones[z];
    if (ZONES[z].carry === 0) continue;
    zone.capacity = zone.strike ? 0 : (s.porters[z] ?? 0) * ZONES[z].carry * carryMult(mods, z);
    zone.factor = zone.made > 0 ? Math.min(1, zone.capacity / zone.made) : 1;
  }
  for (const id of keys(byBuilding)) {
    const out = byBuilding[id] as Cost;
    const toGate = visToGate && isSite(id);
    const f = toGate ? 1 : zones[B[id].zone].factor;
    for (const g of keys(out)) {
      out[g] = (out[g] ?? 0) * f;
      if (!toGate) net[g] += out[g];
    }
  }
  for (const m of s.magi) if (m.sanctum && !m.exp) net.insight += readingRate(s, m, mods);
  if (s.gate?.pour) {
    gate.insight = net.insight;
    net.insight = 0;
  }
  net.bread -= s.hands * HAND_FOOD;
  if (s.gate) gate.stone = s.gate.porters * ZONES.marsh.carry * carryMult(mods, 'marsh');
  const raised = AURA.raiseNotice * (s.research.raise_aura ?? 0);
  const gen = Math.max(0, (NOTICE_K * noticeSum + raised - NOTICE.endow.gen * s.endowments) * noticeMult(mods));
  return { net, byBuilding, zones, hungry, noticeGen: gen, gate };
}

// ─── Simulation ─────────────────────────────────────────────────────

const log = (s: State, text: string) => s.chronicle.push({ t: s.t, text });

function addRes(s: State, g: GoodId, n: number) {
  s.res[g] = Math.min(cap(s, g), Math.max(0, s.res[g] + n));
}
/** Insight goes to the Gate while the player pours into it. */
function gainInsight(s: State, n: number) {
  if (n > 0) s.stats.insightMade += n;
  if (s.gate?.pour && n > 0) s.gate.insight += n;
  else addRes(s, 'insight', n);
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
  const g = s.gate;
  if (g && g.porters > (best?.n ?? 0))
    best = {
      n: g.porters,
      take: () => {
        g.porters--;
      },
    };
  best?.take();
}

function resolveExperiment(s: State, m: MagusState, e: Experiment) {
  const name = nameOf(m);
  const roll = nextRandom(s.rng);
  m.exp = null;
  if (roll < e.botch) {
    s.stats.botches++;
    s.notice += EXPERIMENT.botchNotice;
    log(s, `${name}'s experiment goes wrong. The tower smokes for a day and Dol talks about it.`);
    const a = s.apprentices.find((x) => x.chair === m.id);
    if (a && nextRandom(s.rng) < APPRENTICE.botchDeath) {
      s.apprentices = s.apprentices.filter((x) => x !== a);
      card(
        s,
        'The apprentice',
        `${name}'s apprentice was standing too close. They bury what the fire left on the hill.`,
      );
    }
    return;
  }
  const discovery = roll >= 1 - EXPERIMENT.discovery;
  if (discovery) s.stats.discoveries++;
  const kind = RECIPES[e.recipe].result;
  if (kind === 'insight') {
    // A discovery doubles the yield; the spec's trait choice arrives with traits.
    const gain = e.insight * (discovery ? 2 : 1);
    gainInsight(s, gain);
    if (discovery) log(s, `${name} finds something nobody wrote down before: ${Math.round(gain)} Insight.`);
  } else if (kind === 'longevity') {
    m.longevity = true;
    if (discovery) m.decrepitude = Math.max(0, m.decrepitude - 1);
    log(
      s,
      `${name} works the Longevity Ritual. The years will come more slowly${discovery ? ', and one of them goes back' : ''}.`,
    );
  } else if (kind === 'labText') {
    s.labTexts += discovery ? 2 : 1;
    s.stats.labTextsWritten += discovery ? 2 : 1;
    log(s, `${name} finishes a Lab Text${discovery ? ', and a second one from the margins' : ''}.`);
  } else if (e.target) {
    s.devices[e.target] = (s.devices[e.target] ?? 0) + (discovery ? 2 : 1);
    log(s, `${name} enchants a device for the ${B[e.target].name}${discovery ? ', and it works twice as well' : ''}.`);
  }
}

function met(s: State, c: Condition) {
  switch (c.kind) {
    case 'res':
      return s.res[c.good] >= c.atLeast;
    case 'below':
      return s.res[c.good] < c.share * cap(s, c.good);
    case 'time':
      return s.t >= c.atLeast;
    case 'notice':
      return s.notice >= c.atLeast;
    case 'hands':
      return s.hands >= c.atLeast;
    case 'noHands':
      return s.hands <= 0;
    case 'insightMade':
      return s.stats.insightMade >= c.atLeast;
    case 'researched':
      return keys(s.research).length >= c.atLeast;
    case 'rites':
      return (s.gate?.rites ?? 0) >= c.atLeast;
    case 'noMagi':
      return s.magi.length === 0 && s.apprentices.length === 0;
  }
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

function reveal(s: State, id: string) {
  if (has(s, id)) return;
  s.unlocked.push(id);
  if (id.startsWith('magus:')) {
    const m = id.slice(6) as MagusId;
    if (!s.magi.some((x) => x.id === m)) s.magi.push(newMagus(m, (s.legacy.gens[m] ?? 0) + 1, { sanctum: false }));
  }
}

function checkUnlocks(s: State) {
  scenarioOf(s).unlocks?.forEach((u, i) => {
    if (s.unlocksDone.includes(i) || !met(s, u.when)) return;
    s.unlocksDone.push(i);
    for (const id of u.reveal) reveal(s, id);
    if (u.card) {
      s.events.push({ title: u.card.title, text: u.card.text, options: [{ label: 'Go on', effects: [] }] });
      log(s, u.card.title);
    }
  });
}

function card(s: State, title: string, text: string, options: EventDef['options'] = [{ label: 'Go on', effects: [] }]) {
  s.events.push({ title, text, options });
  log(s, title);
}

function checkNotice(s: State) {
  const fired = (k: string) => s.noticeFired.includes(k);
  const fire = (k: string) => s.noticeFired.push(k);
  for (const k of ['tax', 'strike', 'audit'] as const)
    if (fired(k) && s.notice < NOTICE[k].at - NOTICE.rearm) s.noticeFired = s.noticeFired.filter((x) => x !== k);
  if (!fired('tax') && s.notice >= NOTICE.tax.at) {
    fire('tax');
    const lost = Math.floor(s.res.silver * NOTICE.tax.share);
    s.res.silver -= lost;
    card(
      s,
      "The lord's tax collector",
      `The lord of Dol has heard the covenant is doing well. His collector rides up the hill and leaves with ${lost} Silver.`,
    );
  }
  if (!fired('strike') && s.notice >= NOTICE.strike.at) {
    fire('strike');
    const r = rates(s);
    const z = (keys(ZONES) as ZoneId[])
      .filter((x) => ZONES[x].carry > 0)
      .reduce((a, b) => (r.zones[b].made > r.zones[a].made ? b : a), 'marsh' as ZoneId);
    s.blocks[`strike:${z}`] = s.t + NOTICE.strike.secs;
    const fee = Math.ceil(s.res.silver * NOTICE.strike.payShare);
    card(
      s,
      'The porters strike',
      `The porters of the ${ZONES[z].name} have heard what Dol says about the tower. They sit down on their loads and won't carry for a minute, unless someone makes it worth their while.`,
      [
        {
          label: `Pay them. (${fee} Silver)`,
          effects: [{ kind: 'res', good: 'silver', n: -fee }, { kind: 'endStrike' }],
        },
        { label: 'Wait them out.', effects: [] },
      ],
    );
  }
  if (!fired('audit') && s.notice >= NOTICE.audit.at) {
    fire('audit');
    card(
      s,
      "The Quaesitor's audit",
      'A Quaesitor of the Order has come to read the covenant’s books. While Notice stays this high, no magus may Study. Endow, bribe, or stop building.',
    );
  }
}

function checkIns(s: State) {
  for (const m of s.magi) {
    const e = m.exp;
    if (!e || e.checked || e.end - e.start < EXPERIMENT.checkInAt || s.t < (e.start + e.end) / 2) continue;
    e.checked = true;
    const push = `+${EXPERIMENT.pushYield * 100}% yield, +${EXPERIMENT.pushBotch * 100} points of botch chance`;
    s.events.push({
      title: `${nameOf(m)}, halfway`,
      text: `${nameOf(m)} looks up from ${RECIPES[e.recipe].name}. It is going well. It could go better, or worse.`,
      options: [
        { label: `Push on. (${push})`, effects: [{ kind: 'checkIn', magus: m.id, choice: 'push' }] },
        { label: 'Hold steady.', effects: [{ kind: 'checkIn', magus: m.id, choice: 'steady' }] },
        { label: 'Stop now. (Half the costs back)', effects: [{ kind: 'checkIn', magus: m.id, choice: 'abort' }] },
      ],
    });
  }
}

function tickGate(s: State, r: Rates) {
  const g = s.gate;
  if (!g) return;
  const stone = Math.min(r.gate.stone * DT, s.res.stone);
  s.res.stone -= stone;
  if (!g.raised) {
    g.stone += stone;
    if (g.stone >= GATE.raise) {
      g.raised = true;
      card(
        s,
        'The Gate rises',
        'The last stone goes in at low tide. By morning there is an arch standing in the marsh, and the sea runs through it the wrong way. It will hold Insight now, as much as the magi can pour into it.',
      );
    }
  }
  g.now.stone += stone;
  g.now.vis += r.gate.vis * DT;
  if (s.t - g.now.t >= 1 - 1e-9) {
    g.history = [...g.history.slice(-(GATE.window - 1)), { stone: g.now.stone, vis: g.now.vis }];
    g.now = { stone: 0, vis: 0, t: s.t };
  }
}

/** The Rites' conditions, as the Gate card shows them. */
export function riteStatus(s: State) {
  const g = s.gate;
  const n = g?.history.length ?? 0;
  const avg = (k: 'stone' | 'vis') => (g && n ? g.history.reduce((a, x) => a + x[k], 0) / GATE.window : 0);
  const next = GATE.rites[g?.rites ?? 0];
  const magiReady = s.magi.length >= 3 && s.magi.every((m) => m.sanctum && !m.exp);
  const stone = avg('stone');
  const vis = avg('vis');
  return {
    next,
    stone,
    vis,
    magiReady,
    insight: g?.insight ?? 0,
    ready:
      !!g?.raised &&
      !!next &&
      stone >= GATE.stonePerS - 1e-9 &&
      vis >= GATE.visPerS - 1e-9 &&
      magiReady &&
      g.insight >= next.insight,
  };
}

/** Advances exactly one fixed tick, mutating s. */
function tick(s: State) {
  const r = rates(s);
  for (const g of GOODS) {
    if (g === 'insight') gainInsight(s, r.net.insight * DT);
    else addRes(s, g, r.net[g] * DT);
  }
  if (s.gate?.pour) gainInsight(s, r.gate.insight * DT);
  tickGate(s, r);

  if (s.res.bread <= 0) {
    s.hungerT += DT;
    if (s.hungerT >= 30 && s.hands > 0) {
      s.hungerT = 0;
      loseHand(s);
      log(s, 'A hand walks down the hill to Dol. There is no bread.');
    }
  } else s.hungerT = 0;
  const rent = has(s, 'eels') ? EELS.hand : 0;
  if (s.hands < housing(s) && s.res.bread > 0 && r.net.bread >= 0 && s.res.eels >= rent) {
    s.growT += DT;
    if (s.growT >= 20) {
      s.growT = 0;
      s.hands++;
      s.res.eels -= rent;
    }
  } else s.growT = 0;

  s.notice = Math.max(0, s.notice + ((r.noticeGen - noticeDecay(s) * s.notice) / 60) * DT);
  const friars = divine(s);
  s.t += DT;
  for (const m of s.magi) m.age += DT / YEAR;
  if (divine(s) > friars) friarsArrive(s);
  if (Math.floor(s.t / YEAR) > Math.floor((s.t - DT) / YEAR + 1e-9)) yearTurns(s);
  if (s.faerie.level > 0 && s.t - s.faerie.t >= FAERIE.fade) {
    s.faerie.level--;
    s.faerie.t = s.t;
    log(s, 'Nobody has been down to the Regio Spring in a while. The fae stop listening.');
  }
  tickApprentices(s);
  for (const m of s.magi) if (m.exp && s.t >= m.exp.end - 1e-9) resolveExperiment(s, m, m.exp);
  s.stats.peakNotice = Math.max(s.stats.peakNotice, s.notice);
  checkOutcome(s);
  if (s.outcome) return;
  checkNotice(s);
  checkIns(s);
  checkUnlocks(s);
  startStory(s);
}

function friarsArrive(s: State) {
  card(
    s,
    'The friars come to Dol',
    `Grey friars walk barefoot into Dol, singing, and build a house by the market. The Dominion comes a hand's breadth closer to the hill: Divine ${divine(s)}, and the aura dulls to ${aura(s)}.`,
  );
}

/** Each year, every magus from 45 may grow decrepit; at 5 Decrepitude they die. */
function yearTurns(s: State) {
  for (const m of [...s.magi]) {
    const p = agingChance(s, m);
    if (!p || nextRandom(s.rng) >= p) continue;
    m.decrepitude++;
    const name = nameOf(m);
    if (m.decrepitude < AGING.death) {
      log(s, `${name}'s hands shake over the crucible now. Decrepitude ${m.decrepitude}.`);
      continue;
    }
    s.magi = s.magi.filter((x) => x !== m);
    s.vacant.push({ chair: m.id, gen: m.gen, sanctum: m.sanctum });
    s.stats.deaths++;
    card(
      s,
      `${name} is dead`,
      `${name} walks out onto the sands at low tide, aged ${Math.floor(m.age)}, and does not come back.`,
    );
  }
}

/** Apprentices pass the Gauntlet at 6 years, then wait for a chair to fall vacant. */
function tickApprentices(s: State) {
  for (const a of s.apprentices) {
    if (a.ready || s.t - a.start < APPRENTICE.gauntlet) continue;
    a.ready = true;
    const holder = s.magi.find((m) => m.id === a.chair);
    card(
      s,
      'The Gauntlet',
      `${holder ? `${nameOf(holder)}'s` : `The late ${magusName(a.chair)}'s`} apprentice breaks the Gauntlet and rises, robed and burning: a magus of Hermes. They will wait at their master's side until a chair falls empty.`,
    );
  }
  for (const v of [...s.vacant]) {
    const a = s.apprentices.find((x) => x.ready && x.chair === v.chair) ?? s.apprentices.find((x) => x.ready);
    if (!a) continue;
    const teacher = s.magi.find((m) => m.id === a.chair);
    const lt = Math.max(APPRENTICE.lt, APPRENTICE.lt + Math.floor(((teacher?.lt ?? 10) - 10) / 2));
    s.apprentices = s.apprentices.filter((x) => x !== a);
    s.vacant = s.vacant.filter((x) => x !== v);
    const m = newMagus(v.chair, v.gen + 1, { sanctum: v.sanctum, lt, age: APPRENTICE.age });
    s.magi.push(m);
    const old = chairName(v.chair, v.gen);
    card(
      s,
      `Long live ${magusName(v.chair)}`,
      `${old} is dead; long live ${magusName(v.chair)}. The apprentice kneels, rises, and answers to a dead man's name: ${nameOf(m)}.`,
    );
  }
}

/** A gift from the fae comes only to a covenant in need. */
export function faerieNeed(s: State): string | null {
  if (s.notice >= NOTICE.strike.at) return 'notice';
  if (s.res.bread < 0.1 * cap(s, 'bread')) return 'bread';
  if (s.magi.some((m) => m.decrepitude >= AGING.death - 1)) return 'age';
  if (s.res.silver < 50) return 'silver';
  return null;
}
export const offerCost = (s: State): Cost => ({
  vis: FAERIE.cost * 2 ** (s.faerie.year === year(s) ? s.faerie.offers : 0),
});

/** Legacy for the next covenant: this run's gains, added to what it inherited. */
export function nextLegacy(s: State): Legacy {
  const lg = s.legacy;
  if (!scenarioOf(s).legacy) return lg;
  const gens = { ...lg.gens };
  for (const m of s.magi) gens[m.id] = m.gen;
  for (const v of s.vacant) gens[v.chair] = Math.max(gens[v.chair] ?? 0, v.gen);
  const heirloom = keys(s.devices)
    .map((b) => [b, (s.devices[b] ?? 0) - lg.heirlooms.filter((h) => h === b).length] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    covenants: lg.covenants + 1,
    magic: lg.magic + Math.floor((s.aura.peak - s.aura.start) / 2),
    labTexts: lg.labTexts + s.stats.labTextsWritten,
    heirlooms: heirloom ? [...lg.heirlooms, heirloom] : lg.heirlooms,
    gens,
  };
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

/** A deep copy, except the log and Chronicle: their entries are never changed once written, so they're shared. */
function clone(s: State): State {
  const { log: l, chronicle: c, ...rest } = s;
  return { ...structuredClone(rest), log: [...l], chronicle: [...c] };
}

/** Advances by dt real game-seconds, in fixed ticks. Pending events pause the game. */
export function step(s0: State, dt: number): State {
  if (blocked(s0)) return s0;
  const n = Math.floor((s0.acc + dt) / DT + 1e-9);
  if (n === 0) return { ...s0, acc: s0.acc + dt };
  const s = clone(s0);
  s.acc = s0.acc + dt - n * DT;
  for (let i = 0; i < n && !blocked(s); i++) tick(s);
  return s;
}

/** Ticks until game time t (or until something blocks). */
export function stepTo(s0: State, t: number): State {
  if (s0.t >= t || blocked(s0)) return s0;
  const s = clone(s0);
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
    else if (e.kind === 'unlock') reveal(s, e.id);
    else if (e.kind === 'endStrike') {
      for (const k of Object.keys(s.blocks)) if (k.startsWith('strike:')) delete s.blocks[k];
    } else {
      const m = s.magi.find((x) => x.id === e.magus);
      const x = m?.exp;
      if (!m || !x) continue;
      if (e.choice === 'push') {
        x.insight *= 1 + EXPERIMENT.pushYield;
        x.botch += EXPERIMENT.pushBotch;
      } else if (e.choice === 'abort') {
        for (const g of keys(x.paid)) addRes(s, g, (x.paid[g] ?? 0) / 2);
        m.exp = null;
        log(s, `${nameOf(m)} puts ${RECIPES[x.recipe].name} aside.`);
      }
    }
  }
}

const REELS = ['shell', 'eel', 'bell'];
/** The fae's slot machine: mostly a loss, now and then a gift, and only for a covenant in need. */
function offering(s: State) {
  const roll = nextRandom(s.rng);
  const reels = [0, 1, 2].map(() => REELS[Math.floor(nextRandom(s.rng) * 3)]).join(' · ');
  const o = FAERIE.odds;
  let text: string;
  if (roll < o.nothing) text = 'The fae take it and laugh.';
  else if (roll < o.nothing + o.more) {
    if (s.res.vis >= FAERIE.cost) {
      s.res.vis -= FAERIE.cost;
      text = `They take more: another ${FAERIE.cost} Vis is gone from the chests by morning.`;
    } else {
      loseHand(s);
      text = 'They take more. A hand walks into the marsh at dusk, smiling, and does not come back.';
    }
  } else if (roll < o.nothing + o.more + o.pleased && s.faerie.level >= FAERIE.max) {
    text = 'They are pleased, and greedy with it: they take another offering for the privilege.';
    if (s.res.vis >= FAERIE.cost) s.res.vis -= FAERIE.cost;
  } else if (roll < o.nothing + o.more + o.pleased) {
    s.faerie.level = Math.min(FAERIE.max, s.faerie.level + 1);
    text = `They are pleased. Faerie ${s.faerie.level}: the flats blur, and Dol forgets a little faster.`;
  } else {
    const need = faerieNeed(s);
    if (need === 'notice') {
      s.notice = Math.max(0, s.notice - FAERIE.gift.notice);
      text = 'A gift. For a season the hill is simply not there when the bishop’s men look for it.';
    } else if (need === 'bread') {
      s.res.bread = cap(s, 'bread');
      text = 'A gift. The granary is full in the morning, and the loaves are still warm.';
    } else if (need === 'age') {
      const m = s.magi.reduce((a, b) => (b.decrepitude > a.decrepitude ? b : a));
      m.decrepitude--;
      text = `A gift. ${nameOf(m)} wakes a year younger, and will not say what they dreamt.`;
    } else if (need === 'silver') {
      addRes(s, 'silver', FAERIE.gift.silver);
      text = 'A gift. There is silver in the eel traps, old coins with no king on them.';
    } else text = 'The fae look at the covenant, see it wants for nothing, and laugh.';
  }
  card(s, 'An offering at the Regio Spring', `${reels}\n\n${text}`);
}

function act(s: State, a: Action): string | undefined {
  switch (a.type) {
    case 'build': {
      const def = B[a.building];
      if (!buildable(s, a.building)) return `${def.name} isn't available here`;
      if (isBlocked(s, `build_${a.building}`)) return `No one will build a ${def.name} yet`;
      if (isMaxed(s, a.building))
        return a.building === 'sanctum' ? 'Every magus has a Sanctum' : `There is only one ${def.name}`;
      if (!isSite(a.building) && zoneUsed(s, def.zone) >= ZONES[def.zone].slots)
        return `The ${ZONES[def.zone].name} is full`;
      const c = buildCost(s, a.building);
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
      const b = s.buildings[a.building] ?? { count: 0, workers: 0 };
      b.count++;
      s.buildings[a.building] = b;
      if (a.building === 'sanctum') {
        const m = s.magi.find((x) => !x.sanctum);
        if (m) {
          m.sanctum = true;
          log(s, `${nameOf(m)} moves into a Sanctum.`);
        }
      }
      return;
    }
    case 'demolish': {
      if (!canDemolish(s, a.building)) return 'That cannot be pulled down';
      const b = s.buildings[a.building];
      if (!b) return 'Nothing to pull down';
      for (const [g, n] of Object.entries(demolishRefund(s, a.building)) as [GoodId, number][]) addRes(s, g, n);
      b.count--;
      b.workers = Math.min(b.workers, workerSlots(s, a.building));
      if (b.count === 0) delete s.buildings[a.building];
      log(s, `The covenant pulls down a ${B[a.building].name}.`);
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
    case 'gatePorters': {
      const g = s.gate;
      if (!g || !Number.isInteger(a.delta)) return 'There is no Gate yet';
      if (a.delta > idleHands(s)) return 'No idle hands';
      if (g.porters + a.delta < 0) return 'No one to take off';
      g.porters += a.delta;
      return;
    }
    case 'experiment': {
      const m = s.magi.find((x) => x.id === a.magus);
      if (!m?.sanctum) return 'That magus has no Sanctum';
      if (m.exp) return 'Already experimenting';
      if (!recipeOpen(s, a.recipe)) return 'Nobody here knows how';
      if (isBlocked(s, `experiment:${m.id}`) || isBlocked(s, 'experiment:all'))
        return `${nameOf(m)} is away from the lab`;
      if (!Number.isInteger(a.extra) || a.extra < 0 || a.extra > EXPERIMENT.maxExtraVis) return 'Bad amount of Vis';
      const kind = RECIPES[a.recipe].result;
      if (kind === 'device' && !(a.target && s.buildings[a.target])) return 'Choose a building for the device';
      if (kind === 'longevity' && m.longevity) return `${nameOf(m)} has already worked the ritual`;
      const p = experimentPlan(s, a.magus, a.recipe, a.extra);
      if (!canAfford(s, p.cost)) return 'Not enough';
      pay(s, p.cost);
      m.exp = {
        recipe: a.recipe,
        extra: a.extra,
        start: s.t,
        end: s.t + p.time,
        insight: p.insight,
        botch: p.botch,
        paid: p.cost,
        checked: false,
        ...(kind === 'device' ? { target: a.target } : {}),
      };
      s.stats.experiments++;
      return;
    }
    case 'study': {
      const m = s.magi.find((x) => x.id === a.magus);
      if (!m) return 'No such magus';
      if (s.notice >= NOTICE.audit.at) return 'The Quaesitor forbids it while Notice is this high';
      const c = studyCost(m);
      if (!canAfford(s, c)) return 'Not enough Insight';
      pay(s, c);
      m.lt++;
      return;
    }
    case 'research': {
      if (!has(s, 'research') || !visibleResearch(s).includes(a.id)) return 'Not yet';
      const def = RESEARCH_DEFS[a.id];
      if ((s.research[a.id] ?? 0) > 0 && !def.repeatable) return 'Already known';
      const c = researchCost(s, a.id);
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
      s.research[a.id] = (s.research[a.id] ?? 0) + 1;
      for (const x of def.effects) if (x.kind === 'reveal') reveal(s, x.id);
      if (a.id === 'aegis') s.aura.aegisAt = s.t;
      if (a.id === 'raise_aura') {
        s.aura.magic++;
        s.aura.peak = Math.max(s.aura.peak, s.aura.magic);
        log(
          s,
          `The covenant raises the aura to Magic ${s.aura.magic}. In Dol the milk curdles, and the dogs won't stop howling.`,
        );
      } else if (a.id === 'dig_library') {
        s.labTexts += s.legacy.labTexts;
        log(s, `The covenant digs out the old library: ${s.legacy.labTexts} Lab Texts, damp but legible.`);
      } else log(s, `The covenant learns ${def.name}.`);
      return;
    }
    case 'endow': {
      if (!has(s, 'endow')) return 'Not yet';
      const c = endowCost(s);
      if (!canAfford(s, c)) return 'Not enough Silver';
      pay(s, c);
      s.endowments++;
      log(s, 'The covenant endows the parish of Dol. The priest says a Mass for the magi, a little stiffly.');
      return;
    }
    case 'bribe': {
      if (!has(s, 'endow')) return 'Not yet';
      const c = bribeCost(s);
      if (!canAfford(s, c)) return 'Not enough Silver';
      pay(s, c);
      s.bribes++;
      s.notice = Math.max(0, s.notice - NOTICE.bribe.notice);
      s.aura.stains.push(s.t + AURA.stainSecs);
      log(
        s,
        'A gift goes down the hill to the lord of Dol. He takes the silver and smiles too wide. An Infernal stain spreads over the fields.',
      );
      return;
    }
    case 'sellEels': {
      if (!has(s, 'monks')) return 'The monks are not buying yet';
      if (s.res.eels < EELS.stick) return `A stick is ${EELS.stick} eels`;
      s.res.eels -= EELS.stick;
      addRes(s, 'silver', EELS.stickSilver);
      s.notice = Math.max(0, s.notice - EELS.stickNotice);
      return;
    }
    case 'offer': {
      if (!has(s, 'faerie') || !count(s, 'regio_spring')) return 'Nobody has found the Regio Spring yet';
      const c = offerCost(s);
      if (!canAfford(s, c)) return 'Not enough Vis';
      pay(s, c);
      const y = year(s);
      s.faerie.offers = s.faerie.year === y ? s.faerie.offers + 1 : 1;
      s.faerie.year = y;
      s.faerie.t = s.t;
      offering(s);
      return;
    }
    case 'apprentice': {
      if (!has(s, 'apprentices')) return 'Not yet';
      const m = s.magi.find((x) => x.id === a.magus);
      if (!m) return 'No such magus';
      if (s.apprentices.some((x) => x.chair === m.id)) return `${nameOf(m)} already has an apprentice`;
      if (!canAfford(s, APPRENTICE.cost)) return 'Not enough Silver';
      pay(s, APPRENTICE.cost);
      s.apprentices.push({ chair: m.id, start: s.t, ready: false });
      log(s, `A Redcap brings ${nameOf(m)} a Gifted child from Dinan. The servants keep their distance.`);
      return;
    }
    case 'gate': {
      if (a.op === 'found') {
        if (!has(s, 'gate')) return 'The Gate is still hidden';
        if (s.gate) return 'The Gate is already founded';
        if (!canAfford(s, GATE.found)) return 'Not enough';
        pay(s, GATE.found);
        s.gate = {
          stone: 0,
          raised: false,
          insight: 0,
          pour: false,
          visToGate: false,
          porters: 0,
          rites: 0,
          history: [],
          now: { stone: 0, vis: 0, t: s.t },
        };
        log(s, 'The covenant stakes out the Drowned Gate on the flats.');
        return;
      }
      const g = s.gate;
      if (!g) return 'There is no Gate yet';
      if (a.op === 'pour') {
        g.pour = !g.pour;
        return;
      }
      if (a.op === 'vis') {
        g.visToGate = !g.visToGate;
        return;
      }
      const st = riteStatus(s);
      if (!st.ready || !st.next) return 'The Rite is not ready';
      g.insight -= st.next.insight;
      g.rites++;
      log(s, `${st.next.name}: the covenant performs the Rite.`);
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
  const s = clone(s0);
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
  legacy?: Legacy;
}
export const toSave = (s: State): Save => ({
  v: 1,
  scenario: s.scenario,
  seed: s.seed,
  t: s.t,
  log: s.log,
  legacy: s.legacy,
});

/** Rebuilds a run from its seed and action log. Throws if the log no longer fits the rules. */
export function replay(save: Save): State {
  let s = createRun(save.scenario, save.seed, save.legacy);
  for (const e of save.log) {
    s = stepTo(s, e.t);
    const r = apply(s, e.action);
    if ('error' in r) throw new Error(`Replay diverged at t=${e.t}: ${r.error}`);
    s = r;
  }
  return stepTo(s, save.t);
}
