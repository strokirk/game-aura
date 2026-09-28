import { createMemo, createSignal, For, Match, Show, Switch } from 'solid-js';
import {
  buildable,
  buildCost,
  canAfford,
  cap,
  count,
  dikeCost,
  experimentPlan,
  has,
  housing,
  idleHands,
  isMaxed,
  type MagusState,
  magusName,
  type Rates,
  rates,
  readingRate,
  recipeOpen,
  type State,
  scenarioOf,
  studyCost,
  terraces,
  timeToAfford,
  workerSlots,
  year,
  zoneFull,
  zoneSlots,
  zoneUsed,
} from '../core/index.ts';
import {
  BUILDINGS,
  type BuildingId,
  DEFS,
  DIKE,
  EXPERIMENT,
  FUEL_MULT,
  GOOD_INFO,
  GOODS,
  type GoodId,
  PRESERVE,
  RECIPES,
  type RecipeId,
  START_YEAR,
  YEAR,
  ZONES,
  type ZoneId,
} from '../data/index.ts';
import { cost, eta, mmss, num, rate } from './format.ts';
import { BUILDING_ICON, GOOD_ICON, I } from './icons.tsx';
import { Bar, Button, Card, Dim, Ico, Label, Odds, Portrait, Stepper } from './kit.tsx';
import { Gate, NoticeCard, Research } from './Panels.tsx';
import { Rich } from './Rich.tsx';
import { act, game, options, type Pop, pops, setPaused, setSpeed, speed } from './store.ts';

type Tab = 'covenant' | 'magi' | 'research' | 'gate' | 'chronicle';
const TABS: [Tab, string][] = [
  ['covenant', 'Covenant'],
  ['magi', 'Magi'],
  ['research', 'Research'],
  ['gate', 'Gate'],
  ['chronicle', 'Chronicle'],
];
/** Tabs appear as their feature is revealed. */
const tabShown = (s: State, t: Tab) => (t === 'research' || t === 'gate' ? has(s, t) : true);

