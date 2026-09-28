# Balance and simulation

The balance simulation is the source of truth for every number in the design. A design value that the sim contradicts is wrong, not the sim.

## Running it

- `pnpm sim --scenario full --strategy careful --seed 7` prints a timeline an agent can read: purchases, unlocks, Notice and the outcome.
- `pnpm sim --strategy sensible --seeds 50` reports the win rate and times over 50 seeds.
- A **strategy** is a function `(state) => Action[]`, called every simulated second. Strategies live in `sim/strategies.ts`.
- **Performance budget:** a full 80-minute run simulates in under 1 s.

## Balance tests

`test/balance.test.ts` runs each strategy over 50 seeds and checks outcome ranges. A balance regression fails CI. The full run and its `careful` strategy exist but aren't balanced yet; its rows are targets, not tests.

| Scenario | Strategy | Target |
| --- | --- | --- |
| Trial | Sensible | Wins in 1:30–4:00 in ≥ 90% of seeds, median ≥ 2:00 |
| Trial | Idle (does nothing) | Loses |
| Trial, full run | Random (legal actions at random) | A fuzzer: never crashes, replays exactly |
| Full run | Careful | Wins in 60–75 min `[PLAYTEST: the careful strategy reaches the first Rite on some seeds and wins none yet]` |
| Full run | Reckless, without bribes | Renounced `[PLAYTEST: not simulated yet]` |
| Full run | Timid | Runs out of time `[PLAYTEST: not simulated yet]` |

## Constraints to keep true

- The Rites' 0.3 Vis/s is reachable with 2 of the 3 Vis sites plus research.
- The Rites' 4 Stone/s delivered to the Gate is reachable at full-run scale.
- No story thread ends the run on its own; the eels' flood never takes the last salt-works.

## Playtest register

| Question | Target |
| --- | --- |
| Median time to win the full run | 60–75 minutes |
| Share of first full runs lost | 40–60%, split between Renounced and out of time |
| Time to the first Insight | Under 60 seconds |
| Do players understand the Notice equilibrium marker by minute 10? | 80% of testers can explain it |
| Do traits change decisions? | Testers name at least 1 trait they played around |
| Time between purchases | Something affordable within 60 s of play |
| Experiment rhythm | A result every 1–3 minutes in the middle of the run |
