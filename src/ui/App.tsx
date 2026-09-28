import { For, Match, Show, Switch } from 'solid-js';
import { canAfford, chairName, nameOf, type State, scenarioOf, year } from '../core/index.ts';
import { AURA, type MagusId, SCENARIOS, type ScenarioDef, type ScenarioId } from '../data/index.ts';
import { mmss, num } from './format.ts';
import { Game } from './Game.tsx';
import { Art, Button, Dim, Label, Overlay, Screen, Stack } from './kit.tsx';
import { Rich } from './Rich.tsx';
import {
  act,
  confirming,
  continueRun,
  game,
  hasSave,
  legacy,
  newRun,
  options,
  optionsFrom,
  paused,
  quitToTitle,
  restartRun,
  screen,
  setConfirming,
  setOptions,
  setOptionsFrom,
  setPaused,
  setScreen,
  toast,
} from './store.ts';

const openOptions = (from: 'title' | 'pause') => {
  setOptionsFrom(from);
  setScreen('options');
};

export function App() {
  return (
    <>
      <Switch>
        <Match when={screen() === 'title'}>
          <Title />
        </Match>
        <Match when={screen() === 'options'}>
          <Options />
        </Match>
        <Match when={screen() === 'game'}>
          <Game />
        </Match>
        <Match when={screen() === 'end'}>
          <End />
        </Match>
      </Switch>
      <Show when={screen() === 'game' && game.s?.events[0]}>{(ev) => <EventCard ev={ev()} />}</Show>
      <Show when={paused() && screen() === 'game'}>
        <Pause />
      </Show>
      <Show when={confirming()}>
        {(c) => (
          <Overlay>
            <p class="mb-3">{c().text}</p>
            <div class="flex justify-end gap-2">
              <Button onClick={() => setConfirming(null)}>No</Button>
              <Button
                primary
                onClick={() => {
                  // Read the action before closing: after setConfirming(null), c() is stale.
                  const yes = c().yes;
                  setConfirming(null);
                  yes();
                }}
              >
                Yes
              </Button>
            </div>
          </Overlay>
        )}
      </Show>
      <Show when={toast()}>
        <div
          role="status"
          class="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-gold bg-[#3a2c14] px-4 py-2"
        >
          {toast()}
        </div>
      </Show>
    </>
  );
}

const Big = (p: { children: string }) => <h1 class="ml-[0.3em] text-5xl tracking-[0.3em]">{p.children}</h1>;
const Tagline = (p: { children?: string }) => <p class="mb-3 italic text-dim">{p.children}</p>;

function Title() {
  const scenarios = Object.keys(SCENARIOS) as ScenarioId[];
  return (
    <Screen>
      <Art name="hero" round class="aspect-square max-w-xs" />
      <Big>Aura</Big>
      <Tagline>The Covenant Must Grow</Tagline>
      <Stack>
        <Show when={hasSave()}>
          <Button primary onClick={continueRun}>
            Continue
          </Button>
        </Show>
        <For each={scenarios.filter((id) => !(SCENARIOS[id] as ScenarioDef).stage)}>
          {(id) => (
            <Button class="flex-col" onClick={() => newRun(id)}>
              New run: {SCENARIOS[id].name}
              <Dim class="text-sm">{SCENARIOS[id].goal}</Dim>
            </Button>
          )}
        </For>
        <Label>Jump to a stage</Label>
        <For each={scenarios.filter((id) => (SCENARIOS[id] as ScenarioDef).stage)}>
          {(id) => (
            <Button class="flex-col" onClick={() => newRun(id)}>
              {SCENARIOS[id].name}
              <Dim class="text-sm">A test bed: the covenant already built up</Dim>
            </Button>
          )}
        </For>
        <Button onClick={() => openOptions('title')}>Options</Button>
      </Stack>
    </Screen>
  );
}

