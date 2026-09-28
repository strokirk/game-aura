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
  DECREES,
  DEFS,
  DIKE,
  EEL_RENT,
  type Effect,
  type Ending,
  type EventDef,
  EXPAND,
  EXPERIMENT,
  FAERIE,
  FUEL_MULT,
  GATE,
  type GateStart,
  GOOD_INFO,
  GOODS,
  type GoodId,
  type GuideStep,
  HALL_HOUSING,
  MAGI,
  type MagusId,
  type Modifier,
  NOTICE,
  NOTICE_K,
  PRESERVE,
  RECIPES,
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
  STORE_MULT,
  TERRACE,
  type Thread,
  TRIBUNAL,
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
  /** The chair: the founder whose place this magus holds. */
  id: MagusId;
  /** Which holder of the chair: Aldric II is gen 2. */
  gen: number;
  /** Years, rising with game time. The Drowned Knight doesn't age. */
  age: number;
  decrepitude: number;
  longevity: boolean;
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
/** An apprentice serves a chair and boosts whoever holds it. */
export interface Apprentice {
  chair: MagusId;
  start: number;
  /** Passed the Gauntlet: waits at full boost for a chair to fall vacant. */
  ready: boolean;
}
/** What every fallen covenant leaves to the next. It stacks, run after run. */
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
  /** Buy more land in a zone. */
  | { type: 'expand'; zone: ZoneId }
  /** Leave an offering for the fae at the Regio Spring. */
  | { type: 'offer' }
  | { type: 'apprentice'; magus: MagusId }
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
    /** Houses of friars already announced. */
    friarsSeen: number;
  };
  faerie: { level: number; t: number; year: number; offers: number };
  /** Land bought, per zone. */
  expanded: Partial<Record<ZoneId, number>>;
  legacy: Legacy;
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
  /** The Tribunal's standing decrees (indices into DECREES), until the next meeting. */
  decrees: number[];
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
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
/** A chair's name with its numeral: Aldric, Aldric II. */
export const chairName = (id: MagusId, gen: number) =>
  gen > 1 ? `${magusName(id)} ${ROMAN[gen] ?? gen}` : magusName(id);
export const nameOf = (m: { id: MagusId; gen: number }) => chairName(m.id, m.gen);
const ORD = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
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
    ? `The ${ORD[lg.covenants + 1] ?? `${lg.covenants + 1}th`} covenant of Mont-Dol is founded in spring ${START_YEAR}, on the ruins of the last.`
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
    buildings: structuredClone(sc.start.buildings) as State['buildings'],
    porters: { ...sc.start.porters },
    magi: sc.start.magi.map((m) => newMagus(m.id, m.sanctum, m.lt, m.gen ?? (lg.gens[m.id] ?? 0) + 1, m.age)),
    apprentices: [],
    vacant: [],
    aura: {
      magic,
      start: magic,
      peak: magic,
      stains: [],
      aegisAt: sc.start.research?.aegis ? 0 : null,
      friarsSeen: Math.floor((sc.start.t ?? 0) / AURA.friars),
    },
    faerie: { level: 0, t: 0, year: 0, offers: 0 },
    expanded: {},
    legacy: lg,
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
    devices,
    gate: sc.start.gate ? newGate(sc.start.gate) : null,
    couesnon: null,
    decrees: [],
    yearDone: START_YEAR + Math.floor((sc.start.t ?? 0) / YEAR),
    events: sc.intro ? [structuredClone(sc.intro) as EventDef] : [],
    ink: {},
    fired: [],
    story: { eel_level: 0, eels_state: 0, eels_end_year: 0 },
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
  for (const id of keys(s.research))
    for (let i = 0; i < (s.research[id] ?? 0); i++) out.push(...RESEARCH_DEFS[id].effects);
  return out;
}
const product = (xs: number[]) => xs.reduce((a, x) => a * x, 1);

// ─── The aura (`aura.md`) ───────────────────────────────────────────

