# Proposals

Mechanics proposed for Aura and not yet part of the game. Each document stands alone and is judged as an improvement on the current design (`../design/`). A proposal that is accepted moves into `design/`, or its first slice goes into `../backlog.md`. One that is rejected goes into `../icebox.md` with the reason.

| Proposal | In one line |
| --- | --- |
| [auras-and-realms.md](auras-and-realms.md) | Every zone has an aura of one of the 4 realms; Endowing brings the Dominion up the hill, bribing taints the Bocage, and the Gate makes the Marsh hum |
| [regio-descents.md](regio-descents.md) | Send a magus into a regio level for Vis or Gate Insight, and get them back when faerie time decides |
| [warping-and-twilight.md](warping-and-twilight.md) | Pushing the lab warps the magus; every 10 Warping is a Twilight that returns them wiser or worse, and 50 takes them for good |
| [spells-rituals-devices.md](spells-rituals-devices.md) | Magi know spells they can cast for Fatigue, perform as rituals for Vis, or bind into Devices |
| [books-and-teaching.md](books-and-teaching.md) | Magi write summae and teach each other, raising Lab Totals with time and Vellum instead of Insight |
| [virtues-and-flaws.md](virtues-and-flaws.md) | The player builds the founders, taking Flaws to pay for Virtues; Story Flaws start threads |

## What the current design gets wrong

The critique these proposals answer, checked against the sim (`pnpm sim --scenario grow --strategy careful`, seeds 1, 7, 13 and 20 seeds for the win rate).

1. **The game is called Aura and has no auras.** Nothing in `design/` models a place's supernatural character. The 4 realms are absent; the Regio Spring and the Drowned Regio are names on a Vis site and a win button. The title promises the one thing the game doesn't simulate.
2. **The lab, where the vision puts all the depth, is one button.** In the sim, *Study the Vis* is about 180 of the roughly 210 lab actions in a run (seeds 7 and 13). *Write a Lab Text* and *Enchant a Device* are passive +% purchases whose only choice is which building, and the sim always picks the Quarry. The lab's decisions are extra Vis (0–5) and Push or Steady.
3. **The 3 magi are interchangeable.** Each has 1 random positive and 1 random negative trait, nothing the player chose, and nothing one magus does helps another. Study turns Insight into Lab Total with no time cost and no interaction.
4. **The Breakthrough pool runs dry.** There are 6 positive traits a magus and Sanctum can draw (3 each). A run has 2 Lab Total Breakthroughs per magus plus Discoveries (9 on seed 7). `magi.md` doesn't say what happens when fewer than 2 are left.
5. **Risk is one-dimensional and it's always Notice.** A botch is +5 Notice; seed 7 botches 19 times, so a botch is noise, not a story. No risk falls on a magus.
6. **Endow and Bribe are the same lever at two speeds.** Both are Silver for Notice. Neither has a cost outside the Silver.
7. **The full run can't be won yet**, and the late game has too little to buy. The careful strategy wins 0 of 20 seeds. Research ends at 2,500 Insight while the Rites need 75,000. New systems should be judged partly on whether they give the late game something to do; none of them replaces balancing the Rites.
8. **The Rites' Stone condition can be met from a stockpile.** Gate porters take Stone from the Hall's stock (`src/core/run.ts`, the Gate step), and each carries 3 Stone/s with both carrying research. A covenant making 3 Stone/s passes the 4 Stone/s window with 60 Stone stockpiled and 2 Gate porters. `gate.md`'s playtest note assumes the Stone must be *produced* at 4/s; either the note or the rule is wrong.
9. **The climax's verb is "stop".** The Rites need all 3 magi in Sanctums and *not* experimenting: the lab's big moment is to do nothing.

## Judge's ranking

*Filled in by an independent judge; see below.*
