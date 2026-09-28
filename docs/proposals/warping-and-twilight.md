# Proposal: Warping and Twilight

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

Aldric pushed every experiment. By 1234 he had botched only twice, and he had been in Twilight three times. The first time he came back seeing the tide's colours in the Vis. The second, he forgot how to read his own hand. In 1247, a season before the second Rite, he went into Twilight a fourth time and did not come back. The Chronicle says he became part of the Aegis.

## What it is

In Ars Magica, magic changes the magus who uses it. **Warping** is that change, counted as points. Enough Warping throws the magus into **Twilight**: a trance in which they meet magic itself and return wiser, stranger, or not at all.

Each magus has a **Warping** score from 0 upward. It never falls. Every 10 points sends the magus into Twilight. At 50 they enter **Final Twilight** and leave the game.

## Input

Warping comes from choices the player already makes in the lab. The player doesn't gain it directly; they choose how hard to push.

| Source | Warping |
| --- | --- |
| Committing 3 or more extra Vis to an experiment | +1 per experiment |
| **Push** at the halfway check-in | +2 |
| A botch | +2 (as well as its other costs) |
| Each year (120 s) in a Sanctum while its Lab Total is 20 or more | +1 |

To make room, extra Vis and Push move part of their risk from the covenant to the magus:

| | Today | With this proposal |
| --- | --- | --- |
| Each extra Vis | +2 points botch chance | +1 point botch chance |
| Push | +10 points botch chance | +5 points botch chance |

## System

**Twilight** begins the moment Warping crosses 10, 20, 30 or 40.
- An experiment in progress pauses and resumes when the magus returns. Baseline Insight stops.
- The magus is gone for 30 s × (the number of this Twilight): 30, 60, 90, 120 s.
- On return, one roll: **Comprehend** or **Suffer**.
  - Comprehend chance = 60% + 1 point per Lab Total above 10 − 10 points per earlier Suffer, clamped to 10–90%.
  - **Comprehend:** score +1 (+1 Lab Total), and a Twilight trait: positive (50%) or mixed (50%).
  - **Suffer:** a negative Twilight trait.
- **Final Twilight** at 50 Warping: the magus leaves for good. Their Sanctum stays and a later magus could use it; their Lab Texts and Devices stay. The Chronicle records it.
- A magus in Twilight can't Study, experiment, or be counted for a Rite.
- If Final Twilight would leave fewer magi than a Rite needs, the Rites need every magus still in the covenant instead. `[OPEN QUESTION: or does losing a magus make the win impossible? That's loud, but it can end a run 20 minutes early with nothing left to do, which the vision forbids.]`

**Twilight traits** (magus traits, same shape as `traits.md`):

| Trait | Tone | Effect | Story |
| --- | --- | --- | --- |
| Tide-Sight | + | *Study the Vis* yields +20% | Sees the tide's colours in raw vis |
| Hears the Aegis | + | While this magus is in a Sanctum, Hearth Notice factor −0.1 | The wards hum to them at night |
| Unaging | ± | Warping from Lab Total 20+ doesn't apply; Study costs +25% | Has stopped changing, in every way |
| Speaks in Riddles | ± | Discovery chance +5 points; this magus's Lab Texts give +5% instead of +10% | Writes what they meant, not what they said |
| Forgets Their Hand | − | Write a Lab Text takes this magus twice as long | Can't read their own notes |
| Slips Away | − | Each experiment has a 5% chance to start a 30 s Twilight that adds no Warping | Sometimes simply isn't there |

## Feedback

- Each magus card shows a Warping gauge with ticks at 10, 20, 30, 40 and a red end at 50. The ring fills in violet.
- The experiment screen shows Warping next to botch chance: "7% botch · +3 Warping".
- Twilight is an event card when it starts ("Aldric's eyes go still. The candle burns without flickering.") and one on return (the roll, the trait).
- A magus in Twilight shows a closed-eye portrait and a countdown.

## Parameters

| Parameter | Value |
| --- | --- |
| Twilight every | 10 Warping |
| Final Twilight | 50 Warping |
| Twilight length | 30 s × Twilight number |
| Comprehend chance | 60% + (LT − 10) − 10 × earlier Suffers, clamped 10–90% |
| Warping from ≥ 3 extra Vis | +1 |
| Warping from Push | +2 |
| Warping from a botch | +2 |
| Warping at LT 20+ | +1 per 120 s |
| Extra Vis botch | +1 point each (from +2) |
| Push botch | +5 points (from +10) |

**Pacing, computed:** a magus who commits 3+ extra Vis and pushes every 120 s experiment gains 3 Warping per 2 minutes, a Twilight every 6–7 minutes and Final Twilight at about minute 33 of their career. A magus who never pushes and commits at most 2 extra Vis gains Warping only from botches (+2 each; seed 7 of the sim has 19 botches across 3 magi, about 6 each) about 12, plus 1 per year at Lab Total 20+ (20 more for a magus who reaches LT 20 halfway through the run): 1–3 Twilights by the end. `[PLAYTEST: check with a pusher strategy in the sim that Final Twilight is possible but only for a player who ignores the gauge.]`

## Why

- **The lab has one risk, and it's the covenant's.** Every botch is +5 Notice, seed 7 of the sim botches 19 times, and the only answer is *Lab Notebooks*. Warping gives each magus their own risk budget for the whole run, so pushing becomes a question about this person, not about the covenant's Notice.
- **It makes the three magi different by the end.** Twilight traits are earned by how each magus was played; a careful Sabine and a reckless Aldric end the run as different people.
- **It's a slow, readable clock that fails loudly.** Final Twilight is a memorable loss of a character, never a stall.
- **Borrowed from:** Ars Magica's Warping and Twilight; Darkest Dungeon's stress, where a threshold rolls affliction or virtue; Crusader Kings' stress levels, which change a character permanently.

## Cost to build

- Data: 6 traits, 5 parameters.
- Code: a per-magus Warping counter; a Twilight state that pauses the experiment timer; 2 event cards.

## What this leaves out on purpose

- **Warping for hands and places.** Strong auras warp mundanes in Ars. Add when auras exist and the late game needs a cost for its rising Magic aura.
- **Longevity rituals** (a major Warping source in Ars). They belong with aging (`backlog.md`).
- **Criamon, the House that courts Twilight.** Belongs with Houses (`backlog.md`).
