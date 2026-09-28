// All game data. Typed, checked by tsc; no runtime parsing.

export const GOODS = ['silver', 'salt', 'stone', 'bread', 'eels', 'vellum', 'vis', 'bog_oak', 'insight'] as const;
export type GoodId = (typeof GOODS)[number];
export type Cost = Partial<Record<GoodId, number>>;

export const GOOD_INFO: Record<GoodId, { name: string; cap: number }> = {
  silver: { name: 'Silver', cap: 500 },
  salt: { name: 'Salt', cap: 500 },
  stone: { name: 'Stone', cap: 200 },
  bread: { name: 'Bread', cap: 200 },
  eels: { name: 'Eels', cap: 200 },
  vellum: { name: 'Vellum', cap: 50 },
  vis: { name: 'Vis', cap: 30 },
  bog_oak: { name: 'Bog-oak', cap: 200 },
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
  /** Land won from the sea: every dike adds slots (DIKE). */
  polder: { name: 'Polder', noticeFactor: 1, carry: 1, slots: 0 },
  /** The drowned forest, risen at the first bell (BELL_EFFECTS). Worked only at low tide. */
  scissy: { name: 'Scissy', noticeFactor: 0.5, carry: 1, slots: 0 },
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
  /** Bread each worker burns per second for FUEL_MULT output: hard work needs calories. */
  fuel?: number;
  /** Goods each worker consumes per second. The building stands idle while any of them is out of stock. */
  uses?: Cost;
  /** Goods whose storage cap each one of these multiplies by STORE_MULT. */
  stores?: readonly GoodId[];
  /** Takes no plot in its zone (storage is dug into the hill). */
  noPlot?: boolean;
  /** Notice factor in place of its zone's (Cottages are quiet anywhere). */
  notice?: number;
  /** Cost growth per building owned, if not COST_GROWTH. */
  growth?: number;
  blurb: string;
}
/** Each Storehouse or Library multiplies the caps it covers by this: storage outgrows its ×1.15 price. */
export const STORE_MULT = 1.25;
/** Buying more land in a zone: +`slots` plots, the price ×`growth` per purchase in that zone. */
export const EXPAND = { cost: { silver: 60, stone: 20 } as Cost, growth: 1.2, slots: 3 };
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
    perWorker: { salt: 0.25 },
    fuel: 0.05,
    blurb: 'Salt-sand boiled to salt. The Hall sells it for Silver, or keeps it to preserve food.',
  },
  tide_pool: visSite('The Tide Pool', 'A pool on the flats that never quite drains. Its water holds vis.'),
  knights_barrow: visSite(
    "The Drowned Knight's Barrow",
    'A mound the tide covers twice a day. Vis gathers in the stones.',
  ),
  regio_spring: visSite('The Regio Spring', 'A spring that runs warm in winter.'),
  wormwood: {
    ...visSite('Wormwood', 'A fallen star in the marsh, still ringing. The water round it is bitter, and full of vis.'),
    perWorker: { vis: 0.24 },
  },
  bog_camp: {
    name: 'Bog-oak Camp',
    zone: 'scissy',
    cost: { silver: 60, stone: 30 },
    slots: 3,
    perWorker: { bog_oak: 0.1 },
    blurb:
      'Saws and sledges among the drowned stumps of Scissy. Black oak that never rots. Only while the tide is out.',
  },
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
    fuel: 0.05,
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
    perWorker: { eels: 0.3 },
    blurb:
      'Stakes and wattle across a channel on the flats. Eels pay the rent here: every family that comes up the hill costs a few.',
  },
  storehouse: {
    name: 'Storehouse',
    zone: 'hearth',
    cost: { silver: 50, stone: 20 },
    slots: 0,
    stores: ['silver', 'salt', 'stone', 'bread', 'eels', 'vellum', 'bog_oak'],
    noPlot: true,
    blurb: 'A dry stone barn with a strongroom. Every mundane good: storage ×1.25 for each one.',
  },
  library: {
    name: 'Library',
    zone: 'hearth',
    cost: { silver: 40, vellum: 20 },
    slots: 0,
    stores: ['insight', 'vis'],
    noPlot: true,
    blurb:
      'Shelves, a lectern, a chain for every book and a lead-lined chest. Insight and Vis storage ×1.25 for each one.',
  },
  salt_meadow: {
    name: 'Salt Meadow',
    zone: 'polder',
    cost: { silver: 30 },
    slots: 2,
    perWorker: { bread: 0.1, vellum: 0.05 },
    blurb: 'Sheep on the salt grass inside the dike. Mutton for the table, and skins for Vellum.',
  },
  hostel: {
    name: "Pilgrims' Hostel",
    zone: 'bocage',
    cost: { silver: 40, stone: 20 },
    slots: 1,
    uses: { bread: 0.5 },
    perWorker: { silver: 1 },
    blurb: 'Bread and a roof for the miquelots on their way across the bay to Mont-Saint-Michel. They pay in Silver.',
  },
  cottage: {
    name: 'Cottage',
    zone: 'bocage',
    cost: { silver: 30 },
    slots: 0,
    housing: 3,
    notice: 0.25,
    growth: 1.06,
    blurb: 'Room for three more hands.',
  },
} as const satisfies Record<string, BuildingDef>;
export type BuildingId = keyof typeof BUILDINGS;
/** BUILDINGS widened to BuildingDef, so optional fields read without casts. */
export const DEFS: Record<BuildingId, BuildingDef> = BUILDINGS;

