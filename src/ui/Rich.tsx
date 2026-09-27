// Text with its game terms highlighted and iconified, Old World style. Tapping a term explains it.
import { For } from 'solid-js';
import { FORMS, GLOSSARY, TECHNIQUES, type TermId } from '../data/glossary.ts';
import { GOOD_ICON, I, type Icon } from './icons.tsx';
import { Ico } from './kit.tsx';
import { say } from './store.ts';

const TERM_ICON: Partial<Record<TermId, Icon>> = {
  ...GOOD_ICON,
  notice: I.notice,
  hands: I.hands,
  porters: I.hands,
  sanctum: I.tower,
  magi: I.magus,
  aldric: I.magus,
  sabine: I.magus,
  herve: I.magus,
  tidePool: I.tidePool,
  saltWorks: I.salt,
  eelWeir: I.eel,
};

type Seg = string | { text: string; icon?: Icon; name: string; about: string };

const byForm = new Map<string, { id: TermId; name: string; about: string }>();
for (const [id, t] of Object.entries(GLOSSARY) as [TermId, (typeof GLOSSARY)[TermId]][])
  for (const f of t.forms) byForm.set(f, { id, name: t.forms[0], about: t.text });
const arts = `(?:${Object.keys(TECHNIQUES).join('|')}) (?:${Object.keys(FORMS).join('|')})`;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const forms = [...byForm.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
const PATTERN = new RegExp(`(?<![\\p{L}-])(${arts}|${forms.join('|')})(?![\\p{L}-])`, 'gu');

function art(text: string) {
  const [t, f] = text.split(' ') as [keyof typeof TECHNIQUES, keyof typeof FORMS];
  return `A Hermetic Art: ${t} (${TECHNIQUES[t]}) ${f} (${FORMS[f]}). Every spell is a Technique acting on a Form.`;
}

export function segments(text: string): Seg[] {
  const out: Seg[] = [];
  let at = 0;
  for (const m of text.matchAll(PATTERN)) {
    const word = m[0];
    if (m.index > at) out.push(text.slice(at, m.index));
    const hit = byForm.get(word);
    out.push(
      hit
        ? { text: word, icon: TERM_ICON[hit.id], name: hit.name, about: hit.about }
        : { text: word, name: word, about: art(word) },
    );
    at = m.index + word.length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

/** `plain` renders terms without the tap target, for text inside buttons. */
export function Rich(p: { text: string; plain?: boolean }) {
  return (
    <For each={segments(p.text)}>
      {(s) =>
        typeof s === 'string' ? (
          s
        ) : p.plain ? (
          <span class="text-term">
            {s.icon && <Ico icon={s.icon} class="mr-0.5" />}
            {s.text}
          </span>
        ) : (
          <button
            type="button"
            class="cursor-help whitespace-nowrap text-term underline decoration-dotted decoration-1 underline-offset-4"
            onClick={() => say(`${s.name}: ${s.about}`)}
          >
            {s.icon && <Ico icon={s.icon} class="mr-0.5" />}
            {s.text}
          </button>
        )
      }
    </For>
  );
}
