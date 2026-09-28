// The full run's panels: research, the Notice levers and the Drowned Gate.
import { For, Show } from 'solid-js';
import {
  almsCost,
  bribeCost,
  canAfford,
  endowCost,
  giftCost,
  has,
  idleHands,
  type Rates,
  researchCost,
  riteStatus,
  type State,
  timeToAfford,
  visibleResearch,
} from '../core/index.ts';
import { GATE, NOTICE, RESEARCH_DEFS } from '../data/index.ts';
import { cost, eta, num } from './format.ts';
import { I } from './icons.tsx';
import { Bar, Button, Card, Dim, Ico, Label, Stepper } from './kit.tsx';
import { Rich } from './Rich.tsx';
import { act } from './store.ts';

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

const Gauge = (p: { label: string; value: number; need: number; unit: string }) => (
  <div class={p.value >= p.need - 1e-9 ? 'text-good' : ''}>
    {p.label}: <b>{p.value.toFixed(2)}</b>
    <Dim>
      /{p.need}
      {p.unit}
    </Dim>
    <Bar pct={(p.value / p.need) * 100} />
  </div>
);

export function Gate(p: { s: State; r: Rates }) {
  const g = () => p.s.gate;
  const st = () => riteStatus(p.s);
  return (
    <>
      <Card>
        <Label>
          <Ico icon={I.gate} /> The Drowned Gate
        </Label>
        <Dim class="text-sm">
          <Rich text="Beneath the marsh lies a drowned regio. Raise its Gate with Stone, pour Insight into it, and perform three Rites while Stone and Vis flow to it and every magus stands ready in their Sanctum." />
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
              <Dim class="text-sm">{num(p.r.gate.stone)} Stone/s from the Hall to the Gate</Dim>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <Button on={gate().visToGate} onClick={() => act({ type: 'gate', op: 'vis' })}>
                  Vis to the Gate: {gate().visToGate ? 'on' : 'off'}
                </Button>
                <Button on={gate().pour} onClick={() => act({ type: 'gate', op: 'pour' })}>
                  Pour Insight: {gate().pour ? 'on' : 'off'}
                </Button>
              </div>
            </>
          )}
        </Show>
      </Card>
      <Show when={g()?.raised}>
        <Card warn={st().ready}>
          <Label>
            <Ico icon={I.rite} /> Rite {(g()?.rites ?? 0) + 1} of 3<Show when={st().next}>: {st().next?.name}</Show>
          </Label>
          <Gauge label="Stone" value={st().stone} need={GATE.stonePerS} unit="/s over the last minute" />
          <Gauge label="Vis" value={st().vis} need={GATE.visPerS} unit="/s over the last minute" />
          <div class={st().insight >= (st().next?.insight ?? 0) ? 'text-good' : ''}>
            Insight in the Gate: <b>{num(st().insight)}</b>
            <Dim>/{num(st().next?.insight ?? 0)}</Dim>
            <Bar pct={(st().insight / (st().next?.insight ?? 1)) * 100} />
          </div>
          <div class={st().magiReady ? 'text-good' : ''}>
            <Rich text="Every magus in a Sanctum, and none experimenting" />: {st().magiReady ? 'yes' : 'no'}
          </div>
          <Button primary class="mt-2 w-full" disabled={!st().ready} onClick={() => act({ type: 'gate', op: 'rite' })}>
            Perform the Rite
          </Button>
        </Card>
      </Show>
    </>
  );
}
