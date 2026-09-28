// The full run's panels: research, the Notice levers and the Drowned Gate.
import { For, Show } from 'solid-js';
import {
  almsCost,
  bellStatus,
  bribeCost,
  canAfford,
  dark,
  endowCost,
  giftCost,
  has,
  idleHands,
  lowTide,
  type Rates,
  researchCost,
  type State,
  timeToAfford,
  visibleResearch,
  year,
} from '../core/index.ts';
import { GATE, GOOD_INFO, GOODS, type GoodId, NOTICE, RESEARCH_DEFS, ZONES, type ZoneId } from '../data/index.ts';
import { cost, eta, num } from './format.ts';
import { GOOD_ICON, I } from './icons.tsx';
import { Bar, Button, Card, Dim, Ico, Label, Stepper } from './kit.tsx';
import { Rich } from './Rich.tsx';
import { act, options } from './store.ts';

export function Research(p: { s: State; r: Rates }) {
  return (
    <>
      <Dim class="mb-2 block text-sm">
        <Rich text="Research is bought with Insight. New items appear as you learn the old ones." />
      </Dim>
      <For each={visibleResearch(p.s)}>
        {(id) => {
          const def = RESEARCH_DEFS[id];
          const n = () => p.s.research[id] ?? 0;
          const c = () => researchCost(p.s, id);
          const done = () => n() > 0 && !def.repeatable;
          return (
            <Card class={done() ? 'opacity-70' : ''}>
              <div class="flex items-center justify-between gap-2">
                <b>
                  <Ico icon={I.research} class="mr-1 text-gold" />
                  {def.name}
                  <Show when={def.repeatable && n() > 0}> ×{n()}</Show>
                </b>
                <Show when={done()}>
                  <Dim class="text-sm">Known</Dim>
                </Show>
              </div>
              <Dim class="text-sm">
                <Rich text={def.blurb} />
              </Dim>
              <Show when={!done()}>
                <Button
                  class="mt-1.5 w-full"
                  disabled={!canAfford(p.s, c())}
                  onClick={() => act({ type: 'research', id })}
                >
                  Learn · {cost(c())} <Dim class="text-sm">{eta(timeToAfford(p.s, c(), p.r))}</Dim>
                </Button>
              </Show>
            </Card>
          );
        }}
      </For>
    </>
  );
}

export function NoticeCard(p: { s: State; r: Rates }) {
  const settles = () => p.r.noticeGen * 10;
  return (
    <Card warn={settles() >= NOTICE.strike.at}>
      <Label>
        <Ico icon={I.notice} /> Notice
      </Label>
      <div class="text-sm">
        Now <b>{Math.floor(p.s.notice)}</b> · rising {num(p.r.noticeGen)} a minute · settles at{' '}
        <b>{Math.round(settles())}</b>
        <Dim>
          {' '}
          · tax at {NOTICE.tax.at}, strike at {NOTICE.strike.at}, audit at {NOTICE.audit.at}, Renounced at 100
        </Dim>
      </div>
      <Show when={has(p.s, 'endow')}>
        <div class="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button disabled={!canAfford(p.s, endowCost(p.s))} onClick={() => act({ type: 'endow' })} class="flex-col">
            <span>
              <Ico icon={I.endow} /> Endow the Parish
            </span>
            <Dim class="text-sm">
              {cost(endowCost(p.s))} · settles {NOTICE.endow.gen * 10} lower, for good
            </Dim>
          </Button>
          <Button disabled={!canAfford(p.s, almsCost(p.s))} onClick={() => act({ type: 'alms' })} class="flex-col">
            <span>
              <Ico icon={I.alms} /> Give Alms
            </span>
            <Dim class="text-sm">
              {cost(almsCost(p.s))} · settles {NOTICE.alms.gen * 10} lower, for good
            </Dim>
          </Button>
          <Button disabled={!canAfford(p.s, giftCost(p.s))} onClick={() => act({ type: 'gift' })} class="flex-col">
            <span>
              <Ico icon={I.eel} /> Eels for the Monks
            </span>
            <Dim class="text-sm">
              {cost(giftCost(p.s))} · −{NOTICE.gift.notice} now
            </Dim>
          </Button>
          <Button disabled={!canAfford(p.s, bribeCost(p.s))} onClick={() => act({ type: 'bribe' })} class="flex-col">
            <span>
              <Ico icon={I.bribe} /> Bribe the Lord
            </span>
            <Dim class="text-sm">
              {cost(bribeCost(p.s))} · −{NOTICE.bribe.notice} now, back in ~10 min
            </Dim>
          </Button>
        </div>
      </Show>
    </Card>
  );
}

