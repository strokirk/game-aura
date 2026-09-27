# Scenarios and unlocks

A **scenario** is data: a start state, an unlock set, and lists of win and loss conditions.

| Scenario | Start | Win | Loss | Length |
| --- | --- | --- | --- | --- |
| **Trial of the Tide Pool** | 4 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool worked, 60 Silver. Aldric only | 500 Insight before 1222 | Notice 50; 1222 begins | 3–5 min at 1× |
| **The Covenant Must Grow** | 6 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool, 60 Silver, 150 Bread. Sabine and Hervé arrive later | The third Rite (`gate.md`) before 1260 | Notice 100; 1260 begins | 60–80 min |

## The trial

The trial is the default scenario in development (`?scenario=trial` or the dev menu), the first thing an agent's simulation runs, and the tutorial.

- A player who runs one extra-Vis experiment and assigns hands sensibly wins in about 2.5 minutes (the sim's median).
- A player who ignores the eels (taking the weir drops the Tide Pool's Vis to 80%) needs about 4.5 minutes, close to the deadline.

## Staged unlocks (full run)

Nothing appears before it matters. Each unlock is an entry in data: a condition plus what it reveals.

| When | Unlocks |
| --- | --- |
| Start | The Hall, Aldric's Sanctum, Salt Pans, the Tide Pool, hands, Silver, Vis and Insight |
| First Insight | *Study the Vis*; the Research tab with its first 3 items |
| Bread below 50% of its cap | The Bocage zone, Farms, Cottages; a "The hands are hungry" card |
| First research bought | Stone, Quarries, Storehouses, the Drowned Knight's Barrow, *Enchant a Device* |
| 10 hands | Parchmenters, Vellum, Libraries, the Regio Spring, *Write a Lab Text*; Sabine and Hervé arrive |
| Notice above 1 | The Notice gauge (around minute 4–6) |
| Year 1226 | Endow and Bribe |
| *Aegis of the Hearth* | The Drowned Gate |

**Why:** staged unlocks keep the first minutes small and give the middle a steady drip of new things, the way Kittens Game and A Dark Room reveal themselves.