export function Game() {
  const s = () => game.s as State;
  const r = createMemo(() => rates(s()));
  const [tab, setTab] = createSignal<Tab>('covenant');
  return (
    <div class="flex h-dvh flex-col">
      <Header s={s()} r={r()} />
      <div class="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-3">
        <Switch>
          <Match when={tab() === 'covenant'}>
            <Covenant s={s()} r={r()} />
          </Match>
          <Match when={tab() === 'magi'}>
            <For each={s().magi}>{(m) => <Magus s={s()} m={m} />}</For>
          </Match>
          <Match when={tab() === 'research'}>
            <Research s={s()} r={r()} />
          </Match>
          <Match when={tab() === 'gate'}>
            <Gate s={s()} r={r()} />
          </Match>
          <Match when={tab() === 'chronicle'}>
            <Chronicle s={s()} />
          </Match>
        </Switch>
      </div>
      <nav class="flex border-t border-line bg-bar pb-[env(safe-area-inset-bottom)]">
        <For each={TABS.filter(([t]) => tabShown(s(), t))}>
          {([id, label]) => (
            <button
              type="button"
              aria-pressed={tab() === id}
              onClick={() => setTab(id)}
              class={`min-h-13 flex-1 cursor-pointer ${tab() === id ? 'text-gold shadow-[inset_0_3px_0_var(--color-gold)]' : ''}`}
            >
              {label}
              <Show when={id === 'magi' && s().magi.some((m) => m.sanctum && !m.exp)}>
                <span class="ml-1 text-warn" aria-hidden="true">
                  •
                </span>
              </Show>
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}

/** Floating numbers over a resource when it jumps. */
function Pops(p: { k: Pop['key'] }) {
  const mine = () => pops().filter((x) => x.key === p.k);
  return (
    <For each={mine()}>
      {(x) => {
        const good = p.k === 'notice' ? x.n < 0 : x.n > 0;
        return (
          <span
            aria-hidden="true"
            class={`pointer-events-none absolute -top-4 left-1/2 z-10 animate-pop [text-shadow:0_0_6px_var(--color-bg)] whitespace-nowrap font-bold ${good ? 'text-good' : 'text-bad'}`}
          >
            {x.n > 0 ? '+' : '−'}
            {num(Math.abs(x.n))}
          </span>
        );
      }}
    </For>
  );
}

function Header(p: { s: State; r: Rates }) {
  const speeds = () => (options().dev ? [0, 1, 2, 8] : [0, 1, 2]);
  const shown = (g: GoodId) => p.s.res[g] > 0 || Math.abs(p.r.net[g]) > 1e-9;
  return (
    <header class="border-b border-line bg-bar px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
      <div class="flex items-center justify-between gap-2">
        <div>
          <b>{year(p.s)}</b>{' '}
          <Show when={speed()} fallback={<b class="text-warn">· Paused</b>}>
            <Dim>· {mmss(YEAR - (p.s.t % YEAR))} to next year</Dim>
          </Show>
          <Bar pct={((p.s.t % YEAR) / YEAR) * 100} />
        </div>
        <div class="flex gap-1">
          <For each={speeds()}>
            {(v) => (
              <Button
                on={speed() === v}
                onClick={() => setSpeed(v)}
                class={`min-w-11 px-2 ${v === 1 && speed() === 0 && !p.s.events.length ? 'animate-beckon' : ''}`}
                aria-label={v ? `${v}× speed` : 'Pause'}
              >
                {v === 0 ? <Ico icon={I.pause} /> : `${v}×`}
              </Button>
            )}
          </For>
          <Button aria-label="Menu" onClick={() => setPaused(true)} class="min-w-11 px-2">
            <Ico icon={I.menu} />
          </Button>
        </div>
      </div>
      <div class="my-1 text-sm text-gold">
        Goal: <Rich text={scenarioOf(p.s).goal} />
        <Show when={options().dev}>
          <Dim> · seed {p.s.seed}</Dim>
        </Show>
      </div>
      <div class="grid grid-cols-5 gap-x-2 gap-y-1 sm:grid-cols-10">
        <div class="relative">
          <Pops k="hands" />
          <Ico icon={I.hands} class="mr-1 text-gold" />
          <b class={idleHands(p.s) > 0 ? 'text-warn' : ''}>{idleHands(p.s)}</b>
          <Dim> idle</Dim>
          <div class="text-xs text-dim">
            of {p.s.hands}/{housing(p.s)}
          </div>
        </div>
        <For each={GOODS.filter(shown)}>
          {(g) => (
            // Compact: 8 goods share one strip. The name and cap are in the tooltip; red means full.
            <div class="relative" title={`${GOOD_INFO[g].name}: ${num(p.s.res[g])} of ${num(cap(p.s, g))}`}>
              <Pops k={g} />
              <Ico icon={GOOD_ICON[g]} label={GOOD_INFO[g].name} class="mr-1 text-gold" />
              <b class={p.s.res[g] >= cap(p.s, g) - 1e-9 ? 'text-bad' : ''}>{num(p.s.res[g])}</b>
              <div class={`text-xs ${p.r.net[g] < -1e-9 ? 'text-bad' : 'text-dim'}`}>{rate(p.r.net[g])}</div>
            </div>
          )}
        </For>
        <Show when={has(p.s, 'notice')}>
          <div class="relative">
            <Pops k="notice" />
            <Ico icon={I.notice} class="mr-1 text-gold" />
            <b class={p.s.notice >= 75 ? 'text-bad' : ''}>{Math.floor(p.s.notice)}</b>
            <div class="text-xs text-dim">settles {Math.round(p.r.noticeGen * 10)}</div>
          </div>
        </Show>
      </div>
    </header>
  );
}

function Covenant(p: { s: State; r: Rates }) {
  const inZone = (z: ZoneId) =>
    (Object.keys(BUILDINGS) as BuildingId[]).filter(
      (id) => BUILDINGS[id].zone === z && (buildable(p.s, id) || count(p.s, id) > 0),
    );
  const zones = () => (Object.keys(ZONES) as ZoneId[]).filter((z) => inZone(z).length);
  return (
    <>
      <Card>
        <Label>
          <Ico icon={I.hands} /> Hands
        </Label>
        <div class="flex flex-wrap justify-between gap-2">
          <span>
            <b>{p.s.hands}</b> of {housing(p.s)} housed · <b>{idleHands(p.s)}</b> idle
          </span>
          <Show when={p.s.hands < housing(p.s)}>
            <Dim>a new hand every 20 s while there's room</Dim>
          </Show>
        </div>
        <Show when={has(p.s, 'farm')}>
          <Dim class="block text-sm">
            <Rich
              text={
                p.s.res.bread > 0
                  ? `Bread is feeding the Quarries and Salt-works: they work ×${FUEL_MULT}.`
                  : `No Bread: the Quarries and Salt-works would work ×${FUEL_MULT} if fed.`
              }
            />
          </Dim>
        </Show>
      </Card>
      <Show when={has(p.s, 'notice')}>
        <NoticeCard s={p.s} r={p.r} />
      </Show>
      <For each={zones()}>
        {(z) => (
          <section class="mb-4">
            <Label>
              {ZONES[z].name}{' '}
              <Dim class="text-xs">
                · {zoneUsed(p.s, z)}/{zoneSlots(p.s, z)} plots · Notice ×{ZONES[z].noticeFactor}
              </Dim>
            </Label>
            <Show when={z === 'hearth' && count(p.s, 'quarry') > 0 && Number.isFinite(terraces(p.s).next)}>
              <Dim class="mb-1.5 block text-sm">
                <Ico icon={I.terrace} /> The quarry cuts a new terrace, one more Hearth plot, after{' '}
                {num(terraces(p.s).next)} more Stone quarried
              </Dim>
            </Show>
            <Show when={z === 'polder' && has(p.s, 'dike')}>
              <Card>
                <Button
                  class="w-full flex-col"
                  disabled={!canAfford(p.s, dikeCost(p.s))}
                  onClick={() => act({ type: 'dike' })}
                >
                  <span>
                    <Ico icon={I.dike} /> Build a dike · {cost(dikeCost(p.s))}{' '}
                    <Dim class="text-sm">{eta(timeToAfford(p.s, dikeCost(p.s), p.r))}</Dim>
                  </span>
                  <Dim class="text-sm">
                    +{DIKE.slots} plots of salt grass won from the sea. {p.s.dikes} dikes so far
                  </Dim>
                </Button>
              </Card>
            </Show>
            <Show when={ZONES[z].carry > 0}>
              <Card warn={p.r.zones[z].factor < 1}>
                <Stepper
                  label="Porters"
                  value={p.s.porters[z] ?? 0}
                  canAdd={idleHands(p.s) > 0}
                  onMinus={() => act({ type: 'porters', zone: z, delta: -1 })}
                  onPlus={() => act({ type: 'porters', zone: z, delta: 1 })}
                />
                <div class="text-sm">
                  Carrying {num(Math.min(p.r.zones[z].made, p.r.zones[z].capacity))} of {num(p.r.zones[z].made)} goods/s
                  made · each porter carries {ZONES[z].carry}/s
                  <Show when={p.r.zones[z].factor < 1}>
                    <b class="text-warn"> · short of porters, output is lost</b>
                  </Show>
                </div>
              </Card>
            </Show>
            <For each={inZone(z)}>{(id) => <Building s={p.s} r={p.r} id={id} />}</For>
          </section>
        )}
      </For>
    </>
  );
}

function Building(p: { s: State; r: Rates; id: BuildingId }) {
  const def = () => DEFS[p.id];
  const n = () => count(p.s, p.id);
  const c = () => buildCost(p.s, p.id);
  const maxed = () => isMaxed(p.s, p.id);
  const caps = () => Object.entries(def().caps ?? {}).map(([g, n]) => `+${n} ${GOOD_INFO[g as GoodId].name}`);
  const out = () => p.r.byBuilding[p.id] ?? {};
  return (
    <Card>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <b>
          <Ico icon={BUILDING_ICON[p.id]} class="mr-1 text-gold" />
          {def().name}
          <Show when={n() > 1}> ×{n()}</Show>
        </b>
        <span class="text-sm">
          <For each={Object.keys(out()) as GoodId[]}>
            {(g) => (
              <span>
                {rate(out()[g] ?? 0)} <Ico icon={GOOD_ICON[g]} label={GOOD_INFO[g].name} />
              </span>
            )}
          </For>
        </span>
      </div>
      <Dim class="text-sm">
        <Rich text={def().blurb} />
      </Dim>
      <Show when={caps().length}>
        <Dim class="block text-sm">Storage {caps().join(', ')} each</Dim>
      </Show>
      <Show when={def().uses}>
        {(u) => <Dim class="block text-sm">Each worker uses {cost(u())}/s, and stands idle without it</Dim>}
      </Show>
      <Show when={p.id === 'salt_pan' && n() > 0}>
        <Button on={p.s.keepSalt} class="mt-1.5 w-full text-sm" onClick={() => act({ type: 'keepSalt' })}>
          {p.s.keepSalt
            ? `Keeping Salt: every ${PRESERVE} in store keeps 1 more Bread and Eel. Tap to sell it all`
            : 'Selling Salt for Silver. Tap to keep it and preserve food'}
        </Button>
      </Show>
      <Show when={n() > 0 && def().slots > 0}>
        <Stepper
          label={p.id === 'sanctum' ? 'Assistants' : 'Workers'}
          value={p.s.buildings[p.id]?.workers ?? 0}
          max={workerSlots(p.s, p.id)}
          canAdd={idleHands(p.s) > 0}
          onMinus={() => act({ type: 'workers', building: p.id, delta: -1 })}
          onPlus={() => act({ type: 'workers', building: p.id, delta: 1 })}
        />
      </Show>
      <div class="mt-1.5 flex gap-2">
        <Show
          when={!maxed() && buildable(p.s, p.id) && (def().site || !zoneFull(p.s, def().zone))}
          fallback={
            <Show when={!maxed() && buildable(p.s, p.id)}>
              <Dim class="flex-1 self-center text-sm">
                The {ZONES[def().zone].name} is full.{' '}
                {def().zone === 'hearth'
                  ? 'Quarrying cuts new terraces.'
                  : has(p.s, 'dike')
                    ? 'Dikes win new land from the sea.'
                    : 'Grow elsewhere for now.'}
              </Dim>
            </Show>
          }
        >
          <Button class="flex-1" disabled={!canAfford(p.s, c())} onClick={() => act({ type: 'build', building: p.id })}>
            {n() ? 'Build another' : 'Build'} · {cost(c())}{' '}
            <Dim class="text-sm">{eta(timeToAfford(p.s, c(), p.r))}</Dim>
          </Button>
        </Show>
      </div>
    </Card>
  );
}

const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[];

function Magus(p: { s: State; m: MagusState }) {
  const [extra, setExtra] = createSignal(0);
  const [recipe, setRecipe] = createSignal<RecipeId>('study_vis');
  const [target, setTarget] = createSignal<BuildingId | undefined>();
  const open = () => RECIPE_IDS.filter((id) => recipeOpen(p.s, id));
  const plan = () => experimentPlan(p.s, p.m.id, recipe(), extra());
  const def = () => RECIPES[recipe()];
  const targets = () =>
    (Object.keys(p.s.buildings) as BuildingId[]).filter((id) => DEFS[id].perWorker && count(p.s, id) > 0);
  const result = () =>
    def().result === 'insight'
      ? `${num(plan().insight)} Insight`
      : def().result === 'labText'
        ? `a Lab Text (you have ${p.s.labTexts})`
        : target()
          ? `+25% ${DEFS[target() as BuildingId].name}`
          : 'choose a building';
  const sc = () => studyCost(p.m);
  return (
    <Card>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Portrait name={p.m.id} />
          <Label>{magusName(p.m.id)}</Label>
        </div>
        <span>
          <Rich text="Lab Total" /> <b>{p.m.lt}</b>
        </span>
      </div>
      <Dim class="mb-1 block text-sm">
        Reading: +{readingRate(p.s, p.m).toFixed(2)} Insight/s · Study the Vis: {RECIPES.study_vis.insightPerLT} Insight
        per point
      </Dim>
      <Show
        when={p.m.exp}
        fallback={
          <Dim>
            <Rich
              text={p.m.sanctum ? 'Reading in the Sanctum.' : 'Waiting in the Hall. Build a Sanctum for this magus.'}
            />
          </Dim>
        }
      >
        {(e) => (
          <div>
            <div class="flex justify-between">
              <span>{RECIPES[e().recipe].name}</span>
              <span>{mmss(Math.max(0, e().end - p.s.t))} left</span>
            </div>
            <Bar pct={((p.s.t - e().start) / (e().end - e().start)) * 100} />
            <Dim class="text-sm">
              <Show when={RECIPES[e().recipe].result === 'insight'}>{num(e().insight)} Insight · </Show>
              <Rich text={`${Math.round(e().botch * 100)}% botch`} />
            </Dim>
          </div>
        )}
      </Show>
      <Show when={p.m.sanctum && !p.m.exp}>
        <div class="my-2 border-t border-line pt-2">
          <Show when={open().length > 1}>
            <div class="mb-1.5 flex flex-wrap gap-1.5">
              <For each={open()}>
                {(id) => (
                  <Button on={recipe() === id} onClick={() => setRecipe(id)} class="px-2 text-sm">
                    {RECIPES[id].name}
                  </Button>
                )}
              </For>
            </div>
          </Show>
          <h4>{def().name}</h4>
          <Dim class="text-sm">
            <Rich text={def().blurb} />
          </Dim>
          <Show when={def().result === 'device'}>
            <div class="my-1.5 flex flex-wrap gap-1.5">
              <For each={targets()}>
                {(id) => (
                  <Button on={target() === id} onClick={() => setTarget(id)} class="px-2 text-sm">
                    <Ico icon={BUILDING_ICON[id]} /> {DEFS[id].name}
                  </Button>
                )}
              </For>
            </div>
          </Show>
          <Stepper
            label="Extra Vis"
            value={extra()}
            max={EXPERIMENT.maxExtraVis}
            onMinus={() => setExtra(extra() - 1)}
            onPlus={() => setExtra(extra() + 1)}
          />
          <div class="text-sm">
            {result()} · {mmss(plan().time)}
          </div>
          <Odds botch={plan().botch} discovery={plan().discovery} />
          <div class="text-sm">
            <span class="text-bad">{Math.round(plan().botch * 100)}%</span>{' '}
            <Rich text={`botch: the costs are lost, +${EXPERIMENT.botchNotice} Notice`} /> ·{' '}
            <span class="text-gold">{Math.round(plan().discovery * 100)}%</span>{' '}
            <Rich text="discovery: double the result" />
          </div>
          <Button
            primary
            class="mt-1.5 w-full"
            disabled={!canAfford(p.s, plan().cost) || (def().result === 'device' && !target())}
            onClick={() =>
              act({ type: 'experiment', magus: p.m.id, recipe: recipe(), extra: extra(), target: target() })
            }
          >
            Begin · {cost(plan().cost)} <span class="text-sm">{eta(timeToAfford(p.s, plan().cost))}</span>
          </Button>
        </div>
      </Show>
      <Button
        class="mt-1.5 w-full"
        disabled={!canAfford(p.s, sc())}
        onClick={() => act({ type: 'study', magus: p.m.id })}
      >
        <span class="flex flex-col">
          <span>
            Study: Lab Total {p.m.lt} → {p.m.lt + 1} · {cost(sc())}
          </span>
          <Dim class="text-sm">
            +{(readingRate(p.s, p.m) / p.m.lt).toFixed(2)} Insight/s reading, +{RECIPES.study_vis.insightPerLT} per
            Study the Vis
          </Dim>
        </span>
      </Button>
    </Card>
  );
}

function Chronicle(p: { s: State }) {
  return (
    <Card>
      <Label>Chronicle</Label>
      <ul class="italic">
        <For each={[...p.s.chronicle].reverse()}>
          {(c) => (
            <li class="mb-1.5">
              <Dim>
                {START_YEAR + Math.floor(c.t / YEAR)} · {mmss(c.t)}
              </Dim>{' '}
              <Rich text={c.text} />
            </li>
          )}
        </For>
      </ul>
    </Card>
  );
}
