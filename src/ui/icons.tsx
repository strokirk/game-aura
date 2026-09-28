// Every icon in one place. Game art: game-icons.net (CC BY 3.0, credited in docs/credits.md and Options).
// Interface chrome: Lucide (ISC). Compiled to inline SVG components at build time, so unused icons cost nothing.
import type { Component, JSX } from 'solid-js';
import GiAnvil from '~icons/game-icons/anvil';
import GiBarn from '~icons/game-icons/barn';
import GiBlackKnightHelm from '~icons/game-icons/black-knight-helm';
import GiBookshelf from '~icons/game-icons/bookshelf';
import GiBread from '~icons/game-icons/bread';
import GiChurch from '~icons/game-icons/church';
import GiCoinsPile from '~icons/game-icons/coins-pile';
import GiCrystal from '~icons/game-icons/crystal-growth';
import GiDeadWood from '~icons/game-icons/dead-wood';
import GiEclipse from '~icons/game-icons/eclipse';
import GiEel from '~icons/game-icons/eel';
import GiEyeball from '~icons/game-icons/eyeball';
import GiFallingStar from '~icons/game-icons/falling-star';
import GiMagicGate from '~icons/game-icons/magic-gate';
import GiMagicSwirl from '~icons/game-icons/magic-swirl';
import GiMining from '~icons/game-icons/mining';
import GiOpenBook from '~icons/game-icons/open-book';
import GiPerson from '~icons/game-icons/person';
import GiPilgrimHat from '~icons/game-icons/pilgrim-hat';
import GiQuillInk from '~icons/game-icons/quill-ink';
import GiRingingBell from '~icons/game-icons/ringing-bell';
import GiRiver from '~icons/game-icons/river';
import GiSaltShaker from '~icons/game-icons/salt-shaker';
import GiScrollQuill from '~icons/game-icons/scroll-quill';
import GiScrollUnfurled from '~icons/game-icons/scroll-unfurled';
import GiSheep from '~icons/game-icons/sheep';
import GiSpiralBloom from '~icons/game-icons/spiral-bloom';
import GiStairs from '~icons/game-icons/stairs';
import GiStoneBlock from '~icons/game-icons/stone-block';
import GiStoneTower from '~icons/game-icons/stone-tower';
import GiStoneWall from '~icons/game-icons/stone-wall';
import GiTombstone from '~icons/game-icons/tombstone';
import GiTwoCoins from '~icons/game-icons/two-coins';
import GiVillage from '~icons/game-icons/village';
import GiWheat from '~icons/game-icons/wheat';
import GiWizardStaff from '~icons/game-icons/wizard-staff';
import LuMenu from '~icons/lucide/menu';
import LuMinus from '~icons/lucide/minus';
import LuPause from '~icons/lucide/pause';
import LuPlus from '~icons/lucide/plus';
import type { BuildingId, GoodId } from '../data/index.ts';

export type Icon = Component<JSX.SvgSVGAttributes<SVGSVGElement>>;

export const GOOD_ICON: Record<GoodId, Icon> = {
  silver: GiTwoCoins,
  salt: GiSaltShaker,
  stone: GiStoneBlock,
  bread: GiBread,
  eels: GiEel,
  vellum: GiScrollUnfurled,
  vis: GiCrystal,
  bog_oak: GiDeadWood,
  insight: GiOpenBook,
};

export const BUILDING_ICON: Record<BuildingId, Icon> = {
  salt_pan: GiSaltShaker,
  tide_pool: GiMagicSwirl,
  knights_barrow: GiTombstone,
  regio_spring: GiSpiralBloom,
  farm: GiWheat,
  eel_weir: GiEel,
  hostel: GiPilgrimHat,
  wormwood: GiFallingStar,
  bog_camp: GiDeadWood,
  salt_meadow: GiSheep,
  parchmenter: GiScrollQuill,
  quarry: GiMining,
  sanctum: GiStoneTower,
  cottage: GiVillage,
  storehouse: GiBarn,
  library: GiBookshelf,
};

export const I = {
  notice: GiEyeball,
  hands: GiPerson,
  magus: GiWizardStaff,
  tower: GiStoneTower,
  tidePool: GiMagicSwirl,
  salt: GiSaltShaker,
  eel: GiEel,
  research: GiOpenBook,
  gate: GiMagicGate,
  rite: GiRingingBell,
  aura: GiMagicSwirl,
  faerie: GiSpiralBloom,
  endow: GiChurch,
  bribe: GiCoinsPile,
  alms: GiBread,
  dike: GiStoneWall,
  knight: GiBlackKnightHelm,
  dark: GiEclipse,
  river: GiRiver,
  terrace: GiStairs,
  device: GiAnvil,
  labText: GiQuillInk,
  pause: LuPause,
  menu: LuMenu,
  plus: LuPlus,
  minus: LuMinus,
} satisfies Record<string, Icon>;
