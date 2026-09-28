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
  DIKE,
  type Effect,
  type EventDef,
  EXPERIMENT,
  FUEL_MULT,
  GATE,
  type GateStart,
  GOOD_INFO,
  GOODS,
  type GoodId,
  HALL_HOUSING,
  MAGI,
  type MagusId,
  type Modifier,
  NOTICE,
  NOTICE_K,
  PRESERVE,
  RECIPES,
  RESEARCH,
  RESEARCH_DEFS,
  RESEARCH_SHOWN,
  type RecipeDef,
  type RecipeId,
  type ResearchId,
  SALT_PRICE,
  SANCTUM_ASSIST,
  SCENARIOS,
  type ScenarioDef,
  type ScenarioId,
  START_YEAR,
  TERRACE,
  type Thread,
  TWILIGHT_TRAITS,
  WARP,
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
  id: MagusId;
  lt: number;
  sanctum: boolean;
  exp: Experiment | null;
  /** Botches leave Warping: it raises the Lab Total and risks Twilight. */
  warp: number;
  /** Back from Twilight at this time; null when present. */
  twilight: number | null;
  /** Twilight traits (index into TWILIGHT_TRAITS) and when each fades. */
  traits: { i: number; until: number }[];
}
export interface Outcome {
  kind: 'win' | 'loss';
  cause: string;
  t: number;
}
export interface GateState {
  /** Stone delivered while raising it. */
  stone: number;
  raised: boolean;
  /** Goods poured into the Gate. It has no caps; the bells are paid from it. */
  store: Record<GoodId, number>;
  /** Goods whose income pours into the Gate instead of the Hall. */
  pour: GoodId[];
  porters: number;
  bells: number;
}
export type Action =
  | { type: 'build'; building: BuildingId }
  | { type: 'dike' }
  | { type: 'workers'; building: BuildingId; delta: number }
  | { type: 'porters'; zone: ZoneId; delta: number }
  | { type: 'experiment'; magus: MagusId; recipe: RecipeId; extra: number; target?: BuildingId }
  | { type: 'study'; magus: MagusId }
  | { type: 'research'; id: ResearchId }
  | { type: 'endow' }
  | { type: 'bribe' }
  | { type: 'alms' }
  | { type: 'gift' }
  /** Keep Salt in stock to preserve food, selling only what overflows, or sell it all. */
  | { type: 'keepSalt' }
  | { type: 'gate'; op: 'found' | 'bell' }
  /** Toggle pouring a good's income into the Gate. */
  | { type: 'pour'; good: GoodId }
  /** Point the Couesnon at a zone (after the sixth bell, once a year). */
  | { type: 'couesnon'; zone: ZoneId }
  /** Dev menu: fill the Gate with the next bell's price. */
  | { type: 'devFill' }
  | { type: 'gatePorters'; delta: number }
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
  buildings: Partial<Record<BuildingId, { count: number; workers: number }>>;
  porters: Partial<Record<ZoneId, number>>;
  magi: MagusState[];
  notice: number;
  /** Notice events that have fired and not yet re-armed. */
  noticeFired: string[];
  endowments: number;
  bribes: number;
  alms: number;
  gifts: number;
  keepSalt: boolean;
  dikes: number;
  /** Stone quarried over the run; it opens terraces. */
  quarried: number;
  research: Partial<Record<ResearchId, number>>;
  labTexts: number;
  devices: Partial<Record<BuildingId, number>>;
  gate: GateState | null;
  /** The zone the Couesnon doubles, and the year it last moved. */
  couesnon: { zone: ZoneId; year: number } | null;
  /** The last year whose yearly events (raids, storms) have happened. */
  yearDone: number;
  events: EventDef[];
  /** Each ink thread's saved story state (JSON), absent before its first knot. */
  ink: Partial<Record<Thread, string>>;
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
    t: sc.start.t ?? 0,
    acc: 0,
    res,
    hands: sc.start.hands,
    growT: 0,
    buildings: structuredClone(sc.start.buildings) as State['buildings'],
    porters: { ...sc.start.porters },
    magi: sc.start.magi.map((m) => newMagus(m.id, m.sanctum, m.lt)),
    notice: sc.start.notice ?? 0,
    noticeFired: [],
    endowments: sc.start.endowments ?? 0,
    bribes: 0,
    alms: 0,
    gifts: 0,
    keepSalt: false,
    dikes: 0,
    quarried: 0,
    research: { ...sc.start.research },
    labTexts: sc.start.labTexts ?? 0,
    devices: { ...sc.start.devices },
    gate: sc.start.gate ? newGate(sc.start.gate) : null,
    couesnon: null,
    yearDone: START_YEAR + Math.floor((sc.start.t ?? 0) / YEAR),
    events: sc.intro ? [structuredClone(sc.intro) as EventDef] : [],
    ink: {},
    fired: [],
    story: { eel_level: 0, eels_state: 0, eels_end_year: 0 },
    mods: [],
    blocks: {},
    unlocked: [...sc.unlocked],
    unlocksDone: [],
    chronicle: [{ t: sc.start.t ?? 0, text: `Founded in spring ${START_YEAR}.` }],
    outcome: null,
    log: [],
    stats: { insightMade: 0, peakNotice: 0, experiments: 0, botches: 0, discoveries: 0 },
  };
}