function Choice<T extends string>(p: { label: string; value: T; choices: [T, string][]; set: (v: T) => void }) {
  return (
    <fieldset class="flex flex-wrap justify-center gap-1.5">
      <legend class="mb-1 w-full">{p.label}</legend>
      <For each={p.choices}>
        {([v, label]) => (
          <Button on={p.value === v} onClick={() => p.set(v)}>
            {label}
          </Button>
        )}
      </For>
    </fieldset>
  );
}

function Options() {
  return (
    <Screen>
      <h2 class="text-2xl">Options</h2>
      <Choice
        label="Numbers"
        value={options().numbers}
        choices={[
          ['short', '12.3k'],
          ['full', '12,345'],
        ]}
        set={(numbers) => setOptions({ numbers })}
      />
      <Choice
        label="Text size"
        value={options().textSize}
        choices={[
          ['small', 'Small'],
          ['medium', 'Medium'],
          ['large', 'Large'],
        ]}
        set={(textSize) => setOptions({ textSize })}
      />
      <Choice
        label="Developer tools (8× speed, seed)"
        value={options().dev ? 'on' : 'off'}
        choices={[
          ['off', 'Off'],
          ['on', 'On'],
        ]}
        set={(v) => setOptions({ dev: v === 'on' })}
      />
      <Button primary onClick={() => setScreen(optionsFrom() === 'pause' ? 'game' : 'title')}>
        Done
      </Button>
      <Dim class="max-w-sm text-xs">
        Icons from game-icons.net by Lorc, Delapouite and contributors (CC BY 3.0), and Lucide (ISC). Art from
        public-domain manuscripts: the Très Riches Heures, the Luttrell Psalter, the Eadwine Psalter, William de Brailes
        and others.
      </Dim>
    </Screen>
  );
}

function Pause() {
  return (
    <Overlay>
      <h2 class="mb-3 text-center text-2xl">Paused</h2>
      <div class="flex flex-col gap-2">
        <Button primary onClick={() => setPaused(false)}>
          Resume
        </Button>
        <Button onClick={() => openOptions('pause')}>Options</Button>
        <Button onClick={() => setConfirming({ text: 'Restart this run from the beginning?', yes: restartRun })}>
          Restart run
        </Button>
        <Button onClick={quitToTitle}>Quit to title (saves)</Button>
      </div>
    </Overlay>
  );
}

// ponytail: keyed by card title, so a renamed card just loses its art; move to EventDef if that bites.
const EVENT_ART: Record<string, string> = {
  'Spring 1220': 'hero',
  'The eel rent': 'mill',
  'The weir': 'mill',
  'The Hall is full': 'fields',
  'Granite and barrows': 'fields',
  'The porters strike': 'fields',
  'Two more magi': 'study',
  'The Gate rises': 'win',
};

function EventCard(p: { ev: NonNullable<typeof game.s>['events'][number] }) {
  return (
    <Overlay>
      <Show when={EVENT_ART[p.ev.title]}>
        {(name) => (
          <div class="-mx-4 -mt-4 mb-2 overflow-hidden rounded-t-xl">
            <Art name={name()} class="h-32" />
          </div>
        )}
      </Show>
      <h2 class="mb-2 text-2xl">{p.ev.title}</h2>
      <p class="mb-4 whitespace-pre-line text-[1.1rem] leading-relaxed">
        <Rich text={p.ev.text} />
      </p>
      <div class="flex flex-col gap-2">
        <For each={p.ev.options}>
          {(o, i) => (
            <Button
              primary
              disabled={!!o.cost && !canAfford(game.s as State, o.cost)}
              onClick={() => act({ type: 'choose', option: i() })}
            >
              <span>
                <Rich text={o.label} plain />
              </span>
            </Button>
          )}
        </For>
      </div>
    </Overlay>
  );
}

