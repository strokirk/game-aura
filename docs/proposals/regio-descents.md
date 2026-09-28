# Proposal: regio descents

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

Hervé went down into the Regio Spring in 1238 for what felt like an afternoon. The covenant waited 2 years. He came back with a satchel of vis that smelled of apples, a habit of answering questions before they were asked, and no memory of the Rite he'd promised to attend. Aldric and Sabine had held the Gate open for him for a season, and missed it.

## What it is

A **regio** is a hidden place layered over a real one. Each layer, a **level**, is further from the mundane world, stranger and richer. Time runs wrong inside: an afternoon in the regio can be a year outside.

A **descent** sends a magus into a regio level for a while. The magus is gone, their lab idle; they come back with Vis and sometimes a trait, at a time the player doesn't fully control.

The game has 2 regiones:

| Regio | Where | Levels | Opens |
| --- | --- | --- | --- |
| The Regio Spring | The Marsh Vis site of that name | 3 | Research *Walking the Boundary* (700 Insight), once the Regio Spring has a worker |
| The Drowned Regio | Behind the Drowned Gate | 3 | Level *n* opens when Rite *n* is performed |

## Input

Tap an idle magus (in a Sanctum, not experimenting) → **Descend** → pick a regio and level. The descent starts at once. While a magus is in a regio, the player can tap **Call back** once: it ends the descent early, as below.

## System

**A descent** has a planned length *T* (by level), a yield, and a **time slip** rolled at the start with the run's generator. The magus returns after *T* × slip seconds. The slip is hidden until the magus returns; the card shows only its range.

| Level | Planned length *T* | Slip range (uniform) | Chance to be Lost |
| --- | --- | --- | --- |
| 1 | 60 s | ×0.8–1.5 | 0% |
| 2 | 120 s | ×0.6–2.5 | 3% |
| 3 | 180 s | ×0.5–4 | 8% |

**Lost:** the magus is gone for 3 years (360 s) on top of the slip, and returns with a negative trait (below). The roll happens at the start, like the slip, so saves replay.

**Yields** (paid on return):

| Regio | Level 1 | Level 2 | Level 3 |
| --- | --- | --- | --- |
| The Regio Spring | 15 Vis | 40 Vis; 20% chance of a Faerie trait | 90 Vis; 40% chance of a Faerie trait |
| The Drowned Regio | 2,000 Insight into the Gate | 5,000 Insight into the Gate | 10,000 Insight into the Gate; 40% chance of a Drowned trait |

- Vis yields respect the Vis cap; the overflow is lost, so the player has a reason to spend first.
- **Call back:** the magus returns 15 s later with half the yield and no trait. Calling back cancels a Lost roll.
- A Faerie or Drowned trait is 50/50 positive or mixed (below). Lost gives a negative one.
- Only 1 magus can be in each regio at a time.
- The Rites need their 3 magi in Sanctums: a magus in a regio blocks a Rite until they return.

**Regio traits** (magus traits, same shape as `traits.md`):

| Trait | Tone | Effect | Story |
| --- | --- | --- | --- |
| Apple-Scented | + | This magus's Vis experiments cost 1 less Vis (min 1) | The spring's vis follows them home |
| Faerie-Sighted | ± | Discovery chance +5 points, botch chance +3 points | Sees the second face of everything |
| Keeps Faerie Hours | − | This magus's baseline Insight ×0.8 | Sleeps at noon, works by moonlight |
| Salt Voice | + | Descents into the Drowned Regio yield +25% | The drowned answer when they speak |
| Tide-Late | ± | This magus's slip is always exactly ×1.25 and they are never Lost | Always arrives, never early |
| Half-Drowned | − | 1 fewer assistant slot; can't Descend again for 5 years | Coughs brine in the mornings |

## Feedback

- The magus's portrait moves from the Sanctum to the regio's card, drawn as a door in the Vis site or the Gate. The card shows "Level 2 · back in 96–400 s", a slowly filling bar with no end mark, and **Call back**.
- On return, an event card: what they found, the slip as a line of flavour ("Hervé believes he was gone an hour. It has been 2 years."), and the trait if any.
- The Chronicle keeps every Lost magus and every return from level 3.

## Parameters

| Parameter | Value |
| --- | --- |
| *Walking the Boundary* | 700 Insight |
| Level lengths | 60 / 120 / 180 s |
| Slip ranges | ×0.8–1.5, ×0.6–2.5, ×0.5–4 |
| Lost chance | 0 / 3 / 8%, +360 s |
| Regio Spring yields | 15 / 40 / 90 Vis |
| Drowned Regio yields | 2,000 / 5,000 / 10,000 Gate Insight |
| Trait chances | 0 / 20 / 40% |

**The trade, computed at LT 15:** *Study the Vis* makes 225 Insight per 60 s for 5 Vis. A level-1 descent (mean 69 s) returns 15 Vis, which fund 3 *Study the Vis* worth 675 Insight. So a descent pays when Vis, not magus time, is the bottleneck, which is the mid-game. The Drowned Regio pays in the late game: level 2's mean slip is ×1.55, 186 s, for 5,000 Gate Insight, about 27 Insight/s against about 4 Insight/s from *Study the Vis* at LT 15. `[PLAYTEST: the Drowned yields are sized to close the gap between the Rites' 75,000 Insight and what the sim's labs produce (about 90,000 over a whole run, most of it spent on research). Tune with the sim.]`

## Why

- **The Drowned Gate is the game's only regio, and nobody ever goes in.** This lets the magi walk into the thing the whole run is about, and makes each Rite open something, not just close a stage.
- **It's the one lab action that is a real gamble with a person.** Experiments risk goods and Notice. A descent risks a magus's time and the Rite schedule: the late-game question becomes "can I spare Hervé for 3 minutes, when he might take 12?" That's the late sprint's pressure.
- **It gives the Regio Spring and its Vis site a reason to be named.**
- **Borrowed from:** Ars Magica's regiones and faerie time; Darkest Dungeon's expeditions, where heroes come back changed; Cultist Simulator's expeditions, where you commit a follower and wait; FTL's beacons, where a known range hides the outcome.

## Cost to build

- Data: 2 regiones × 3 levels, 6 traits, 1 research item.
- Code: a new magus state (`inRegio`) next to `experimenting`; the slip roll at start; Gate Insight as a yield target (it exists for *Pour into the Gate*).

## What this leaves out on purpose

- **Rooms, moves and guardians** (`icebox.md`, *Journeys into the Regio*). A descent is a single timed bet; the map version stays parked until descents prove fun.
- **Faerie vis as its own good.** All vis stays Vim (`data-model.md`).

`[OPEN QUESTION: should level 3 of the Drowned Regio be required for the third Rite, so every winning run sends someone to the bottom?]`
