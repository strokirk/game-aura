// The full run's panels: research, the Notice levers and the Drowned Gate.
import { For, Show } from 'solid-js';
import {
  almsCost,
  aura,
  auraBoosts,
  bellStatus,
  bribeCost,
  canAfford,
  canAffordResearch,
  count,
  dark,
  divine,
  endowCost,
  friars,
  giftCost,
  has,
  idleHands,
  influence,
  lowTide,
  nextTribunal,
  noticeDecay,
  noticeLimit,
  offerCost,
  type Rates,
  researchCost,
  type State,
  stains,
  timeToAfford,
  visibleResearch,
  year,
} from '../core/index.ts';
import {
  AURA,
  DECREES,
  FAERIE,
  GATE,
  GOOD_INFO,
  GOODS,
  type GoodId,
  NOTICE,
  RESEARCH_DEFS,
  TRIBUNAL,
  ZONES,
  type ZoneId,
} from '../data/index.ts';
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
                  disabled={!canAffordResearch(p.s, c())}
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

/** Only the next line Notice will cross, not all of them. */
function nextThreshold(s: State) {
  const limit = noticeLimit(s);
  const lines: [number, string][] = [
    [NOTICE.tax.at, 'the lord taxes'],
    [NOTICE.strike.at, 'the porters strike'],
    [NOTICE.audit.at, 'the Order audits'],
  ];
  const next = lines.find(([at]) => at > s.notice && at < limit);
  return next ? `at ${next[0]} ${next[1]}` : `at ${limit} the covenant is lost`;
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
        <Dim> · {nextThreshold(p.s)}</Dim>
      </div>
      <Show when={nextTribunal(p.s)}>
        {(y) => (
          <div class="mt-1 text-sm">
            <Rich text="Tribunal" /> in <b>{y()}</b> · influence now <b>{influence(p.s)}</b>
            <Dim> (1 per 20 Notice under 100, 1 per 20 Vis; a gift per 2)</Dim>
            <For each={p.s.decrees}>
              {(i) => (
                <div class="text-warn">
                  Decree {DECREES[i]?.name}: ×{TRIBUNAL.mult} Notice until {y()}
                </div>
              )}
            </For>
          </div>
        )}
      </Show>
      <Show when={has(p.s, 'endow')}>
        <div class="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button disabled={!canAfford(p.s, endowCost(p.s))} onClick={() => act({ type: 'endow' })} class="flex-col">
            <span>
              <Ico icon={I.endow} /> Endow the Parish
            </span>
            <Dim class="text-sm">
              {cost(endowCost(p.s))} · settles {NOTICE.endow.gen * 10} lower, for good · every second one: Divine +1,
              aura −1
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
              {cost(bribeCost(p.s))} · −{NOTICE.bribe.notice} now, back in ~10 min · an Infernal stain: all output ×
              {AURA.stain} for {AURA.stainSecs / 120} years
            </Dim>
          </Button>
        </div>
      </Show>
    </Card>
  );
}

const pct = (x: number) => `${x >= 1 ? '+' : '−'}${Math.round(Math.abs(x - 1) * 100)}%`;

/** The covenant's aura: its realms, the boosts it gives at each level, and the offerings at the Regio Spring. */
export function AuraCard(p: { s: State; r: Rates }) {
  const b = () => auraBoosts(p.s);
  const a = () => aura(p.s);
  const tiers = (): [number, string, string][] => [
    [Number.NEGATIVE_INFINITY, 'Lab Insight', pct(b().insight)],
    [AURA.speedFrom, 'Experiment speed', pct(b().speed)],
    [AURA.agingFrom, 'Aging', pct(b().aging)],
    [AURA.discoveryFrom, 'Discovery', `+${Math.round(b().discovery * 100)} points`],
    [AURA.visFrom, 'Vis sites', pct(b().vis)],
    [AURA.ltFrom, 'Lab Total', `+${b().lt}`],
  ];
  const spring = () => has(p.s, 'faerie') && count(p.s, 'regio_spring') > 0;
  return (
    <Card warn={a() < AURA.base}>
      <Label>
        <Ico icon={I.aura} /> Aura {a()}
      </Label>
      <div class="text-sm">
        <Rich
          text={`Magic ${p.s.aura.magic} − Divine ${divine(p.s)} (${p.s.endowments} Endowments, ${friars(p.s)} houses of friars${p.s.aura.aegisAt !== null ? ', held off by the Aegis' : ''}).`}
        />
        <Show when={stains(p.s)}>
          <Rich text={` Infernal stains ${stains(p.s)}: all output ×${(AURA.stain ** stains(p.s)).toFixed(2)}.`} />
        </Show>
        <Show when={p.s.faerie.level}>
          <Rich text={` Faerie ${p.s.faerie.level}: Notice fades ${(noticeDecay(p.s) * 100).toFixed(1)}% a minute.`} />
        </Show>
      </div>
      <ul class="mt-1 grid grid-cols-2 gap-x-3 text-sm">
        <For each={tiers()}>
          {([from, name, v]) => (
            <li class={a() >= from ? '' : 'text-dim'}>
              {name}: <b>{a() >= from ? v : `at aura ${from}`}</b>
            </li>
          )}
        </For>
      </ul>
      <Dim class="block text-sm">
        <Rich text="Raise the Aura is research: Magic +1, Notice +1 a minute for good." />
      </Dim>
      <Show when={spring()}>
        <Button
          class="mt-1.5 w-full flex-col"
          disabled={!canAfford(p.s, offerCost(p.s))}
          onClick={() => act({ type: 'offer' })}
        >
          <span>
            <Ico icon={I.faerie} /> Leave an offering at the Regio Spring · {cost(offerCost(p.s))}
          </span>
          <Dim class="text-sm">
            Mostly lost. Sometimes Faerie +1 (max {FAERIE.max}): Notice fades faster. A gift, if you're in real need
          </Dim>
        </Button>
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