export const HALL_HOUSING = 8;
/** Output of a fuelled building (Salt-works, Quarry) while there is Bread to burn. */
export const FUEL_MULT = 1.5;
/** A dike wins land from the sea: Polder slots, paid in Stone and in Bread for the diggers. */
export const DIKE = { cost: { stone: 80, bread: 80 } as Cost, growth: 1.2, slots: 3 };
/** Quarrying Mont-Dol cuts terraces: each opens a Hearth slot, after ever more Stone quarried. */
export const TERRACE = { first: 500, growth: 1.3, max: 20 };
/** Every this many Salt in stock raises the Bread and Eels caps by 1. */
export const PRESERVE = 5;
/** Silver per Salt sold at the Hall. */
export const SALT_PRICE = 1;
export const COST_GROWTH = 1.15;
export const NOTICE_K = 0.35;
export const SANCTUM_ASSIST = 0.25;
export const BASELINE_INSIGHT = 0.02; // per LT per second

/** The founders, with their ages in 1220. Each founder's place is a chair their successors inherit, name and all. */
export const MAGI = [
  { id: 'aldric', name: 'Aldric', age: 48 },
  { id: 'sabine', name: 'Sabine', age: 31 },
  { id: 'herve', name: 'Hervé', age: 39 },
  /** Risen at the fifth bell. Works from Ys: needs no Sanctum, and does not age. */
  { id: 'knight', name: 'The Drowned Knight', age: 0 },
] as const;
export type MagusId = (typeof MAGI)[number]['id'];

export interface RecipeDef {
  name: string;
  cost: Cost;
  time: number;
  /** What a success gives: Insight (per point of Lab Total), a Lab Text, or a Device for a chosen building. */
  result: 'insight' | 'labText' | 'device' | 'longevity';
  insightPerLT?: number;
  /** Devices a success adds (default 1). */
  power?: number;
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
  great_device: {
    name: 'Enchant a Great Device',
    cost: { vis: 20, bog_oak: 20 },
    time: 300,
    result: 'device',
    power: 4,
    blurb:
      'Bind a Rego Terram effect into a frame of bog-oak that will outlast the hill. +100% output for one kind of building, for good.',
  },
  longevity: {
    name: 'Longevity Ritual',
    cost: {},
    time: 240,
    result: 'longevity',
    blurb:
      'A Creo Corpus ritual against the years. Costs a fifth of the magus’s age in Vis, plus 5 per point of Decrepitude. Halves the chance of growing decrepit, for life. Once per magus.',
  },
} as const satisfies Record<string, RecipeDef>;
export type RecipeId = keyof typeof RECIPES;

/** Warping: every botch leaves a mark on the magus (`magi.md`, *Warping and Twilight*). */
export const WARP = {
  /** Each point of Warping adds this much to the Lab Total. */
  lt: 1,
  /** Chance of Twilight on a botch, per point of Warping. */
  twilight: 0.1,
  /** Seconds a magus spends in Twilight. */
  twilightSecs: 180,
  /** A Twilight trait lasts between these many seconds. */
  traitSecs: [300, 900] as const,
  /** Chance a botch also destroys one building. */
  destroy: 0.15,
};

