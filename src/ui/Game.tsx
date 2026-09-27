import { createMemo, createSignal, For, Match, Show, Switch } from 'solid-js';
import {
  buildCost,
  canAfford,
  count,
  experimentPlan,
  housing,
  idleHands,
  type MagusState,
  magusName,
  type Rates,
  rates,
  type State,
  scenarioOf,
  studyCost,
  timeToAfford,
  workerSlots,
  year,
  zoneUsed,
} from '../core/index.ts';
import {
  BUILDINGS,
  type BuildingId,
  DEFS,
  EXPERIMENT,
  GOOD_INFO,
  GOODS,
  type GoodId,
  RECIPES,
  START_YEAR,
  YEAR,
  ZONES,
  type ZoneId,
} from '../data/index.ts';
import { cost, eta, mmss, num, rate } from './format.ts';
import { BUILDING_ICON, GOOD_ICON, I } from './icons.tsx';
import { Bar, Button, Card, Dim, Ico, Label, Stepper } from './kit.tsx';
import { act, game, options, setPaused, setSpeed, speed } from './store.ts';

type Tab = 'covenant' | 'magi' | 'chronicle';
const TABS: [Tab, string][] = [
  ['covenant', 'Covenant'],
  ['magi', 'Magi'],
  ['chronicle', 'Chronicle'],
];

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
          <Match when={tab() === 'chronicle'}>
            <Chronicle s={s()} />
          </Match>
        </Switch>
      </div>
      <nav class="flex border-t border-line bg-bar pb-[env(safe-area-inset-bottom)]">
        <For each={TABS}>
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

