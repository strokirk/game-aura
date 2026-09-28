# Review: the balance simulation

- **Date:** 2026-09-28
- **Reviewer:** independent subagent with fresh context (did not write the sim or the design)
- **Task:** review and fix the balance simulation (`sim/`, `src/core/run.ts`, `src/data/index.ts`, `test/`): performance, correctness, determinism, strategies that play badly, dominant or dead mechanics. At minimum: an 80-minute careful run in under 1 s; a full run the careful strategy wins in 60–75 minutes; meaningful tests. Free to change any rule or number, with the design docs updated to match.
- **Changed:** the core (in-place stepping, cached research effects, pouring, Gate porters removed), the numbers (bell prices, Gate raise, Notice lever growth), the careful strategy, the sim CLI, two tests, and the design docs `balance.md`, `gate.md`, `notice.md`, `economy.md`, `research.md`, `scenarios.md` and `tech.md`. Commits `951528e` and `abc17fe`, plus this report.

## What I ran

Every number below is measured on this container (4 cores, Node 22.22). "Before" is commit `e12ad6c`, checked out in a scratch worktree. Scratch scripts (in the session scratchpad, not the repo) call `simulate()` directly:

| Script | What it does |
| --- | --- |
| `bench.ts` | One line per seed: outcome, minute, ms, when the Aegis, the Gate and each bell happened, Notice levers used |
| `perf.ts` | Warms up, then times `simulate('grow', seed, careful, 4800)` (an 80-minute run) for seeds 1–5 |
| `tl.ts`, `nb.ts`, `gate.ts` | Snapshots every N minutes: hands, buildings, rates, caps; Notice by zone; what the next bell still lacks |
| `gaps.ts` | Median minute of the Aegis, the Gate rising and each bell, and the win times, over N seeds |
| `usage.ts` | Which actions the careful player takes, averaged over 10 seeds |
| `replay.ts` | Reruns and replays from the save; deep-equality |
| `node --cpu-prof` | CPU profiles, read with a small script summing self and inclusive time per function |

Plus `pnpm sim --scenario grow --strategy careful --seeds 50`, `pnpm test`, `npx tsc --noEmit -p .`, `npx biome check .` and `pnpm build`.

## Before and after

| Measure | Before (`e12ad6c`) | After |
| --- | --- | --- |
| Careful, full run, 10 seeds | 0 wins. 4 Renounced (minutes 37, 41, 54, 91); 6 unfinished at the 150-minute cap with 2 bells | 10 wins, 61–80 min, median 72 |
| Careful, full run, 50 seeds | not run (0/10 already) | **50 wins, 61:00–91:01, median 72:23** |
| Median minute: Aegis / Gate raised / bells 1–7 (10 seeds) | 30 / 49 / 57, 64, never | 21 / 27 / 32, 38, 44, 53, 61, 64, 72 |
| 80-minute careful run, warm, median of 5 | **2,127 ms** | **461 ms** |
| Careful run to the end (150-min cap before, the win after), warm, median | 4,207 ms | 404 ms |
| `pnpm sim --scenario grow --strategy careful --seed 1`, wall clock incl. Node start | 4.9–5.5 s | 1.4–1.5 s |
| Trial, sensible, 50 seeds | 46 wins, 1:42–3:18, median 2:30 | identical |
| Random, full run, 5 seeds | 5 Renounced, minutes 27–43 | 5 Renounced |
| Stage scenarios, careful, 10 seeds | not measured; the old doc says it wins neither | Gate stage 10/10 (median 42 min of play), Middle Years 10/10 (median 74) |
| `pnpm test` | 50 tests | 51 tests, about 15 s |

Determinism: for careful seeds 1–5, random seeds 1–2 on the full run and careful on both stages, a rerun and a replay from the save are deep-equal to the live run (`replay.ts`). The perf commit (`951528e`) alone left `pnpm sim` output byte-identical for careful seeds 1–3 and random seed 1.

## Findings, ranked by severity

### F1. Critical: the full run could not be won; the bell prices were out of reach by two orders of magnitude

- The careful run made 70,000–186,000 Insight in 150 minutes (`bench.ts`, seeds 1–10). The seven bells asked for 27 million, and the seventh also for 10,000 of each of 8 goods. Vis came in at about 1 a second, so 10,000 Vis alone was about 3 hours.
- Stalls came from goods, not only Insight: after its fixes (F3) the careful run sat 40+ minutes at bell 4 on 3,000 Vellum (0.45 Vellum/s) and at bell 7 on Eels.
- **Fix:** prices fitted to what the careful sim earns: 5k, 15k, 30k, 70k, 150k, 300k, 450k Insight; goods at 3–10 minutes of that good's income (bell 7: 300 of each, 200 Vis). The Gate rises at 600 Stone, not 1,500. Result: 50/50 wins, median 72 (`gate.md` now says how the prices were set).

### F2. Critical: every Notice lever priced itself out of the Hall's caps, so Notice only went up

