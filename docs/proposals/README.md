# Proposals

Mechanics proposed for Aura and not yet part of the game. Each document stands alone and is judged as an improvement on the current design (`../design/`). A proposal that is accepted moves into `design/`, or its first slice goes into `../backlog.md`. One that is rejected goes into `../icebox.md` with the reason.

| Proposal | In one line |
| --- | --- |
| [auras-and-realms.md](auras-and-realms.md) | *Superseded by `tide-remembers.md`.* Every zone has an aura of one of the 4 realms; Endowing brings the Dominion up the hill, bribing taints the Bocage, and the Gate makes the Marsh hum |
| [regio-descents.md](regio-descents.md) | Send a magus into a regio level for Vis or Gate Insight, and get them back when faerie time decides |
| [warping-and-twilight.md](warping-and-twilight.md) | Pushing the lab warps the magus; every 10 Warping is a Twilight that returns them wiser or worse, and 50 takes them for good |
| [spells-rituals-devices.md](spells-rituals-devices.md) | Magi know spells they can cast for Fatigue, perform as rituals for Vis, or bind into Devices |
| [books-and-teaching.md](books-and-teaching.md) | Magi write summae and teach each other, raising Lab Totals with time and Vellum instead of Insight |
| [tide-remembers.md](tide-remembers.md) | **Implemented.** No deadline; the aura and its realms, offerings to the fae, eel rent, aging, apprentices and chairs, stacking legacies |
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

Scored 1–5 on the 4 lenses in `../process.md` plus Fit (the vision's mantras, depth in the magi, value for build cost), each proposal judged as if it were the only one adopted. The judge was an independent agent that saw only the files. It ran the sim (seeds 1, 7, 13; `--seeds 20` on grow, middle and gate) and checked each proposal's maths with scripts.

| Rank | Proposal | Specificity | Purpose | Standalone | Maths | Fit | Total | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Warping and Twilight | 4 | 4 | 4 | 2 | 5 | 19 | Cheap, aimed at the magi, fills a real gap; the pacing assumes Push on 60 s experiments, which have no check-in |
| 2 | Virtues and Flaws | 4 | 3 | 4 | 2 | 4 | 17 | Owning the founders is right; Flaws are nearly free, so taking the most is dominant |
| 3 | Regio descents | 4 | 3 | 4 | 1 | 4 | 16 | The right fantasy; an instant Call back makes 5,000 Gate Insight in 15 s |
| 4 | Books and teaching | 4 | 2 | 4 | 2 | 4 | 16 | Right goal; reading costs *Study the Vis* time, so it only beats Study from LT 19, which the sim never passes |
| 5 | Auras and realms | 3 | 2 | 4 | 3 | 3 | 15 | Fixes the title, not the decisions: the Faerie Bargain is always worth paying, and after the Aegis the Dominion costs nothing |
| 6 | Spells, rituals and Devices | 3 | 2 | 3 | 2 | 3 | 13 | Biggest build; *Veil of the Unremarked* every minute and alternating Quarry casts break Notice and the Rites |

**Blocking findings to fix before any proposal moves on:**
- **Warping:** with +1 Warping at 3+ extra Vis, the *careful* strategy's Aldric reaches about 43 Warping on seed 7. Move the threshold to 4+ extra Vis (or Twilight every 15, Final at 75). Warping at LT 20+ never fires; no magus passes LT 19.
- **Virtues and Flaws:** 1 Flaw per founder; *Luck* once per run; *Driven* also blocks Steady. "1 year (360 s)" should be 3 years.
- **Regio descents:** Call back pays yield × (elapsed ÷ *T*) × 0.5 and only after *T* ÷ 2. The Drowned yields 2,000 / 7,000 / 18,000, so deeper pays more per second.
- **Books:** reading runs alongside experiments, or a Summa's level is the author's LT − 1. Lab Texts never go damp.
- **Auras:** the Faerie Bargain costs 25 Vis; the Dominion threshold is 3, then 5 after the Aegis; drop the Divine Notice relief; start the Bocage at Divine 0 and the Spring at Faerie 0 so minute 0 is unchanged.
- **Spells:** a 120 s cooldown per spell across the covenant; *Veil* costs 3 Fatigue; remove the references to Twilight and regiones; cut to 4 spells.

**On the critique above:** the judge upheld claims 1, 2, 3, 5, 8 and 9, and claim 4 in a milder form (without LT 20, a magus draws about 4 times from a pool of 5 or fewer). Claim 6 half holds: permanent against temporary is a real choice. Claim 7 holds but misdiagnoses the cause. On 17 of 20 seeds the careful strategy builds no Library, so Insight sits at the 1,000 cap and the Aegis (2,000) is never bought. Fix `sim/strategies.ts` before sizing anything against the Rites. Traits and Breakthroughs are not in the code yet (`src/core/run.ts`: a Discovery doubles the yield), so every trait-based proposal needs them first.

**Recommendation:** first fix the careful strategy and implement traits and Breakthroughs. Then move Warping and Twilight forward (with the 4+ extra Vis threshold), then Virtues and Flaws (with 1 Flaw per founder). Regio descents is the best late-game idea, once Call back is fixed and the sim reaches the Gate.