function Header(p: { s: State; r: Rates }) {
  const speeds = () => (options().dev ? [0, 1, 2, 8] : [0, 1, 2]);
  const shown = (g: GoodId) => p.s.res[g] > 0 || Math.abs(p.r.net[g]) > 1e-9;
  return (
    <header class="border-b border-line bg-bar px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
      <div class="flex items-center justify-between gap-2">
        <div>
          <b>{year(p.s)}</b> <Dim>· {mmss(YEAR - (p.s.t % YEAR))} to next year</Dim>
          <Bar pct={((p.s.t % YEAR) / YEAR) * 100} />
        </div>
        <div class="flex gap-1">
          <For each={speeds()}>
            {(v) => (
              <Button
                on={speed() === v}
                onClick={() => setSpeed(v)}
                class="min-w-11 px-2"
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
        Goal: {scenarioOf(p.s).goal}
        <Show when={options().dev}>
          <Dim> · seed {p.s.seed}</Dim>
        </Show>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <For each={GOODS.filter(shown)}>
          {(g) => (
            <div>
              <Ico icon={GOOD_ICON[g]} class="mr-1 text-gold" />
              <b class={p.s.res[g] >= GOOD_INFO[g].cap - 1e-9 ? 'text-bad' : ''}>{num(p.s.res[g])}</b>
              <Dim>/{num(GOOD_INFO[g].cap)}</Dim>
              <div class={`text-sm ${p.r.net[g] < -1e-9 ? 'text-bad' : ''}`}>
                {GOOD_INFO[g].name} {rate(p.r.net[g])}
              </div>
            </div>
          )}
        </For>
        <div>
          <Ico icon={I.notice} class="mr-1 text-gold" />
          <b>{Math.floor(p.s.notice)}</b>
          <Dim> → {Math.round(p.r.noticeGen * 10)}</Dim>
          <div class="text-sm">Notice (settles at)</div>
        </div>
      </div>
    </header>
  );
}

function Covenant(p: { s: State; r: Rates }) {
  const inZone = (z: ZoneId) =>
    (Object.keys(BUILDINGS) as BuildingId[]).filter(
      (id) =>
        BUILDINGS[id].zone === z &&
        ((scenarioOf(p.s).allowed as readonly BuildingId[]).includes(id) || count(p.s, id) > 0),
    );
  const zones = () => (Object.keys(ZONES) as ZoneId[]).filter((z) => inZone(z).length);
  const breadLeft = () => (p.r.net.bread < 0 ? p.s.res.bread / -p.r.net.bread : Number.POSITIVE_INFINITY);
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
          <span class={p.r.net.bread < 0 ? 'text-bad' : ''}>
            Bread {rate(p.r.net.bread)}
            <Show when={Number.isFinite(breadLeft())}> · lasts {mmss(breadLeft())}</Show>
          </span>
        </div>
        <Show when={p.r.hungry}>
          <p class="text-bad">No bread: everyone works at half speed, and hands are leaving.</p>
        </Show>
      </Card>
      <For each={zones()}>
        {(z) => (
          <section class="mb-4">
            <Label>
              {ZONES[z].name}{' '}
              <Dim class="text-xs">
                · {zoneUsed(p.s, z)}/{ZONES[z].slots} plots · Notice ×{ZONES[z].noticeFactor}
              </Dim>
            </Label>
            <Show when={ZONES[z].carry > 0}>
              <Card warn={p.r.zones[z].factor < 1}>
                <Stepper
                  label="Porters"
                  value={p.s.porters[z] ?? 0}
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
  const maxed = () => n() >= (def().max ?? Number.POSITIVE_INFINITY);
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
      <Dim class="text-sm">{def().blurb}</Dim>
      <Show when={n() > 0 && def().slots > 0 && p.id !== 'sanctum'}>
        <Stepper
          label="Workers"
          value={p.s.buildings[p.id]?.workers ?? 0}
          max={workerSlots(p.s, p.id)}
          onMinus={() => act({ type: 'workers', building: p.id, delta: -1 })}
          onPlus={() => act({ type: 'workers', building: p.id, delta: 1 })}
        />
      </Show>
      <Show when={!maxed() && (scenarioOf(p.s).allowed as readonly BuildingId[]).includes(p.id)}>
        <Button
          class="mt-1.5 w-full"
          disabled={!canAfford(p.s, c())}
          onClick={() => act({ type: 'build', building: p.id })}
        >
          {n() ? 'Build another' : 'Build'} · {cost(c())} <Dim class="text-sm">{eta(timeToAfford(p.s, c(), p.r))}</Dim>
        </Button>
      </Show>
    </Card>
  );
}

function Magus(p: { s: State; m: MagusState }) {
  const [extra, setExtra] = createSignal(0);
  const plan = () => experimentPlan(p.s, p.m.id, 'study_vis', extra());
  const sc = () => studyCost(p.m);
  return (
    <Card>
      <div class="flex items-center justify-between">
        <Label>
          <Ico icon={I.magus} /> {magusName(p.m.id)}
        </Label>
        <span>Lab Total {p.m.lt}</span>
      </div>
      <Show when={p.m.exp} fallback={<Dim>{p.m.sanctum ? 'Reading in the Sanctum.' : 'No Sanctum.'}</Dim>}>
        {(e) => (
          <div>
            <div class="flex justify-between">
              <span>{RECIPES[e().recipe].name}</span>
              <span>{mmss(Math.max(0, e().end - p.s.t))} left</span>
            </div>
            <Bar pct={((p.s.t - e().start) / (e().end - e().start)) * 100} />
            <Dim class="text-sm">
              {num(e().insight)} Insight · {Math.round(e().botch * 100)}% botch
            </Dim>
          </div>
        )}
      </Show>
      <Show when={p.m.sanctum && !p.m.exp}>
        <div class="my-2 border-t border-line pt-2">
          <h4>{RECIPES.study_vis.name}</h4>
          <Dim class="text-sm">{RECIPES.study_vis.blurb}</Dim>
          <Stepper
            label="Extra Vis"
            value={extra()}
            max={EXPERIMENT.maxExtraVis}
            onMinus={() => setExtra(extra() - 1)}
            onPlus={() => setExtra(extra() + 1)}
          />
          <div class="text-sm">
            {num(plan().insight)} Insight · {mmss(plan().time)} · {Math.round(plan().botch * 100)}% botch ·{' '}
            {Math.round(plan().discovery * 100)}% discovery
          </div>
          <Button
            primary
            class="mt-1.5 w-full"
            disabled={!canAfford(p.s, plan().cost)}
            onClick={() => act({ type: 'experiment', magus: p.m.id, recipe: 'study_vis', extra: extra() })}
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
        Study: Lab Total {p.m.lt} → {p.m.lt + 1} · {cost(sc())}
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
              {c.text}
            </li>
          )}
        </For>
      </ul>
    </Card>
  );
}