- Over 10 careful seeds, every run stopped at exactly **2 Endowments, 4 bribes, 4 gifts and 0 alms** (`bench.ts`). Endow and Bribe doubled (500·2ⁿ, 100·2ⁿ Silver) against a Silver cap of about 1,500; Alms started at 200 Bread, the whole Bread cap, and doubled.
- With the levers gone, 4 of 10 seeds were Renounced, and the rest hovered at Notice 75–88 for over an hour.
- **Fix:** Endow, Bribe and Alms grow ×1.5 a purchase; Alms start at 100 Bread. The careful player counts the next Endowment as a cost that needs storage, so it buys Storehouses (×1.25 cap each, about two per Endowment). Now careful uses 6–8 Endowments, 1–7 bribes and 2–6 gifts a run; peak Notice 65–83; no seed Renounced in 50.
- This matches the independent economy review of the same day (`2026-09-28-economy-expansion.md`), which found Notice a flat tax per building that stops growth by minute 20.

### F3. High: the careful strategy played badly, in ways a careful person wouldn't

Each was found in the timelines (`tl.ts`, `nb.ts`, `gate.ts`) and fixed in `sim/strategies.ts`:

1. **Cottages with idle hands.** It built a Cottage whenever hands neared housing, even with 13–29 hands idle. Cottages sit in the Bocage (Notice factor 1.5); seed 7 had 22 of them and was Renounced at 36:49. Now: only when nobody is idle.
2. **Pouring what was already paid.** It poured every good in the next bell's price until the bell rang, so after bell 2 it poured Vis (400 needed, 5,777 poured by minute 150) and the labs starved: 188 Lab Texts, 102,000 Insight in 150 minutes (seed 1). Now it pours exactly what the Gate still lacks.
3. **Lab round-robin.** Study the Vis (60 s), a Lab Text (180 s) and a Device (240 s) in turn put 1/8 of lab time into Insight. Now: Study the Vis whenever there's Vis, else a Lab Text, else a Device for the Gate's slowest good. With all the fixes, the median Aegis moved from minute 30 to 21.
4. **Pushing on at every check-in.** The sim took option 0 on every card, and at a check-in that's "Push on" (+10 points of botch). Botches cost 5 Notice (15 under the reckless-experiment decree); seed 4 had 6 botches in 8 minutes. Now careful holds steady, and uses extra Vis only below Notice 60.
5. **The hidden hour.** In the dark, `rates().noticeGen` is 0, so careful read "Notice settles at 0" and built freely for 60 s every 5 minutes. Now it reads Notice past the hour.
6. **Storehouses blocked at Notice 60.** It refused all building above Notice 60, including Storehouses that draw none after the Aegis, so it never afforded the next Endowment (seed 9 sat at bell 4 from minute 52 until it was Renounced at 88; at minute 71 the strategy returned no action at all). Now anything drawing no Notice is always allowed.
7. **Hands never moved.** New Bog-oak Camps stood unworked and unported for 30 minutes (seed 7, bell 5) because hands only went to jobs when idle. Now, with nobody idle, it moves one hand a second from the busiest job the Gate doesn't need to where goods lie uncarried or to the Gate's slowest good.
8. **No producers for the Gate.** It built only a fixed list. Now it builds the producer of whatever the Gate will take longest to fill.
9. **Smaller:** Form trees were bought whenever they cost under a quarter of all Insight on hand, draining the Gate's store (seed 3); now under a tenth of the next bell's Insight. Offerings to the fae (a slot machine that takes hands) are gone from careful. In seed 1's 150 minutes it tried 4,667 bribes it couldn't afford (each a refused action); now it checks.

### F4. High: the sim was too slow, and not for the reason the doc gave

- `balance.md` blamed `plan()` and `placeHands()`. The profile said otherwise (150-minute careful run, seed 1, before): `structuredClone` 1.2 s of 4.8 s, the careful strategy's storage check `over()` 0.78 s (it called `cap()`, which rebuilt the research modifier list, once per cost), `rates()` 1.1 s. `plan`/`placeHands` were 0.17 s.
- Every `step()` and `apply()` deep-copied the whole state (63 µs a copy). In that run the sim loop alone made 9,000 `step` copies and 7,037 `apply` copies, 6,563 of them for actions the core refused; the careful strategy made thousands more to preview its own moves.
- **Fix** (commit `951528e`, outcomes unchanged): the sim owns its state and calls new in-place twins, `advance()` and `applyInPlace()`; `step()` and `apply()` still copy for the UI. Strategies copy once per call, not once per action. Research effects are folded into one aggregate, cached per research object (buying research now replaces the object). `cap()` walks only the storage buildings. 80-minute run: 2.1 s → 0.46 s. What's left is `rates()` (4 calls a game second) and the careful strategy itself.
- The balance test now fails if a careful full run takes over 1 s on average.

### F5. High: goods in the Hall could never reach the Gate

