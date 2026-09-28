# Scenarios and unlocks

A **scenario** is data: a start state, an unlock set, and lists of win and loss conditions.

| Scenario | Start | Win | Loss | Length |
| --- | --- | --- | --- | --- |
| **Trial of the Tide Pool** | 4 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool worked, 60 Silver. Aldric only | 500 Insight before 1222 | Notice 50; 1222 begins | 3–5 min at 1× |
| **The Covenant Must Grow** | 6 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool, 1 Eel Weir, 2 Marsh porters, 60 Silver, 20 Eels, no Bread, plus the legacy. Sabine and Hervé arrive later | The seventh bell (`gate.md`) | Notice 100; the line is broken | 60–80 min |

## The trial

The trial is the default scenario in development (`?scenario=trial` or the dev menu), the first thing an agent's simulation runs, and the tutorial.

- A player who runs one extra-Vis experiment and assigns hands sensibly wins in about 2.5 minutes (the sim's median).
- A player who ignores the eels (taking the weir drops the Tide Pool's Vis to 80%) needs about 4.5 minutes, close to the Tribunal of 1222.

## Staged unlocks (full run)

Nothing appears before it matters. Each unlock is an entry in data: a condition plus what it reveals.

| When | Unlocks |
| --- | --- |
| Start | The Hall, Aldric's Sanctum, Salt Pans, the Tide Pool, hands, Silver, Vis and Insight |
| First Insight | *Study the Vis*; the Research tab with its first 3 items |
| 8 hands (the Hall is full) | The Bocage zone, Farms, Cottages; a "The Hall is full" card |
| First research bought | Stone, Quarries, Storehouses, the Drowned Knight's Barrow, *Enchant a Device*, the *Longevity Ritual*, apprentices |
| 10 hands | Parchmenters, Vellum, Libraries, the Regio Spring and its offerings, *Write a Lab Text*; Sabine and Hervé arrive |
| Notice above 1 | The Notice gauge (around minute 4–6) |
| Year 1226 | Endow and Bribe |
| The Bocage full | The Polder zone, dikes and Salt Meadows; a "Land from the sea" card |
| *Aegis of the Hearth* | The Drowned Gate |

**Why:** staged unlocks keep the first minutes small and give the middle a steady drip of new things, the way Kittens Game and A Dark Room reveal themselves.

## Stage scenarios

Stage scenarios start partway through the full run with the covenant already built up, so each stage can be played and judged on its own. They're listed apart on the title screen under "Jump to a stage". Same win and loss as the full run; stages leave no legacy.

| Stage | Starts | The situation |
| --- | --- | --- |
| **The Middle Years** | Spring 1236 | 3 magi (Lab Totals 14, 12, 12), 26 hands, 6 salt-works, all 3 Vis sites, 2 Quarries, 2 Parchmenters, a Library and a Storehouse. 7 research items and 2 Lab Texts known. Notice 45 and settling at 66, above the tax line. The Aegis and the Gate are still ahead |
| **The Gate** | Spring 1250; Aldric II and Hervé II hold two of the chairs | Everything researched and the Form trees open; 6 Lab Texts; 8 Devices on the Quarries. The Gate is raised, holds 4,000 of the 10,000 Insight the first bell needs, and Insight pours into it. With the dev menu's *Fill the Gate*, every bell can be tried here |

- **Why:** the full run is 80 minutes, too long to reach the late game every time a rule changes. Stage scenarios let a playtester (or the sim) start at the stage being tested, the way strategy games ship scenario starts.
- Every production line runs from the first second: food is positive, porters keep up, and every building fits its zone. A test checks this.
- `[PLAYTEST: the careful strategy wins neither stage. On the Gate it sends Vis to the Gate for good and starves its own labs; a human who fills the Gate's Insight first and then opens a 60 s window of Stone and Vis should do better. Confirm by play.]`
