// The only place raw styling decisions live. Screens compose these; they don't invent new looks.
import { type JSX, type ParentProps, Show, splitProps } from 'solid-js';
import { I, type Icon } from './icons.tsx';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; on?: boolean };
export function Button(p: ButtonProps) {
  const [own, rest] = splitProps(p, ['primary', 'on', 'class']);
  const look = () =>
    own.on
      ? 'bg-primary border-primary-line'
      : own.primary
        ? 'bg-primary border-primary-line hover:enabled:brightness-110'
        : 'bg-btn border-btn-line hover:enabled:brightness-125';
  return (
    <button
      type="button"
      aria-pressed={own.on}
      class={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-1.5 disabled:cursor-default disabled:opacity-45 ${look()} ${own.class ?? ''}`}
      {...rest}
    />
  );
}

/** `glow` marks the card the trial's guide points at. */
export function Card(p: ParentProps<{ warn?: boolean; glow?: boolean; class?: string }>) {
  const edge = () =>
    p.glow ? 'border-gold shadow-[0_0_1rem_-0.25rem_var(--color-gold)]' : p.warn ? 'border-warn' : 'border-line';
  return <section class={`mb-2.5 rounded-xl border bg-card p-3 ${edge()} ${p.class ?? ''}`}>{p.children}</section>;
}

export const Label = (p: ParentProps) => <h3 class="mb-1.5 text-sm uppercase tracking-widest">{p.children}</h3>;
export const Dim = (p: ParentProps<{ class?: string }>) => (
  <span class={`text-dim ${p.class ?? ''}`}>{p.children}</span>
);

export const Bar = (p: { pct: number }) => (
  <div class="my-1 h-1 overflow-hidden rounded-sm bg-line">
    <div class="h-full bg-gold" style={{ width: `${Math.min(100, Math.max(0, p.pct))}%` }} />
  </div>
);

/** An icon at text size, aligned with the text around it. */
export const Ico = (p: { icon: Icon; class?: string; label?: string }) => (
  <p.icon
    class={`inline-block size-[1.15em] shrink-0 align-[-0.2em] ${p.class ?? ''}`}
    aria-label={p.label}
    aria-hidden={p.label ? undefined : true}
    role={p.label ? 'img' : undefined}
  />
);

/** `canAdd` false disables + (for hands: nobody idle). */
export function Stepper(p: {
  label: string;
  value: number;
  max?: number;
  canAdd?: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div class="my-1.5 flex items-center gap-2">
      <span class="flex-1">{p.label}</span>
      <Button aria-label={`Fewer ${p.label}`} disabled={p.value <= 0} onClick={p.onMinus} class="w-11">
        <Ico icon={I.minus} />
      </Button>
      <b class="min-w-10 text-center">
        {p.value}
        <Show when={p.max !== undefined}>/{p.max}</Show>
      </b>
      <Button
        aria-label={`More ${p.label}`}
        disabled={p.canAdd === false || (p.max !== undefined && p.value >= p.max)}
        onClick={p.onPlus}
        class="w-11"
      >
        <Ico icon={I.plus} />
      </Button>
    </div>
  );
}

/** A dialog over the screen. It never grows past the screen: a long one scrolls inside. */
export const Overlay = (p: ParentProps) => (
  <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
    <div
      role="dialog"
      aria-modal="true"
      class="max-h-full w-full max-w-md animate-card-in overflow-y-auto rounded-xl border border-gold bg-card p-4 shadow-[0_0_2rem_-0.5rem_var(--color-gold)]"
    >
      {p.children}
    </div>
  </div>
);

/** Manuscript art from `public/art` (credits in `docs/credits.md`), fading out at the bottom, or all round when `round`.
 * Decorative, so no alt. */
export const Art = (p: { name: string; round?: boolean; class?: string }) => (
  <img
    src={`art/${p.name}.webp`}
    alt=""
    class={`w-full object-cover ${p.round ? '[mask-image:radial-gradient(closest-side,black_75%,transparent)]' : '[mask-image:linear-gradient(black_55%,transparent)]'} ${p.class ?? ''}`}
  />
);

export const Portrait = (p: { name: string }) => (
  <img src={`art/${p.name}.webp`} alt="" class="size-12 shrink-0 rounded-full border border-gold object-cover" />
);

/** A full-height top-level screen (title, options, end). */
export const Screen = (p: ParentProps) => (
  <main class="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,#1f3029,var(--color-bg)_70%)] px-4 py-6 text-center">
    {p.children}
  </main>
);

export const Stack = (p: ParentProps) => <div class="flex w-full max-w-sm flex-col gap-2">{p.children}</div>;

/** Odds as one bar: success, botch and discovery side by side. */
export const Odds = (p: { botch: number; discovery: number }) => (
  <div class="my-1 flex h-1.5 overflow-hidden rounded-sm" aria-hidden="true">
    <div class="bg-bad" style={{ width: `${p.botch * 100}%` }} />
    <div class="flex-1 bg-line" />
    <div class="bg-gold" style={{ width: `${p.discovery * 100}%` }} />
  </div>
);
