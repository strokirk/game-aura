# Designing for 0, 1 or N

For every concept, decide up front whether it can ever be **0**, **1** or **N**. If there's any chance of N later, store it as a list (or a keyed map) from day one, even when the game has only 1. Turning a single value into a list later touches every system that reads it; starting with a list of 1 costs almost nothing.

| Concept | The game has | Model as | Why |
| --- | --- | --- | --- |
| Traits on an entity | 0–4 | List | Gained and lost in play |
| Entity types a trait can attach to | 1 each | List on the trait definition | A trait may later fit both a magus and a place |
| Notice tracks | 1 | Map track → value, with zone factors, thresholds and levers per track | Separate lord, church and Order tracks are a likely direction |
| Kinds of Vis | 1 (Vim) | Goods registry; Vis is 1 entry | Ars Magica has 10 Forms of vis; more can join Vim later |
| Goods | 8 + Insight | Registry of good definitions | New goods must never need code changes |
| Win conditions | 1 per scenario | List of condition objects; any met = win | Alternative victories are likely |
| Loss conditions | 2 per scenario | List of condition objects; any met = loss | Already N |
| Scenarios | 2 | Registry | More will come |
| Magi | 1–4 | List | Apprentices and deaths later |
| Magus skill | 1 (Lab Total) | Map skill → value with 1 entry | Could become several Arts |
| Magi per Sanctum | 1 | List with a capacity of 1 | Shared labs are plausible |
| Hands | A count per job | Counts, with named people as a separate list | Named hands may arrive through events |
| Zones | 5 | List, with carry distance as data, not a formula tied to 3 | New zones or a map later |
| Vis sites | 3 | List of named, addressable sites | Events already target them individually |
| Zones a building can go in | 1 each | 1 zone per building definition | A building in 2 zones needs per-zone counts; add a list when one needs it |
| Research, and its effects | About 15, 1–3 effects each | Registry; each item has a list of effects | New research is pure data |
| Experiment recipes | 3 | Registry | More recipes are content |
| Modifiers (research, traits, Lab Texts, Devices, ink) | Dozens | One list of modifier objects, applied in one place | No effect is special-cased in code |
| Bells | 7 | List | Longer finales later |
| Event choices | 1–3 | List | Bigger events later |
| Story threads | 2 | Registry of threads with their triggers | More threads are content |
| Covenants | 1 | An object, not global state | Rival covenants are a likely direction |
| Players | 1 | 1 | Multiplayer isn't planned; don't pay for it |
| Save slots | 1 | 1 | Can become N cheaply later |

The test is "could a later design want 2 of these?" If yes, it's N now. The only concepts kept at 1 on purpose are those where N adds cost with no planned use: players and save slots.
