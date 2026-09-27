import { type Cost, GOOD_INFO, type GoodId } from '../data/index.ts';
import { options } from './store.ts';

export function num(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  const a = Math.abs(n);
  if (options().numbers === 'short') {
    if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (a >= 1e4) return `${(n / 1e3).toFixed(1)}k`;
  }
  if (a < 100 && a % 1 !== 0) return n.toFixed(1);
  return Math.floor(n).toLocaleString('en');
}
export const rate = (n: number) =>
  `${n >= 0 ? '+' : '−'}${Math.abs(n) < 10 ? Math.abs(n).toFixed(2) : num(Math.abs(n))}/s`;
export const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
export const cost = (c: Cost) =>
  (Object.keys(c) as GoodId[]).map((g) => `${num(c[g] ?? 0)} ${GOOD_INFO[g].name}`).join(' + ');
export const eta = (t: number) => (t <= 0 ? '' : Number.isFinite(t) ? `in ${mmss(t)}` : 'not at current rates');
