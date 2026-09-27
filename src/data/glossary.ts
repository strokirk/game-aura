// Game terms the interface highlights wherever they appear in text, Old World style.
// `forms` are the exact spellings matched as whole words; the first is the display name.
import { BASELINE_INSIGHT, EXPERIMENT, RECIPES } from './index.ts';

export interface Term {
  forms: readonly string[];
  text: string;
}

export const GLOSSARY = {
  silver: {
    forms: ['Silver', 'silver'],
    text: 'Coin. Salt is sold for it at the Hall, and almost everything costs it.',
  },
  stone: { forms: ['Stone'], text: 'Granite from Mont-Dol, for Sanctums, storehouses and the Gate.' },
  bread: {
    forms: ['Bread'],
    text: 'Food. Every hand eats a little every second; without it they work at half speed and leave.',
  },
  vellum: { forms: ['Vellum'], text: 'Calfskin prepared for writing. Lab Texts are written on it.' },
  vis: {
    forms: ['Vis', 'vis'],
    text: 'Raw magic, gathered at a few special places. All of the covenant’s vis is Vim vis, the Form of magic itself. Experiments burn it.',
  },
  insight: { forms: ['Insight'], text: 'What the magi learn. Research is bought with it.' },
  notice: {
    forms: ['Notice'],
    text: 'The attention the covenant draws. Every building adds to it, and it settles where growth and forgetting balance. The Order judges it: at the limit, the covenant is Renounced.',
  },
  hands: {
    forms: ['hands', 'hand', 'Hands'],
    text: 'The covenant’s servants, the covenfolk. They work buildings or carry goods, and they eat Bread.',
  },
  porters: {
    forms: ['porters', 'porter', 'Porters'],
    text: 'Hands who carry goods from the fields and the marsh to the Hall.',
  },
  sanctum: {
    forms: ['Sanctum', 'Sanctums'],
    text: 'A magus’s laboratory, and the one room of the tower nobody else enters.',
  },
  labTotal: {
    forms: ['Lab Total'],
    text: `A magus’s skill in the laboratory. Each point gives ${BASELINE_INSIGHT} Insight a second while the magus reads in their Sanctum, and ${RECIPES.study_vis.insightPerLT} more Insight from every Study the Vis. Raise it with Study, at a price that climbs by a third each time.`,
  },
  botch: {
    forms: ['botch', 'botches', 'botched', 'Botch'],
    text: `An experiment gone wrong. Its costs are lost, nothing comes of it, and Dol sees the smoke: +${EXPERIMENT.botchNotice} Notice. Each extra Vis adds ${EXPERIMENT.extraBotch * 100} points to the chance and pushing adds ${EXPERIMENT.pushBotch * 100}; Lab Notebooks halve it.`,
  },
  discovery: {
    forms: ['discovery', 'discoveries', 'Discovery'],
    text: 'An experiment that goes better than anyone hoped: double the result. Twice the Insight, two Lab Texts, or a Device twice as strong.',
  },
  magi: {
    forms: ['magi', 'magus', 'Magi'],
    text: 'Wizards of the Order of Hermes. They have the Gift, which unsettles ordinary people.',
  },
  covenant: {
    forms: ['covenant', 'Covenant'],
    text: 'A community of magi and the people who serve them: tower, labs, lands and all.',
  },
  order: {
    forms: ['the Order', 'Order of Hermes'],
    text: 'The society of all Hermetic magi. Its Code forbids bringing ruin on the Order through dealings with ordinary folk.',
  },
  tidePool: { forms: ['Tide Pool'], text: 'A pool on the flats that never quite drains. Its water holds vis.' },
  saltWorks: {
    forms: ['salt-works'],
    text: 'The bay made salt by gathering salty sand from the flats, washing it into brine and boiling it in pans.',
  },
  eelWeir: { forms: ['Eel Weir'], text: 'Stakes and wattle across a channel, with a basket at the narrow end.' },
  sticks: { forms: ['sticks', 'stick'], text: 'Medieval eel rents were counted in sticks: 25 eels threaded on a rod.' },
  aldric: { forms: ['Aldric'], text: 'A founder of the covenant, and its first magus.' },
  sabine: { forms: ['Sabine'], text: 'A founder of the covenant.' },
  herve: { forms: ['Hervé'], text: 'A founder of the covenant.' },
  montDol: {
    forms: ['Mont-Dol'],
    text: 'A granite hill in the marsh, where legend says the archangel Michael fought the Devil and left his footprint in the rock.',
  },
  dol: { forms: ['Dol'], text: 'The town below the hill, with a bishop, a cathedral and a great many opinions.' },
} as const satisfies Record<string, Term>;
export type TermId = keyof typeof GLOSSARY;

/** Hermetic Arts: a Technique (what is done) and a Form (what it is done to). "Rego Aquam" is controlling water. */
export const TECHNIQUES = {
  Creo: 'create',
  Intellego: 'perceive',
  Muto: 'transform',
  Perdo: 'destroy',
  Rego: 'control',
};
export const FORMS = {
  Animal: 'animals',
  Aquam: 'water',
  Auram: 'air',
  Corpus: 'the body',
  Herbam: 'plants',
  Ignem: 'fire',
  Imaginem: 'images',
  Mentem: 'the mind',
  Terram: 'earth',
  Vim: 'magic itself',
};
