# Aura

*The Covenant Must Grow.* An incremental game about a covenant of Ars Magica wizards at Mont-Dol, 1220–1260.

- `docs/spec-v2.md`: the current design. `docs/spec.md` and `prototype/v1.html` are the first prototype.
- `docs/ink/`: story content (ink).

```sh
pnpm install
pnpm dev                                   # play
pnpm test                                  # core + balance tests
pnpm sim --strategy sensible --seed 7      # one headless run, as a timeline
pnpm sim --strategy sensible --seeds 50    # win rate and times over 50 seeds
pnpm check                                 # biome + tsc
```

The game core (`src/core`) is headless and deterministic: `createRun(scenario, seed)`, `step(state, dt)`, `apply(state, action)`. A save is the seed plus the action log.
