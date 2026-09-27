# Economy: zones, hands, buildings, carrying and storage

## Zones

The covenant's lands are 3 **zones**, shown as sections of the Covenant tab.

| Zone | Building slots | Notice factor | Carry distance | Allowed buildings |
| --- | --- | --- | --- | --- |
| Hearth | 8 | 0.5 (0 after the Aegis) | 0 (no porters needed) | Sanctum, Quarry, Storehouse, Library |
| Bocage | 12 | 1.5 | 1 | Farm, Parchmenter, Cottage |
| Marsh | 10, plus 3 Vis sites | 0.5 | 2 | Salt Pan, Vis Source (Vis sites only), Eel Weir (when unlocked) |

- Each building uses 1 slot in its zone. Cottages live in the loud Bocage, so housing more hands costs Notice.
- Vis Sources use the 3 named Vis sites, not the Marsh's 10 slots.
- **Why:** slots cap breadth. Once a zone is full, growth comes from research multipliers and from putting more hands to work.

## Hands

- **Start:** 4 hands in the trial, 6 in the full run.
- **Housing:** the Hall houses 8. Each Cottage houses 3 more.
- **Food:** each hand eats 0.05 Bread/s.
- **Growth:** while there is free housing, Bread stock is above 0 and net Bread is ≥ 0, 1 new hand arrives every 20 s.
- **Hunger:** at 0 Bread, every job runs at 50% and 1 hand leaves every 30 s. When the last hand leaves, the run is lost: a covenant that starves loses loudly instead of idling to the deadline.
- **Jobs:** a hand is a **worker** (assigned to a building type) or a **porter** (assigned to a zone). Unassigned hands are idle and still eat.
- **Input:** each building type has − / + buttons for its workers, plus "fill" (as many as the slots allow). Each zone has − / + for porters.
- **Feedback:** the header shows "Hands 14 / 17 · 2 idle" and the Bread balance ("Bread +0.3/s").
- **Why:** hands are the scarce resource. Every worker is a porter you didn't assign, and every new hand eats.

## Buildings

Buildings are counted per type. The next one costs base cost × 1.15^owned. Each building adds worker slots; output = workers × per-worker rate × multipliers.

| Building | Zone | Base cost | Worker slots | Per worker | Why build it |
| --- | --- | --- | --- | --- | --- |
| Salt Pan | Marsh | 20 Silver | 2 | 0.25 Salt/s | The main income: Salt is sold on arrival at the Hall, 1 Salt = 1 Silver |
| Farm | Bocage | 20 Silver | 2 | 0.2 Bread/s | Bread feeds the hands |
| Quarry | Hearth | 40 Silver | 2 | 0.25 Stone/s | Stone pays for Sanctums, Storehouses and the Gate |
| Parchmenter | Bocage | 30 Silver | 1 | 0.15 Vellum/s | Vellum pays for Lab Texts and Libraries |
| Vis Source | Marsh Vis site (max 3) | 40 Silver | 2 | 0.08 Vis/s | Vis fuels experiments, the Aegis and the Gate |
| Sanctum | Hearth (max 3, 1 per magus) | 100 Silver + 50 Stone | 2 assistants | +25% to the magus's baseline Insight and experiment speed per assistant | A magus without a Sanctum does nothing |
| Cottage | Bocage | 30 Silver | 0 | Housing +3 | More hands |
| Storehouse | Hearth | 50 Silver + 20 Stone | 0 | Stone, Bread and Vellum caps +50% of base | Room to stockpile |
| Library | Hearth | 40 Silver + 20 Vellum | 0 | Insight cap +500 | Room to save for big research |
| Eel Weir | Marsh (after `unlock:eel_weir`) | 15 Silver | 1 | 0.3 Bread/s × (1 + 0.5 × eel level) while the eels thread is open; ×3 for 1 year after the flood; ×1 after a stop | Cheap food, and the eels' standing temptation (`stories.md`) |

The 3 Vis sites are named and individually addressable: the Tide Pool, the Drowned Knight's Barrow, and the Regio Spring. Events can target one of them.

## Carrying

Goods made outside the Hearth count only once porters bring them to the Hall.

- A porter carries 1 good/s from the Bocage (distance 1) or 0.5 goods/s from the Marsh (distance 2).
- If a zone makes more than its porters can carry, output is throttled to what they carry. The surplus is not stored.
- Research raises carrying: *Mule Trains* ×2 for all zones, *Stones That Carry* ×3 for the Marsh.
- Goods going *out* to the Marsh (Stone for the Drowned Gate) are carried by the Marsh's porters at the same rates, sharing their capacity with goods coming in.
- **Feedback:** each zone header says it plainly: "Marsh: carried 1.8 of 2.4 goods/s · 3 porters". When porters are the bottleneck, the zone's porter + button pulses.
- **Why:** distance matters and the bottleneck is visible, without drawing any lines. Porters compete with workers for the same hands.

## Storage caps

Every good has a cap. At the cap, new production of that good is wasted and the resource shows red "full".

| Good | Base cap | Raised by |
| --- | --- | --- |
| Silver | 500 | *Hermetic Accounts* (×2); *Strongbox* (+500 each, repeatable) |
| Stone | 200 | Storehouse (+100 each) |
| Bread | 200 | Storehouse (+100 each) |
| Vellum | 50 | Storehouse (+25 each) |
| Vis | 30 | *Lead-Lined Chests* (+30) |
| Insight | 1,000 | Library (+500 each). Once founded, the Drowned Gate holds Insight with no cap (`gate.md`) |

**Why:** caps turn "awash" into "spend it or lose it", and make storage a purchase with a real trade-off: a Storehouse or Library takes a Hearth slot a Quarry or Sanctum could use. This is Kittens Game's main constraint.

## Stacking

- Bonuses of the same kind add together: 3 Lab Texts give +30%, not ×1.1³.
- Bonuses of separate kinds multiply: research × Lab Texts × Devices × traits × assistants.
- Multipliers apply to output. Costs change only when an effect says so.
- **Why:** additive within a kind keeps each extra copy equally valuable; multiplying across kinds is what makes numbers go up.