/** What a magus brings back from Twilight, for a while. */
export interface TwilightTrait {
  name: string;
  text: string;
  /** This magus's experiment yield, time and botch chance. */
  yield?: number;
  time?: number;
  botch?: number;
  /** Output of one building type, covenant-wide. */
  building?: BuildingId;
  mult?: number;
}
export const TWILIGHT_TRAITS: readonly TwilightTrait[] = [
  { name: 'Tide-Sight', text: 'sees where the vis runs, like water under sand. Experiment yields ×1.5.', yield: 1.5 },
  {
    name: 'The Hours Fold',
    text: 'works as if the day had more hours in it. Experiments take ×0.6 the time.',
    time: 0.6,
  },
  {
    name: 'Hears the Bells',
    text: 'hears bells under the bay and cannot stop listening. Yields ×2, botch chance +10 points.',
    yield: 2,
    botch: 0.1,
  },
  {
    name: 'Stone-Speaker',
    text: 'talks to the granite, and it answers. Quarries ×1.5.',
    building: 'quarry',
    mult: 1.5,
  },
  {
    name: 'Salt in the Blood',
    text: 'can taste the brine from the tower. Salt-works ×1.5.',
    building: 'salt_pan',
    mult: 1.5,
  },
  {
    name: 'Drowned Eyes',
    text: 'came back with eyes like a drowned man’s, and the lab work suffers. Yields ×0.7.',
    yield: 0.7,
  },
];

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
  | { kind: 'cap'; good: GoodId; mult: number }
  | { kind: 'botch'; mult: number }
  | { kind: 'assistants'; add: number }
  | { kind: 'zoneNotice'; zone: ZoneId; factor: number }
  | { kind: 'baseline'; mult: number }
  | { kind: 'noticeGen'; mult: number }
  /** Experiment yields. */
  | { kind: 'yield'; mult: number }
  | { kind: 'reveal'; id: string };

export interface ResearchDef {
  name: string;
  cost: Cost;
  effects: readonly Modifier[];
  /** Repeatable research grows its cost by `growth` (default 2) each time. */
  repeatable?: boolean;
  growth?: number;
  /** Growth of costs other than Insight, if not `growth`. */
  goodsGrowth?: number;
  /** Paid every time, without growing. */
  flat?: Cost;
  /** Shown only once this feature is revealed (see UnlockDef), and always while it is. */
  needs?: string;
  blurb: string;
}
/** A Form tree: repeatable, its Insight ×2.5 and its good ×1.25 each time, revealed by the Aegis. */
function tree(art: string, good: Cost, effects: Modifier[], blurb: string): ResearchDef {
  return {
    name: `The ${art} tree`,
    cost: { insight: 2000, ...good },
    effects,
    repeatable: true,
    growth: 2.5,
    goodsGrowth: 1.25,
    needs: 'trees',
    blurb,
  };
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
  raise_aura: {
    name: 'Raise the Aura',
    cost: { insight: 300 },
    flat: { vis: 10 },
    effects: [],
    repeatable: true,
    growth: 1.8,
    needs: 'research',
    blurb:
      'Magic +1. Pour vis into the granite until the hill hums; in Dol the milk curdles and the villagers dream of bells. Notice +1 a minute, for good. Each raise costs ×1.8 the Insight.',
  },
  strongbox: {
    name: 'Strongbox',
    cost: { insight: 400 },
    effects: [{ kind: 'cap', good: 'silver', mult: 1.5 }],
    repeatable: true,
    blurb: 'Silver storage ×1.5. Can be bought again, at double the price.',
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
    effects: [{ kind: 'cap', good: 'vis', mult: 2 }],
    blurb: 'Vis storage ×2.',
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
      { kind: 'reveal', id: 'trees' },
    ],
    blurb:
      'The Hearth draws no Notice; baseline Insight ×1.25; the Drowned Gate can be found, and the Form trees open.',
  },
  marsh_mist: {
    name: 'Marsh Mist',
    cost: { insight: 2500, vis: 10 },
    effects: [{ kind: 'noticeGen', mult: 0.6 }],
    blurb: 'All Notice ×0.6. The flats are hard to see from Dol most mornings.',
  },
  // The Form trees: revealed by the Aegis, repeatable forever, each paid in Insight and its own good.
  terram: tree(
    'Terram',
    { stone: 100 },
    [
      { kind: 'output', building: 'quarry', mult: 1.5 },
      { kind: 'output', building: 'bog_camp', mult: 1.5 },
    ],
    'Quarries and Bog-oak Camps ×1.5. The Form of earth and stone.',
  ),
  aquam: tree(
    'Aquam',
    { salt: 100 },
    [
      { kind: 'output', building: 'salt_pan', mult: 1.5 },
      { kind: 'output', building: 'eel_weir', mult: 1.5 },
    ],
    'Salt-works and Eel Weirs ×1.5. The Form of water, brine and tide.',
  ),
  herbam: tree(
    'Herbam',
    { bread: 100 },
    [
      { kind: 'output', building: 'farm', mult: 1.5 },
      { kind: 'output', building: 'salt_meadow', mult: 1.5 },
      { kind: 'output', building: 'parchmenter', mult: 1.5 },
    ],
    'Farms, Salt Meadows and Parchmenters ×1.5. The Form of plants and all that grows.',
  ),
  vim: tree(
    'Vim',
    { vis: 20 },
    [
      { kind: 'yield', mult: 2 },
      { kind: 'output', building: 'tide_pool', mult: 1.25 },
      { kind: 'output', building: 'knights_barrow', mult: 1.25 },
      { kind: 'output', building: 'regio_spring', mult: 1.25 },
      { kind: 'output', building: 'wormwood', mult: 1.25 },
    ],
    'Experiment yields ×2, Vis sites ×1.25. The Form of magic itself.',
  ),
  mentem: {
    ...tree(
      'Mentem',
      { vellum: 30 },
      [
        { kind: 'baseline', mult: 2 },
        { kind: 'noticeGen', mult: 0.8 },
      ],
      'Reading ×2, Notice ×0.8. The Form of minds: yours, and Dol’s.',
    ),
    growth: 2,
  },
} as const satisfies Record<string, ResearchDef>;
export type ResearchId = keyof typeof RESEARCH | 'dig_library';
/** Shown only when fallen covenants buried Lab Texts. Its Insight is per buried text. */
export const DIG_LIBRARY: ResearchDef = {
  name: 'Dig Out the Old Library',
  cost: { insight: 100 },
  effects: [],
  blurb:
    'Under the hill lie the Lab Texts of every covenant that fell here. Dig them out, all of them, back onto the shelves.',
};
export const RESEARCH_DEFS: Record<ResearchId, ResearchDef> = { ...RESEARCH, dig_library: DIG_LIBRARY };
/** How many unbought items the Research tab shows at once. */
export const RESEARCH_SHOWN = 3;

