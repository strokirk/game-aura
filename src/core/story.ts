// The ink bridge. Ink never calls game code: the engine sets read-only variables, plays a knot,
// and parses the tags after the chosen line into the same Effect type research and traits use.
// The story's state lives in State as ink's own JSON, so saves and replays cover it.
import { Story } from 'inkjs';
import eels from '../content/eels.json' with { type: 'json' };
import { type Effect, GOODS, type GoodId, type StoryBeat } from '../data/index.ts';

/** What the engine tells ink before each knot (`stories.md`, "What ink can read"). */
export interface InkInputs {
  year: number;
  notice: number;
  silver: number;
  silver_rate: number;
  vis: number;
  salt_pans: number;
  has_sabine: boolean;
  has_herve: boolean;
  sinking_magus: string;
}
/** The whitelist of ink variables the engine reads back. */
export interface InkOutputs {
  eel_level: number;
  eels_state: number;
}

/** A fresh story seeds itself from the clock; `seed` keeps ink's randomness on the run's seed. */
function load(saved: string | null, seed = 0): Story {
  const story = new Story(eels);
  if (saved) story.state.LoadJson(saved);
  else story.state.storySeed = seed % 100;
  return story;
}

function runOn(story: Story) {
  const lines: string[] = [];
  const tags: string[] = [];
  while (story.canContinue) {
    const line = story.Continue()?.trim();
    if (line) lines.push(line);
    tags.push(...(story.currentTags ?? []));
  }
  return { lines, tags };
}

const outputs = (story: Story): InkOutputs => ({
  eel_level: Number(story.variablesState.eel_level),
  eels_state: Number(story.variablesState.eels_state),
});

/** Plays a knot up to its choices. Returns the card and the saved story state. */
export function playKnot(saved: string | null, seed: number, beat: StoryBeat, inputs: InkInputs) {
  const story = load(saved, seed);
  for (const [k, v] of Object.entries(inputs)) story.variablesState[k] = v;
  story.ChoosePathString(beat.knot);
  const { lines } = runOn(story);
  return {
    event: {
      title: beat.title,
      text: lines.join('\n'),
      options: story.currentChoices.map((c) => ({ label: c.text, effects: [] })),
      knot: beat.knot,
    },
    saved: story.state.toJson(),
  };
}

/** Takes choice `index` in the waiting knot and runs it to DONE, collecting tags from every line. */
export function chooseInKnot(saved: string, index: number) {
  const story = load(saved);
  if (!story.currentChoices[index]) return null;
  story.ChooseChoiceIndex(index);
  const { lines, tags } = runOn(story);
  return { lines, effects: tags.map(parseTag), saved: story.state.toJson(), vars: outputs(story) };
}

const isGood = (g: string): g is GoodId => (GOODS as readonly string[]).includes(g);

/** Parses one effect tag (`stories.md`, "Effect tags"). Throws on anything unknown, so bad content fails tests. */
export function parseTag(tag: string): Effect {
  const [kind, ...p] = tag.trim().split(':');
  const num = (x: string | undefined) => {
    const n = Number(x);
    if (x === undefined || x === '' || Number.isNaN(n)) throw new Error(`Bad number in tag "${tag}"`);
    return n;
  };
  switch (kind) {
    case 'res': {
      const [good, amount = ''] = p;
      if (!good || !isGood(good)) break;
      const perSecond = amount.endsWith('s');
      return { kind: 'res', good, n: num(perSecond ? amount.slice(0, -1) : amount), perSecond };
    }
    case 'notice':
      return { kind: 'notice', n: num(p[0]) };
    case 'mod': {
      const [id, good, mult, secs] = p;
      if (!id || !good || !isGood(good)) break;
      return { kind: 'mod', id, good, mult: num(mult), secs: num(secs) };
    }
    case 'block': {
      const secs = num(p.at(-1));
      return { kind: 'block', what: p.slice(0, -1).join(':'), secs };
    }
    case 'unlock':
      if (p[0]) return { kind: 'unlock', id: p[0] };
  }
  throw new Error(`Unknown effect tag "${tag}"`);
}
