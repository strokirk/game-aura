// All game data. Typed, checked by tsc; no runtime parsing.

export const GOODS = ['silver', 'stone', 'bread', 'vellum', 'vis', 'insight'] as const;
export type GoodId = (typeof GOODS)[number];
export type Cost = Partial<Record<GoodId, number>>;

export const GOOD_INFO: Record<GoodId, { name: string; cap: number }> = {
  silver: { name: 'Silver', cap: 500 },
  stone: { name: 'Stone', cap: 200 },
  bread: { name: 'Bread', cap: 200 },
  vellum: { name: 'Vellum', cap: 50 },
  vis: { name: 'Vis', cap: 30 },
  insight: { name: 'Insight', cap: 1000 },
};

export interface ZoneDef {
  name: string;
  noticeFactor: number;
  /** Goods per second one porter carries to the Hall; 0 = no porters needed. */
  carry: number;
  slots: number;
}
export const ZONES = {
  hearth: { name: 'Hearth', noticeFactor: 0.5, carry: 0, slots: 8 },
  bocage: { name: 'Bocage', noticeFactor: 1.5, carry: 1, slots: 12 },
  marsh: { name: 'Marsh', noticeFactor: 0.5, carry: 0.5, slots: 10 },
} as const satisfies Record<string, ZoneDef>;
export type ZoneId = keyof typeof ZONES;

export interface BuildingDef {
  name: string;
  zone: ZoneId;
  cost: Cost;
  slots: number;
  perWorker?: Cost;
  housing?: number;
  /** At most this many. Named sites (the Vis sources) are max 1 and don't use zone slots. */
  max?: number;
  site?: boolean;
  blurb: string;
}
const visSite = (name: string, blurb: string): BuildingDef => ({
  name,
  zone: 'marsh',
  cost: { silver: 40 },
  slots: 2,
  perWorker: { vis: 0.08 },
  max: 1,
  site: true,
  blurb,
});
export const BUILDINGS = {
  salt_pan: {
    name: 'Salt-works',
    zone: 'marsh',
    cost: { silver: 20 },
    slots: 2,
    perWorker: { silver: 0.25 },
    blurb: 'Salt-sand boiled to salt, sold at the Hall.',
  },
  tide_pool: visSite('The Tide Pool', 'A pool on the flats that never quite drains. Its water holds vis.'),
  knights_barrow: visSite(
    "The Drowned Knight's Barrow",
    'A mound the tide covers twice a day. Vis gathers in the stones.',
  ),
  regio_spring: visSite('The Regio Spring', 'A spring that runs warm in winter.'),
  farm: {
    name: 'Farm',
    zone: 'bocage',
    cost: { silver: 20 },
    slots: 2,
    perWorker: { bread: 0.2 },
    blurb: 'Hedged fields and an oven.',
  },
  parchmenter: {
    name: 'Parchmenter',
    zone: 'bocage',
    cost: { silver: 30 },
    slots: 1,
    perWorker: { vellum: 0.15 },
    blurb: 'Calfskin, lime and a knife.',
  },
  quarry: {
    name: 'Quarry',
    zone: 'hearth',
    cost: { silver: 40 },
    slots: 2,
    perWorker: { stone: 0.25 },
    blurb: 'Granite from the flank of Mont-Dol.',
  },
  sanctum: {
    name: 'Sanctum',
    zone: 'hearth',
    cost: { silver: 100, stone: 50 },
    slots: 2,
    max: 3,
    blurb: "A magus's laboratory. Each assistant speeds its research by 25%.",
  },
  eel_weir: {
    name: 'Eel Weir',
    zone: 'marsh',
    cost: { silver: 15 },
    slots: 1,
    perWorker: { bread: 0.3 },
    blurb: 'Stakes and wattle across the channel below the Tide Pool. The eels grow bigger every year.',
  },
  cottage: {
    name: 'Cottage',
    zone: 'hearth',
    cost: { silver: 30 },
    slots: 0,
    housing: 3,
    blurb: 'Room for three more hands.',
  },
} as const satisfies Record<string, BuildingDef>;
export type BuildingId = keyof typeof BUILDINGS;
/** BUILDINGS widened to BuildingDef, so optional fields read without casts. */
export const DEFS: Record<BuildingId, BuildingDef> = BUILDINGS;

export const HALL_HOUSING = 8;
export const HAND_FOOD = 0.05; // Bread per hand per second
export const COST_GROWTH = 1.15;
export const NOTICE_K = 0.35;
export const SANCTUM_ASSIST = 0.25;
export const BASELINE_INSIGHT = 0.02; // per LT per second

