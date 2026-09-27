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

export function Card(p: ParentProps<{ warn?: boolean; class?: string }>) {
  return (
    <section class={`mb-2.5 rounded-xl border bg-card p-3 ${p.warn ? 'border-warn' : 'border-line'} ${p.class ?? ''}`}>
      {p.children}
    </section>
  );
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

export function Stepper(p: { label: string; value: number; max?: number; onMinus: () => void; onPlus: () => void }) {
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
        disabled={p.max !== undefined && p.value >= p.max}
        onClick={p.onPlus}
        class="w-11"
      >
        <Ico icon={I.plus} />
      </Button>
    </div>
  );
}

export const Overlay = (p: ParentProps) => (
  <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
    <div class="w-full max-w-md animate-card-in rounded-xl border border-gold bg-card p-4 shadow-[0_0_2rem_-0.5rem_var(--color-gold)]">
      {p.children}
    </div>
  </div>
);

/** A full-height top-level screen (title, options, end). */
export const Screen = (p: ParentProps) => (
  <main class="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,#1f3029,var(--color-bg)_70%)] px-4 py-6 text-center">
    {p.children}
  </main>
);

export const Stack = (p: ParentProps) => <div class="flex w-full max-w-sm flex-col gap-2">{p.children}</div>;
