# Aura — Spec v2

## 0. What changed and why

v1 (`spec.md`, prototype in `index.html`) proved the premise: growth against Notice under a deadline is fun. Playtest feedback:

| Problem in v1 | Cause | v2 answer |
| --- | --- | --- |
| Most of the run is waiting for Insight | Insight came only from a passive rate; its only lever (Study) was linear | **Experiments** (section 6): timed, player-started bets that are the main Insight source |
| Awash in every resource except Stone and Insight | Unlimited Hall storage; Silver had few sinks after the early game | **Storage caps** (section 5) and **hands** as the scarce resource (section 3) |
| Packet pipelines felt neither good nor medieval | Abstract lines carrying continuous flows | **No connections.** Carrying is a job for a limited number of **porters** (section 4) |
| The start was overwhelming | Every system visible at minute 0 | **Staged unlocks** (section 9) and a **3–5 minute trial scenario** (section 10) |
| The map got messy | Connections crossing between rings | **List and card UI** (section 11), mobile first. A map, if it returns, will be a point graph (section 15) |

**What survives from v1 unchanged unless stated:** the setting, the 3 magi, the deadline (1220–1260, 120 s per year), Notice and its levers (v1 section 11), the Drowned Gate and its Rites (v1 section 13), and the 0/1/N rule (v1 section 19). **Numbers in this document are starting points.** The balance simulation (section 13) is the source of truth; every value here is `[PLAYTEST]` unless marked otherwise.

## 1. Pillars (revised)

1. **Number go up.** Buildings are bought in quantity with costs ×1.15 each; research and experiments stack multipliers.
2. **People, not pipes.** Every building needs hands. Hands need Bread and housing. Where hands go is the central decision.
3. **Growth is the crime.** Every building raises Notice, more in the loud Bocage.
4. **Everything has a story.** Magi traits, experiment discoveries and ink events, written plainly and concretely.

## 2. Zones

The three rings become three **zones**: sections of the Covenant tab, not a map.

| Zone | Building slots | Notice factor | Carry distance | Allowed buildings |
| --- | --- | --- | --- | --- |
| Hearth | 8 | 0.5 (0 after the Aegis) | 0 (no porters needed) | Sanctum, Quarry, Cottage, Storehouse, Library |
| Bocage | 12 | 1.5 | 1 | Farm, Parchmenter, Cottage |
| Marsh | 10, plus 3 Vis sites | 0.5 | 2 | Salt Pan, Vis Source (Vis sites only), Eel Weir (if unlocked, see section 8) |

Slots cap breadth. Once a zone is full, growth comes from research multipliers and hands per building.

## 3. Hands

Hands are anonymous servants, counted as a number. Magi are the only named people.

- **Start:** 4 hands (trial), 6 hands (full run).
- **Housing:** the Hall houses 8. Each Cottage houses 3 more.
- **Food:** each hand eats 0.05 Bread/s.
- **Growth:** while there is free housing and Bread stock is above 0 with net Bread ≥ 0, 1 new hand arrives every 20 s.
- **Hunger:** at 0 Bread, every job runs at 50% and 1 hand leaves every 30 s.
- **Jobs:** hands are assigned to a building type (worker) or to a zone (porter). Unassigned hands are idle and still eat.
- **Input:** each building type has − / + buttons for its workers, plus "fill" (as many as the slots allow). Each zone has − / + for porters.
- **Feedback:** the header shows "Hands 14 / 17 · 2 idle" and the Bread balance ("Bread +0.3/s").

## 4. Buildings and carrying

Buildings are counted per type. Cost of the next one = base cost × 1.15^owned. Each building adds worker slots; output = workers × per-hand rate × multipliers.

