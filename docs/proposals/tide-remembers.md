# Proposal: the Tide Remembers

*Status: proposal, being implemented. Not part of the game until it moves into `design/`.*

The full run loses its 1260 deadline. In its place: a goal the opening tells, an **aura** the player raises at a cost in Notice, magi who **age and die**, **apprentices** who inherit their master's name, **eels** that buy hands, and a **legacy** that every fallen covenant leaves to the next, stacking without limit.

## The story this makes possible

Aldric climbed Mont-Dol alone in 1220, because the sea took his brother and he still hears bells under the water. He raised the aura three times and the milk curdled in Dol. He died in 1236 with the Gate half-built. His apprentice knelt, rose, and answered to his name: Aldric II. The bishop's Endowments smothered the hill, the Order renounced the covenant in 1248, and the next covenant found fourteen Lab Texts under the ruins and a hill that already hummed at Magic 5.

## 1. No deadline; the opening tells the goal

**Input:** none. **System:** the full run and the stage scenarios have no time loss. The trial keeps its 1222 limit, framed as the Tribunal that will charter the covenant. **Feedback:** the goal line reads "Open the Drowned Gate: perform its three Rites". The end screen and Chronicle record the year the tide stood still: that year is the score.

**The opening card** (the full run):

> **Spring, 1220.** Aldric climbs Mont-Dol alone: the black hill in the marsh where the archangel ground his heel into the Devil and left the print in the stone. The wind comes off the bay with brine and the smoke of the salt-pans. Across the water, Mont-Saint-Michel wears a cage of scaffolding: the monks are raising the Merveille, stone on stone, toward heaven.
>
> Below him his few hands rake salt-sand on the flats and lift eels from the weir. Here, eels pay the rent, and eels bring families up the hill.
>
> He was forty-eight this winter. On still nights he hears bells under the water. He has heard them since the year the sea took his brother. Under the reeds, under the eels, under a fathom of black water lies the Drowned Regio, sealed behind the Drowned Gate. It is said no one there grows old, and that the drowned are only waiting.
>
> Open the Gate. Thicken the aura until the hill hums like a struck bell. But the bishop counts sins, the lord of Dol counts silver, and the Order of Hermes counts Notice, and at one hundred casts you out. And Time counts everything. Magi age. Magi die. Take apprentices, or the line ends in the mud.
>
> *There is no deadline. There is only the tide.*

Sabine's and Hervé's arrival card carries their motives: Sabine wants everything the drowned knew with her name cut above it; Hervé hears in the bells a church older than Rome.