export function Gate(p: { s: State; r: Rates }) {
  const g = () => p.s.gate;
  const st = () => bellStatus(p.s);
  const need = () => (st().next ? (Object.keys(st().next!.price) as GoodId[]) : []);
  return (
    <>
      <Card>
        <Label>
          <Ico icon={I.gate} /> The Drowned Gate
        </Label>
        <Dim class="text-sm">
          <Rich text="Beneath the marsh lies Ys, the drowned city, and seven bells hang in its towers. Raise the Gate with Stone, pour Insight and goods into it, and ring the bells one by one. Each bell opens something new, and wakes something too." />
        </Dim>
        <Show
          when={g()}
          fallback={
            <Button
              primary
              class="mt-2 w-full"
              disabled={!canAfford(p.s, GATE.found)}
              onClick={() => act({ type: 'gate', op: 'found' })}
            >
              Found the Gate · {cost(GATE.found)}
            </Button>
          }
        >
          {(gate) => (
            <>
              <Show when={!gate().raised}>
                <div class="mt-2">
                  Raising: <b>{num(gate().stone)}</b>
                  <Dim>/{num(GATE.raise)} Stone</Dim>
                  <Bar pct={(gate().stone / GATE.raise) * 100} />
                </div>
              </Show>
              <Stepper
                label="Porters carrying Stone out"
                value={gate().porters}
                canAdd={idleHands(p.s) > 0}
                onMinus={() => act({ type: 'gatePorters', delta: -1 })}
                onPlus={() => act({ type: 'gatePorters', delta: 1 })}
              />
              <Dim class="text-sm">{num(p.r.gateStone)} Stone/s from the Hall to the Gate</Dim>
              <Label>Pour into the Gate</Label>
              <Dim class="mb-1 block text-sm">
                A poured good's income goes to the Gate, which has no cap, instead of the Hall.
              </Dim>
              <div class="grid grid-cols-3 gap-1.5">
                <For each={GOODS.filter((k) => p.s.res[k] > 0 || gate().store[k] > 0 || need().includes(k))}>
                  {(k) => (
                    <Button
                      on={gate().pour.includes(k)}
                      class="px-1.5 text-sm"
                      onClick={() => act({ type: 'pour', good: k })}
                    >
                      <Ico icon={GOOD_ICON[k]} /> {num(gate().store[k])}
                    </Button>
                  )}
                </For>
              </div>
            </>
          )}
        </Show>
      </Card>
      <Show when={g()?.raised && st().next}>
        <Card warn={st().ready}>
          <Label>
            <Ico icon={I.rite} /> Bell {(g()?.bells ?? 0) + 1} of {GATE.bells.length}: {st().next?.name}
          </Label>
          <Dim class="block text-sm">Opens: {st().next?.opens}</Dim>
          <Dim class="block text-sm">Wakes: {st().next?.wakes}</Dim>
          <For each={need()}>
            {(k) => {
              const want = () => st().next?.price[k] ?? 0;
              const have = () => g()?.store[k] ?? 0;
              return (
                <div class={have() >= want() ? 'text-good' : ''}>
                  <Ico icon={GOOD_ICON[k]} /> {GOOD_INFO[k].name} in the Gate: <b>{num(have())}</b>
                  <Dim>/{num(want())}</Dim>{' '}
                  <Dim class="text-sm">
                    {eta(
                      want() > have() && p.r.gate[k] > 0
                        ? (want() - have()) / p.r.gate[k]
                        : want() > have()
                          ? Number.POSITIVE_INFINITY
                          : 0,
                    )}
                  </Dim>
                  <Bar pct={(have() / want()) * 100} />
                </div>
              );
            }}
          </For>
          <Show when={!st().quiet}>
            <p class="text-bad">The whole bay will watch: Notice must be under {GATE.lastBellNotice}.</p>
          </Show>
          <Button primary class="mt-2 w-full" disabled={!st().ready} onClick={() => act({ type: 'gate', op: 'bell' })}>
            Ring the bell
          </Button>
          <Show when={options().dev}>
            <Button class="mt-1.5 w-full text-sm" onClick={() => act({ type: 'devFill' })}>
              Dev: fill the Gate for this bell
            </Button>
          </Show>
        </Card>
      </Show>
      <Show when={(g()?.bells ?? 0) > 0}>
        <Card>
          <Label>
            <Ico icon={I.rite} /> Rung
          </Label>
          <For each={GATE.bells.slice(0, g()?.bells ?? 0)}>
            {(b) => (
              <div class="mb-1 text-sm">
                <b>{b.name}.</b>{' '}
                <Dim>
                  {b.opens} {b.wakes}
                </Dim>
              </div>
            )}
          </For>
          <Show when={(g()?.bells ?? 0) >= 1}>
            <div class="text-sm">
              Scissy: <b>{lowTide(p.s) ? 'the tide is out, the forest is workable' : 'the tide is in'}</b>
            </div>
          </Show>
          <Show when={(g()?.bells ?? 0) >= 4}>
            <div class={`text-sm ${dark(p.s) ? 'text-gold' : ''}`}>
              <Ico icon={I.dark} />{' '}
              {dark(p.s) ? 'The hidden hour: Notice stops, experiments run twice as fast' : 'Daylight'}
            </div>
          </Show>
          <Show when={(g()?.bells ?? 0) >= 6}>
            <Label>
              <Ico icon={I.river} /> The Couesnon
            </Label>
            <Dim class="mb-1 block text-sm">
              Doubles one zone's output. It can be moved once a year
              {p.s.couesnon?.year === year(p.s) ? ': it has moved this year.' : '.'}
            </Dim>
            <div class="grid grid-cols-3 gap-1.5">
              <For each={Object.keys(ZONES) as ZoneId[]}>
                {(z) => (
                  <Button
                    on={p.s.couesnon?.zone === z}
                    class="px-1.5 text-sm"
                    onClick={() => act({ type: 'couesnon', zone: z })}
                  >
                    {ZONES[z].name}
                  </Button>
                )}
              </For>
            </div>
          </Show>
        </Card>
      </Show>
    </>
  );
}