/** The end screen's one huge word, by how the run ended. */
function endTitle(cause: string, won: boolean) {
  if (won) return 'NO MORE SEA';
  if (/renounce/i.test(cause)) return 'RENOUNCED';
  if (/apprentice|magus dies/i.test(cause)) return 'THE LINE IS BROKEN';
  return 'THE HILL IS EMPTY';
}
const END_LINES: Record<string, string> = {
  RENOUNCED:
    'The Tribunal has spoken your name backward. Your sigils are struck from the books. Your hill is only salt again.',
  'THE LINE IS BROKEN':
    'The last magus closed their eyes, and no young voice answered. The aura sinks back into the marsh like a stone into black water.',
  'THE HILL IS EMPTY': 'The last hand has walked down to Dol. Nobody carries the vis now, and the tower goes dark.',
  'NO MORE SEA': 'The seventh bell rings under the bay, and the tide goes out and does not come back.',
};

/** The nag: what the next covenant inherits, from the legacy already saved. */
function inheritance(): string {
  const lg = legacy();
  if (!lg.covenants) return '';
  const heir = (id: MagusId) => chairName(id, (lg.gens[id] ?? 0) + 1);
  const parts = [
    lg.labTexts ? `${lg.labTexts} Lab Texts under the hill` : '',
    lg.magic ? `a hill that already hums at Magic ${AURA.base + lg.magic}` : '',
    lg.heirlooms.length ? `${lg.heirlooms.length} enchanted heirloom${lg.heirlooms.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean);
  return `${heir('aldric')} will climb the hill${parts.length ? ` and find ${parts.join(', ')}` : ''}.`;
}

function End() {
  const s = () => game.s!;
  const won = () => s().outcome?.kind === 'win';
  const title = () => endTitle(s().outcome?.cause ?? '', won());
  const stats = (): [string, string][] => [
    ['Ended', `${year(s())}, after ${mmss(s().t)}`],
    ['Insight gathered', num(s().stats.insightMade)],
    ['Experiments', `${s().stats.experiments} (${s().stats.botches} botched, ${s().stats.discoveries} discoveries)`],
    ['Peak Notice', String(Math.floor(s().stats.peakNotice))],
    [
      'Magi',
      s()
        .magi.map((m) => `${nameOf(m)} (Lab Total ${m.lt}${m.id === 'knight' ? '' : `, age ${Math.floor(m.age)}`})`)
        .join(', ') || 'none',
    ],
    ['Aura', `Magic ${s().aura.magic}, at its height ${s().aura.peak}`],
  ];
  return (
    <Screen>
      <Art name={won() ? 'win' : 'wheel'} round class="aspect-square max-w-xs" />
      <h1
        class={`text-center font-bold text-4xl uppercase tracking-[0.2em] sm:text-6xl ${won() ? 'text-gold' : 'text-bad'}`}
      >
        {title()}
      </h1>
      <Tagline>{s().outcome?.cause}</Tagline>
      <p class="max-w-md text-center">{END_LINES[title()]}</p>
      <Show when={scenarioOf(s()).legacy}>
        <p class="max-w-md text-center italic text-gold">
          {won() ? 'And the hill remembers.' : 'But the Gate still waits under the tide, and the Gate remembers.'}{' '}
          {inheritance()}
        </p>
      </Show>
      <Label>The Chronicle</Label>
      <ul class="max-w-md italic">
        <For each={s().chronicle.slice(-5)}>
          {(c) => (
            <li class="mb-1.5">
              <Rich text={c.text} />
            </li>
          )}
        </For>
      </ul>
      <dl class="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-left">
        <For each={stats()}>
          {([k, v]) => (
            <>
              <dt class="text-dim">{k}</dt>
              <dd>{v}</dd>
            </>
          )}
        </For>
      </dl>
      <Stack>
        <Button primary onClick={restartRun}>
          {scenarioOf(s()).legacy ? 'Found a new covenant' : 'Try again'}
        </Button>
        <Button onClick={() => setScreen('title')}>Title</Button>
      </Stack>
    </Screen>
  );
}
