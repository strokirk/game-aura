// UI state: which screen, overlays, options, and the loop that drives the core.
import { createSignal } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import {
  type Action,
  apply,
  createRun,
  rates,
  replay,
  type Save,
  type State,
  step,
  toSave,
  year,
} from '../core/index.ts';
import { GOODS, type GoodId, type ScenarioId } from '../data/index.ts';

export type Screen = 'title' | 'options' | 'game' | 'end';
export const [screen, setScreen] = createSignal<Screen>('title');
export const [optionsFrom, setOptionsFrom] = createSignal<'title' | 'pause'>('title');
export const [paused, setPaused] = createSignal(false);
export const [confirming, setConfirming] = createSignal<{ text: string; yes: () => void } | null>(null);
const [speedSignal, setSpeedSignal] = createSignal(0);
export const speed = speedSignal;
let lastSpeed = 1;
export function setSpeed(v: number) {
  if (v > 0) lastSpeed = v;
  setSpeedSignal(v);
}
export const togglePause = () => setSpeed(speed() ? 0 : lastSpeed);
export const [toast, setToast] = createSignal('');

let state: State | null = null;
/** The core state mirrored into a Solid store once per frame. */
export const [game, setGame] = createStore<{ s: State | null }>({ s: null });
const sync = () => setGame('s', reconcile(state));

// ─── Options ──────────────────────────────────────────────────────

export interface Options {
  numbers: 'short' | 'full';
  textSize: 'small' | 'medium' | 'large';
  dev: boolean;
}
const OPTIONS_KEY = 'aura-options';
const SAVE_KEY = 'aura-v2-save';
function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}
function writeJson(key: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}
export const [options, setOptionsSignal] = createSignal<Options>({
  numbers: 'short',
  textSize: 'medium',
  dev: false,
  ...readJson<Options>(OPTIONS_KEY),
});
export function setOptions(o: Partial<Options>) {
  setOptionsSignal({ ...options(), ...o });
  writeJson(OPTIONS_KEY, options());
  document.documentElement.dataset.text = options().textSize;
}
document.documentElement.dataset.text = options().textSize;

// ─── Runs ─────────────────────────────────────────────────────────

let flash: ReturnType<typeof setTimeout> | undefined;
export function say(text: string) {
  setToast(text);
  clearTimeout(flash);
  flash = setTimeout(() => setToast(''), Math.max(2500, text.length * 55));
}

// ─── Pops: floating numbers for sudden gains and losses ────────────

export interface Pop {
  id: number;
  key: GoodId | 'notice';
  n: number;
}
export const [pops, setPops] = createSignal<Pop[]>([]);
let popId = 0;
function pop(key: Pop['key'], n: number) {
  const id = ++popId;
  setPops([...pops().slice(-8), { id, key, n }]);
  setTimeout(() => setPops(pops().filter((x) => x.id !== id)), 1400);
}
/** Shows what changed beyond the steady rates: experiment results, event effects, purchases. */
function popChanges(prev: State, next: State) {
  const dt = next.t - prev.t;
  const r = rates(prev);
  for (const g of GOODS) {
    const jump = next.res[g] - prev.res[g] - r.net[g] * dt;
    if (Math.abs(jump) >= 1) pop(g, jump);
  }
  const drift = ((r.noticeGen - 0.1 * prev.notice) / 60) * dt;
  const jump = next.notice - prev.notice - drift;
  if (Math.abs(jump) >= 1) pop('notice', jump);
}

export const hasSave = () => readJson<Save>(SAVE_KEY) !== null;
function save() {
  if (state && !state.outcome) writeJson(SAVE_KEY, toSave(state));
}

/** Runs start paused, so the player can look around first. */
function start(s: State) {
  state = s;
  sync();
  setPaused(false);
  setSpeed(0);
  lastSpeed = 1;
  setScreen('game');
}
export function newRun(scenario: ScenarioId, seed = Math.floor(Math.random() * 2 ** 31)) {
  writeJson(SAVE_KEY, null);
  start(createRun(scenario, seed));
}
export function continueRun() {
  const sv = readJson<Save>(SAVE_KEY);
  if (!sv) return;
  try {
    start(replay(sv));
  } catch (e) {
    writeJson(SAVE_KEY, null);
    say(`That save no longer fits the rules and was discarded. (${(e as Error).message})`);
  }
}
export function quitToTitle() {
  save();
  setPaused(false);
  setScreen('title');
}
export function restartRun() {
  if (state) newRun(state.scenario);
}

export function act(a: Action) {
  if (!state) return;
  const r = apply(state, a);
  if ('error' in r) return say(r.error);
  popChanges(state, r);
  state = r;
  sync();
  if (state.outcome) finish();
}

function finish() {
  writeJson(SAVE_KEY, null);
  setScreen('end');
}

// ─── The loop ─────────────────────────────────────────────────────

let last = 0;
function frame(now: number) {
  requestAnimationFrame(frame);
  const real = Math.min(0.25, (now - (last || now)) / 1000);
  last = now;
  if (!state || screen() !== 'game' || paused() || confirming()) return;
  const y = year(state);
  const next = step(state, real * speed());
  if (next === state) return;
  popChanges(state, next);
  state = next;
  sync();
  if (year(state) !== y) save();
  if (state.outcome) finish();
}
requestAnimationFrame(frame);

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || screen() !== 'game' || paused() || (e.target as HTMLElement).closest('input, textarea'))
    return;
  e.preventDefault();
  togglePause();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen() === 'game') {
    save();
    setPaused(true);
  }
});
