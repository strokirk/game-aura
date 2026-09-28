# Scenarios and unlocks

A **scenario** is data: a start state, an unlock set, and lists of win and loss conditions.

| Scenario | Start | Win | Loss | Length |
| --- | --- | --- | --- | --- |
| **Trial of the Tide Pool** | 4 idle hands, Aldric with a Sanctum, 1 unworked Salt-works, 20 Silver, no porters, no Vis site. Aldric only | 500 Insight gathered before 1224 | Notice 50; 1224 begins | 3–6 min at 1× |
| **The Covenant Must Grow** | 6 hands, Aldric with a Sanctum, 1 Salt Pan, the Tide Pool, 1 Eel Weir, 2 Marsh porters, 60 Silver, 20 Eels, no Bread, plus the legacy. Sabine and Hervé arrive later | The seventh bell (`gate.md`) | Notice 100; the line is broken | 60–80 min |

## The trial

The trial is the tutorial, the default scenario in development (`?scenario=trial` or the dev menu), and the first thing an agent's simulation runs. It teaches one loop, and nothing else: **hands make Silver, Silver buys a Vis site, Vis becomes Insight, Insight buys research.**

**Input:** the player follows the **guide**, one step at a time.

**System:** the guide is a list of steps in the scenario's data, each a line of text and a condition. The current step is the first whose condition isn't met, so a step that is undone (a hand taken off the Salt-works) comes back. A step can name a tab and a building to point at. The last step has no condition: it stays until the run ends.

| Step | Says | Done when | Points at |
| --- | --- | --- | --- |
| 0 | Build a Salt-works. (Shown only if the covenant has none.) | A Salt-works built | The Salt-works |
| 1 | Put 2 hands to work in the Salt-works. | 2 workers in the Salt-works | The Salt-works |
| 2 | Make a hand a porter. Salt sells for Silver only once it is carried to the Hall. | 1 Marsh porter | The Marsh porters |
| 3 | Save 40 Silver and build the Tide Pool. It gathers Vis. | The Tide Pool built | The Tide Pool |
| 4 | Put 2 hands to work at the Tide Pool. | 2 workers at the Tide Pool | The Tide Pool |
| 5 | The Marsh now makes more than one porter can carry. Make a second porter. | 2 Marsh porters | The Marsh porters |
| 6 | Put 2 idle hands in the Sanctum as assistants. Each makes Aldric work 25% faster. | 2 assistants in the Sanctum | The Sanctum |
| 7 | At 5 Vis, open the Magi tab and have Aldric Study the Vis. | 1 experiment begun | The Magi tab |
| 8 | When the study is done, learn Salt Rakes in the Research tab: more Salt, more Silver. | 1 research bought | The Research tab |
| 9 | Keep Aldric studying. Extra Vis in a study yields more Insight, when there is Vis to spare. | Never: it stays | — |

**Feedback:** the guide is one gold line under the goal in the header, prefixed "Next:", on every tab. The tab it names pulses, and the building or porter card it names has a gold border. The goal line shows the progress: "Goal: Gather 500 Insight before the Tribunal of 1224 · 180/500".

**What the trial reveals:** only what the loop needs. At the start: the Hall, Aldric's Sanctum, the Salt-works, the Tide Pool and the Barrow (to build: the Barrow is there for a player who looks past the guide, since the guide's 8 hands fill every job), hands, Silver. Vis and Insight appear in the header when they first move. The Research tab appears when Aldric begins his first Study the Vis (he reads from the first second, so the first Insight comes too early to mean anything) and lists **one item, Salt Rakes**. Notice appears when it passes 1, as in the full run. The trial never shows the aura, the Tribunal, Bread or the Bocage.

**Parameters:**

| Parameter | Value |
| --- | --- |
| Start | 4 hands, none assigned; housing 8, a new hand every 20 s, so the 8 hands the guide places are all there by 1:20 |
| Start goods | 20 Silver, 0 Vis |
| Tide Pool, Barrow | 40 Silver each, 0.08 Vis/s per worker, 2 workers |
| Win | 500 Insight **gathered** (spending it on research doesn't count against it) |
| Loss | Notice 50; the start of 1224 (480 s) |
| Research on offer | Salt Rakes only (50 Insight) |

**Why:** a tutorial that can be won by pressing one button teaches one button. Starting with idle hands and no Vis site makes the player build the whole chain once, in order, and each step's reward is the next step's input, the way *A Dark Room* hands over one verb at a time. The win counts Insight gathered, not held, so the one research never feels like a trap. The Tribunal sits in 1224, four years out: a player who does only what the guide says, a click every 15 s, wins by about 6:15, and a botch or a bad bargain with the eels still leaves time. The deadline is there so that neglect loses; a tutorial shouldn't be lost to reading slowly.

- A player who follows the guide to the letter wins in about 4–5½ minutes at 1×; an efficient one in about 3½ (`balance.md`).
- The eels thread's first 2 beats play here too. Taking the weir drops the Tide Pool's Vis to 80% for 10 minutes; going to look first idles Aldric's lab for 60 s but spares the Vis, and is the better choice here.

## Staged unlocks (full run)

Nothing appears before it matters. Each unlock is an entry in data: a condition plus what it reveals.

| When | Unlocks |
| --- | --- |
| Start | The Hall, Aldric's Sanctum, Salt Pans, the Tide Pool, hands, Silver, Vis and Insight |
| First Insight | *Study the Vis*; the Research tab with its first 3 items; the Aura card |
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