export const MAGI = [
  { id: 'aldric', name: 'Aldric' },
  { id: 'sabine', name: 'Sabine' },
  { id: 'herve', name: 'Hervé' },
] as const;
export type MagusId = (typeof MAGI)[number]['id'];

export interface RecipeDef {
  name: string;
  cost: Cost;
  time: number;
  /** Insight per point of Lab Total. */
  insightPerLT: number;
  blurb: string;
}
export const RECIPES = {
  study_vis: {
    name: 'Study the Vis',
    cost: { vis: 5 },
    time: 60,
    insightPerLT: 15,
    blurb: 'Burn a measure of raw vis and write down what it does.',
  },
} as const satisfies Record<string, RecipeDef>;
export type RecipeId = keyof typeof RECIPES;

export const EXPERIMENT = {
  maxExtraVis: 5,
  extraTime: -0.1,
  extraYield: 0.15,
  extraBotch: 0.02,
  botch: 0.05,
  discovery: 0.05,
  botchNotice: 5,
};

/** What choices, research and traits do. Ink tags parse into these (`docs/design/stories.md`). */
export type Effect =
  | { kind: 'res'; good: GoodId; n: number; perSecond?: boolean }
  | { kind: 'notice'; n: number }
  /** Multiplies `good` output of building `id`, or of every building if `id` isn't a building. secs 0 = forever. */
  | { kind: 'mod'; id: string; good: GoodId; mult: number; secs: number }
  /** Blocks an action key such as `experiment:aldric`, `experiment:all` or `build_salt_pan`. */
  | { kind: 'block'; what: string; secs: number }
  | { kind: 'unlock'; id: string };

export interface EventDef {
  title: string;
  text: string;
  options: readonly { label: string; effects: readonly Effect[] }[];
  /** An ink knot waiting for its choice; its effects come from the tags after the choice. */
  knot?: string;
}

/** An ink knot the engine plays once, as an event card, when its condition is first met. */
export interface StoryBeat {
  knot: string;
  title: string;
  when: Condition;
}

export type Condition =
  | { kind: 'res'; good: GoodId; atLeast: number }
  | { kind: 'time'; atLeast: number }
  | { kind: 'notice'; atLeast: number };

export interface ScenarioDef {
  name: string;
  goal: string;
  start: {
    res: Cost;
    hands: number;
    buildings: Partial<Record<BuildingId, { count: number; workers: number }>>;
    porters: Partial<Record<ZoneId, number>>;
    magi: readonly { id: MagusId; sanctum: boolean }[];
  };
  allowed: readonly BuildingId[];
  win: readonly { when: Condition; cause: string }[];
  loss: readonly { when: Condition; cause: string }[];
  intro?: EventDef;
  story?: readonly StoryBeat[];
}

export const YEAR = 120;
export const START_YEAR = 1220;

export const SCENARIOS = {
  trial: {
    name: 'Trial of the Tide Pool',
    goal: 'Gather 500 Insight before 1222',
    start: {
      res: { silver: 60, bread: 60, vis: 5 },
      hands: 4,
      buildings: {
        sanctum: { count: 1, workers: 0 },
        salt_pan: { count: 1, workers: 1 },
        tide_pool: { count: 1, workers: 1 },
      },
      porters: { marsh: 1 },
      magi: [{ id: 'aldric', sanctum: true }],
    },
    allowed: ['salt_pan', 'tide_pool', 'knights_barrow'],
    win: [
      {
        when: { kind: 'res', good: 'insight', atLeast: 500 },
        cause: 'Aldric fills a book with what the Tide Pool knows.',
      },
    ],
    loss: [
      { when: { kind: 'notice', atLeast: 50 }, cause: 'The Order takes Notice.' },
      { when: { kind: 'time', atLeast: 2 * YEAR }, cause: 'The year 1222 begins, and the book is still thin.' },
    ],
    intro: {
      title: 'Spring 1220',
      text: 'Aldric has a tower on Mont-Dol, four hands, a salt-works on the flats and a pool the tide never empties. The pool holds vis. Burn it in the lab and write down what it does. Five hundred pages of Insight by 1222 and the Order will take the covenant seriously.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: [
      { knot: 'eels_1_first_catch', title: 'The eel rent', when: { kind: 'time', atLeast: 60 } },
      { knot: 'eels_2_the_weir', title: 'The weir', when: { kind: 'time', atLeast: YEAR } },
    ],
  },
} as const satisfies Record<string, ScenarioDef>;
export type ScenarioId = keyof typeof SCENARIOS;