| Building | Zone | Base cost | Slots | Per worker | Notes |
| --- | --- | --- | --- | --- | --- |
| Salt Pan | Marsh | 20 Silver | 2 | 0.25 Salt/s | Salt is sold on arrival at the Hall: 1 Salt = 1 Silver. In prose, "salt-works": the bay boiled salt-sand in sauneries |
| Farm | Bocage | 20 Silver | 2 | 0.2 Bread/s | |
| Quarry | Hearth | 40 Silver | 2 | 0.25 Stone/s | |
| Parchmenter | Bocage | 30 Silver | 1 | 0.15 Vellum/s | |
| Vis Source | Marsh Vis site (max 3, named) | 40 Silver | 2 | 0.08 Vis/s | The Tide Pool, the Drowned Knight's Barrow, the Regio Spring. Individually addressable (events can target the Tide Pool) |
| Sanctum | Hearth (max 3, 1 per magus) | 100 Silver + 50 Stone | 2 assistants | +25% to the magus's baseline Insight and experiment speed per assistant | |
| Cottage | Hearth, Bocage | 30 Silver | 0 | Housing +3 | |
| Storehouse | Hearth | 50 Silver + 20 Stone | 0 | Stone, Bread and Vellum caps +50% of base | |
| Library | Hearth | 40 Silver + 20 Vellum | 0 | Insight cap +500 | |

**Carrying:** goods made outside the Hearth only count once porters bring them to the Hall.

- A porter carries 1 good/s from the Bocage (distance 1) or 0.5 goods/s from the Marsh (distance 2).
- If a zone makes more than its porters can carry, output is throttled to what they carry. The surplus is not stored.
- The zone header shows it plainly: "Marsh: carried 1.8 of 2.4 goods/s · 3 porters". When porters are the bottleneck, the zone's porter + button pulses.
- Research raises carrying: *Mule Trains* ×2 for all zones, *Stones That Carry* ×3 for the Marsh.
- The Gate (section 7) needs Stone delivered **into the Marsh**. That trip is distance 2, carried by Marsh porters.

**Why:** carrying keeps v1's "distance matters" and "find the bottleneck" without drawing lines. Porters compete with workers for the same hands, which is the scarcity v1 lacked.

## 5. Storage caps

Every good except Insight has a cap. At the cap, new production of that good is wasted, and the resource shows red "full".

| Good | Base cap | Raised by |
| --- | --- | --- |
| Silver | 500 | Research *Hermetic Accounts* (×2); the Strongbox research line |
| Stone, Bread, Vellum | 200 / 200 / 50 | Storehouse (+50% of base each) |
| Vis | 30 | Research *Lead-Lined Chests* (+30) |
| Insight | 1,000 | Library (+500 each) |

**Why:** caps turn "awash" into "spend it or lose it", and make storage a purchase with a real trade-off (a Storehouse uses a Hearth slot a Sanctum could use). This is Kittens Game's main constraint.

## 6. Magi and experiments

Each magus has a Lab Total (LT, starts at 10) and traits (v1 section 12, magus and Sanctum lists only). A magus without a Sanctum does nothing.

**Baseline research:** a magus in a Sanctum makes 0.02 × LT Insight/s (0.2/s at LT 10). It's deliberately small: the floor, not the engine.

**Study:** raise LT by 1 for 20 × 1.35^(LT − 10) Insight, as in v1. Breakthroughs at LT 15, 20 and 25 work as in v1.

**Experiments** are the engine. A magus starts one, and while it runs they make no baseline Insight.

| Recipe | Base cost | Base time | Result |
| --- | --- | --- | --- |
| Study the Vis | 5 Vis | 60 s | 15 × LT Insight (150 at LT 10) |
| Write a Lab Text | 20 Vellum | 180 s | Permanent: +10% to all experiment yields (stacks) |
| Enchant a Device | 10 Vis + 50 Stone | 240 s | Permanent: +25% output for 1 chosen building type |

- **Extra Vis:** before starting, the player may commit up to 5 extra Vis. Each one gives −10% time, +15% yield and +2 percentage points of botch chance.
- **Outcomes:** base botch chance 5%, base discovery chance 5%, rolled with the seeded random number generator at the end.
  - **Botch:** the costs are lost, Notice +5, and a one-line consequence ("Aldric's eyebrows will grow back").
  - **Discovery:** the full yield, plus the Breakthrough trait choice.
- **Check-in:** experiments of 120 s or longer pause at the halfway point with an event card:
  - **Push:** yield +30%, botch chance +10 points.
  - **Steady:** no change.
  - **Abort:** refund half the costs.
- **Feedback:** each magus card shows a progress ring, the time left and the stakes ("150 Insight · 7% botch"). A finished experiment raises a badge on the Magi tab. On mobile this is where a notification would go (deferred).

