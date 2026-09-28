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
  type RecipeId,
  type ResearchId,
  SALT_PRICE,
  SANCTUM_ASSIST,
  SCENARIOS,
  type ScenarioDef,
  type ScenarioId,
  START_YEAR,
  TERRACE,
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
  | { type: 'gate'; op: 'found' | 'pour' | 'vis' | 'rite' }
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
    magi: sc.start.magi.map((m) => ({ id: m.id, lt: m.lt ?? 10, sanctum: m.sanctum, exp: null })),
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
    gate: sc.start.gate ? { ...sc.start.gate, history: [], now: { stone: 0, vis: 0, t: sc.start.t ?? 0 } } : null,
    events: sc.intro ? [structuredClone(sc.intro) as EventDef] : [],
    ink: null,
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
  id === 'sanctum' ? s.magi.length : (B[id].max ?? Number.POSITIVE_INFINITY);
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
  ZONES[z].slots + (z === 'polder' ? DIKE.slots * s.dikes : 0) + (z === 'hearth' ? terraces(s).n : 0);
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
  for (const g of keys(def.cost)) c[g] = (def.cost[g] ?? 0) * 2 ** n;
  return c;
}
/** What the Research tab lists: everything bought, plus the next few in order. */
export function visibleResearch(s: State): ResearchId[] {
  const out: ResearchId[] = [];
  let fresh = 0;
  for (const id of keys(RESEARCH) as ResearchId[]) {
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
export function readingRate(s: State, m: MagusState, mods = modifiers(s)) {
  if (!m.sanctum) return 0;
  return BASELINE_INSIGHT * m.lt * assistMult(s) * baselineMult(mods);
}
export const studyCost = (m: MagusState): Cost => ({ insight: Math.ceil(20 * 1.35 ** (m.lt - 10)) });

export function experimentPlan(s: State, magus: MagusId, recipe: RecipeId, extra: number) {
  const m = s.magi.find((x) => x.id === magus);
  const def = RECIPES[recipe];
  const cost: Cost = { ...def.cost };
  cost.vis = (cost.vis ?? 0) + extra;
  const perLT = 'insightPerLT' in def ? def.insightPerLT : 0;
  return {
    cost,
    time: (def.time * (1 + EXPERIMENT.extraTime * extra)) / assistMult(s),
    insight: perLT * (m?.lt ?? 10) * (1 + EXPERIMENT.extraYield * extra) * (1 + EXPERIMENT.labText * s.labTexts),
    botch: (EXPERIMENT.botch + EXPERIMENT.extraBotch * extra) * botchMult(modifiers(s)),
    discovery: EXPERIMENT.discovery,
  };
}

export interface Rates {
  net: Record<GoodId, number>;
  byBuilding: Partial<Record<BuildingId, Cost>>;
  zones: Record<ZoneId, { made: number; capacity: number; factor: number; strike: boolean }>;
  /** Notice generated per minute. */
  noticeGen: number;
  /** Stone and Vis heading to the Gate per second, and Insight poured into it. */
  gate: { stone: number; vis: number; insight: number };
}

/** Every per-second rate in the game, computed in one place. The UI shows exactly what tick() applies. */
export function rates(s: State): Rates {
  const mods = modifiers(s);
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
    const uses: Cost = def.uses ?? {};
    const fed = keys(uses).every((g) => s.res[g] > 0);
    const w = fed ? Math.min(s.buildings[id]?.workers ?? 0, workerSlots(s, id)) : 0;
    for (const g of keys(uses)) net[g] -= w * (uses[g] ?? 0);
    const fuelled = !!def.fuel && s.res.bread > 0;
    if (fuelled) net.bread -= w * (def.fuel ?? 0);
    const out: Cost = {};
    for (const g of keys(pw)) {
      out[g] = w * (pw[g] ?? 0) * (fuelled ? FUEL_MULT : 1) * outputMult(s, mods, id, g);
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
  const reserve = s.keepSalt ? cap(s, 'salt', mods) : 0;
  if (net.salt > 0 && s.res.salt >= reserve - 1e-9) {
    net.silver += net.salt * SALT_PRICE;
    net.salt = 0;
  }
  if (s.gate) gate.stone = s.gate.porters * ZONES.marsh.carry * carryMult(mods, 'marsh');
  const levers = NOTICE.endow.gen * s.endowments + NOTICE.alms.gen * s.alms;
  const gen = Math.max(0, (NOTICE_K * noticeSum - levers) * noticeMult(mods));
  return { net, byBuilding, zones, noticeGen: gen, gate };
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
    s.devices[e.target] = (s.devices[e.target] ?? 0) + (discovery ? 2 : 1);
    log(s, `${name} enchants a device for the ${B[e.target].name}${discovery ? ', and it works twice as well' : ''}.`);
  }
}

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
    case 'noHands':
      return s.hands <= 0;
    case 'insightMade':
      return s.stats.insightMade >= c.atLeast;
    case 'researched':
      return keys(s.research).length >= c.atLeast;
    case 'rites':
      return (s.gate?.rites ?? 0) >= c.atLeast;
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
    if (!s.magi.some((x) => x.id === m)) s.magi.push({ id: m, lt: 10, sanctum: false, exp: null });
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
  s.stats.peakNotice = Math.max(s.stats.peakNotice, s.notice);
  checkOutcome(s);
  if (s.outcome) return;
  checkNotice(s);
  checkIns(s);
  checkUnlocks(s);
  startStory(s);
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
    else if (e.kind === 'unlock') reveal(s, e.id);
    else if (e.kind === 'destroy') {
      const b = s.buildings[e.building];
      // A drained Vis site stays gone.
      if (isSite(e.building)) s.blocks[`build_${e.building}`] = Number.MAX_SAFE_INTEGER;
      if (!b) continue;
      b.count = Math.max(0, b.count - e.n);
      b.workers = Math.min(b.workers, workerSlots(s, e.building));
      if (b.count === 0) delete s.buildings[e.building];
    } else if (e.kind === 'endStrike') {
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
      if (!canAfford(s, c)) return 'Not enough';
      pay(s, c);
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
