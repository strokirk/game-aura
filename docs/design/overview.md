# Overview

Aura is a single-player incremental game. The player runs a covenant of wizards at Mont-Dol from Spring 1220. Buildings make goods; servants called **hands** work them and carry the goods home; magi turn goods into **Insight** through experiments; Insight buys research. Every building raises **Notice**. The full run is won by ringing the Seven Bells of Ys at the Drowned Gate before 1260, and lost if Notice reaches 100 or time runs out.

## Pillars

1. **Number go up.** Buildings are bought in quantity with costs ×1.15 each; research and experiments stack multipliers.
2. **People, not pipes.** Every building needs hands. Hands need Bread and housing. Where the hands go is the central decision.
3. **Growth is the crime.** Every building raises Notice, and more so in the loud Bocage.
4. **Everything has a story.** Magi traits, experiment discoveries and ink events, written plainly and concretely.

## Time

- 1 in-game year = 120 s at 1× speed. Speeds: pause, 1×, 2×.
- The simulation advances in fixed 0.25 s ticks, so frame rate never changes outcomes.
- Building, assigning hands and buying research all work while paused.
- **Why a deadline:** without one, the safe answer to Notice is to grow slowly forever. The deadline makes the player decide how much risk to take for speed, the way Frostpunk's countdown to the storm does.

## Win and loss

Win and loss conditions belong to a scenario (`scenarios.md`). Each is a list; any condition met ends the run.

| Scenario | Win | Loss |
| --- | --- | --- |
| Trial of the Tide Pool | 500 Insight before 1222 | Notice 50; 1222 begins |
| The Covenant Must Grow | The seventh bell of Ys (`gate.md`) before 1260 | Notice 100 (Renounced); 1260 begins |

## Glossary

| Term | Meaning |
| --- | --- |
| Covenant | The wizards' community: the Hall, labs, workers and lands. The player runs it |
| Magus (plural magi) | A wizard. The full run has 3: Aldric, Sabine and Hervé. They are the only named people |
| Hands | Anonymous servants, counted as a number. They work buildings or carry goods |
| Porter | A hand assigned to carry goods from a zone to the Hall |
| Zone | One of 3 sections of the covenant's lands: Hearth, Bocage, Marsh |
| Sanctum | A magus's laboratory |
| Lab Total (LT) | A magus's skill number |
| Experiment | A timed lab action a magus starts; the main source of Insight |
| Insight | The research currency |
| Vis | Raw magic, harvested at 3 named Vis sites. All the covenant's vis is Vim vis, the Form of magic itself |
| Notice | The attention the covenant draws from the lord of Dol, the bishop and the Order of Hermes. At 100 the covenant is Renounced |
| Order of Hermes | The society of wizards the covenant belongs to. Its judges (Quaesitores) punish covenants that draw too much attention |
| Aegis of the Hearth | A protective ritual around the covenant's home |
| Drowned Gate | The entrance to the Drowned Regio, a hidden magical realm under the marsh |
| Ys | The drowned city in the regio. Its seven bells hold back the sea; ringing them wins the run (`gate.md`) |
| Warping, Twilight | What botched magic leaves on a magus: more power, and a risk of being taken away for a while (`magi.md`) |
| Trait | A short named quality on a magus or a Sanctum, with an effect, a story line and a tone (positive, negative or mixed) |
| Bocage | Hedged farmland, typical of the region |

## Conventions

- Rates are per second of game time at 1× unless stated.
- Numbers are starting points; the balance simulation is the source of truth (`balance.md`).
- `[PLAYTEST: …]` marks a value to validate; `[OPEN QUESTION: …]` marks an undecided design.