**Why:** experiments turn the wait into bets the player places, with a return every 1–3 minutes (the Kittens and Cookie Clicker hook). Botches feed Notice, so the lab joins the core tension. The Lab Text is the long-term Insight multiplier the player chooses to invest in, and it spends Vellum, so Vellum always has a use.

## 7. Research and the Gate

The 5 Enchantments become a **research list** of about 15 one-time Insight purchases, spaced so something lands every 1–3 minutes early on and every 5 minutes late.

| Research | Cost (Insight) | Effect |
| --- | --- | --- |
| Salt Rakes | 50 | Salt Pans ×1.5 |
| Self-Tilling Plough | 120 | Farms ×2 |
| Mule Trains | 250 | Porters carry ×2 |
| Hermetic Accounts | 300 | Silver cap ×2 |
| Reed Pen of Diligent Copying | 500 | Parchmenters ×2 |
| Lab Notebooks | 600 | Botch chance halved |
| Apprentice Rooms | 800 | +1 assistant slot per Sanctum |
| Lead-Lined Chests | 900 | Vis cap +30 |
| Stones That Carry | 1,500 | Marsh porters ×3 |
| Aegis of the Hearth | 2,000 + 20 Vis | Hearth Notice factor 0; baseline Insight ×1.25; unlocks the Gate |
| Marsh Mist | 2,500 + 10 Vis | All Notice generation ×0.6 |
| (3–4 more, filled by content generation and tuned by the simulation) | | |

**The Drowned Gate:** as in v1 section 13, with carrying replacing connections. Found it after the Aegis (200 Silver + 100 Stone). Raise it by delivering 1,500 Stone. The 3 Rites need 20k / 25k / 30k Insight, plus a sustained 8 Stone/s and 0.3 Vis/s carried into the Marsh, plus all 3 magi in Sanctums and not experimenting. The climax is a porter-allocation problem: can you spare the hands?

## 8. Notice and stories

**Notice:** the v1 model stands. Generation per minute = 0.35 × Σ(buildings × zone factor) + traits + botches − Endowments, with 10% decay per minute, thresholds at 50/75/90, and Endow and Bribe. Hands add no Notice; buildings do. The 75 "jam" becomes **a strike**: the porters of the zone carrying the most goods stop for 60 s.

