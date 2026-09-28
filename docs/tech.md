# Tech choices

| Choice | Why |
| --- | --- |
| **Headless, deterministic core** (`src/core`) | Seed + action log = the whole run. Saves, replays, bug repros and agent playtests for free. No DOM, `Date` or `Math.random` in the core |
| **sfc32 RNG, state inside `State`** | Seeded and serialisable; ~15 lines instead of a dependency |
| **Fixed 0.25 s tick** | Frame rate never changes outcomes |
| **One `rates()` function** | UI shows exactly what the simulation applies; no second formula to drift |
| **Typed TS data** (`as const satisfies`) | tsc catches data mistakes, human or agent. json5 + zod only once non-programmers or mods edit data |
| **Balance sims as tests** (`sim/`, `test/balance.test.ts`) | Scripted players over 50 seeds pin win-time ranges; balance regressions fail CI |
| **Solid** | Fine-grained updates suit numbers ticking every frame. Core state → store via `reconcile` |
| **Tailwind v4 + `ui/kit.tsx`** | Tokens in one `@theme`; styling lives on the component. New looks go in the kit, screens compose it. Stops the global-CSS sprawl LLM-written code drifts into |
| **Iconify via `unplugin-icons`** | Icons compile to inline SVG components; only used ones ship. [game-icons.net](https://game-icons.net) (4,000+ fantasy icons) for the game, Lucide for UI chrome. All mappings in `ui/icons.tsx` |
| **ink / inkjs** | Branching story with memory. Effects are tags the core parses; ink never calls game code. Story state is saved in `State` |
| **Node's own TS stripping** | `node sim/cli.ts` runs with no build step or tsx |
| **Vite, pnpm, Vitest, Biome** | Standard, fast |

## Rules

- Core stays pure: new randomness goes through `state.rng`, new time through `tick()`.
- Every UI number comes from a core selector.
- No raw colours or hand-rolled buttons/cards in screens: use the tokens and `kit.tsx`.
- Icons are referenced only through `ui/icons.tsx`.
- CC BY assets get a line in `docs/credits.md` and the in-game credits.

## Architecture

**Layout:**

```
src/core/     state, step, actions, rng, effects, conditions, ink bridge. No DOM, no Date, no Math.random
src/data/     goods, buildings, research, recipes, traits, scenarios, unlocks
src/content/  *.ink and their compiled *.json
src/ui/       Solid: screens, tabs, overlays
sim/          CLI + strategies
scripts/      ink compiler
test/         unit + balance tests
```

**The core contract:**

- `createRun(scenarioId, seed): State`
- `step(state, dt): State`: advances in fixed 0.25 s ticks internally
- `apply(state, action): State | Rejection`: actions are a typed union (`build`, `assign`, `startExperiment`, `choose`, `research`, `endow`, …)
- `advance(state, dt)` and `applyInPlace(state, action)`: the same without the copy, for code that owns its state (the sim). Every rule check in an action comes before its first change, so a refused action changes nothing
- Selectors for everything the UI shows: rates, caps, time to afford, bottlenecks

**Determinism:**

- The same scenario, seed and action log give the same state.
- The random number generator (sfc32) keeps its state inside `State`.
- The ink story state (`story.state.ToJson()`) is part of `State`, and ink's random seed comes from the run's generator.
- Ink effects are tags parsed by the core into the same effect type that research and traits use. Ink never calls game code.

**Stories:** `src/content/*.ink` compile to JSON next to them with `pnpm ink`, and the JSON is committed so the sim, tests and Vite all import it the same way. A test fails if the JSON is stale. The bridge is `src/core/story.ts`; which knots play, and when, is TypeScript data (`story` on each scenario).

**Saves:** `{version, scenario, seed, log}` plus a snapshot for fast loading. Loading replays the log; a mismatch with the snapshot is a bug report.

**Art:** public-domain manuscript art (British Library, Bodleian, Getty, Met Open Access, Wikimedia Commons). Check each image's licence and credit it in `credits.md` from the first image.
