# Balance and simulation

The balance simulation is the source of truth for every number in the design. A design value that the sim contradicts is wrong, not the sim.

## Running it

- `pnpm sim --scenario full --strategy careful --seed 7` prints a timeline an agent can read: purchases, unlocks, Notice and the outcome.
- `pnpm sim --strategy sensible --seeds 50` reports the win rate and times over 50 seeds.
- A **strategy** is a function `(state) => Action[]`, called every simulated second. Strategies live in `sim/strategies.ts`.
- With no deadline, a sim stops at 150 minutes of play if the strategy hasn't finished.
- **Strategies:** `careful` first builds what brings more hands (Cottages, Eel Weirs for the rent), keeps every hand at work (porters wherever goods are lost, then the job with the lowest share of its slots filled), round-robins each magus's lab work, takes apprentices and works the Longevity Ritual. `random` plays legal actions at random, then puts every idle hand to work at random, and now and then reorganizes all its hands.
- **Performance budget:** a full 80-minute run simulates in under 1 s. `[PLAYTEST: careful takes about 2.5 s; its hand planning re-applies actions to a copy.]`

## Balance tests

`test/balance.test.ts` runs each strategy over 50 seeds and checks outcome ranges. A balance regression fails CI. The full run and its `careful` strategy exist but aren't balanced yet; its rows are targets, not tests.

| Scenario | Strategy | Target |
| --- | --- | --- |
| Trial | Sensible | Wins in 1:30–4:00 in ≥ 90% of seeds, median ≥ 2:00 |
| Trial | Idle (does nothing) | Loses |
| Trial, full run | Random (legal actions at random) | A fuzzer: never crashes, replays exactly |
| Full run | Careful | Wins in 60–75 min `[PLAYTEST: careful rings 2 of the 7 bells by about minute 75 on seeds 1–2 and stalls there; seed 3 is Renounced at minute 54]` |
| Full run | Reckless, without bribes | Renounced `[PLAYTEST: not simulated yet]` |
| Full run | Timid | Loses to age or is Renounced, or wins after minute 100 `[PLAYTEST: not simulated yet]` |

## Constraints to keep true

- Every bell's price is reachable within about 80 minutes through the Form trees and the aura `[PLAYTEST: not yet]`.
- No story thread ends the run on its own; the eels' flood never takes the last salt-works.

## Playtest register

| Question | Target |
| --- | --- |
| Median time to win the full run | 60–75 minutes |
| Share of first full runs lost | 40–60%, split between Renounced and the line broken |
| Time to the first Insight | Under 60 seconds |
| Do players understand the Notice equilibrium marker by minute 10? | 80% of testers can explain it |
| Do traits change decisions? | Testers name at least 1 trait they played around |
| Time between purchases | Something affordable within 60 s of play |
| Experiment rhythm | A result every 1–3 minutes in the middle of the run |