**Ink stories** add flavor and small stakes. The first thread is **the eels** (`docs/ink/eels.ink`, `docs/ink/eels-notes.md`):
- The marsh eel fisheries are rich, then too rich: more eels, bigger eels, eels in the wrong places.
- Unchecked, they overflow in a magical flood that wrecks the Salt Pans.
- Early on the eels tempt the player with cheap food. They can be stopped at several points, and later stops cost more.
- Beats 1–2 play inside the trial scenario and can cost it: ignoring the problem cuts the Tide Pool's Vis output to 80% for 10 minutes, which slows the experiments the trial's win depends on.
- Stopping the eels costs Vis and magus time (the magus can't experiment), rising with each beat: 5 Vis early, then 20 Vis plus losing the Tide Pool late. The flood destroys two thirds of the salt-works and halves the Tide Pool for good, so it is always worse than a late stop.

**The ink contract** (the engine side):
- The engine decides when a knot plays (trigger conditions are TypeScript data). Each knot is self-contained and ends in `DONE`.
- Before each knot, the engine sets read-only variables: `year`, `notice`, `silver`, `silver_rate`, `vis`, `salt_pans`, `has_sabine`, `has_herve`.
- Choices carry effect tags, parsed into the same effect type that research and traits use:
  - `res:<good>:<±n>`: an absolute amount.
  - `res:<good>:<±n>s`: n seconds of the current net income, so the effect scales across the run.
  - `notice:<±n>`
  - `destroy:<building>:<n>` or `destroy:tide_pool`
  - `mod:<id>:<target>:<mult>:<seconds>`: 0 seconds means permanent.
  - `block:experiment:<magus|all>:<seconds>` and `block:<action>:<seconds>`
  - `unlock:<id>`
- Tags may be dynamic, e.g. `destroy:salt_pan:{lost}`.
- The engine collects tags from every line of the knot until `DONE`, not just the first line after a choice.
- `silver_rate` passed to ink is floored at 1, so "N seconds of Silver" never costs 0.
- **Unaffordable choices are greyed out, not hidden,** so the player learns a stop exists before they can afford it. The cost goes in a choice tag (`* [Seal the outflow.] #cost:vis:5`) instead of an ink guard, and the engine disables choices it can't pay for. `eels.ink` gets converted in build step 3.
- Ink arithmetic: bracket mixed `*` and `/`, since `a * 2 / 3` evaluates as `a * (2 / 3)`.
- The engine reads a whitelist of ink variables back (`eel_level`, `eels_state`) for building rates such as the Eel Weir's.

## 9. Staged unlocks (the full run)

Nothing appears before it matters. Each unlock is an entry in data: a condition plus what it reveals.

| When | Unlocks |
| --- | --- |
| Start | Hall, Aldric's Sanctum, Salt Pans, the Tide Pool, hands, Silver/Vis/Insight |
| First Insight | Study the Vis experiment; Research tab with the first 3 items |
| Bread below 50% of cap | Bocage zone, Farms, Cottages; "The hands are hungry" card |
| First research bought | Stone, Quarries, Storehouse |
| 10 hands | Parchmenter, Vellum, Write a Lab Text; Sabine and Hervé arrive |
| Notice > 1 | Notice gauge (minute 4–6) |
| Year 1226 | Endow and Bribe |
| Aegis | The Gate |

## 10. Scenarios

A scenario is data: a start state, an unlock set, win conditions and loss conditions (lists, per v1 section 19).

| Scenario | Start | Win | Loss | Length |
| --- | --- | --- | --- | --- |
| **Trial of the Tide Pool** | 4 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool worked, 60 Silver | 500 Insight before 1222 | Notice 50; 1222 begins | 3–5 min at 1× |

The trial has Aldric only; Sabine and Hervé arrive mid-run in the full scenario.
| **The Covenant Must Grow** | As in section 9 | The third Rite before 1260 | Notice 100; 1260 begins | 60–80 min |

The trial is the default in development (`?scenario=trial` or the dev menu), the first thing an agent's simulation runs, and later the tutorial. It must be winnable in about 3 minutes by a player who runs one extra-Vis experiment and assigns hands sensibly. A player who ignores the eels (the Tide Pool's Vis drops to 80%) should need about 4.5 minutes, close to the deadline.

## 11. Screens

Mobile first: one column, a bottom tab bar, and thumb-sized targets. Desktop uses the same layout with wider cards.

| Screen | Kind | Contents |
| --- | --- | --- |
| Title | Top level | Title, tagline, hero image (manuscript art), Continue (if saved), New run (scenario choice; the trial is labelled "Short trial"), Options |
| Options | Top level, and as an overlay from Pause | Sound, number format, text size, reduced motion, dev menu toggle |
| Game | Top level | Header: year and years left, year bar, speed (pause/1×/2×), menu. Resource strip: amount, cap, rate. Compact Notice gauge (tap to expand Endow, Bribe and top contributors). **Tabs:** Covenant (zones, buildings, hands, porters), Magi (cards, experiments, Study), Research, Chronicle (log of events and ink beats) |
| Event card | Overlay, pauses | Ink text and choices, or a system card (Breakthrough, check-in, audit) |
| Confirm | Overlay | "Are you sure?" for destructive actions |
| Pause | Overlay, pauses | Resume, Options, Restart, Quit to title |
| End | Top level | Win or loss variant: title, cause, 3-line Chronicle, stats, Play again |

The screen stack lives in the UI: a top-level state (Title, Options, Game, End) plus an overlay stack. The core knows nothing about screens; it exposes `outcome: null | {kind: 'win' | 'loss', cause}` and the pending event queue.

## 12. Architecture

| Concern | Decision |
| --- | --- |
| Language and build | TypeScript (strict), Vite, pnpm, Biome (lint + format), Vitest |
| UI | Solid. Once per animation frame, the core state is pushed into a Solid store with `reconcile` |
| Game data | Typed TypeScript modules: `export const BUILDINGS = [...] as const satisfies readonly BuildingDef[]`. No runtime parsing. Move to json5 + zod only when non-programmers or mods edit data |
| Stories | ink via inkjs. `.ink` files are compiled to JSON at build time by a small Vite plugin; tests use the same compiler |
| Art | Public-domain manuscript art (British Library, Bodleian, Getty, Met Open Access, Wikimedia Commons). Check each image's licence; `docs/credits.md` from the first image |