function newGate(g: GateStart): GateState {
  const store = zeroGoods();
  for (const k of keys(g.store)) store[k] = g.store[k] ?? 0;
  return { stone: g.stone, raised: g.raised, store, pour: [...g.pour], porters: g.porters, bells: g.bells };
}
export const bells = (s: State) => s.gate?.bells ?? 0;
/** Scissy is workable at low tide. */
export const lowTide = (s: State) => s.t % GATE.tide.period < GATE.tide.out;
/** The hidden hour, after the fourth bell. */
export const dark = (s: State) => bells(s) >= 4 && s.t % GATE.darkness.period < GATE.darkness.dark;

// ─── Modifiers: every permanent bonus, gathered in one place ────────

function modifiers(s: State): Modifier[] {
  const out: Modifier[] = [];
  for (const id of keys(s.research)) for (let i = 0; i < (s.research[id] ?? 0); i++) out.push(...RESEARCH[id].effects);
  return out;
}
const product = (xs: number[]) => xs.reduce((a, x) => a * x, 1);
function outputMult(s: State, mods: Modifier[], id: BuildingId, good: GoodId) {
  let m = product(mods.flatMap((x) => (x.kind === 'output' && x.building === id ? [x.mult] : [])));
  m *= 1 + EXPERIMENT.device * (s.devices[id] ?? 0);
  if (id === 'eel_weir' && s.story.eels_state === 0) m *= 1 + 0.5 * s.story.eel_level;
  if (id === 'eel_weir' && bells(s) >= 2) m *= GATE.bloodEels;
  if (id === 'farm' && bells(s) >= 4) m *= GATE.darkFarms;
  if (id === 'bog_camp' && !lowTide(s)) m = 0;
  if (s.couesnon?.zone === B[id].zone) m *= GATE.couesnon;
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
  if (g === 'bread' || g === 'eels') c += Math.floor(s.res.salt / PRESERVE);
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
  id === 'sanctum' ? s.magi.filter((m) => m.id !== 'knight').length : (B[id].max ?? Number.POSITIVE_INFINITY);
export const isMaxed = (s: State, id: BuildingId) => count(s, id) >= maxOf(s, id);
/** A revealed feature, recipe or building. */
export const has = (s: State, what: string) => s.unlocked.includes(what);
/** Allowed by the scenario, or unlocked in play. */
export const buildable = (s: State, id: BuildingId) =>
  (scenarioOf(s).allowed as readonly string[]).includes(id) || has(s, id);
export const isBlocked = (s: State, key: string) => (s.blocks[key] ?? 0) > s.t;
export const recipeOpen = (s: State, r: RecipeId) => r === 'study_vis' || has(s, `recipe:${r}`);

/** A zone with no free slot. */
export const zoneFull = (s: State, z: ZoneId) => zoneUsed(s, z) >= zoneSlots(s, z);
/** Terraces cut so far, and the Stone quarried still needed for the next (Infinity at the last). */
export function terraces(s: State) {
  let n = 0;
  let need = TERRACE.first;
  let left = s.quarried;
  while (n < TERRACE.max && left >= need) {
    left -= need;
    need *= TERRACE.growth;
    n++;
  }
  return { n, next: n < TERRACE.max ? need - left : Number.POSITIVE_INFINITY };
}
export const zoneSlots = (s: State, z: ZoneId) =>
  ZONES[z].slots +
  (z === 'polder' ? DIKE.slots * s.dikes : 0) +
  (z === 'hearth' ? terraces(s).n : 0) +
  (z === 'scissy' && bells(s) >= 1 ? GATE.scissySlots : 0);
export const dikeCost = (s: State): Cost => {
  const c: Cost = {};
  for (const g of keys(DIKE.cost)) c[g] = Math.ceil((DIKE.cost[g] ?? 0) * DIKE.growth ** s.dikes);
  return c;
};

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

export function researchCost(s: State, id: ResearchId): Cost {
  const def = RESEARCH_DEFS[id];
  const n = def.repeatable ? (s.research[id] ?? 0) : 0;
  const c: Cost = {};
  for (const g of keys(def.cost)) c[g] = Math.ceil((def.cost[g] ?? 0) * (def.growth ?? 2) ** n);
  return c;
}
/** What the Research tab lists: everything bought, plus the next few in order. */
/** Research may draw Insight from the Gate's store as well as the Hall. */
export const canAffordResearch = (s: State, c: Cost) =>
  canAfford(s, { ...c, insight: Math.max(0, (c.insight ?? 0) - (s.gate?.store.insight ?? 0)) });

export function visibleResearch(s: State): ResearchId[] {
  const out: ResearchId[] = [];
  let fresh = 0;
  for (const id of keys(RESEARCH) as ResearchId[]) {
    const needs = RESEARCH_DEFS[id].needs;
    // The Form trees stand apart from the list: always shown once revealed.
    if (needs) {
      if (has(s, needs)) out.push(id);
      continue;
    }
    const bought = (s.research[id] ?? 0) > 0;
    if (bought || fresh < RESEARCH_SHOWN) out.push(id);
    if (!bought) fresh++;
  }
  return out;
}
export const endowCost = (s: State): Cost => ({ silver: NOTICE.endow.base * NOTICE.endow.growth ** s.endowments });
export const bribeCost = (s: State): Cost => ({ silver: NOTICE.bribe.base * NOTICE.bribe.growth ** s.bribes });
export const giftCost = (s: State): Cost => ({
  eels: Math.ceil(NOTICE.gift.base * NOTICE.gift.growth ** s.gifts),
});
export const almsCost = (s: State): Cost => ({ bread: NOTICE.alms.base * NOTICE.alms.growth ** s.alms });

const assistMult = (s: State) => {
  const n = count(s, 'sanctum');
  return 1 + (n ? (SANCTUM_ASSIST * (s.buildings.sanctum?.workers ?? 0)) / n : 0);
};
/** Insight per second a magus makes reading in their Sanctum (none while experimenting). */
const newMagus = (id: MagusId, sanctum: boolean, lt = 10): MagusState => ({
  id,
  lt,
  sanctum,
  exp: null,
  warp: 0,
  twilight: null,
  traits: [],
});
/** Lab Total with Warping. Study raises `lt`; botches raise `warp`. */
export const labTotal = (m: MagusState) => m.lt + WARP.lt * m.warp;
/** The magus's Twilight traits still in force. */
export const activeTraits = (s: State, m: MagusState) =>
  m.traits.filter((x) => x.until > s.t).map((x) => TWILIGHT_TRAITS[x.i]!);
const traitMult = (s: State, m: MagusState | undefined, k: 'yield' | 'time') =>
  m ? product(activeTraits(s, m).map((x) => x[k] ?? 1)) : 1;
/** At work in the Sanctum: not in Twilight. */
export const present = (m: MagusState) => m.sanctum && m.twilight === null;

export function readingRate(s: State, m: MagusState, mods = modifiers(s)) {
  if (!m.sanctum) return 0;
  return BASELINE_INSIGHT * labTotal(m) * assistMult(s) * baselineMult(mods);
}
export const studyCost = (m: MagusState): Cost => ({ insight: Math.ceil(20 * 1.35 ** (m.lt - 10)) });

export function experimentPlan(s: State, magus: MagusId, recipe: RecipeId, extra: number) {
  const m = s.magi.find((x) => x.id === magus);
  const def = RECIPES[recipe];
  const cost: Cost = { ...def.cost };
  cost.vis = (cost.vis ?? 0) + extra;
  const perLT = 'insightPerLT' in def ? def.insightPerLT : 0;
  const lt = m ? labTotal(m) : 10;
  // A device is craft: a stronger magus finishes it sooner.
  const craft = def.result === 'device' ? 10 / lt : 1;
  const traitBotch = m ? activeTraits(s, m).reduce((a, x) => a + (x.botch ?? 0), 0) : 0;
  return {
    cost,
    time: (def.time * craft * (1 + EXPERIMENT.extraTime * extra) * traitMult(s, m, 'time')) / assistMult(s),
    insight:
      perLT *
      lt *
      (1 + EXPERIMENT.extraYield * extra) *
      (1 + EXPERIMENT.labText * s.labTexts) *
      traitMult(s, m, 'yield') *
      product(modifiers(s).flatMap((x) => (x.kind === 'yield' ? [x.mult] : []))),
    botch: (EXPERIMENT.botch + EXPERIMENT.extraBotch * extra + traitBotch) * botchMult(modifiers(s)),
    discovery: EXPERIMENT.discovery,
  };
}

/** The most extra Vis affordable for this experiment, up to the maximum; -1 if even the base cost isn't. */
export function maxExtraVis(s: State, magus: MagusId, recipe: RecipeId) {
  for (let x = EXPERIMENT.maxExtraVis; x >= 0; x--)
    if (canAfford(s, experimentPlan(s, magus, recipe, x).cost)) return x;
  return -1;
}

export interface Rates {
  net: Record<GoodId, number>;
  byBuilding: Partial<Record<BuildingId, Cost>>;
  zones: Record<ZoneId, { made: number; capacity: number; factor: number; strike: boolean }>;
  /** Notice generated per minute. */
  noticeGen: number;
  /** Goods poured into the Gate per second. */
  gate: Record<GoodId, number>;
  /** Stone the Gate porters carry out from the Hall per second. */
  gateStone: number;
}

/** Every per-second rate in the game, computed in one place. The UI shows exactly what tick() applies. */
export function rates(s: State): Rates {
  const mods = modifiers(s);
  const net = zeroGoods();
  const byBuilding: Rates['byBuilding'] = {};
  const zones = Object.fromEntries(
    keys(ZONES).map((z) => [z, { made: 0, capacity: 0, factor: 1, strike: isBlocked(s, `strike:${z}`) }]),
  ) as Rates['zones'];
  const rung = bells(s);
  const fuelRate = rung >= 3 ? GATE.wormwoodFuel : 1;
  let noticeSum = 0;
  let wakes = 0;
  for (const id of keys(s.buildings)) {
    const def = B[id];
    noticeSum += count(s, id) * zoneNotice(s, def.zone, mods);
    // The Bell of Blood: brine carries vis.
    const pw: Cost = id === 'salt_pan' && rung >= 2 ? { ...def.perWorker, vis: GATE.bloodVis } : (def.perWorker ?? {});
    const uses: Cost = def.uses ?? {};
    const fed = keys(uses).every((g) => s.res[g] > 0);
    const w = fed ? Math.min(s.buildings[id]?.workers ?? 0, workerSlots(s, id)) : 0;
    for (const g of keys(uses)) net[g] -= w * (uses[g] ?? 0);
    const fuelled = !!def.fuel && s.res.bread > 0;
    if (fuelled) net.bread -= w * (def.fuel ?? 0) * fuelRate;
    if (id === 'bog_camp' && w > 0) wakes += GATE.scissyNotice;
    const out: Cost = {};
    for (const g of keys(pw)) {
      out[g] = w * (pw[g] ?? 0) * (fuelled ? FUEL_MULT : 1) * outputMult(s, mods, id, g);
      zones[def.zone].made += out[g];
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
    const f = zones[B[id].zone].factor;
    for (const g of keys(out)) {
      out[g] = (out[g] ?? 0) * f;
      net[g] += out[g];
    }
  }
  for (const m of s.magi) if (present(m) && !m.exp) net.insight += readingRate(s, m, mods);
  // Poured goods go to the Gate, uncapped, instead of the Hall (and poured Salt isn't sold).
  const gate = zeroGoods();
  for (const g of s.gate?.pour ?? [])
    if (net[g] > 0) {
      gate[g] = net[g];
      net[g] = 0;
    }
  const reserve = s.keepSalt ? cap(s, 'salt', mods) : 0;
  if (net.salt > 0 && s.res.salt >= reserve - 1e-9) {
    net.silver += net.salt * SALT_PRICE;
    net.salt = 0;
  }
  const gateStone = s.gate ? s.gate.porters * ZONES.marsh.carry * carryMult(mods, 'marsh') : 0;
  if (rung >= 2) wakes += GATE.bloodNotice;
  const levers = NOTICE.endow.gen * s.endowments + NOTICE.alms.gen * s.alms;
  const gen = dark(s) ? 0 : Math.max(0, (NOTICE_K * noticeSum + wakes - levers) * noticeMult(mods));
  return { net, byBuilding, zones, noticeGen: gen, gate, gateStone };
}

// ─── Simulation ─────────────────────────────────────────────────────

const log = (s: State, text: string) => s.chronicle.push({ t: s.t, text });

function addRes(s: State, g: GoodId, n: number) {
  s.res[g] = Math.min(cap(s, g), Math.max(0, s.res[g] + n));
}
/** Insight goes to the Gate while the player pours into it. */
function gainInsight(s: State, n: number) {
  if (n > 0) s.stats.insightMade += n;
  if (s.gate?.pour.includes('insight') && n > 0) s.gate.store.insight += n;
  else addRes(s, 'insight', n);
}

function resolveExperiment(s: State, m: MagusState, e: Experiment) {
  const name = magusName(m.id);
  const roll = nextRandom(s.rng);
  m.exp = null;
  if (roll < e.botch) {
    s.stats.botches++;
    s.notice += EXPERIMENT.botchNotice;
    m.warp++;
    log(
      s,
      `${name}'s experiment goes wrong. The tower smokes for a day and Dol talks about it. ${name} is Warped (${m.warp}).`,
    );
    if (nextRandom(s.rng) < WARP.destroy) {
      const pool = keys(s.buildings).filter((id) => id !== 'sanctum' && !isSite(id));
      const id = pool[Math.floor(nextRandom(s.rng) * pool.length)];
      if (id) {
        applyEffects(s, [{ kind: 'destroy', building: id, n: 1 }]);
        log(s, `The blast takes a ${B[id].name} with it.`);
      }
    }
    if (nextRandom(s.rng) < WARP.twilight * m.warp) {
      m.twilight = s.t + WARP.twilightSecs;
      card(
        s,
        `${name} enters Twilight`,
        `${name} stops mid-word and stares at nothing. The magic has come too close. For a while ${name} is somewhere else, and nobody can reach them.`,
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
  } else if (kind === 'labText') {
    s.labTexts += discovery ? 2 : 1;
    log(s, `${name} finishes a Lab Text${discovery ? ', and a second one from the margins' : ''}.`);
  } else if (e.target) {
    const power = (RECIPES[e.recipe] as RecipeDef).power ?? 1;
    s.devices[e.target] = (s.devices[e.target] ?? 0) + (discovery ? 2 : 1) * power;
    log(s, `${name} enchants a device for the ${B[e.target].name}${discovery ? ', and it works twice as well' : ''}.`);
  }
}

function returnFromTwilight(s: State, m: MagusState) {
  m.twilight = null;
  const i = Math.floor(nextRandom(s.rng) * TWILIGHT_TRAITS.length);
  const [lo, hi] = WARP.traitSecs;
  const secs = Math.round(lo + nextRandom(s.rng) * (hi - lo));
  const t = TWILIGHT_TRAITS[i]!;
  m.traits.push({ i, until: s.t + secs });
  if (t.building && t.mult) s.mods.push({ id: t.building, good: goodOf(t.building), mult: t.mult, until: s.t + secs });
  const name = magusName(m.id);
  card(
    s,
    `${name} returns: ${t.name}`,
    `${name} comes back from Twilight, and ${t.text} For about ${Math.round(secs / 60)} minutes.`,
  );
}
/** The good a building makes (its first). */
const goodOf = (id: BuildingId) => (Object.keys(B[id].perWorker ?? {})[0] ?? 'silver') as GoodId;

function met(s: State, c: Condition): boolean {
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
    case 'insightMade':
      return s.stats.insightMade >= c.atLeast;
    case 'researched':
      return keys(s.research).length >= c.atLeast;
    case 'bells':
      return bells(s) >= c.atLeast;
    case 'fired':
      return s.fired.includes(c.knot);
    case 'zoneFull':
      return zoneFull(s, c.zone);
    case 'story':
      return s.story[c.v] >= (c.atLeast ?? -Infinity) && s.story[c.v] <= (c.atMost ?? Infinity);
    case 'yearsAfter':
      return year(s) >= s.story[c.v] + c.years;
    case 'all':
      return c.of.every((x) => met(s, x));
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
    if (!s.magi.some((x) => x.id === m)) s.magi.push(newMagus(m, false));
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
      title: `${magusName(m.id)}, halfway`,
      text: `${magusName(m.id)} looks up from ${RECIPES[e.recipe].name}. It is going well. It could go better, or worse.`,
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
  const stone = Math.min(r.gateStone * DT, s.res.stone);
  s.res.stone -= stone;
  if (g.raised) g.store.stone += stone;
  else {
    g.stone += stone;
    if (g.stone >= GATE.raise) {
      g.raised = true;
      card(
        s,
        'The Gate rises',
        'The last stone goes in at low tide. By morning there is an arch standing in the marsh, and the sea runs through it the wrong way. Under the mud, something is ringing. Pour Insight and goods into it: seven bells hang in drowned Ys.',
      );
    }
  }
  for (const k of GOODS) {
    // Poured Stone raises the Gate first.
    if (k === 'stone' && !g.raised) g.stone += r.gate[k] * DT;
    else g.store[k] += r.gate[k] * DT;
    if (k === 'insight') s.stats.insightMade += r.gate[k] * DT;
  }
}

/** The next bell, what the Gate holds against its price, and whether it can ring. */
export function bellStatus(s: State) {
  const g = s.gate;
  const next = GATE.bells[g?.bells ?? 0];
  const last = (g?.bells ?? 0) === GATE.bells.length - 1;
  const paid = !!g && !!next && keys(next.price).every((k) => g.store[k] >= (next.price[k] ?? 0) - 1e-9);
  const quiet = !last || s.notice < GATE.lastBellNotice;
  return { next, paid, quiet, ready: !!g?.raised && paid && quiet };
}

/** What ringing bell n (1–7) opens. What it wakes lives in rates() and the yearly events. */
function ring(s: State, n: number) {
  if (n === 1) for (const id of ['bog_camp', 'recipe:great_device']) reveal(s, id);
  if (n === 3) reveal(s, 'wormwood');
  if (n === 5 && !s.magi.some((m) => m.id === 'knight')) {
    s.magi.push(newMagus('knight', true, GATE.knightLT));
    reveal(s, 'magus:knight');
  }
}

/** Once a year after the fifth and sixth bells: raids from the Pit, and storms on the dikes. */
function yearly(s: State) {
  const y = year(s);
  if (y <= s.yearDone) return;
  s.yearDone = y;
  if (bells(s) >= 5) {
    const crowded = (keys(ZONES) as ZoneId[]).reduce((a, z) => (zoneUsed(s, z) > zoneUsed(s, a) ? z : a), 'hearth');
    const prey = keys(s.buildings)
      .filter((id) => B[id].zone === crowded && id !== 'sanctum' && !isSite(id))
      .sort((a, b) => count(s, b) - count(s, a))[0];
    if (prey)
      card(
        s,
        'Things from the Pit',
        `Something climbed out of the Barrow after the Knight, and it has found the ${ZONES[crowded].name}. Ward the marsh with Vis, or it takes what it finds.`,
        [
          { label: `Ward it. (${GATE.raid.ward.vis} Vis)`, effects: [], cost: GATE.raid.ward },
          {
            label: `Let it come. (Lose ${GATE.raid.lose} ${B[prey].name}s)`,
            effects: [{ kind: 'destroy', building: prey, n: GATE.raid.lose }],
          },
        ],
      );
  }
  if (bells(s) >= 6 && s.dikes > 0)
    card(s, 'The storm', 'The four winds meet over the bay, and a dike goes. The sea is in the polder to the knee.', [
      {
        label: `Mend it. (${GATE.storm.mend.stone} Stone, ${GATE.storm.mend.bread} Bread)`,
        effects: [],
        cost: GATE.storm.mend,
      },
      { label: 'Let it breach. (Lose a dike)', effects: [{ kind: 'dikes', n: -1 }] },
    ]);
}

/** Advances exactly one fixed tick, mutating s. */
function tick(s: State) {
  const r = rates(s);
  for (const g of GOODS) {
    if (g === 'insight') gainInsight(s, r.net.insight * DT);
    else addRes(s, g, r.net[g] * DT);
  }
  tickGate(s, r);
  if (dark(s)) for (const m of s.magi) if (m.exp) m.exp.end -= DT; // the hidden hour: twice as fast
  const cut = terraces(s).n;
  s.quarried += (r.byBuilding.quarry?.stone ?? 0) * DT;
  if (terraces(s).n > cut)
    log(s, 'The quarry has cut a new terrace into Mont-Dol: room for one more building on the Hearth.');

  if (s.hands < housing(s)) {
    s.growT += DT;
    if (s.growT >= 20) {
      s.growT = 0;
      s.hands++;
    }
  } else s.growT = 0;

  s.notice = Math.max(0, s.notice + ((r.noticeGen - 0.1 * s.notice) / 60) * DT);
  s.t += DT;
  for (const m of s.magi) if (m.exp && s.t >= m.exp.end - 1e-9) resolveExperiment(s, m, m.exp);
  for (const m of s.magi) if (m.twilight !== null && s.t >= m.twilight - 1e-9) returnFromTwilight(s, m);
  s.stats.peakNotice = Math.max(s.stats.peakNotice, s.notice);
  checkOutcome(s);
  if (s.outcome) return;
  checkNotice(s);
  checkIns(s);
  checkUnlocks(s);
  yearly(s);
  startStory(s);
}

/** Queues the first story beat whose condition is met. Beats fire once, one at a time. */
function startStory(s: State) {
  const beat = scenarioOf(s).story?.find((b) => !s.fired.includes(b.knot) && met(s, b.when));
  if (!beat) return;
  const r = rates(s);
  const thread = beat.thread ?? 'eels';
  const { event, saved } = playKnot(s.ink[thread] ?? null, s.seed, beat, {
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
  s.ink[thread] = saved;
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
    else if (e.kind === 'unlock') reveal(s, e.id);
    else if (e.kind === 'destroy') {
      const b = s.buildings[e.building];
      // A drained Vis site stays gone.
      if (isSite(e.building)) s.blocks[`build_${e.building}`] = Number.MAX_SAFE_INTEGER;
      if (!b) continue;
      b.count = Math.max(0, b.count - e.n);
      b.workers = Math.min(b.workers, workerSlots(s, e.building));
      if (b.count === 0) delete s.buildings[e.building];
    } else if (e.kind === 'dikes') s.dikes = Math.max(0, s.dikes + e.n);
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
        log(s, `${magusName(m.id)} puts ${RECIPES[x.recipe].name} aside.`);
      }
    }
  }
}

function act(s: State, a: Action): string | undefined {
  switch (a.type) {
    case 'build': {
      const def = B[a.building];
      if (!buildable(s, a.building)) return `${def.name} isn't available here`;
      if (isBlocked(s, `build_${a.building}`)) return `No one will build a ${def.name} yet`;
      if (isMaxed(s, a.building))
        return a.building === 'sanctum' ? 'Every magus has a Sanctum' : `There is only one ${def.name}`;
      if (!isSite(a.building) && zoneFull(s, def.zone)) return `The ${ZONES[def.zone].name} is full`;
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
          log(s, `${magusName(m.id)} moves into a Sanctum.`);
        }
      }
      return;
    }
    case 'dike': {
      if (!has(s, 'dike')) return 'Not yet';
      const c = dikeCost(s);
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
      s.dikes++;
      log(s, 'The diggers close another dike across the flats. The sea gives up two fields of salt grass.');
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
      if (a.delta > 0 && zoneSlots(s, a.zone) === 0) return 'Nothing to carry there yet';
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
      if (m.twilight !== null) return `${magusName(m.id)} is in Twilight`;
      if (m.exp) return 'Already experimenting';
      if (!recipeOpen(s, a.recipe)) return 'Nobody here knows how';
      if (isBlocked(s, `experiment:${m.id}`) || isBlocked(s, 'experiment:all'))
        return `${magusName(m.id)} is away from the lab`;
      if (!Number.isInteger(a.extra) || a.extra < 0 || a.extra > EXPERIMENT.maxExtraVis) return 'Bad amount of Vis';
      const kind = RECIPES[a.recipe].result;
      if (kind === 'device' && !(a.target && s.buildings[a.target])) return 'Choose a building for the device';
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
      if (!canAffordResearch(s, c)) return 'Not enough';
      // Insight comes from the Hall first, then from the Gate.
      const fromHall = Math.min(s.res.insight, c.insight ?? 0);
      if (s.gate) s.gate.store.insight -= (c.insight ?? 0) - fromHall;
      pay(s, { ...c, insight: fromHall });
      s.research[a.id] = (s.research[a.id] ?? 0) + 1;
      for (const x of def.effects) if (x.kind === 'reveal') reveal(s, x.id);
      log(s, `The covenant learns ${def.name}.`);
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
    case 'alms': {
      if (!has(s, 'endow')) return 'Not yet';
      const c = almsCost(s);
      if (!canAfford(s, c)) return 'Not enough Bread';
      pay(s, c);
      s.alms++;
      log(s, 'The covenant gives Bread to the poor of Dol every Friday. They pray for the magi, and mean it.');
      return;
    }
    case 'gift': {
      if (!has(s, 'endow')) return 'Not yet';
      const c = giftCost(s);
      if (!canAfford(s, c)) return 'Not enough Eels';
      pay(s, c);
      s.gifts++;
      s.notice = Math.max(0, s.notice - NOTICE.gift.notice);
      log(
        s,
        'A cart of eels goes across the sands to the monks of Mont-Saint-Michel. The abbot writes a kind letter to the bishop.',
      );
      return;
    }
    case 'keepSalt': {
      s.keepSalt = !s.keepSalt;
      if (!s.keepSalt) {
        addRes(s, 'silver', s.res.salt * SALT_PRICE);
        s.res.salt = 0;
      }
      return;
    }
    case 'bribe': {
      if (!has(s, 'endow')) return 'Not yet';
      const c = bribeCost(s);
      if (!canAfford(s, c)) return 'Not enough Silver';
      pay(s, c);
      s.bribes++;
      s.notice = Math.max(0, s.notice - NOTICE.bribe.notice);
      log(s, 'A gift goes down the hill to the lord of Dol. He forgets a few things.');
      return;
    }
    case 'gate': {
      if (a.op === 'found') {
        if (!has(s, 'gate')) return 'The Gate is still hidden';
        if (s.gate) return 'The Gate is already founded';
        if (!canAfford(s, GATE.found)) return 'Not enough';
        pay(s, GATE.found);
        s.gate = newGate({ stone: 0, raised: false, store: {}, pour: [], porters: 0, bells: 0 });
        log(s, 'The covenant stakes out the Drowned Gate on the flats.');
        return;
      }
      const g = s.gate;
      if (!g) return 'There is no Gate yet';
      const st = bellStatus(s);
      if (!st.next) return 'Every bell has rung';
      if (!g.raised) return 'The Gate is not raised';
      if (!st.paid) return 'The Gate does not hold enough';
      if (!st.quiet) return `Notice must be under ${GATE.lastBellNotice}`;
      for (const k of keys(st.next.price)) g.store[k] -= st.next.price[k] ?? 0;
      g.bells++;
      ring(s, g.bells);
      log(s, `${st.next.name} rings under the bay. ${st.next.opens} ${st.next.wakes}`);
      return;
    }
    case 'pour': {
      const g = s.gate;
      if (!g) return 'There is no Gate yet';
      g.pour = g.pour.includes(a.good) ? g.pour.filter((x) => x !== a.good) : [...g.pour, a.good];
      return;
    }
    case 'couesnon': {
      if (bells(s) < 6) return 'The Couesnon keeps to its bed';
      if (s.couesnon?.year === year(s)) return 'The river has moved once this year';
      s.couesnon = { zone: a.zone, year: year(s) };
      log(s, `The Couesnon turns in its bed toward the ${ZONES[a.zone].name}.`);
      return;
    }
    case 'devFill': {
      const g = s.gate;
      const next = bellStatus(s).next;
      if (!g || !next) return 'Nothing to fill';
      for (const k of keys(next.price)) g.store[k] = Math.max(g.store[k], next.price[k] ?? 0);
      return;
    }
    case 'choose': {
      const ev = s.events[0];
      const opt = ev?.options[a.option];
      if (!opt) return 'No such choice';
      if (opt.cost && !canAfford(s, opt.cost)) return 'Not enough';
      if (opt.cost) pay(s, opt.cost);
      const thread = ev.thread ?? 'eels';
      const saved = s.ink[thread];
      if (ev.knot && saved) {
        const r = chooseInKnot(thread, saved, a.option);
        if (!r) return 'No such choice';
        s.ink[thread] = r.saved;
        if (r.vars) s.story = r.vars;
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
