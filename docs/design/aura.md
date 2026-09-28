# The aura

In Ars Magica an **aura** is a place's supernatural character and strength. There are 4 **realms**: **Magic**, the magi's own; **Divine**, the Dominion of the Church; **Faerie**; and **Infernal**. Magi work best in a strong Magic aura. The Dominion smothers magic, and sin leaves a stain.

The covenant has one aura, built from all four.

## The realms

| Realm | Starts at | Raised by | Effect |
| --- | --- | --- | --- |
| **Magic** | 3, plus the legacy (`ui.md`) | *Raise the Aura* (research, below) | The boosts below |
| **Divine** | 0 | Every second Endowment (`notice.md`); the friars, +1 each decade (1230, 1240…) until the *Aegis* is cast | −1 to the effective aura per point |
| **Infernal** | none | Each bribe leaves a stain for 5 years (600 s) | Every building's output ×0.95 per stain |
| **Faerie** | 0 | Offerings at the Regio Spring (below) | Notice decays 0.6 points a minute faster per level (10% a minute becomes up to 13%) |

**Effective aura** = Magic − Divine. The header shows it next to Notice.

## Raise the Aura

- **Input:** a repeatable research item, shown apart from the research queue once research opens.
- **System:** Magic +1. It costs 300 × 1.8^n Insight (n = raises so far) + 10 Vis, and adds 1 to Notice generation per minute, for good: +10 to where Notice settles.

## What the aura gives

Each boost opens at its level and grows with every point above it. Below 3 the first is a penalty.

| From aura | Boost | Formula (*a* = effective aura) |
| --- | --- | --- |
| any | Lab Insight: reading and experiments | ×max(0.25, 1 + 0.15 × (*a* − 3)) |
| 5 | Experiment speed | ×(1 + 0.1 × (*a* − 4)) |
| 6 | Slower aging (`magi.md`) | aging chance ×max(0, 1 − 0.1 × (*a* − 5)) |
| 7 | Discovery chance | +1 point per point above 6 |
| 8 | Vis sites | ×(1 + 0.1 × (*a* − 7)) |
| 9 | Lab Total | +1 per point above 8 |

At Lab Total 15, lab output is ×1.15 at aura 4, ×1.43 at 5, ×1.74 at 6, ×2.08 at 7 and ×3.04 at 9, before the aging, Discovery and Vis boosts.

## Offerings at the Regio Spring

- **Input:** **Leave an offering**, once the Regio Spring is built. The first offering of a year costs 10 Vis, and each further one that year doubles.
- **System:** one roll with the run's generator. Three reels (shell, eel, bell) spin for show.

| Weight | Outcome |
| --- | --- |
| 50% | The fae take it and laugh: nothing |
| 20% | They take more: 10 more Vis, or a hand walks into the marsh if the Vis is gone |
| 20% | They are pleased: Faerie +1, up to 5. At 5, this counts as "they take more" |
| 10% | A gift, only for a covenant **in need**; otherwise nothing |

- **In need**, checked in order: Notice 75 or more (the gift: Notice −30); Bread under 10% of its cap (the granary fills); a magus at Decrepitude 4 (−1 Decrepitude); Silver under 50 (+200 Silver).
- Faerie falls by 1 each 240 s without an offering.

## Feedback

- The header shows the aura. The Aura card on the Covenant tab shows each realm and where its points came from, every boost with the level it opens at, the stains and Faerie, and the offering button.
- The friars arrive with a card. Raising the aura, a bribe's stain and every offering add a Chronicle line or card.
- Endow and Bribe say what they cost the aura.

## Parameters

| Parameter | Value |
| --- | --- |
| Starting Magic | 3 + legacy |
| Raise the Aura | 300 × 1.8^n Insight + 10 Vis; Notice +1/min each |
| Divine | 1 per 2 Endowments; 1 per decade of friars before the Aegis |
| Infernal stain | ×0.95 all output, 600 s, per bribe |
| Faerie | +0.6 decay points per level, max 5, −1 per 240 s unvisited |
| Offering | 10 Vis × 2^(offerings this year); 50 / 20 / 20 / 10 |

`[PLAYTEST: can Endowments, alms, eels for the monks, bribes and Faerie together hold the +40 to +60 Notice of aura 7–9?]` `[PLAYTEST: the Middle Years stage opens at aura 1, so its labs start at −30%.]`

## Why

- **The title becomes the engine.** Raising the aura is the covenant's biggest multiplier, and it's paid in Notice: growth is the crime, and here the growth is magic itself.
- **Every Notice lever costs something different.** Endowing smothers the aura, bribing blights the fields, alms and eels cost goods, and Faerie is the one lever that leaves the aura whole, paid in Vis and luck.
- **The friars are a clock without a date.** The Dominion creeps in each decade; stalling costs the labs, and the *Aegis* is what stops it.
- **Borrowed from:** Ars Magica's auras and realms; Civilization's religious pressure; Cultist Simulator's capricious powers, a losing bet when you're comfortable and the only miracle when you're not.