/** Notice events, fired when Notice rises past them and re-armed once it falls 5 below (`notice.md`). */
export const NOTICE = {
  rearm: 5,
  tax: { at: 50, share: 0.1 },
  strike: { at: 75, secs: 60, payShare: 0.05 },
  audit: { at: 90 },
  endow: { base: 500, growth: 1.5, gen: 1 },
  /** A gift of eels to the monks of Mont-Saint-Michel: Bribe's twin in kind, Notice down at once. */
  gift: { base: 50, growth: 1.5, notice: 15 },
  /** Alms to the poor of Dol: Endow's Bread twin. */
  alms: { base: 100, growth: 1.5, gen: 1 },
  bribe: { base: 100, growth: 1.5, notice: 20 },
};

/** The aura (`aura.md`). Effective aura = Magic − Divine. */
export const AURA = {
  base: 3,
  /** Notice generation per minute, per Raise the Aura. */
  raiseNotice: 1,
  /** The friars bring the Dominion: Divine +1 every decade, until the Aegis holds them off. */
  friars: 10 * 120,
  /** Endowments per point of Divine. */
  endowments: 2,
  /** A bribe's Infernal stain lasts this long, and multiplies all output by `stain`. */
  stainSecs: 600,
  stain: 0.95,
  /** Lab Insight per point above 3 (a penalty below, down to the floor); then each boost from its level. */
  insight: 0.15,
  insightFloor: 0.25,
  speedFrom: 5,
  speed: 0.1,
  agingFrom: 6,
  aging: 0.1,
  discoveryFrom: 7,
  discovery: 0.01,
  visFrom: 8,
  vis: 0.1,
  ltFrom: 9,
};

/** Offerings at the Regio Spring (`aura.md`). */
export const FAERIE = {
  cost: 10,
  max: 5,
  /** Faerie falls by 1 after this long without an offering. */
  fade: 240,
  /** Each level adds this to Notice's decay per minute. */
  decay: 0.006,
  odds: { nothing: 0.5, more: 0.2, pleased: 0.2 },
  gift: { notice: 30, silver: 200 },
};

/** The eel rent: a new hand costs this many eels, where the scenario has `eelRent`. */
export const EEL_RENT = 10;

export const AGING = { from: 45, perYear: 0.03, longevity: 0.5, death: 5 };

export const APPRENTICE = {
  cost: { silver: 150 } as Cost,
  /** The boost to the master's Insight slides from `start` to `end` over `ramp` seconds. */
  start: -0.25,
  end: 0.25,
  ramp: 480,
  gauntlet: 720,
  botchDeath: 0.2,
  age: 25,
  lt: 8,
};

