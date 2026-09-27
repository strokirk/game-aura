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
  /** Raises storage caps, per building. */
  caps?: Cost;
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
  storehouse: {
    name: 'Storehouse',
    zone: 'hearth',
    cost: { silver: 50, stone: 20 },
    slots: 0,
    caps: { stone: 100, bread: 100, vellum: 25 },
    blurb: 'A dry stone barn. More Stone, Bread and Vellum can wait here.',
  },
  library: {
    name: 'Library',
    zone: 'hearth',
    cost: { silver: 40, vellum: 20 },
    slots: 0,
    caps: { insight: 500 },
    blurb: 'Shelves, a lectern and a chain for every book. Room for more Insight.',
  },
  cottage: {
    name: 'Cottage',
    zone: 'bocage',
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
  /** What a success gives: Insight (per point of Lab Total), a Lab Text, or a Device for a chosen building. */
  result: 'insight' | 'labText' | 'device';
  insightPerLT?: number;
  blurb: string;
}
export const RECIPES = {
  study_vis: {
    name: 'Study the Vis',
    cost: { vis: 5 },
    time: 60,
    result: 'insight',
    insightPerLT: 15,
    blurb: 'Burn a measure of raw vis and write down what it does.',
  },
  lab_text: {
    name: 'Write a Lab Text',
    cost: { vellum: 20 },
    time: 180,
    result: 'labText',
    blurb:
      'Copy out what the lab has learned, so the next experiment starts further along. +10% to all experiment yields, for good.',
  },
  device: {
    name: 'Enchant a Device',
    cost: { vis: 10, stone: 50 },
    time: 240,
    result: 'device',
    blurb: 'Bind a Rego Terram effect into a tool. +25% output for one kind of building, for good.',
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
  /** The halfway check-in, for experiments of at least this many seconds. */
  checkInAt: 120,
  pushYield: 0.3,
  pushBotch: 0.1,
  labText: 0.1,
  device: 0.25,
};

/** Research and other permanent bonuses, all applied in one place (`rates()`). */
export type Modifier =
  | { kind: 'output'; building: BuildingId; mult: number }
  | { kind: 'carry'; zone?: ZoneId; mult: number }
  | { kind: 'cap'; good: GoodId; mult?: number; add?: number }
  | { kind: 'botch'; mult: number }
  | { kind: 'assistants'; add: number }
  | { kind: 'zoneNotice'; zone: ZoneId; factor: number }
  | { kind: 'baseline'; mult: number }
  | { kind: 'noticeGen'; mult: number }
  | { kind: 'reveal'; id: string };

export interface ResearchDef {
  name: string;
  cost: Cost;
  effects: readonly Modifier[];
  /** Repeatable research doubles its cost each time. */
  repeatable?: boolean;
  blurb: string;
}
/** In the order the Research tab reveals them. */
export const RESEARCH = {
  salt_rakes: {
    name: 'Salt Rakes',
    cost: { insight: 50 },
    effects: [{ kind: 'output', building: 'salt_pan', mult: 1.5 }],
    blurb: 'Salt-works ×1.5. Rakes that find the saltiest sand.',
  },
  plough: {
    name: 'Self-Tilling Plough',
    cost: { insight: 120 },
    effects: [{ kind: 'output', building: 'farm', mult: 2 }],
    blurb: 'Farms ×2. It turns the furrow, the hands walk behind.',
  },
  mule_trains: {
    name: 'Mule Trains',
    cost: { insight: 250 },
    effects: [{ kind: 'carry', mult: 2 }],
    blurb: 'Porters carry ×2.',
  },
  accounts: {
    name: 'Hermetic Accounts',
    cost: { insight: 300 },
    effects: [{ kind: 'cap', good: 'silver', mult: 2 }],
    blurb: 'Silver storage ×2. Double-entry, and a lock on the chest.',
  },
  strongbox: {
    name: 'Strongbox',
    cost: { insight: 400 },
    effects: [{ kind: 'cap', good: 'silver', add: 500 }],
    repeatable: true,
    blurb: 'Silver storage +500. Can be bought again, at double the price.',
  },
  reed_pen: {
    name: 'Reed Pen of Diligent Copying',
    cost: { insight: 500 },
    effects: [{ kind: 'output', building: 'parchmenter', mult: 2 }],
    blurb: 'Parchmenters ×2.',
  },
  notebooks: {
    name: 'Lab Notebooks',
    cost: { insight: 600 },
    effects: [{ kind: 'botch', mult: 0.5 }],
    blurb: 'Botch chance halved. Write it down before you burn it.',
  },
  apprentice_rooms: {
    name: 'Apprentice Rooms',
    cost: { insight: 800 },
    effects: [{ kind: 'assistants', add: 1 }],
    blurb: '+1 assistant in every Sanctum.',
  },
  lead_chests: {
    name: 'Lead-Lined Chests',
    cost: { insight: 900 },
    effects: [{ kind: 'cap', good: 'vis', add: 30 }],
    blurb: 'Vis storage +30.',
  },
  stones_carry: {
    name: 'Stones That Carry',
    cost: { insight: 1500 },
    effects: [{ kind: 'carry', zone: 'marsh', mult: 3 }],
    blurb: 'Marsh porters ×3. Rego Terram in the paving of the causeway.',
  },
  aegis: {
    name: 'Aegis of the Hearth',
    cost: { insight: 2000, vis: 20 },
    effects: [
      { kind: 'zoneNotice', zone: 'hearth', factor: 0 },
      { kind: 'baseline', mult: 1.25 },
      { kind: 'reveal', id: 'gate' },
    ],
    blurb: 'The Hearth draws no Notice; baseline Insight ×1.25; the Drowned Gate can be found.',
  },
  marsh_mist: {
    name: 'Marsh Mist',
    cost: { insight: 2500, vis: 10 },
    effects: [{ kind: 'noticeGen', mult: 0.6 }],
    blurb: 'All Notice ×0.6. The flats are hard to see from Dol most mornings.',
  },
} as const satisfies Record<string, ResearchDef>;
export type ResearchId = keyof typeof RESEARCH;
export const RESEARCH_DEFS: Record<ResearchId, ResearchDef> = RESEARCH;
/** How many unbought items the Research tab shows at once. */
export const RESEARCH_SHOWN = 3;

/** Notice events, fired when Notice rises past them and re-armed once it falls 5 below (`notice.md`). */
export const NOTICE = {
  rearm: 5,
  tax: { at: 50, share: 0.1 },
  strike: { at: 75, secs: 60, payShare: 0.05 },
  audit: { at: 90 },
  endow: { base: 500, growth: 2, gen: 1 },
  bribe: { base: 100, growth: 2, notice: 20 },
};

export interface GateStart {
  stone: number;
  raised: boolean;
  insight: number;
  pour: boolean;
  visToGate: boolean;
  porters: number;
  rites: number;
}

/** The Drowned Gate (`gate.md`). */
export const GATE = {
  found: { silver: 200, stone: 100 } as Cost,
  raise: 1500,
  stonePerS: 4,
  visPerS: 0.3,
  window: 60,
  rites: [
    { name: 'The Bells Beneath the Tide', insight: 20000 },
    { name: 'The Knight Unburied', insight: 25000 },
    { name: 'The Tide Stands Still', insight: 30000 },
  ],
};

/** What choices, research and traits do. Ink tags parse into these (`docs/design/stories.md`). */
export type Effect =
  | { kind: 'res'; good: GoodId; n: number; perSecond?: boolean }
  | { kind: 'notice'; n: number }
  /** Multiplies `good` output of building `id`, or of every building if `id` isn't a building. secs 0 = forever. */
  | { kind: 'mod'; id: string; good: GoodId; mult: number; secs: number }
  /** Blocks an action key such as `experiment:aldric`, `experiment:all` or `build_salt_pan`. */
  | { kind: 'block'; what: string; secs: number }
  | { kind: 'unlock'; id: string }
  /** Removes n buildings; their workers go idle. A Vis site removed this way can't be worked again. */
  | { kind: 'destroy'; building: BuildingId; n: number }
  /** The halfway check-in's answer for a running experiment. */
  | { kind: 'checkIn'; magus: MagusId; choice: 'push' | 'steady' | 'abort' }
  /** Ends a strike at once. */
  | { kind: 'endStrike' };

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
  /** Stock below this share of its cap. */
  | { kind: 'below'; good: GoodId; share: number }
  | { kind: 'time'; atLeast: number }
  | { kind: 'notice'; atLeast: number }
  | { kind: 'hands'; atLeast: number }
  | { kind: 'noHands' }
  | { kind: 'insightMade'; atLeast: number }
  | { kind: 'researched'; atLeast: number }
  | { kind: 'rites'; atLeast: number }
  /** An ink variable the engine reads back (`stories.md`). */
  | { kind: 'story'; v: StoryVar; atLeast?: number; atMost?: number }
  /** The year is at least `years` after the year held in an ink variable. */
  | { kind: 'yearsAfter'; v: StoryVar; years: number }
  | { kind: 'all'; of: readonly Condition[] };

/** The whitelist of ink variables the engine reads back. */
export type StoryVar = 'eel_level' | 'eels_state' | 'eels_end_year';

/** Something the scenario reveals when its condition is first met: buildings, recipes, tabs, magi. */
export interface UnlockDef {
  when: Condition;
  /** Building ids, `recipe:<id>`, `magus:<id>`, or a feature: `research`, `notice`, `endow`, `gate`. */
  reveal: readonly string[];
  card?: { title: string; text: string };
}

export interface ScenarioDef {
  name: string;
  goal: string;
  start: {
    res: Cost;
    hands: number;
    buildings: Partial<Record<BuildingId, { count: number; workers: number }>>;
    porters: Partial<Record<ZoneId, number>>;
    magi: readonly { id: MagusId; sanctum: boolean; lt?: number }[];
    /** Stage scenarios start partway through a run, with the covenant already built up. */
    t?: number;
    notice?: number;
    endowments?: number;
    research?: Partial<Record<ResearchId, number>>;
    labTexts?: number;
    devices?: Partial<Record<BuildingId, number>>;
    gate?: GateStart;
  };
  /** A stage scenario: a test bed for one stage of the full run, listed apart on the title screen. */
  stage?: boolean;
  allowed: readonly BuildingId[];
  /** Revealed from the start: recipes and features (see UnlockDef). */
  unlocked: readonly string[];
  unlocks?: readonly UnlockDef[];
  win: readonly { when: Condition; cause: string }[];
  loss: readonly { when: Condition; cause: string }[];
  intro?: EventDef;
  story?: readonly StoryBeat[];
}

export const YEAR = 120;
export const START_YEAR = 1220;

const inYear = (y: number): Condition => ({ kind: 'time', atLeast: (y - START_YEAR) * YEAR });
/** A beat that plays in year `y` or later while the eels thread is open. */
const open = (knot: string, title: string, y: number): StoryBeat => ({
  knot,
  title,
  when: { kind: 'all', of: [inYear(y), { kind: 'story', v: 'eels_state', atMost: 0 }] },
});
/** The eels thread (`docs/ink/eels-notes.md`). The wyrm (`eels_9_the_wyrm`) waits on Sanctum traits. */
const EELS: readonly StoryBeat[] = [
  { knot: 'eels_1_first_catch', title: 'The eel rent', when: { kind: 'time', atLeast: 60 } },
  { knot: 'eels_2_the_weir', title: 'The weir', when: inYear(1221) },
  open('eels_3_the_font', 'The font', 1224),
  open('eels_4_the_pits', 'Eels in the brine', 1229),
  open('eels_5_the_road', 'The Dol road', 1235),
  open('eels_6_spring_tide', 'The spring tide', 1241),
  open('eels_7_flood', 'The flood', 1245),
  {
    knot: 'eels_8_rent',
    title: 'The eel rent',
    when: {
      kind: 'all',
      of: [
        { kind: 'story', v: 'eels_state', atLeast: 1 },
        { kind: 'yearsAfter', v: 'eels_end_year', years: 3 },
      ],
    },
  },
];

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
    unlocked: ['notice'],
    win: [
      {
        when: { kind: 'res', good: 'insight', atLeast: 500 },
        cause: 'Aldric fills a book with what the Tide Pool knows.',
      },
    ],
    loss: [
      { when: { kind: 'notice', atLeast: 50 }, cause: 'The Order takes Notice.' },
      { when: { kind: 'noHands' }, cause: 'The last hand walks down to Dol. Nobody is left to carry the vis.' },
      { when: { kind: 'time', atLeast: 2 * YEAR }, cause: 'The year 1222 begins, and the book is still thin.' },
    ],
    intro: {
      title: 'Spring 1220',
      text: 'Aldric has a tower on Mont-Dol, four hands, a salt-works on the flats and a pool the tide never empties. The pool holds vis. Burn it in the lab and write down what it does. Five hundred pages of Insight by 1222 and the Order will take the covenant seriously.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: EELS,
  },
  grow: {
    name: 'The Covenant Must Grow',
    goal: 'Perform the three Rites of the Drowned Gate before 1260',
    start: {
      res: { silver: 60, bread: 150, vis: 5 },
      hands: 6,
      buildings: {
        sanctum: { count: 1, workers: 0 },
        salt_pan: { count: 1, workers: 1 },
        tide_pool: { count: 1, workers: 1 },
      },
      porters: { marsh: 1 },
      magi: [{ id: 'aldric', sanctum: true }],
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum'],
    unlocked: [],
    unlocks: [
      { when: { kind: 'insightMade', atLeast: 1 }, reveal: ['research'] },
      {
        when: { kind: 'below', good: 'bread', share: 0.5 },
        reveal: ['farm', 'cottage'],
        card: {
          title: 'The hands are hungry',
          text: 'The cook has started counting loaves. Beyond the hedges of the Bocage there is land for Farms, and room for Cottages. Every hand eats Bread, and every hand you house will want more.',
        },
      },
      {
        when: { kind: 'researched', atLeast: 1 },
        reveal: ['quarry', 'storehouse', 'knights_barrow', 'recipe:device'],
        card: {
          title: 'Granite and barrows',
          text: 'Mont-Dol is granite to the root. Quarry it for Stone: Sanctums, Storehouses and one day greater things are built of it. Out on the flats the hands have found a second place where vis gathers: the Drowned Knight’s Barrow.',
        },
      },
      {
        when: { kind: 'hands', atLeast: 10 },
        reveal: ['parchmenter', 'library', 'regio_spring', 'recipe:lab_text', 'magus:sabine', 'magus:herve'],
        card: {
          title: 'Two more magi',
          text: 'Word has reached the Order that Mont-Dol can feed a covenant. Sabine and Hervé arrive with their books in a cart. Each needs a Sanctum before they can work. They know of a third vis source, the Regio Spring, and they want Vellum for Lab Texts.',
        },
      },
      { when: { kind: 'notice', atLeast: 1 }, reveal: ['notice'] },
      {
        when: { kind: 'time', atLeast: 6 * YEAR },
        reveal: ['endow'],
        card: {
          title: 'Friends in Dol',
          text: 'The parish would take an Endowment, and the lord of Dol a gift. Endowing calms the covenant’s Notice for good; a bribe buys quiet for a few years.',
        },
      },
    ],
    win: [
      {
        when: { kind: 'rites', atLeast: 3 },
        cause: 'The tide stands still, and the Drowned Gate opens.',
      },
    ],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noHands' }, cause: 'The last hand walks down to Dol. The magi cannot live on Insight.' },
      { when: { kind: 'time', atLeast: 40 * YEAR }, cause: 'The year 1260 begins, and the Gate stays shut.' },
    ],
    intro: {
      title: 'Spring 1220',
      text: 'Aldric has a tower on Mont-Dol, six hands, a salt-works and the Tide Pool. Under the marsh lies a drowned regio, and a Gate into it. Open it before 1260. Every building will be noticed in Dol, and the Order watches what Dol notices.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: EELS,
  },
  middle: {
    name: 'Stage: the Middle Years',
    goal: 'Perform the three Rites of the Drowned Gate before 1260',
    stage: true,
    start: {
      t: 16 * YEAR,
      res: { silver: 600, stone: 150, bread: 150, vellum: 30, vis: 20, insight: 800 },
      hands: 26,
      buildings: {
        sanctum: { count: 3, workers: 2 },
        library: { count: 1, workers: 0 },
        storehouse: { count: 1, workers: 0 },
        quarry: { count: 2, workers: 3 },
        salt_pan: { count: 6, workers: 5 },
        tide_pool: { count: 1, workers: 2 },
        knights_barrow: { count: 1, workers: 2 },
        regio_spring: { count: 1, workers: 1 },
        farm: { count: 3, workers: 4 },
        parchmenter: { count: 2, workers: 2 },
        cottage: { count: 6, workers: 0 },
      },
      porters: { marsh: 3, bocage: 2 },
      magi: [
        { id: 'aldric', sanctum: true, lt: 14 },
        { id: 'sabine', sanctum: true, lt: 12 },
        { id: 'herve', sanctum: true, lt: 12 },
      ],
      notice: 45,
      endowments: 2,
      research: { salt_rakes: 1, plough: 1, mule_trains: 1, accounts: 1, strongbox: 1, reed_pen: 1, notebooks: 1 },
      labTexts: 2,
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum'],
    unlocked: [
      'research',
      'notice',
      'endow',
      'farm',
      'cottage',
      'quarry',
      'storehouse',
      'knights_barrow',
      'parchmenter',
      'library',
      'regio_spring',
      'recipe:device',
      'recipe:lab_text',
      'magus:sabine',
      'magus:herve',
    ],
    win: [{ when: { kind: 'rites', atLeast: 3 }, cause: 'The tide stands still, and the Drowned Gate opens.' }],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noHands' }, cause: 'The last hand walks down to Dol. The magi cannot live on Insight.' },
      { when: { kind: 'time', atLeast: 40 * YEAR }, cause: 'The year 1260 begins, and the Gate stays shut.' },
    ],
    intro: {
      title: 'Spring 1236',
      text: 'Sixteen years on. Three magi, twenty-six hands, six salt-works and three sources of vis. Dol has noticed: Notice is climbing toward the lord’s tax and settling well above it. The Aegis of the Hearth is still to be learned, and the Drowned Gate still to be found.',
      options: [{ label: 'Begin', effects: [] }],
    },
  },
  gate: {
    name: 'Stage: the Gate',
    goal: 'Perform the three Rites of the Drowned Gate before 1260',
    stage: true,
    start: {
      t: 30 * YEAR,
      res: { silver: 1200, stone: 150, bread: 150, vellum: 40, vis: 30, insight: 1500 },
      hands: 30,
      buildings: {
        sanctum: { count: 3, workers: 2 },
        library: { count: 3, workers: 0 },
        quarry: { count: 2, workers: 4 },
        salt_pan: { count: 8, workers: 5 },
        tide_pool: { count: 1, workers: 2 },
        knights_barrow: { count: 1, workers: 2 },
        regio_spring: { count: 1, workers: 2 },
        farm: { count: 3, workers: 5 },
        parchmenter: { count: 1, workers: 1 },
        cottage: { count: 8, workers: 0 },
      },
      porters: { marsh: 1, bocage: 2 },
      magi: [
        { id: 'aldric', sanctum: true, lt: 18 },
        { id: 'sabine', sanctum: true, lt: 17 },
        { id: 'herve', sanctum: true, lt: 16 },
      ],
      notice: 60,
      endowments: 1,
      research: {
        salt_rakes: 1,
        plough: 1,
        mule_trains: 1,
        accounts: 1,
        strongbox: 1,
        reed_pen: 1,
        notebooks: 1,
        apprentice_rooms: 1,
        lead_chests: 1,
        stones_carry: 1,
        aegis: 1,
        marsh_mist: 1,
      },
      labTexts: 6,
      devices: { quarry: 8 },
      gate: { stone: 1500, raised: true, insight: 12000, pour: true, visToGate: false, porters: 3, rites: 0 },
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum'],
    unlocked: [
      'research',
      'notice',
      'endow',
      'farm',
      'cottage',
      'quarry',
      'storehouse',
      'knights_barrow',
      'parchmenter',
      'library',
      'regio_spring',
      'recipe:device',
      'recipe:lab_text',
      'magus:sabine',
      'magus:herve',
      'gate',
    ],
    win: [{ when: { kind: 'rites', atLeast: 3 }, cause: 'The tide stands still, and the Drowned Gate opens.' }],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noHands' }, cause: 'The last hand walks down to Dol. The magi cannot live on Insight.' },
      { when: { kind: 'time', atLeast: 40 * YEAR }, cause: 'The year 1260 begins, and the Gate stays shut.' },
    ],
    intro: {
      title: 'Spring 1250',
      text: 'Ten years left. The Gate stands in the marsh with twelve thousand pages of Insight poured into it, and the Order watches every cartload of Stone that goes out to it. The first Rite needs Stone and Vis flowing at once, every magus ready, and more Insight than the Gate holds yet.',
      options: [{ label: 'Begin', effects: [] }],
    },
  },
} as const satisfies Record<string, ScenarioDef>;
export type ScenarioId = keyof typeof SCENARIOS;