**Why:** the deadline was arbitrary; the Gate is the goal. Stalling is punished by in-world clocks instead (aging, the friars' Dominion). Trivial beats slow (`vision.md`): the challenge is to finish sooner.

## 2. Eels

**Input:** build and staff Eel Weirs (Marsh, from the start of the full run); sell eels to Mont-Saint-Michel from 1226. **System:**

| Parameter | Value |
| --- | --- |
| Eels | A good; cap 100; carried by Marsh porters like any Marsh good |
| Eel Weir | 15 Silver, 1 worker, 0.3 Eels/s (× the eels thread's level while it runs). No longer makes Bread |
| A new hand | Arrives every 20 s as before, and now also costs **10 Eels** (the eel rent); none arrive without them |
| Sell a stick to the Mont | 25 Eels → 30 Silver and Notice −1. From 1226, with Endow and Bribe |
| Full run start | 1 Eel Weir with 1 worker, 20 Eels, 2 Marsh porters |

The trial keeps free hands. **Why:** medieval rents were paid in eels, counted in sticks of 25; it gives the Marsh a second early job and hands a price. Selling to the monks is a small, steady Notice lever that costs Marsh hands and porters.

## 3. The aura

The covenant has one aura built from four realms. **Effective aura** = Magic − Divine.

| Realm | Starts | Raised by | Effect |
| --- | --- | --- | --- |
| Magic | 3 (+ legacy) | **Raise the Aura**, repeatable research: 500 × 2^n Insight + 10 Vis | Boost tiers below. Each raise: Notice generation +1/min, for good |
| Divine | 0 | Each Endowment +1; the friars +1 in 1230, 1240, 1250… | −1 effective aura per point |
| Infernal | 0 | Each Bribe +1 stain, for 10 years (1,200 s) | All buildings' output ×0.9 per stain |
| Faerie | 0 | Offerings at the Regio Spring (§4) | Notice decays 1 point faster per level (10% → 11% a minute per level) |

**Boost tiers**, by effective aura *a*. Each unlocks at its level and grows with every point above it:

| From | Boost | Formula |
| --- | --- | --- |
| always | Lab Insight (reading and experiments) | ×max(0.25, 1 + 0.15 × (*a* − 3)); below 3 it's a penalty |
| 5 | Experiment speed | ×(1 + 0.1 × (*a* − 4)) |
| 6 | Slower aging | aging chance ×max(0, 1 − 0.1 × (*a* − 5)) |
| 7 | Discovery chance | +1 point per point above 6 |
| 8 | Vis sites | ×(1 + 0.1 × (*a* − 7)) |
| 9 | Lab Total | +1 per point above 8 |

Computed at Lab Total 15, lab output is ×1.15 at aura 4, ×1.43 at 5, ×1.74 at 6, ×2.08 at 7 and ×3.04 at 9. Reaching 9 costs 31,500 Insight and +6 Notice a minute: +60 to where Notice settles.

**Feedback:** a header badge "Aura: Magic 5"; the Covenant tab's Aura card lists each realm, the tiers reached and the next; Endow and Bribe buttons say what they cost the aura; the friars arrive with a card.

**Why:** the title becomes the engine. Raising the aura is the big multiplier, paid in Notice; the Notice fixes each cost something different: Endowing smothers the aura, Bribing blights the fields, and Faerie is the one fix that doesn't hurt the aura, paid in Vis and luck.

## 4. Faerie offerings: a slot machine at the Regio Spring

**Input:** **Leave an offering**, once the Regio Spring is built. Costs 10 Vis, doubling with each further offering in the same year. **System:** one roll:

| Weight | Outcome |
| --- | --- |
| 50% | The fae take it and laugh: nothing |
| 20% | They take more: 10 more Vis, or a hand walks into the marsh if there's no Vis |
| 20% | They are pleased: Faerie +1 (max 5) |
| 10% | A gift, only when the covenant is **in need**; otherwise nothing |

In need, checked in order: Notice ≥ 75 (gift: Notice −30), Bread under 10% of its cap (the granary fills), a magus at Decrepitude 4 (−1 Decrepitude), Silver under 50 (+200 Silver). Faerie falls by 1 after 600 s without an offering. **Feedback:** a card with three reels (shell, eel, bell) and the outcome. **Why:** Cultist Simulator's capricious gods: a losing bet when you're comfortable, the only miracle when you're not.

## 5. Aging and death

| Parameter | Value |
| --- | --- |
| Starting ages | Aldric 48, Hervé 39, Sabine 31 |
| Aging roll | Each year boundary from age 45: chance (age − 45) × 3% of +1 Decrepitude |
| Decrepitude | Each point: Lab Total −1. At 5 the magus dies |
| Longevity Ritual | Lab recipe: Vis = age ÷ 5 rounded up, 240 s. Halves the aging chance for life; once per magus. A Discovery also removes 1 Decrepitude |

Computed (20,000 runs): median death year without a ritual Aldric 1235, Hervé 1243, Sabine 1251; with one 1242, 1251, 1259. **Why:** the clock that replaces the deadline, and the first "invest in a person" decision.

## 6. Apprentices and the chairs

- **Take an apprentice:** 150 Silver, from a magus's card; one per magus.
- **Boost:** the master's Insight ×(1 + *b*), with *b* sliding from −25% to +25% over 4 years (480 s), then staying at +25%. Over 6 years that's +0.5 magus-years: **+8.3% on average**, breaking even at year 4.
- **Gauntlet:** at 6 years (720 s) the apprentice becomes a journeyman and **stays with the master at +25%** until a magus's place falls vacant.
- **Botches:** each botch by the master kills the apprentice 20% of the time (16% over 12 experiments at a 7% botch rate).
- **The chairs:** each magus's place is a chair named for its founder. An apprentice who fills a vacant chair takes its name and the next numeral (*Aldric II*), its Sanctum, age 25, and Lab Total 8 + ⌊(master's Lab Total − 10) ÷ 2⌋ (at least 8). A journeyman fills their own master's chair first.
- If the master dies before the Gauntlet, training continues without a boost.

**Why:** Crusader Kings' heir, at an incremental game's pace; the boost pays for the apprentice while it waits.

## 7. Losing, and the legacy

**Loss:** Notice 100 (**RENOUNCED**), no magus and no apprentice left (**THE LINE IS BROKEN**), or the last hand leaves. **The end screen:** a huge title, the cause, and a nag that names the inheritance: *"But the Gate still waits under the tide. Aldric III will find 14 Lab Texts under the hill."* Its button reads **Found a new covenant**.

**The Tide Remembers.** Every ended full run (lost or won) adds to the legacy, and legacies **stack**:

| Legacy | Adds each run |
| --- | --- |
| Aura | Starting Magic += ⌊(peak Magic this run − starting Magic) ÷ 2⌋. Inherited Magic adds no Notice |
| The Buried Library | Every Lab Text written this run. *Dig Out the Old Library* (research, 100 Insight per text) recovers all of them |
| Heirlooms | 1 Device, on the building type with the most Devices this run; every heirloom starts built |
| The chairs | Numerals carry on: the next covenant opens with Aldric III |

**Why:** number go up across runs, the way Cultist Simulator's successors and every prestige layer work. The first run is the hardest; later ones are faster, and the challenge becomes the year.

## Open questions

- `[PLAYTEST: can Endowing, Bribing, selling eels and Faerie together absorb +60 Notice from aura 9?]`
- `[PLAYTEST: the faerie odds; the eel price of a hand.]`
- `[OPEN QUESTION: after a win, should the next covenant face harsher friars or a deeper Gate?]`