/** The Normandy Tribunal (`tribunal.md`). */
export const TRIBUNAL = {
  first: 1227,
  every: 7,
  /** Influence: 1 per this much Notice below 100, and 1 per this much Vis in the Hall. */
  perNotice: 20,
  perVis: 20,
  decrees: 2,
  mult: 3,
  perGift: 2,
};
export interface DecreeDef {
  name: string;
  /** The building whose Notice it multiplies; none means botches. */
  building?: BuildingId;
}
export const DECREES: readonly DecreeDef[] = [
  { name: 'On the salt trade', building: 'salt_pan' },
  { name: 'On quarrying the Mount', building: 'quarry' },
  { name: 'On pilgrims', building: 'hostel' },
  { name: 'On dealings with fishermen', building: 'eel_weir' },
  { name: 'On the enclosure of the Bocage', building: 'farm' },
  { name: 'On the reclaiming of land', building: 'salt_meadow' },
  { name: 'On reckless experiment' },
];

export interface GateStart {
  stone: number;
  raised: boolean;
  /** Goods poured into the Gate. It has no caps. */
  store: Cost;
  /** Goods whose income pours into the Gate instead of the Hall. */
  pour: GoodId[];
  bells: number;
}

export interface BellDef {
  name: string;
  /** Paid from the Gate's store. */
  price: Cost;
  /** One line: what ringing it opens, and what it wakes. */
  opens: string;
  wakes: string;
}

