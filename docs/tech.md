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
| **ink / inkjs** (from build step 3) | Branching story with memory. Effects are tags the core parses; ink never calls game code. Story state is saved in `State` |
| **Node's own TS stripping** | `node sim/cli.ts` runs with no build step or tsx |
| **Vite, pnpm, Vitest, Biome** | Standard, fast |

## Rules

- Core stays pure: new randomness goes through `state.rng`, new time through `tick()`.
- Every UI number comes from a core selector.
- No raw colours or hand-rolled buttons/cards in screens: use the tokens and `kit.tsx`.
- Icons are referenced only through `ui/icons.tsx`.
- CC BY assets get a line in `docs/credits.md` and the in-game credits.
