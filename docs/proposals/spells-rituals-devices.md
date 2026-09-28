# Proposal: spells, rituals and Devices

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

The strike came in the spring of 1233, with 40 Stone short of the Gate. Aldric walked down to the Marsh and told the stones to carry themselves. They did, for half a minute, and he slept for two days. In 1241 Sabine bound the same spell into a pair of iron-shod poles, and the Gate porters never walked alone again. At the third Rite, with the Stone gauge flickering at 3.8 against the 4 it needed, Hervé made the quarry give three days' stone in an afternoon, and fell asleep in the spoil.

## What it is

Magi know **spells**: named effects in Ars Magica's language of a Technique and a Form ("Rego Terram": control earth). A spell a magus knows can be used 3 ways:

| Use | Costs | Effect |
| --- | --- | --- |
| **Cast** | Fatigue | A short, strong burst, now |
| **Ritual** | Vis and 60 s of the magus's lab | A long effect, 1 year (120 s) |
| **Device** | Vis, Stone and 240 s of the lab | A permanent, weaker effect, bound into an object |

A magus learns a spell with a new lab recipe, **Invent a Spell**. The lab's existing *Enchant a Device* becomes the Device use of a known spell.

## Input

- **Invent a Spell** (lab recipe): pick a spell whose level is at most the magus's Lab Total. Costs 10 Vellum per 5 levels and runs 30 s per 5 levels. On success the magus knows it for good. Botch and Discovery work as for any experiment.
- **Cast:** tap a spell on a magus card. Allowed while the magus is in the covenant and not in Twilight or a regio, **including while experimenting**.
- **Ritual:** start it like an experiment (the magus can't run another). No check-in.
- **Device:** start it like an experiment. Replaces *Enchant a Device*.

## System

**Fatigue.** Each magus has 0–5 Fatigue.
- Each level of Fatigue: this magus's experiments run 10% slower and their baseline Insight falls 10%.
- Fatigue recovers 1 level every 30 s.
- At 5 the magus is **unconscious** for 60 s: their experiment pauses, they can't cast, and then they wake at 3 Fatigue.

**Casting.** A cast costs the spell's Fatigue and takes effect at once. A cast is **seen** when its effect lands in the Bocage or the Marsh: Notice +1 (Bocage) or +0.5 (Marsh) per cast. Spells on the Hearth are unseen.

**Rituals** cost Vis equal to level ÷ 5 and last 120 s. Only 1 ritual of each spell runs at a time.

**Devices** cost 10 Vis + 50 Stone, as *Enchant a Device* does today. Each Device of the same spell adds its effect (additive within a kind, `economy.md`).

**The spells:**

| Spell | Arts | Level | Cast (Fatigue) | Ritual (120 s) | Device (each) |
| --- | --- | --- | --- | --- | --- |
| The Stones Walk Themselves | Rego Terram | 15 | Marsh and Gate porters ×3 for 30 s (2) | Gate porters ×1.5 | Gate porters +15% |
| Brine Into White Salt | Perdo Aquam | 10 | Salt Pans ×3 for 20 s (1) | Salt Pans ×1.5 | Salt Pans +25% |
| The Bountiful Furrow | Creo Herbam | 10 | +30 s of Farm output at once (1) | Farms ×1.5 | Farms +25% |
| The Patient Quarry | Rego Terram | 15 | Quarries ×3 for 20 s (1) | Quarries ×1.5 | Quarries +25% |
| Veil of the Unremarked | Perdo Imaginem | 20 | Notice −3 at once; unseen (2) | Notice generation ×0.8 | — (can't be bound) |
| Hands Made Willing | Rego Corpus | 15 | Ends a strike at once (2) | Hands arrive every 15 s instead of 20 s | — (can't be bound) |
| The Scribe's Endless Night | Creo Imaginem | 20 | — | This magus's Lab Text experiments run ×2 speed | — |
| Clarity of the Tide Pool | Intellego Vim | 25 | Reveals the botch and discovery roll of this magus's current experiment before the check-in (1) | Discovery chance +5 points for all magi | Vis sites +10% |

Every Device effect above is today's *Enchant a Device* bonus (+25% to a building type) where one existed. The new ones are the Gate porters (+15%) and Vis sites (+10%).

**Starting spells:** each founder knows 1 spell at the start, rolled from the level-10 spells.

**Edge cases:**
- Cast bursts of the same spell don't stack; a second cast refreshes the timer.
- Casting while unconscious or at 5 Fatigue is not allowed. Casting that would reach 5 is allowed, and knocks the magus out.
- A cast counts for the Rites' 60 s Stone and Vis window: casting to hit 4 Stone/s is intended.
- The Rites need their magi "not experimenting". Casting doesn't break that; a ritual does.

## Feedback

- Each magus card shows 5 Fatigue pips under the portrait and a row of spell buttons, each with its Fatigue cost and, when seen, "+1 Notice".
- A cast plays its Technique's sound and floats the burst ("Salt ×3 · 20 s") over the zone it affects, with a shrinking timer bar.
- Unconscious: the portrait slumps and greys, with a 60 s countdown.
- The Research-style Chronicle line for each new spell: "1229: Sabine learned *Brine Into White Salt*."

## Parameters

| Parameter | Value |
| --- | --- |
| Fatigue levels | 0–5; unconscious at 5 for 60 s, wake at 3 |
| Fatigue penalty | −10% experiment speed and baseline Insight per level |
| Recovery | 1 level per 30 s |
| Seen cast | Notice +1 in the Bocage, +0.5 in the Marsh |
| Invent a Spell | 10 Vellum and 30 s per 5 levels |
| Ritual | Vis = level ÷ 5; 60 s of lab; 120 s effect |
| Device | 10 Vis + 50 Stone; 240 s |

**A cast, computed:** 3 fully staffed Salt Pans (6 workers × 0.25 × 1.5 with *Salt Rakes*) make 2.25 Salt/s. *Brine Into White Salt* ×3 for 20 s adds 2 × 2.25 × 20 = 90 Silver, if Marsh porters can carry it (at ×3, 6.75/s needs 14 porters without research, so casts reward pre-positioned porters). 1 Fatigue costs the magus about 30 s at −10% speed. At the Rites the bottleneck is Stone made, not carried (Gate porters carry 3 Stone/s each with both carrying research). The Gate stage starts at 3 Stone/s against the Rites' 4. *The Patient Quarry* ×3 for 20 s gives 9 Stone/s for 20 s and 3 Stone/s for the other 40 s: 300 Stone in the window, 5 Stone/s. One cast turns a covenant that falls short into one that passes: a Rite window can be bought, which is the point. `[PLAYTEST: that may be too strong for the Rites' 60 s window. If so, make casts not count towards Rite windows, or make the window 120 s.]`

## Why

- **The magi don't cast spells.** The one thing wizards do is missing; they only run timed recipes. This adds the active verb.
- **It gives the plate-spinning middle and the sprint something to tap.** Casts are the incremental game's active abilities: Cookie Clicker's Grimoire (a magic meter, spells with backfire), Realm Grinder's spells. They reward attention without being required; a player who never casts loses only bursts.
- **It turns *Enchant a Device* from one +25% button into a choice between 3 uses of the same spell**: burst now, a year's strength, or a permanent trickle. In Ars Magica, a Device *is* a spell bound into an object, so this is the fiction as well as the mechanic.
- **Fatigue costs the thing the player cares about most**, lab speed, so casting is a trade, not free money.
- **Borrowed from:** Ars Magica's formulaic spells, rituals, Fatigue and invested devices; Cookie Clicker's Grimoire; Frostpunk's emergency shifts (a burst paid for later).

## Cost to build

- Data: 8 spells, each with up to 3 effects built from the existing modifier and effect types.
- Code: Fatigue per magus; a timed-modifier effect (the `mod:…:<seconds>` tag already exists); 2 new lab recipes, 1 replaced.

## What this leaves out on purpose

- **Spontaneous magic** (improvising a spell on the spot). Every spell here is formulaic and known in advance.
- **Moon-bound rituals.** Ars rituals follow the moon; add when the game has seasons (`backlog.md`).
- **Casting totals, penetration and Magic Resistance.** Spells always work if known.
- **Spells in the Techniques and Forms.** Their names use the Arts as vocabulary; the Arts stay parked (`icebox.md`).
