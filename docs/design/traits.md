# Traits

A **trait** is a short named quality attached to an entity. Every trait has a mechanical effect, a story line, and a **tone**: positive (+), negative (−) or mixed (±, a benefit with a catch). Every entity holds a **list** of traits (0 to N), and all traits share one data shape. Traits are meant to be situational; their strength gets tuned over time.

Traits currently attach to magi and Sanctums.

## When traits appear and disappear

| Entity | At the start | Gained | Lost |
| --- | --- | --- | --- |
| Magus | 1 positive + 1 negative, rolled; no 2 magi share a negative trait | Breakthroughs (`magi.md`); ink events | The LT 25 Breakthrough removes 1 negative trait; ink events |
| Sanctum | 1 random trait when built | Breakthroughs; ink events (e.g. the eels' wyrm) | Each trait's removal rule below |

## Magus traits

| Trait | Tone | Effect | Story |
| --- | --- | --- | --- |
| Affinity with Vim | + | This magus's experiments cost 50% less Vis | Raw magic comes to them like a tame hound |
| Gentle Gift | + | Assistants in this magus's Sanctum give +35% instead of +25% | Servants don't flinch when they pass |
| Diligent Scholar | + | Study costs 25% less | Reads by candlelight until dawn |
| Blatant Gift | − | This magus's Sanctum has 1 fewer assistant slot | Servants find reasons to be elsewhere |
| Hunted by a Rival | − | Notice +0.5 per minute | A rival magus writes to the Tribunal every season |
| Absent-Minded | − | This magus's experiments cost 10% more Vellum and Vis | Half-finished notes on every surface |

## Sanctum traits

| Trait | Tone | Effect | Removed by |
| --- | --- | --- | --- |
| Aligned with the Aura | + | Insight from this Sanctum ×1.25 | — |
| Great Hearth | + | Assistants here eat no Bread | — |
| Warded Cell | + | This Sanctum adds no Notice | — |
| Drafty | − | Experiments here cost 20% more Vellum | Paying 60 Silver + 30 Stone to glaze the windows |
| Haunted | ± | Insight ×1.1, but Notice +0.5 per minute | Paying 100 Silver for an exorcism (loses the bonus too) |
| Cramped | − | 1 fewer assistant slot | Paying 500 Silver + 250 Stone to expand |
| Sunken Damp | − | Experiments here cost 20% more Vellum | Paying 100 Silver to raise the floor |
| Undercroft | ± | Insight ×1.25, but Notice +0.5 per minute | — |

*Sunken Damp* and *Undercroft* come only from the eels thread (`stories.md`).

**Stacking:** trait multipliers multiply with other kinds of bonus (`economy.md`). Flat Notice effects add up.

**Feedback:** traits show as small icons on magus cards and Sanctums: gold for positive, dark red for negative, half-and-half for mixed. Tapping one shows its effect, story line and removal rule. A new trait arrives with a toast.

**Why:** traits make each run's magi unlike the last, and give the numbers a voice: "glaze Sabine's windows" is a better sentence than "fix the 20% Vellum cost". Mixed traits carry a benefit with their catch, so removing one is a choice, not a chore. The model is Ars Magica's Virtues and Flaws, with Crusader Kings' traits that change through events.