- Pouring moved only income. In seed 1 at minute 70 the Hall held 368 Eels while the Gate needed 120 more and the only Eel Weir had been destroyed: no way to deliver them, ever. Separately, Silver from sold Salt went to the Hall even with Silver poured, so pouring Silver caught only Hostel Silver.
- **Fix (rule change):** a poured good's Hall stock goes to the Gate too, every tick; Silver from sold Salt pours with Silver. This made **Gate porters** redundant (pouring Stone moves the Hall's Stone), so they're deleted: the `gatePorters` action, `GateState.porters`, `Rates.gateStone` and the UI stepper.
- Saves whose log contains `gatePorters` no longer replay. The save version wasn't bumped.

### F6. Medium: the seventh bell was unwinnable in both stage scenarios

- The Gate and Middle Years stages allowed no Eel Weirs and play no eel story, which is what unlocks them, but the seventh bell needs Eels. The careful Gate stage rang 6 bells by minute 88 and sat there to the cap (`gate.ts`). **Fix:** both stages allow Eel Weirs. Now 10/10 wins on each.

### F7. Medium: the sim could hang or crash on a card whose first option costs

- `simulate()` answered unanswered cards with option 0. The Pit's raid and the storm put their cost on option 0; when the covenant couldn't pay, the old code cast the error to a State and crashed. **Fix:** the first option the covenant can pay for, and a clear error if none can.
- Also in the core: a `choose` that ink refused had already paid the option's cost. Now it checks first. That was the one action that changed state before refusing, which `applyInPlace` relies on never happening.

### F8. Medium: mechanics the careful player never uses, so no balance test covers them

Over 10 careful full runs (`usage.ts`): **Alms 0, dikes 0 (so the Polder and Salt Meadows 0), Hostels 0, keep-Salt 0, the Great Device 0, the Couesnon 0, offerings 0** (removed from careful on purpose). The random fuzzer plays them all for crashes, but nothing checks their balance. Most hands are in Salt-works; about 370 of the ~1,000 logged actions a run move a Salt-works hand. Lab Texts are no longer runaway (20–35 a run, not 188), because Study the Vis comes first.

### F9. Low: doc and tooling slips

- `balance.md` said `pnpm sim --scenario full`; the scenario is `grow`. Fixed.
- `pnpm sim --seeds N` printed only wins; it now also prints how the other runs ended and ms a run.
- The random fuzz test's `expect(outcome).toBeDefined()` holds only because random gets Renounced; a random run that survives 150 minutes would fail it.

## Design rules changed or deleted

| Rule | Before | After | Why |
| --- | --- | --- | --- |
| Pouring (`gate.md`) | Income only | Income and the Hall's stock | Stock was stranded (F5) |
| Gate porters (`gate.md`, `economy.md`) | Hands carry Hall Stone to the Gate at 0.5/s each | Deleted | Pouring Stone does it |
| Sold Salt's Silver | Always to the Hall | Pours with Silver | Pouring Silver caught only Hostel Silver |
| Raising the Gate | 1,500 Stone | 600 Stone | 1,500 took 20+ minutes (median raise went from 49 to 27) |
| Bell prices | 10k → 20M Insight, ×3.5; bell 7 10,000 of every good | 5k → 450k; goods at 3–10 min of income | F1 |
| Endow / Bribe | 500·2ⁿ / 100·2ⁿ Silver | 500·1.5ⁿ / 100·1.5ⁿ | F2 |
| Alms | 200·2ⁿ Bread | 100·1.5ⁿ Bread | F2: never affordable |
| Stage scenarios | No Eel Weirs | Eel Weirs allowed | F6 |
| Balance target, full run | A target, not a test | A test: ≥ 90% of 20 seeds, median 60–75, none after 100, < 1 s a run | Pins what this review established |

## Left undone

- **The careful player is the only one the full run is balanced for, and it wins 50 of 50.** Reckless and timid players aren't simulated, so "losable by plausible play" and the target of 40–60% first runs lost are untested. The next step is a `reckless` strategy (full extra Vis, pushes on, no levers) that should be Renounced.
- **The prices fit the careful sim, not people.** A human who pours cleverly or raises the aura harder will be faster. Playtest before trusting 60–75.
- **The eels story's choices** are taken as option 0. One of them blocks every lab for 10 minutes (`block:experiment:all:600`) and is a large share of the variance (seed 10's 16-minute gap before bell 3).
- **Notice is still a flat tax per building** (F2 and the economy review): the covenant stops at about 40–70 hands. That's the economy review's to fix; I only made the levers usable.
- **The Middle Years stage plays slower than the full run** from the same point (74 minutes of play against about 40 in the full run from minute 32). Its Notice 45, settling at 66, holds the builder back.
- **F8's dead mechanics** need either a strategy that uses them or a decision to cut them.
- **Performance headroom:** `rates()` runs 4 times a game second and is now most of the cost. A 0.5 s tick would halve it, at the price of choppier UI numbers. Not done.
- Old saves that contain `gatePorters` no longer replay.
