# Proposal: auras and the four realms

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

In 1231 Sabine's experiments slowed, and nobody knew why until Hervé walked the fields. The parish, fattened by two Endowments, had put up a wayside cross at the top of the Bocage, and the Dominion was climbing the hill. The Hearth's aura fell from 3 to 2 and every Lab Total with it. The Aegis pushed it back in 1236. After the Gate was raised in 1249 the marsh began to hum: the labs ran hot, the Vis sites overflowed, and the salt-workers dreamt of bells.

## What it is

In Ars Magica an **aura** is a place's supernatural character and strength. There are 4 **realms**: **Magic** (the magi's own), **Divine** (the Dominion of the Church), **Faerie** and **Infernal**. Magi work best in a Magic aura; the Dominion smothers their magic but calms the mundanes around them.

Each **place** (a zone, or a Vis site with its own aura) has exactly 1 aura: a realm and a strength from 0 to 10. The aura is shown on the zone header and changes during the run.

## Starting auras

| Place | Realm | Strength | Why |
| --- | --- | --- | --- |
| Hearth | Magic | 3 | The covenant's home on Mont-Dol's shoulder |
| Bocage | Divine | 2 | The parish of Dol and the archangel's footprint on the Mont |
| Marsh | Magic | 4 | The Drowned Regio seeps up through the flats |
| The Regio Spring (Vis site) | Faerie | 3 | The spring belongs to someone else, and they remember gifts |

No place starts Infernal. The Infernal realm arrives only through what the covenant does (below).

## Input

The player does not set auras directly. Auras move in response to 5 existing actions:

| Action | Aura change |
| --- | --- |
| Endow the Parish | Bocage Divine +1 (max 10) |
| Bribe the Lord | Bocage gains 1 Infernal **taint** (see below) |
| Research *Aegis of the Hearth* | Hearth Magic +2; the Dominion threshold rises from 3 to 6 |
| Found / raise the Drowned Gate | Marsh Magic +1 each; raising it also gives Hearth Magic +1 |
| Each Rite performed | Marsh Magic +1 |

## System

**Lab Total.** A magus's Lab Total = their **score** + the aura of the zone their Sanctum is in (Magic adds, Divine subtracts, Faerie and Infernal add nothing). Founders' scores start at 7, so their Lab Totals start at 10 as now. Study raises the score; its cost formula uses score − 7 in place of LT − 10, so every Study costs what it costs today.

**The Dominion climbs the hill.** Dominion pressure = max(0, Bocage Divine − threshold). The threshold is 3, and 6 once the Aegis is cast. The Hearth's effective Magic aura = Hearth Magic − Dominion pressure, never below 0.

**Realm effects by zone:**

| Realm, strength *s* | Effect on the place |
| --- | --- |
| Magic | Vis sites in it yield ×(1 + 0.1 × (*s* − 4)), so the Marsh's starting 4 is the baseline. Sanctums add *s* to Lab Totals |
| Divine | The zone's Notice factor ×(1 − 0.05 × *s*): the priest vouches for his flock. Vis sites in it yield ×(1 − 0.1 × *s*) |
| Faerie | The Vis site yields ×(1 + 0.1 × *s*), and a **Faerie Bargain** card plays every 5 years (below) |
| Infernal taint | Each point of taint: the zone's buildings make ×0.95 output, and Notice +0.2 per minute. 1 point of taint fades every 10 years (1,200 s) |

**Faerie Bargain** (every 5 years, 600 s): the faerie of the spring asks for something small and strange. 2 choices: pay 10 Vis (Faerie +1, max 7), or refuse (Faerie −1; at 0 the spring's Faerie aura is gone and the site yields ×1). The card's text varies; the choice doesn't.

**Edge cases:**
- Taint is a separate counter from a place's realm; the Bocage can be Divine 4 with 2 taint.
- Auras are integers. The UI never shows fractions.
- A Hearth Magic aura of 0 still allows labs; Lab Totals just lose the bonus.

## Feedback

- Each zone header gets a small aura badge: a realm icon and a number ("Magic 5"). Tapping it lists what sets it: "Magic 3 · Aegis +2 · Dominion −1 = 4".
- A magus card's Lab Total reads "Score 12 + Aura 4 = 16".
- The Endow button adds a second line: "Bocage Divine 4 → 5 · Hearth aura −1 (−1 Lab Total for all 3 magi)" whenever the change crosses the threshold.
- The Bribe button says "+1 taint in the Bocage: −5% output, +0.2 Notice/min for 10 years".
- When the Hearth aura falls, a one-line Chronicle entry: "1231: the Dominion reached the Hearth."

## Parameters

| Parameter | Value |
| --- | --- |
| Starting auras | Hearth Magic 3, Bocage Divine 2, Marsh Magic 4, Regio Spring Faerie 3 |
| Founder score | 7 |
| Dominion threshold | 3; 6 after the Aegis |
| Divine Notice relief | −5% zone factor per point |
| Magic Vis bonus | +10% per point above 4 |
| Faerie Vis bonus | +10% per point |
| Faerie Bargain | Every 600 s; 10 Vis for +1, refusing −1 |
| Infernal taint | ×0.95 output and +0.2 Notice/min per point; −1 per 1,200 s |
| Late-game Magic | Hearth up to 6 (3 + Aegis 2 + Gate 1); Marsh up to 9 (4 + founded 1 + raised 1 + 3 Rites) |

`[PLAYTEST: the sim's careful strategy endows twice per run. That takes the Bocage to Divine 4, 1 over the threshold, costing each magus 1 Lab Total until the Aegis. Check this is felt but not crippling.]`

## Why

- **The game is called Aura and has none.** This makes the title a system: the ground itself has a character, and the covenant's choices change it.
- **It gives Endow and Bribe a second cost, and makes them different.** Today both are Silver-for-Notice. Now Endowing buys calm with lab power (the Dominion climbs the hill), while Bribing buys calm with the Bocage's output and a slow Notice leak (Infernal taint). That's the backlog's "cheapest permanent Notice fix costs lab power", with a matching cost on the temporary fix.
- **The Aegis becomes the defence it is in Ars Magica**: it holds the Dominion back, so it isn't just a Notice switch.
- **The late game gets a climbing number.** Every Gate stage and Rite raises the Marsh's Magic aura, so Vis grows exactly when the Rites need 0.3 Vis/s. Number go up, driven by the endgame itself.
- **Borrowed from:** Ars Magica's aura rules (the aura adds to the Lab Total; realms contest a place); Civilization's religious pressure spreading between cities; Factorio's pollution cloud reaching the biters: the covenant's own growth moves the map against it.

## Cost to build

- Data: an `aura` on each zone and on the Regio Spring; 5 effects on existing actions. Everything else is existing modifier plumbing (`economy.md`, *Stacking*).
- Code: the Lab Total formula gains an aura term; 1 new card (Faerie Bargain); a taint counter with decay.

## What this leaves out on purpose

- **Sanctums outside the Hearth.** A Sanctum in the Marsh at Magic 7+ would be a great late-game choice, but Sanctums, Vellum and Stone all assume the Hearth. Add when the Hearth is too crowded to hold the Rites' 3 Sanctums.
- **Magic auras affecting hands.** In Ars the Gift and strong auras unsettle mundanes. It would give the rising Marsh aura a cost; add it if the late-game Magic climb makes the game too easy.
- **Per-realm Notice tracks.** Parked in `icebox.md`.

`[OPEN QUESTION: should the Infernal realm also come from famine (hands dying in a zone), so a starving covenant rots as well as shrinks?]`
