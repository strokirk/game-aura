# Balance and simulation

The balance simulation is the source of truth for every number in the design. A design value that the sim contradicts is wrong, not the sim.

## Running it

- `pnpm sim --scenario full --strategy careful --seed 7` prints a timeline an agent can read: purchases, unlocks, Notice and the outcome.
- `pnpm sim --strategy sensible --seeds 50` reports the win rate and times over 50 seeds.
- A **strategy** is a function `(state) => Action[]`, called every simulated second. Strategies live in `sim/strategies.ts`.
- **Performance budget:** a full 80-minute run simulates in under 1 s.

## Balance tests

`test/balance.test.ts` runs each strategy over 50 seeds and checks outcome ranges. A balance regression fails CI.

| Scenario | Strategy | Target |
| --- | --- | --- |
| Trial | Sensible | Wins in 2.5–4 min in ≥ 90% of seeds |
| Trial | Idle (does nothing) | Loses |
| Full run | Careful | Wins in 60–75 min |
| Full run | Reckless, without bribes | Renounced |
| Full run | Timid | Runs out of time |

## Constraints to keep true

- The Rites' 0.3 Vis/s is reachable with 2 of the 3 Vis sites plus research.
- The Rites' 8 Stone/s carried into the Marsh is reachable at full-run scale.
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