/** Houses of friars in Dol: one a decade, until the Aegis holds them off. */
export const friars = (s: State) => Math.floor(Math.min(s.t, s.aura.aegisAt ?? s.t) / AURA.friars);
/** Divine: every second Endowment, and the friars. */
export const divine = (s: State) => Math.floor(s.endowments / AURA.endowments) + friars(s);
export const stains = (s: State) => s.aura.stains.filter((t) => t > s.t).length;
/** Effective aura: Magic less the Dominion. */
export const aura = (s: State) => s.aura.magic - divine(s);
const above = (a: number, from: number) => Math.max(0, a - from + 1);
/** Every boost the aura gives at its current strength. */
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

// ─── Age and apprentices ────────────────────────────────────────────

/** The apprentice's boost to their chair's holder: −25% sliding to +25% over 4 years. */
export function apprenticeBoost(s: State, chair: MagusId) {
  const a = s.apprentices.find((x) => x.chair === chair);
  if (!a) return 0;
  return APPRENTICE.start + (APPRENTICE.end - APPRENTICE.start) * Math.min(1, (s.t - a.start) / APPRENTICE.ramp);
}
/** The aura and an apprentice, on a magus's Insight. */
const insightMult = (s: State, m: MagusState) => auraBoosts(s).insight * (1 + apprenticeBoost(s, m.id));
export function agingChance(s: State, m: MagusState) {
  if (m.id === 'knight' || m.age < AGING.from) return 0;
  return Math.min(1, (m.age - AGING.from) * AGING.perYear * (m.longevity ? AGING.longevity : 1) * auraBoosts(s).aging);
}

function outputMult(s: State, mods: Modifier[], id: BuildingId, good: GoodId) {
  let m = product(mods.flatMap((x) => (x.kind === 'output' && x.building === id ? [x.mult] : [])));
  m *= 1 + EXPERIMENT.device * (s.devices[id] ?? 0);
  m *= AURA.stain ** stains(s);
  if (isSite(id)) m *= auraBoosts(s).vis;
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
/** How much one more of a building raises the Notice equilibrium: the "+X Notice at rest" on its Build button. */
export function buildNotice(s: State, id: BuildingId) {
  const mods = modifiers(s);
  return 10 * NOTICE_K * zoneNotice(s, B[id].zone, mods) * decreeMult(s, id) * noticeMult(mods);
}
const botchMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'botch' ? [x.mult] : [])));
const baselineMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'baseline' ? [x.mult] : [])));
const noticeMult = (mods: Modifier[]) => product(mods.flatMap((x) => (x.kind === 'noticeGen' ? [x.mult] : [])));
const extraAssistants = (mods: Modifier[]) => mods.reduce((a, x) => a + (x.kind === 'assistants' ? x.add : 0), 0);

// ─── Selectors ──────────────────────────────────────────────────────