**Layout:**

```
src/core/     state, step, actions, rng, effects, conditions, ink bridge. No DOM, no Date, no Math.random
src/data/     goods, buildings, research, recipes, traits, scenarios, unlocks
src/content/  *.ink
src/ui/       Solid: screens, tabs, overlays
sim/          CLI + strategies
test/         unit + balance tests
```

**The core contract:**

- `createRun(scenarioId, seed): State`
- `step(state, dt): State`: advances in fixed 0.25 s ticks internally
- `apply(state, action): State | Rejection`: actions are a typed union (`build`, `assign`, `startExperiment`, `choose`, `research`, `endow`, …)
- Selectors for everything the UI shows: rates, caps, time to afford, bottlenecks

**Determinism (a hard rule):**
- The same scenario, seed and action log give the same state.
- The random number generator is a small seeded one (sfc32), and its state is part of `State`.
- The ink story state (`story.state.ToJson()`) is part of `State`, and ink's random seed comes from the run's generator.
- Ink effects are tags parsed by the core into the same effect type that research and traits use. Ink never calls game code.

**Saves:** `{version, scenario, seed, log}` plus a snapshot for fast loading. Loading replays the log; a mismatch with the snapshot is a bug report.

## 13. Simulation and balance tests

- `pnpm sim --scenario full --strategy careful --seed 7` prints a timeline an agent can read: purchases, unlocks, Notice, the outcome.
- A strategy is a function `(state) => Action[]`, called every simulated second.
- **Balance tests** run each strategy over 50 seeds and check outcome ranges. For example:
  - **Trial:** "sensible" wins in 2.5–4 min in ≥ 90% of seeds; "idle" (does nothing) loses.
  - **Full run:** "careful" wins in 60–75 min; "reckless" without bribes is Renounced; "timid" runs out of time.
- **Performance budget:** a full 80-minute run simulates in under 1 s.
- **Vis constraint:** the Rites' 0.3 Vis/s must be reachable with 2 of the 3 Vis sources plus research, so that losing the Tide Pool hurts without deciding the run.
- Content (ink threads, traits, research) is generated by subagents and scored by separate judge agents against a rubric. The balance tests then check that the content doesn't break the target ranges.

## 14. Build plan

Each step ends playable and tested.

| Step | Adds | Done when |
| --- | --- | --- |
| 1 | Scaffold; core skeleton; the trial scenario (hands, Salt Pans, the Tide Pool, Study the Vis); seeded generator; sim CLI; 2 trial strategies | `pnpm test` shows the trial winnable and losable, deterministic across runs |
| 2 | UI shell: Title, Options, Game with 2 tabs, Pause, Event card, End | The trial is playable on a phone, start to either end screen |
| 3 | ink bridge; eel beats 1–2 in the trial | Story choices replay deterministically; tags apply |
| 4 | Full economy: zones, porters, caps, all buildings, research, all experiments | The full scenario runs to the deadline in the sim |
| 5 | Notice, the Gate, Rites, full balance tests | Careful, reckless and timid hit their target ranges |
| 6 | Traits, the rest of the eel thread, art, sounds, polish | Ready for outside playtesters |

## 15. Deferred and open

- **Map:** if it returns, a point graph (Mont-Dol, Dol, the salt flats, Mont Saint-Michel …) where things travel node to node; a bribe to Mont Saint-Michel passes through several. v1's rings stay a good fit for Regio flavor but not for routing.
- **[OPEN QUESTION]** Offline progress: mobile idle players expect it, but a fixed 80-minute deadline conflicts with it. The default is that closing the app pauses the run.
- **[OPEN QUESTION]** Should hands ever become named (a steward, a master porter) through ink events?
- **[OPEN QUESTION]** 4× speed for the late game?
- Site and connection traits from v1 are dropped along with sites and connections. Their role moves to ink events and building-type traits.
