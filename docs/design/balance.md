# Balance and simulation

The balance simulation is the source of truth for every number in the design. A design value that the sim contradicts is wrong, not the sim.

## Running it

- `pnpm sim --scenario grow --strategy careful --seed 7` prints a timeline an agent can read: purchases, unlocks, Notice and the outcome.
- `pnpm sim --strategy sensible --seeds 50` reports the win rate, the win times, how the other runs ended and the time each run takes to simulate, over 50 seeds.
- A **strategy** is a function `(state) => Action[]`, called every simulated second. Strategies live in `sim/strategies.ts`.
- With no deadline, a sim stops at 150 minutes of play if the strategy hasn't finished.
- A card the strategy doesn't answer takes its first option the covenant can pay for.
- **Strategies:**
  - `careful` buys land when a wanted building's zone is full or Silver sits at its cap, builds dikes once the Bocage and Marsh are full, and buys Storehouses when any price (land and dikes included) is over a cap. It builds Cottages when every hand is at work, and for the Gate's next goal the producer of whatever it will take longest to fill (Stone to raise it, then each bell's goods). It builds only while Notice settles below 60, except buildings that draw no Notice, the Vis sites, Sanctums and Libraries, and buys Storehouses and Libraries when a price outgrows a cap. Its magi Study the Vis whenever there's Vis (with extra Vis only while Notice is under 60), else write a Lab Text, else enchant a Device for the Gate's slowest good, and hold steady at every check-in. It Endows when Notice would settle above 55, gives eels and bribes above 65 and 70 (45 and 50 once the last bell is paid for), buys a Form tree when it costs under a tenth of the next bell's Insight, and pours exactly the goods the next bell still lacks. With no idle hand, it moves one hand a second from the busiest job the Gate doesn't need to where goods lie uncarried or to the Gate's slowest good. It never makes offerings.
  - `random` plays legal actions at random, then puts every idle hand to work at random, and now and then reorganizes all its hands. It's the fuzzer.
- **Performance budget:** a full 80-minute run simulates in under 1 s. The sim owns its state and changes it in place (`advance`, `applyInPlace`); the UI's `step` and `apply` copy. A careful full run takes about 0.5 s (`pnpm sim --scenario grow --strategy careful --seeds 10`), and the balance test fails above 1 s a run.

## Balance tests

`test/balance.test.ts` runs the trial over 50 seeds and the full run over 20, and checks outcome ranges. A balance regression fails CI. Rows marked "not simulated" are targets, not tests.

| Scenario | Strategy | Target |
| --- | --- | --- |
| Trial | Sensible | Wins in 1:30–4:00 in ≥ 90% of seeds, median ≥ 2:00 |
| Trial | Idle (does nothing) | Loses |
| Trial, full run | Random (legal actions at random) | A fuzzer: never crashes, replays exactly |
| Full run | Careful | Wins in ≥ 90% of 20 seeds, median 60–75 min, none after 100 min; each run simulates in under 1 s. Over 50 seeds: 49 wins, 60–84 min, median 70; 1 Renounced. About 100 buildings by minute 60 |
| Full run | Reckless, without bribes | Renounced `[PLAYTEST: not simulated yet]` |
| Full run | Timid | Loses to age or is Renounced, or wins after minute 100 `[PLAYTEST: not simulated yet]` |

## Constraints to keep true

- Every bell's price is reachable within about 80 minutes: the careful sim's slowest of 50 seeds wins at minute 84.
- The covenant keeps growing all run: the careful sim has about 100 buildings by minute 60 (seeds 1–3), because land, dikes and terraces are cheap and Notice is the one hard budget (`economy.md`).
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