/** Every cap is a base times multipliers: storage buildings (×1.25 each) and research. */
export function cap(s: State, g: GoodId, mods = modifiers(s)) {
  let c = GOOD_INFO[g].cap;
  for (const id of keys(s.buildings)) if (B[id].stores?.includes(g)) c *= STORE_MULT ** count(s, id);
  for (const x of mods) if (x.kind === 'cap' && x.good === g) c *= x.mult;
  c = Math.floor(c);
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
  (z === 'scissy' && bells(s) >= 1 ? GATE.scissySlots : 0) +
  EXPAND.slots * (s.expanded[z] ?? 0);
/** Land can be bought in any zone that has plots: not the Polder, which is won with dikes. */
export const canExpand = (s: State, z: ZoneId) => z !== 'polder' && zoneSlots(s, z) > 0;
export const expandCost = (s: State, z: ZoneId): Cost => {
  const c: Cost = {};
  for (const g of keys(EXPAND.cost)) c[g] = Math.ceil((EXPAND.cost[g] ?? 0) * EXPAND.growth ** (s.expanded[z] ?? 0));
  return c;
};
export const dikeCost = (s: State): Cost => {
  const c: Cost = {};
  for (const g of keys(DIKE.cost)) c[g] = Math.ceil((DIKE.cost[g] ?? 0) * DIKE.growth ** s.dikes);
  return c;
};

export function buildCost(s: State, id: BuildingId): Cost {
  const c: Cost = {};
  const base = B[id].cost;
  for (const g of keys(base)) c[g] = Math.ceil((base[g] ?? 0) * (B[id].growth ?? COST_GROWTH) ** count(s, id));
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
  for (const g of keys(def.flat ?? {})) c[g] = (c[g] ?? 0) + (def.flat?.[g] ?? 0);
  if (id === 'dig_library') c.insight = (c.insight ?? 0) * s.legacy.labTexts;
  return c;
}
/** What the Research tab lists: everything bought, plus the next few in order. */
/** Research may draw Insight from the Gate's store as well as the Hall. */
export const canAffordResearch = (s: State, c: Cost) =>
  canAfford(s, { ...c, insight: Math.max(0, (c.insight ?? 0) - (s.gate?.store.insight ?? 0)) });

export function visibleResearch(s: State): ResearchId[] {
  const only = scenarioOf(s).research;
  if (only) return [...only];
  const out: ResearchId[] = s.legacy.labTexts > 0 ? ['dig_library'] : [];
  let fresh = 0;
  for (const id of keys(RESEARCH_DEFS).filter((x) => x !== 'dig_library')) {
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
const newMagus = (id: MagusId, sanctum: boolean, lt = 10, gen = 1, age?: number): MagusState => ({
  id,
  gen,
  age: age ?? MAGI.find((x) => x.id === id)?.age ?? 40,
  decrepitude: 0,
  longevity: false,
  lt,
  sanctum,
  exp: null,
  warp: 0,
  twilight: null,
  traits: [],
});
/** Lab Total with Warping, less Decrepitude. Study raises `lt`; botches raise `warp`. The aura's top tier adds to it at work. */
export const labTotal = (m: MagusState) => Math.max(1, m.lt + WARP.lt * m.warp - m.decrepitude);
/** The magus's Twilight traits still in force. */
export const activeTraits = (s: State, m: MagusState) =>
  m.traits.filter((x) => x.until > s.t).map((x) => TWILIGHT_TRAITS[x.i]!);
const traitMult = (s: State, m: MagusState | undefined, k: 'yield' | 'time') =>
  m ? product(activeTraits(s, m).map((x) => x[k] ?? 1)) : 1;
/** At work in the Sanctum: not in Twilight. */
export const present = (m: MagusState) => m.sanctum && m.twilight === null;

export function readingRate(s: State, m: MagusState, mods = modifiers(s)) {
  if (!m.sanctum) return 0;
  const lt = labTotal(m) + auraBoosts(s).lt;
  return BASELINE_INSIGHT * lt * assistMult(s) * baselineMult(mods) * insightMult(s, m);
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
  const lt = (m ? labTotal(m) : 10) + boosts.lt;
  // A device is craft: a stronger magus finishes it sooner.
  const craft = def.result === 'device' ? 10 / lt : 1;
  const traitBotch = m ? activeTraits(s, m).reduce((a, x) => a + (x.botch ?? 0), 0) : 0;
  return {
    cost,
    time:
      (def.time * craft * (1 + EXPERIMENT.extraTime * extra) * traitMult(s, m, 'time')) / assistMult(s) / boosts.speed,
    insight:
      perLT *
      lt *
      (m ? insightMult(s, m) : 1) *
      (1 + EXPERIMENT.extraYield * extra) *
      (1 + EXPERIMENT.labText * s.labTexts) *
      traitMult(s, m, 'yield') *
      product(modifiers(s).flatMap((x) => (x.kind === 'yield' ? [x.mult] : []))),
    botch: (EXPERIMENT.botch + EXPERIMENT.extraBotch * extra + traitBotch) * botchMult(modifiers(s)),
    discovery: EXPERIMENT.discovery + boosts.discovery,
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
    noticeSum += count(s, id) * zoneNotice(s, def.zone, mods) * decreeMult(s, id);
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
  const raised = AURA.raiseNotice * (s.research.raise_aura ?? 0);
  const gen = dark(s) ? 0 : Math.max(0, (NOTICE_K * noticeSum + wakes + raised - levers) * noticeMult(mods));
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
  const name = nameOf(m);
  const roll = nextRandom(s.rng);
  m.exp = null;
  if (roll < e.botch) {
    s.stats.botches++;
    s.notice += EXPERIMENT.botchNotice * decreeMult(s);
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
    const a = s.apprentices.find((x) => x.chair === m.id);
    if (a && nextRandom(s.rng) < APPRENTICE.botchDeath) {
      s.apprentices = s.apprentices.filter((x) => x !== a);
      card(
        s,
        'The apprentice',
        `${name}'s apprentice was standing too close. They bury what the fire left on the hill.`,
      );
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
  const name = nameOf(m);
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
    case 'workers':
      return (s.buildings[c.building]?.workers ?? 0) >= c.atLeast;
    case 'porters':
      return (s.porters[c.zone] ?? 0) >= c.atLeast;
    case 'built':
      return count(s, c.building) >= c.atLeast;
    case 'experiments':
      return s.stats.experiments >= c.atLeast;
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
    case 'noMagi':
      return s.magi.length === 0 && s.apprentices.length === 0;
  }
}
/** The scenario's ending that matches how the run ended: its title and epitaph. */
export function ending(s: State): Ending | undefined {
  const sc = scenarioOf(s);
  const list = s.outcome?.kind === 'win' ? sc.win : sc.loss;
  return list.find((e) => e.cause === s.outcome?.cause);
}

/** The trial's guide: the first step not yet done, or null with no guide or once the run is over. */
export function guideStep(s: State): GuideStep | null {
  if (s.outcome) return null;
  return scenarioOf(s).guide?.find((g) => !g.done || !met(s, g.done)) ?? null;
}

/** The Notice at which this scenario is lost. */
export function noticeLimit(s: State) {
  const l = scenarioOf(s).loss.find((e) => e.when.kind === 'notice')?.when;
  return l?.kind === 'notice' ? l.atLeast : 100;
}

/** Progress toward a numeric goal, for the goal line: Insight gathered toward the trial's 500. */
export function goalProgress(s: State): { have: number; need: number } | null {
  const w = scenarioOf(s).win[0]?.when;
  return w?.kind === 'insightMade' ? { have: s.stats.insightMade, need: w.atLeast } : null;
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
    if (!s.magi.some((x) => x.id === m)) s.magi.push(newMagus(m, false, 10, (s.legacy.gens[m] ?? 0) + 1));
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

/** Influence at the Tribunal: quiet and vis-rich covenants are heard. */
export const influence = (s: State) =>
  Math.max(0, Math.floor((100 - s.notice) / TRIBUNAL.perNotice)) + Math.floor(s.res.vis / TRIBUNAL.perVis);
/** The year of the next Tribunal, or null if it doesn't meet in this scenario. */
export function nextTribunal(s: State) {
  if (!scenarioOf(s).tribunal) return null;
  // The first year whose yearly events haven't happened yet.
  const y = s.yearDone + 1;
  if (y <= TRIBUNAL.first) return TRIBUNAL.first;
  return TRIBUNAL.first + Math.ceil((y - TRIBUNAL.first) / TRIBUNAL.every) * TRIBUNAL.every;
}
/** A standing decree triples the Notice of its activity: a building type, or botches when none is given. */
export const decreeMult = (s: State, building?: BuildingId) =>
  s.decrees.some((i) => DECREES[i]?.building === building) ? TRIBUNAL.mult : 1;

function tribunal(s: State) {
  const inf = influence(s);
  const why = `Notice ${Math.floor(s.notice)}: ${Math.max(0, Math.floor((100 - s.notice) / TRIBUNAL.perNotice))}, Vis ${Math.floor(s.res.vis)}: ${Math.floor(s.res.vis / TRIBUNAL.perVis)}`;
  // Draw distinct decrees.
  const pool = DECREES.map((_, i) => i);
  s.decrees = [];
  for (let k = 0; k < TRIBUNAL.decrees && pool.length; k++)
    s.decrees.push(pool.splice(Math.floor(nextRandom(s.rng) * pool.length), 1)[0]!);
  const gifts: string[] = [];
  const producers = keys(s.buildings).filter((id) => B[id].perWorker && (s.buildings[id]?.workers ?? 0) > 0);
  const best = producers.sort((a, b) => (s.buildings[b]?.workers ?? 0) - (s.buildings[a]?.workers ?? 0))[0];
  for (let k = 0; k < Math.floor(inf / TRIBUNAL.perGift); k++) {
    if (best && nextRandom(s.rng) < 0.5) {
      s.devices[best] = (s.devices[best] ?? 0) + 1;
      gifts.push(`a device for the ${B[best].name}`);
    } else {
      s.labTexts++;
      gifts.push('a Lab Text');
    }
  }
  const decreed = s.decrees.map((i) => DECREES[i]!.name).join(' and ');
  card(
    s,
    `The Tribunal of ${year(s)}`,
    `The magi of the Normandy Tribunal meet, and Mont-Dol has ${inf} influence (${why}). They decree ${decreed}: until the next Tribunal, those draw three times the Notice. ${gifts.length ? `For the covenant's standing they give ${gifts.join(', ')}.` : 'They give the covenant nothing.'}`,
  );
}

/** Each year, every magus from 45 may grow decrepit; at 5 Decrepitude they die and their chair stands empty. */
function growOld(s: State) {
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

/** Apprentices pass the Gauntlet after 6 years, then wait for a chair to fall vacant and take it, with its name. */
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
    const m = newMagus(v.chair, v.sanctum, lt, v.gen + 1, APPRENTICE.age);
    s.magi.push(m);
    card(
      s,
      `Long live ${magusName(v.chair)}`,
      `${chairName(v.chair, v.gen)} is dead; long live ${magusName(v.chair)}. The apprentice kneels, rises, and answers to a dead man's name: ${nameOf(m)}.`,
    );
  }
}

/** A gift from the fae comes only to a covenant in need. */
export function faerieNeed(s: State): 'notice' | 'bread' | 'age' | 'silver' | null {
  if (s.notice >= NOTICE.strike.at) return 'notice';
  if (s.res.bread < 0.1 * cap(s, 'bread')) return 'bread';
  if (s.magi.some((m) => m.decrepitude >= AGING.death - 1)) return 'age';
  if (s.res.silver < 50) return 'silver';
  return null;
}
export const offerCost = (s: State): Cost => ({
  vis: FAERIE.cost * 2 ** (s.faerie.year === year(s) ? s.faerie.offers : 0),
});
const REELS = ['shell', 'eel', 'bell'];
/** The fae's slot machine: mostly a loss, sometimes Faerie, and a gift only for a covenant in need. */
function offering(s: State) {
  const roll = nextRandom(s.rng);
  const reels = [0, 1, 2].map(() => REELS[Math.floor(nextRandom(s.rng) * 3)]).join(' · ');
  const o = FAERIE.odds;
  let text: string;
  const takeMore = () => {
    if (s.res.vis >= FAERIE.cost) {
      s.res.vis -= FAERIE.cost;
      return `They take more: another ${FAERIE.cost} Vis is gone from the chests by morning.`;
    }
    s.hands = Math.max(0, s.hands - 1);
    unassignOne(s);
    return 'They take more. A hand walks into the marsh at dusk, smiling, and does not come back.';
  };
  if (roll < o.nothing) text = 'The fae take it and laugh.';
  else if (roll < o.nothing + o.more) text = takeMore();
  else if (roll < o.nothing + o.more + o.pleased) {
    if (s.faerie.level >= FAERIE.max) text = `They are pleased, and greedy with it. ${takeMore()}`;
    else {
      s.faerie.level++;
      text = `They are pleased. Faerie ${s.faerie.level}: the flats blur, and Dol forgets a little faster.`;
    }
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
/** After a hand is lost, take one from the biggest job if nobody is idle. */
function unassignOne(s: State) {
  if (idleHands(s) >= 0) return;
  const id = keys(s.buildings).sort((a, b) => (s.buildings[b]?.workers ?? 0) - (s.buildings[a]?.workers ?? 0))[0];
  const z = keys(s.porters).sort((a, b) => (s.porters[b] ?? 0) - (s.porters[a] ?? 0))[0];
  const bw = id ? (s.buildings[id]?.workers ?? 0) : 0;
  const pw = z ? (s.porters[z] ?? 0) : 0;
  if (id && bw >= pw && bw > 0) s.buildings[id]!.workers--;
  else if (z && pw > 0) s.porters[z] = pw - 1;
  else if (s.gate && s.gate.porters > 0) s.gate.porters--;
}

/** The next covenant's legacy: what it inherited, plus what this run adds. */
export function nextLegacy(s: State): Legacy {
  const lg = s.legacy;
  if (!scenarioOf(s).legacy) return lg;
  const gens = { ...lg.gens };
  for (const m of s.magi) if (m.id !== 'knight') gens[m.id] = m.gen;
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

/** Once a year: the Tribunal every 7 years; after the fifth and sixth bells, raids from the Pit and storms on the dikes. */
function yearly(s: State) {
  const y = year(s);
  if (y <= s.yearDone) return;
  s.yearDone = y;
  if (friars(s) > s.aura.friarsSeen) {
    s.aura.friarsSeen = friars(s);
    card(
      s,
      'The friars come to Dol',
      `Grey friars walk barefoot into Dol, singing, and build a house by the market. The Dominion comes a hand's breadth closer to the hill: Divine ${divine(s)}, and the aura dulls to ${aura(s)}.`,
    );
  }
  growOld(s);
  if (scenarioOf(s).tribunal && y >= TRIBUNAL.first && (y - TRIBUNAL.first) % TRIBUNAL.every === 0) tribunal(s);
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

  // New hands pay the eel rent where the scenario asks it.
  const rent = has(s, 'eelRent') ? EEL_RENT : 0;
  if (s.hands < housing(s) && s.res.eels >= rent) {
    s.growT += DT;
    if (s.growT >= 20) {
      s.growT = 0;
      s.hands++;
      s.res.eels -= rent;
    }
  } else s.growT = 0;

  s.notice = Math.max(0, s.notice + ((r.noticeGen - noticeDecay(s) * s.notice) / 60) * DT);
  s.t += DT;
  for (const m of s.magi) if (m.id !== 'knight') m.age += DT / YEAR;
  if (s.faerie.level > 0 && s.t - s.faerie.t >= FAERIE.fade) {
    s.faerie.level--;
    s.faerie.t = s.t;
    log(s, 'Nobody has been down to the Regio Spring in a while. The fae stop listening.');
  }
  tickApprentices(s);
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

/** A deep copy, except the log and Chronicle: their entries never change once written, so they're shared. */
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
        log(s, `${nameOf(m)} puts ${RECIPES[x.recipe].name} aside.`);
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
          log(s, `${nameOf(m)} moves into a Sanctum.`);
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
      if (m.twilight !== null) return `${nameOf(m)} is in Twilight`;
      if (m.exp) return 'Already experimenting';
      if (!recipeOpen(s, a.recipe)) return 'Nobody here knows how';
      if (isBlocked(s, `experiment:${m.id}`) || isBlocked(s, 'experiment:all'))
        return `${nameOf(m)} is away from the lab`;
      if (!Number.isInteger(a.extra) || a.extra < 0 || a.extra > EXPERIMENT.maxExtraVis) return 'Bad amount of Vis';
      const kind = RECIPES[a.recipe].result;
      if (kind === 'device' && !(a.target && s.buildings[a.target])) return 'Choose a building for the device';
      if (kind === 'longevity' && (m.longevity || m.id === 'knight')) return `${nameOf(m)} needs no ritual`;
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
      s.aura.stains.push(s.t + AURA.stainSecs);
      log(
        s,
        'A gift goes down the hill to the lord of Dol. He takes the silver and smiles too wide, and an Infernal stain spreads over the fields.',
      );
      return;
    }
    case 'expand': {
      if (!canExpand(s, a.zone)) return 'There is no land to be had there';
      const c = expandCost(s, a.zone);
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
      s.expanded[a.zone] = (s.expanded[a.zone] ?? 0) + 1;
      log(s, `The covenant buys ${EXPAND.slots} more plots in the ${ZONES[a.zone].name}.`);
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
      if (!m || m.id === 'knight') return 'No such magus';
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