/** The Drowned Gate and the Seven Bells of Ys (`gate.md`). */
export const GATE = {
  found: { silver: 200, stone: 100 } as Cost,
  raise: 600,
  bells: [
    {
      name: 'The Bell of Scissy',
      price: { insight: 15_000, stone: 900 },
      opens: 'Scissy, the drowned forest: 6 plots for Bog-oak Camps, worked at low tide. Great Devices of bog-oak.',
      wakes: 'The drowned dead: Notice +1/min while Scissy is worked.',
    },
    {
      name: 'The Bell of Blood',
      price: { insight: 45_000, salt: 3_000 },
      opens: 'The bay runs red with vis: Salt-works make Vis too, and Eel Weirs ×2.',
      wakes: 'The fish die and the fishers rage: Notice +2/min, for good.',
    },
    {
      name: 'The Bell of Wormwood',
      price: { insight: 90_000, vis: 450 },
      opens: 'Wormwood, a fallen star: a Vis site three times the Tide Pool.',
      wakes: 'The wells turn bitter and the hands drink ale: fuelled work burns ×1.5 Bread.',
    },
    {
      name: 'The Bell of Darkness',
      price: { insight: 210_000, vellum: 1_500 },
      opens: 'The hidden hour: 60 s of every 5 minutes, Notice stops and experiments run twice as fast.',
      wakes: 'Crops fail in the dark: Farms ×0.5.',
    },
    {
      name: 'The Bell of the Pit',
      price: { insight: 450_000, bog_oak: 900 },
      opens: 'The Drowned Knight rises and serves: a fourth magus, Lab Total 15, who needs no Sanctum.',
      wakes: 'Things climb out after him: every year, ward them with Vis or lose buildings.',
    },
    {
      name: 'The Bell of the Four Winds',
      price: { insight: 900_000, stone: 6_000 },
      opens: 'The Couesnon turns: point the river at a zone to double its output. It can be moved once a year.',
      wakes: 'Storms: every year a dike breaches unless it is mended with Stone and Bread.',
    },
    {
      name: 'No More Sea',
      price: {
        insight: 1_350_000,
        silver: 900,
        salt: 900,
        stone: 900,
        bread: 900,
        eels: 900,
        vellum: 900,
        vis: 600,
        bog_oak: 900,
      },
      opens: 'The tide goes out and does not come back. The run is won.',
      wakes: 'The whole bay watches: ring it only with Notice under 50.',
    },
  ] as readonly BellDef[],
  /** The seventh bell rings only below this Notice. */
  lastBellNotice: 50,
  /** Scissy's tide: the forest is workable for the first `out` seconds of every `period`. */
  tide: { period: 60, out: 30 },
  /** The hidden hour: dark for the first `dark` seconds of every `period`. */
  darkness: { period: 300, dark: 60 },
  scissySlots: 6,
  /** The Bell of Blood: Vis per Salt-works worker, and the Eel Weir multiplier. */
  bloodVis: 0.02,
  bloodEels: 2,
  /** Notice per minute woken by Scissy (while worked) and by Blood (for good). */
  scissyNotice: 1,
  bloodNotice: 2,
  wormwoodFuel: 1.5,
  darkFarms: 0.5,
  knightLT: 15,
  /** The Pit's yearly raid: ward it with this much Vis, or lose this many buildings. */
  raid: { ward: { vis: 30 } as Cost, lose: 2 },
  /** The Four Winds' yearly storm: mend a dike for this, or lose it. */
  storm: { mend: { stone: 200, bread: 200 } as Cost },
  couesnon: 2,
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
  | { kind: 'endStrike' }
  /** Dikes won or lost. */
  | { kind: 'dikes'; n: number };

export interface EventDef {
  title: string;
  text: string;
  /** A choice with a `cost` can't be taken until it's affordable. */
  options: readonly { label: string; effects: readonly Effect[]; cost?: Cost }[];
  /** An ink knot waiting for its choice; its effects come from the tags after the choice. */
  knot?: string;
  thread?: Thread;
}

/** An ink knot the engine plays once, as an event card, when its condition is first met. */
export interface StoryBeat {
  /** The ink story the knot lives in (default: the eels). */
  thread?: Thread;
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
  | { kind: 'insightMade'; atLeast: number }
  | { kind: 'researched'; atLeast: number }
  | { kind: 'bells'; atLeast: number }
  /** A story beat has played. */
  | { kind: 'fired'; knot: string }
  | { kind: 'zoneFull'; zone: ZoneId }
  /** An ink variable the engine reads back (`stories.md`). */
  | { kind: 'story'; v: StoryVar; atLeast?: number; atMost?: number }
  /** The year is at least `years` after the year held in an ink variable. */
  | { kind: 'yearsAfter'; v: StoryVar; years: number }
  | { kind: 'all'; of: readonly Condition[] }
  /** No magus and no apprentice left: the line is broken. */
  | { kind: 'noMagi' };

export type Thread = 'eels' | 'ys';
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
    magi: readonly { id: MagusId; sanctum: boolean; lt?: number; age?: number; gen?: number }[];
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
  /** The Normandy Tribunal meets in this scenario (`tribunal.md`). */
  tribunal?: boolean;
  /** The full run: its end adds to the legacy, and it starts from it. */
  legacy?: boolean;
}

export const YEAR = 120;
/** Won once the seventh bell has rung and its story has been told. */
const YS_WON: Condition = {
  kind: 'all',
  of: [
    { kind: 'bells', atLeast: 7 },
    { kind: 'fired', knot: 'ys_7' },
  ],
};
export const START_YEAR = 1220;

const inYear = (y: number): Condition => ({ kind: 'time', atLeast: (y - START_YEAR) * YEAR });
/** A beat that plays in year `y` or later while the eels thread is open. */
const open = (knot: string, title: string, y: number): StoryBeat => ({
  knot,
  title,
  when: { kind: 'all', of: [inYear(y), { kind: 'story', v: 'eels_state', atMost: 0 }] },
});
/** The eels thread (`docs/ink/eels-notes.md`). The wyrm (`eels_9_the_wyrm`) waits on Sanctum traits. */
/** The Seven Bells (`src/content/ys.ink`): each bell's story plays once it has rung. */
const YS: readonly StoryBeat[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  thread: 'ys',
  knot: `ys_${n}`,
  title: [
    'The drowned forest',
    'The red bay',
    'Wormwood',
    'The hidden hour',
    'The Pit',
    'The four winds',
    'No more sea',
  ][n - 1]!,
  when: { kind: 'bells', atLeast: n },
}));
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
    goal: 'Gather 500 Insight before the Tribunal of 1222',
    start: {
      res: { silver: 60, vis: 5 },
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
      { when: { kind: 'time', atLeast: 2 * YEAR }, cause: 'The year 1222 begins, and the book is still thin.' },
    ],
    intro: {
      title: 'Spring 1220',
      text: 'Aldric has a tower on Mont-Dol, four hands, a salt-works on the flats and a pool the tide never empties. The pool holds vis. Burn it in the lab and write down what it does. The Tribunal meets in 1222 to decide whether to charter the covenant: bring it five hundred pages of Insight.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: EELS,
  },
  grow: {
    name: 'The Covenant Must Grow',
    goal: 'Ring the Seven Bells of Ys',
    start: {
      res: { silver: 60, vis: 5, eels: 20 },
      hands: 6,
      buildings: {
        sanctum: { count: 1, workers: 0 },
        salt_pan: { count: 1, workers: 1 },
        tide_pool: { count: 1, workers: 1 },
        eel_weir: { count: 1, workers: 1 },
      },
      porters: { marsh: 2 },
      magi: [{ id: 'aldric', sanctum: true }],
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum', 'eel_weir'],
    unlocked: ['eelRent'],
    unlocks: [
      { when: { kind: 'insightMade', atLeast: 1 }, reveal: ['research'] },
      {
        when: { kind: 'hands', atLeast: 8 },
        reveal: ['farm', 'cottage'],
        card: {
          title: 'The Hall is full',
          text: 'Every bench in the Hall has a hand asleep on it. Beyond the hedges of the Bocage there is room for Cottages, and land for Farms. Bread is what hard work runs on: quarrymen and salt-boilers who eat well work half as hard again.',
        },
      },
      {
        when: { kind: 'researched', atLeast: 1 },
        reveal: [
          'quarry',
          'storehouse',
          'knights_barrow',
          'recipe:device',
          'hostel',
          'recipe:longevity',
          'apprentices',
        ],
        card: {
          title: 'Granite and barrows',
          text: 'Mont-Dol is granite to the root. Quarry it for Stone: Sanctums, Storehouses and one day greater things are built of it. Out on the flats the hands have found a second place where vis gathers: the Drowned Knight’s Barrow.',
        },
      },
      {
        when: { kind: 'hands', atLeast: 10 },
        reveal: ['parchmenter', 'library', 'regio_spring', 'faerie', 'recipe:lab_text', 'magus:sabine', 'magus:herve'],
        card: {
          title: 'Two more magi',
          text: 'Word has reached the Order that Mont-Dol can feed a covenant. Sabine and Hervé arrive with their books in a cart. Sabine, thirty-one, wants everything the drowned knew, with her name cut into the Order’s stone above it. Hervé, thirty-nine, says the bells under the bay were blessed before Rome ever came to this coast. Each needs a Sanctum before they can work. They know of a third vis source, the Regio Spring, where the fae take offerings, and they want Vellum for Lab Texts.',
        },
      },
      { when: { kind: 'notice', atLeast: 1 }, reveal: ['notice'] },
      {
        when: { kind: 'zoneFull', zone: 'bocage' },
        reveal: ['dike', 'salt_meadow'],
        card: {
          title: 'Land from the sea',
          text: 'The Bocage is hedged to the last furrow. But the monks of Dol have been diking the marsh for a hundred years, and every dike wins a field from the sea. Stone for the bank, Bread for the diggers. The new land is salt grass at first: good for sheep.',
        },
      },
      {
        when: { kind: 'time', atLeast: 6 * YEAR },
        reveal: ['endow'],
        card: {
          title: 'Friends in Dol',
          text: 'The parish would take an Endowment, and the lord of Dol a gift. Endowing calms the covenant’s Notice for good, but the Dominion comes with it and dulls the aura. A bribe buys quiet for a few years, and leaves an Infernal stain on the fields. And the monks building the Merveille across the bay would take a cart of eels, and speak well of whoever sent it.',
        },
      },
    ],
    win: [{ when: YS_WON, cause: 'The seventh bell rings, and there is no more sea.' }],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noMagi' }, cause: 'The last magus dies, and no apprentice answers to the name.' },
    ],
    intro: {
      title: 'Spring 1220',
      text: 'Aldric climbs Mont-Dol alone: the black hill in the marsh where the archangel ground his heel into the Devil and left the print in the stone. The wind comes off the bay with brine and the smoke of the salt-pans. Across the water, Mont-Saint-Michel wears a cage of scaffolding: the monks are raising the Merveille, stone on stone, toward heaven.\n\nBelow him his few hands rake salt-sand on the flats and lift eels from the weir. Here, eels pay the rent, and eels bring families up the hill.\n\nHe was forty-eight this winter. On still nights he hears bells under the water. He has heard them since the year the sea took his brother. Under the reeds, under the eels, under a fathom of black water lies the Drowned Regio, sealed behind the Drowned Gate. It is said no one there grows old, and that the drowned are only waiting.\n\nOpen the Gate. Thicken the aura until the hill hums like a struck bell. But the bishop counts sins, the lord of Dol counts silver, and the Order of Hermes counts Notice, and at one hundred casts you out. And Time counts everything. Magi age. Magi die. Take apprentices, or the line ends in the mud.\n\nThere is no deadline. There is only the tide.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: [...EELS, ...YS],
    tribunal: true,
    legacy: true,
  },
  middle: {
    name: 'Stage: the Middle Years',
    goal: 'Ring the Seven Bells of Ys',
    stage: true,
    start: {
      t: 16 * YEAR,
      res: { silver: 600, stone: 150, bread: 150, vellum: 30, vis: 20, insight: 800, eels: 50 },
      hands: 26,
      buildings: {
        sanctum: { count: 3, workers: 2 },
        library: { count: 1, workers: 0 },
        storehouse: { count: 1, workers: 0 },
        quarry: { count: 2, workers: 3 },
        salt_pan: { count: 6, workers: 4 },
        tide_pool: { count: 1, workers: 2 },
        knights_barrow: { count: 1, workers: 2 },
        regio_spring: { count: 1, workers: 1 },
        farm: { count: 3, workers: 4 },
        parchmenter: { count: 2, workers: 2 },
        cottage: { count: 6, workers: 0 },
      },
      porters: { marsh: 4, bocage: 2 },
      magi: [
        { id: 'aldric', sanctum: true, lt: 14, age: 64 },
        { id: 'sabine', sanctum: true, lt: 12, age: 47 },
        { id: 'herve', sanctum: true, lt: 12, age: 55 },
      ],
      notice: 45,
      endowments: 2,
      research: { salt_rakes: 1, plough: 1, mule_trains: 1, accounts: 1, strongbox: 1, reed_pen: 1, notebooks: 1 },
      labTexts: 2,
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum', 'eel_weir'],
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
      'hostel',
      'dike',
      'salt_meadow',
      'magus:sabine',
      'magus:herve',
      'eelRent',
      'faerie',
      'apprentices',
      'recipe:longevity',
    ],
    win: [{ when: YS_WON, cause: 'The seventh bell rings, and there is no more sea.' }],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noMagi' }, cause: 'The last magus dies, and no apprentice answers to the name.' },
    ],
    intro: {
      title: 'Spring 1236',
      text: 'Sixteen years on. Three magi, twenty-six hands, six salt-works and three sources of vis. Aldric is sixty-four, and his hands shake. Dol has noticed: Notice is climbing toward the lord’s tax and settling well above it. The Aegis of the Hearth is still to be learned, and the Drowned Gate still to be found.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: YS,
    tribunal: true,
  },
  gate: {
    name: 'Stage: the Gate',
    goal: 'Ring the Seven Bells of Ys',
    stage: true,
    start: {
      t: 30 * YEAR,
      res: { silver: 1200, stone: 150, bread: 150, vellum: 40, vis: 30, insight: 1500, eels: 50 },
      hands: 30,
      buildings: {
        sanctum: { count: 3, workers: 2 },
        library: { count: 3, workers: 0 },
        quarry: { count: 2, workers: 4 },
        salt_pan: { count: 8, workers: 4 },
        tide_pool: { count: 1, workers: 2 },
        knights_barrow: { count: 1, workers: 2 },
        regio_spring: { count: 1, workers: 2 },
        farm: { count: 3, workers: 5 },
        parchmenter: { count: 1, workers: 1 },
        cottage: { count: 8, workers: 0 },
      },
      porters: { marsh: 2, bocage: 2 },
      magi: [
        { id: 'aldric', sanctum: true, lt: 18, age: 36, gen: 2 },
        { id: 'sabine', sanctum: true, lt: 17, age: 61 },
        { id: 'herve', sanctum: true, lt: 16, age: 40, gen: 2 },
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
      gate: { stone: 1500, raised: true, store: { insight: 4000 }, pour: ['insight'], bells: 0 },
    },
    allowed: ['salt_pan', 'tide_pool', 'sanctum', 'eel_weir'],
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
      'hostel',
      'dike',
      'salt_meadow',
      'magus:sabine',
      'magus:herve',
      'gate',
      'trees',
      'eelRent',
      'faerie',
      'apprentices',
      'recipe:longevity',
    ],
    win: [{ when: YS_WON, cause: 'The seventh bell rings, and there is no more sea.' }],
    loss: [
      { when: { kind: 'notice', atLeast: 100 }, cause: 'The Order renounces the covenant.' },
      { when: { kind: 'noMagi' }, cause: 'The last magus dies, and no apprentice answers to the name.' },
    ],
    intro: {
      title: 'Spring 1250',
      text: 'Thirty years on. Aldric and Hervé are dead; their apprentices answer to their names. The Gate stands in the marsh with four thousand pages of Insight poured into it, and under the mud something is listening. Seven bells hang in drowned Ys. Pour Insight and goods into the Gate, and ring them one by one.',
      options: [{ label: 'Begin', effects: [] }],
    },
    story: YS,
    tribunal: true,
  },
} as const satisfies Record<string, ScenarioDef>;
export type ScenarioId = keyof typeof SCENARIOS;
