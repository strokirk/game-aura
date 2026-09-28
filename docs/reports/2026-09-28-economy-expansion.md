# Review: economy.md through the expansion lens

- **Date:** 2026-09-28
- **Reviewer:** independent subagent with fresh context (did not write the design)
- **Task:** review `docs/design/economy.md` against the vision, `process.md`, `overview.md` and the neighbouring docs (aura, research, gate, notice), with one lens: *can the player build a grand, sprawling covenant?* The designer's complaint: "Location space is limited, and prices escalate to where you'll never reach them."
- **Changed:** only this report. I read the code but did not edit it. A scratch snapshot script ran from the repo root and was deleted afterwards. The working tree had an uncommitted sim/core refactor in progress (`sim/run.ts`, `sim/strategies.ts`, `src/core/run.ts` modified), and all runs below are against that tree.

## What I ran

| Run | What it is | Key output |
| --- | --- | --- |
| `pnpm -s sim --scenario grow --strategy careful --seed 1` | The timeline | 84 build/research actions; **the last production building is at 24:12**, followed only by 5 Eel Weirs and 3 Cottages. No outcome at 150:00; 2 bells |
| Snapshot script (scratch, deleted), careful seeds 1–3 | Uses the core's `rates`, `cap`, `zoneSlots`, `buildCost`, `expandCost` and `dikeCost` at minutes 5–150 | Table A |
| Same script with every zone's Notice factor ×0.5 and ×0.25 (runtime patch, in memory only) | Counterfactual: is Notice the wall? | Table B |
| `curves.py` (python3, scratch) | Nth building price, land, dikes, terraces, Storehouses needed per price, Notice ceiling | Sections below |
| `model2.py` (python3, scratch) | A crude greedy covenant model calibrated to the sim's ~0.16 Silver/s per hand at minute 30, comparing the current rules with the proposal | Table in §3 |

### Table A: what the careful covenant actually has (sim, current rules)

| Seed | Minute | Hands/housing | Buildings | Plots used/total (H, B, M, Polder, Scissy) | Land bought | Dikes | Terraces | Notice | Silver |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 10 | 24/26 | 22 | 2/8, 11/12, 6/10, 0/0, 0/0 | 0 | 0 | 0 | 38 | 112/1,000 |
| 1 | 30 | 45/50 | 36 | 9/10, 19/20, 5/10, 0/0, 0/0 | 5 | 0 | 0 | 59 | 1,390/1,500 |
| 1 | 60 | 38/50 | 35 | 9/11, 19/20, 5/10, 0/0, 0/0 | 5 | 0 | 1 | 79 | **1,500/1,500** |
| 1 | 90 | 56/56 | 38 | 9/12, 20/20, 7/10, 0/0, 0/6 | 5 | 0 | 2 | 64 | **1,500/1,500** |
| 1 | 150 | 56/56 | 37 | 9/13, 20/20, 6/10, 0/0, 0/6 | 5 | 0 | 3 | 86 | **1,500/1,500** |
| 2 | 20 → 150 | 49 → 59 | **38 → 38** | Bocage 20/20 throughout | 5 | 0 | 0 → 2 | 62 → 69 | |
| 3 | 45 | 71/71 | 43 | Bocage 26/26 | 8 | 0 | 1 | 67 | Renounced at 54:01 |

Across the 3 seeds the covenant reaches its final size (37–43 buildings) by about minute 20 and then stops growing for over two hours. The next Salt-works costs 41 Silver while 1,500 Silver sits at the cap. Seed 1's Marsh keeps 3–5 of its 10 plots empty for the whole run. No seed ever builds a dike or a Salt Meadow.

### Table B: counterfactual with Notice scaled down (seed 1, careful)

| Notice factors | Buildings at 30 / 60 / 90 / 150 min | Where it stops |
| --- | --- | --- |
| ×1 (as designed) | 36 / 35 / 38 / 37 | Notice: careful builds only while Notice settles under 60 |
| ×0.5 | 44 / 44 / 53 / 55 | Bocage 26/26; the next Bocage land is 628 Silver + **251 Stone against a Stone cap of 200** |
| ×0.25 | 54 / 56 / 57 / 60 | The same Stone wall, plus Hearth 20/20 |

Halving Notice lifts the plateau by about 40%. Removing most of it then runs straight into the second wall: land prices that no cap can hold, with no Hearth plot left for a Storehouse.

---

## 1. Verdict

1. The designer's diagnosis is half right. Building prices never bind (the most expensive building any plot allows costs about 100 Silver, while 1,500 Silver sits unspent). What stops the covenant at about 38 buildings by minute 20 is **Notice as a flat tax per building**, with Cottages alone making 62% of it.
2. Behind that sits a second, real hard cap. Land (×1.3), dikes (×1.5) and the Form trees' goods (×2.5) outgrow the only cap raiser (Storehouse ×1.25), and each Storehouse eats a Hearth plot, so economy.md's promise "the covenant never locks itself out of a purchase" is false.
3. As written, "the covenant is enormous" can't happen: the maths caps it at about 35–60 Notice-weighted buildings forever. It is fixable with 6 number or rule changes (below) that keep Notice as the constraint while making it a budget that grows.

---

## 2. Findings, ranked by severity

### F1. Critical: Notice caps the covenant's size at a fixed number of buildings, and housing is the loudest thing in it

**Evidence.**
- Notice at rest per building = 10 × 0.35 × zone factor: **Bocage 5.25, Polder 3.5, Marsh, Hearth and Scissy 1.75** (Hearth 0 after the Aegis).
- A Cottage houses 3 hands for +5.25 Notice at rest, which is **1.75 Notice per hand housed**, and housing exists only as Cottages in the Bocage.
- In careful seed 1 at 90 min the Notice-weighted count is 38.5 (20 Bocage × 1.5 + 9 Hearth × 0.5 + 8 Marsh × 0.5), and **16 Cottages make 24 of it (62%)**.
- The ceiling in weighted buildings is ((E/10)/M + levers − wakes) / 0.35 (curves.py), where E is the highest Notice the player accepts at rest and M the product of Notice multipliers:

| Lever state | Max weighted buildings at the given Notice |
| --- | --- |
| No levers, Notice 60 | 17.1 |
| Careful at 90 min (2 Endowments, Marsh Mist), Notice 60 | 34.3 |
| Mist, 2 Mentem, 5 Endowments + 3 Alms, wakes 7 (bells 1–2, 4 aura raises), Notice 75 | 52.3 |
| The same at Notice 90 | 62.2 |
| Needed for 150 weighted at Notice 75 | M = 0.146, which is Mist plus **8.7 Mentem purchases**, costing 2,000 × 2.5^8 ≈ 3,050,000 Insight **plus 11,400 Vellum** (above any reachable Vellum cap; see F2) |

- Every other lever is additive or one-off: an Endowment is −1 per minute (worth +2.9 weighted buildings) at 500 × 2^n Silver, and Alms likewise at 200 × 2^n Bread. Meanwhile each covenant building adds a constant amount. Linear cost against a budget fixed at 100 means the covenant's size is fixed.
- Careful acts on exactly this: it builds production only while Notice settles under 60 (`sim/strategies.ts`, careful), and it stops at minute 20.

**Fix (numbers).**
1. **Homes are quiet, works are loud:** Cottages have a Notice factor of **0.25 in any zone**. This removes about 20 of careful's 38.5 weighted buildings, which is about −42 Notice at rest after Mist.
2. **Mentem is the compounding Notice lever:** Notice **×0.8** per purchase (from ×0.85), Insight **2,000 × 2^m** (from 2.5^m), Vellum **30 × 1.25^m** (from 2.5^m). The ceiling at Notice 75 with Mist and 6 levers becomes 53 / 84 / 133 weighted buildings at 2 / 4 / 6 purchases (currently 47 / 66 / 92), for 4,000 / 16,000 / 64,000 Insight, all inside the bells' range.
3. Optional, Factorio's pollution absorption: every plot the covenant **owns** absorbs 0.02 Notice per minute, built on or not. Buying land and diking then buy Notice headroom as well as space, and a sprawling covenant quiets its own edges.

### F2. High: prices outrun every reachable cap, so economy.md's storage promise is false

economy.md, *Storage caps*: "storage always keeps up with prices and the covenant never locks itself out of a purchase". That holds only for a Storehouse against its *own* price. The Storehouses needed for a price to fit under its cap (curves.py):

| Purchase | Growth | Storehouses needed for the 1st…nth |
| --- | --- | --- |
| Land in one zone (Stone 40 × 1.3^k vs cap 200) | ×1.3 | 0 up to the 7th; **2 for the 8th**, 5 for the 11th, 10 for the 15th |
| Dike (Stone and Bread 100 × 1.5^d) | ×1.5 | 1 for the 3rd, **5 for the 5th**, 8 for the 7th, **14 for the 10th** |
| Terram (Stone 100 × 2.5^m) | ×2.5 | 1, **6**, 10, 14 for the 2nd–5th |
| Mentem (Vellum 30 × 2.5^m vs cap 50) | ×2.5 | 2, **6**, 11, 15 for the 2nd–5th |
| Vim (Vis 20 × 2.5^m vs cap 60 with *Lead-Lined Chests*) | ×2.5 | Libraries: 4, 8, 12 for the 3rd–5th |
| Endowment (Silver 500 × 2^n vs 500 × 2 × 1.5² with *Accounts* and 2 Strongboxes) | ×2 | 3 for the 4th, 6 for the 5th, 12 for the 7th |

- Every Storehouse and Library takes a Hearth plot. The Hearth has 8, minus 3 Sanctums and at least 1 Quarry, which leaves **4 plots** for all the storage above until terraces arrive (F3).
- Only Insight escapes this, because research can draw Insight from the Gate (`canAffordResearch`). The Form trees' goods cannot.
- In the sim, the ×0.5 and ×0.25 counterfactuals (Table B) hit exactly this: the 8th Bocage land costs 251 Stone against a 200 cap, with the Hearth full.

**Fix.**
1. **Storehouses and Libraries take no plot** (cellars under the Hall, shelves in the tower). They keep their ×1.15 price and ×1.25 caps, and their Hearth Notice.
2. **An invariant, written into economy.md:** every repeatable price paid in a capped good grows **at most ×1.25 per purchase** (the Storehouse's rate), or is paid from the Gate's store.
   - Land: **×1.2**.
   - Dikes: **×1.2**.
   - The Form trees' goods: **×1.25**, with Insight staying ×2.5 and drawn from the Gate.
   - Endow and Alms keep ×2, since they are meant to run out.

### F3. High: terraces never matter

**Evidence.** Terraces open at 2,000 Stone quarried, ×1.6 each. Ten terraces need **363,171 Stone** quarried. One fed Quarry makes 0.75 Stone/s, so the first terrace takes 44 min and the fourth 411 min; even 5 fed Quarries take 82 min to reach the fourth. Careful cuts 1–3 terraces in 150 min. In the ×0.25 counterfactual (54–60 buildings, Stone 13–55/s) it reaches 8.

**Fix.** First at **500** Stone quarried, **×1.3**, up to **20**: 10 terraces need 21,310 Stone and 20 need 315,083. Terraces then give the Hearth about 1 plot per 3–5 minutes in the mid-game, a steady trickle that rewards Quarries.

### F4. Medium: land is overpriced against what goes on it

**Evidence.**
- The 12th Farm costs 93 Silver and the 10th Salt-works 70.
- The 5th Bocage purchase costs **286 Silver + 114 Stone for 2 plots**, and the 11th 1,379 + 551.
- So a plot costs 1.5–7× the building on it, and in Stone, which careful makes at 0.4–2 per second. Careful bought 5–8 purchases in total, all before minute 24.

**Fix.** **+3 plots per purchase, 60 Silver + 20 Stone, ×1.2 per purchase in that zone.** The 15th purchase in a zone costs 770 Silver + 257 Stone (2 Storehouses) for plots 43–45.

### F5. Medium: dikes are a dead branch

**Evidence.** Careful never builds a dike in 3 seeds × 150 min. A dike costs Stone *and* Bread, and careful's Bread runs at +0.4 to +1.9/s against a 200 cap. The 5th dike costs 506 of each, the 6th 759, the 10th 3,844. The Four Winds' storms then take dikes back.

**Fix.** **80 Stone + 80 Bread, ×1.2, +3 Polder plots.** The 10th dike costs 413 of each (3 Storehouses), for 30 Polder plots.

### F6. Medium: Silver has nothing to buy once plots and Notice bind

**Evidence.** In seed 1, Silver sits at its 1,500 cap from about minute 45 to 150 while making 6–11 Silver/s. The Silver sinks left are Endow (×2) and bribes (×2). That is the opposite of "prices escalate out of reach": the player is *awash with nothing to spend on*. Kittens Game warns against exactly this, and "Number go up" loses.

**Fix.** F1 and F2 give Silver its outlets back (land, and buildings on new land). For the late game, add Anno's growth in place:
- **Improve** a building type: +1 worker slot on every building of that type, **no plot and no Notice**.
- Price: 400 × 3^l Silver (l = improvements of that type so far).
- A plot-bound covenant then keeps getting denser, and Silver has a sink that grows with it.

### F7. Medium: the arrival of hands is a fixed 3 per minute

**Evidence.** 1 hand per 20 s while housed and the eel rent is paid (`src/core/run.ts`, tick) gives at most 270 hands by minute 90, whatever the covenant's size. It also needs 0.5 Eels/s, which is 2 Weirs.

**Fix (optional, validate in the sim).** The arrival interval is 20 s / (1 + Cottages/10): 10 s at 10 Cottages and 5 s at 30. A big covenant then draws people faster, as a real boom town does.

### F8. Low: the sim can't show expansion yet

The careful strategy never builds Storehouses for land or dike prices: its `over()` check covers building and research costs only. It never wants Salt Meadows unless hands are idle, and so it never dikes. It gates growth at Notice 60. Since "the simulation is the source of truth", any expansion change needs careful to:
- buy a Storehouse when a wanted land or dike price is over the cap;
- build dikes when the Bocage and the Marsh are full;
- spend Silver at the cap on land.

Without that, the sim will under-report every fix above.

### F9. Low: nothing in the legacy makes the next covenant bigger

Legacies carry aura, Lab Texts, Devices and chair numerals (`overview.md`), but nothing for land. "Later ones race" (vision), yet every covenant starts on the same 30 plots.

**Fix.** A **Charter**: each fallen covenant leaves 1 free land purchase per zone, up to 3. That is Cookie Clicker's and Kittens Game's prestige applied to space.

---

## 3. A proposed expansion model

**Principles**, from the reference games:
- **Cookie Clicker:** production multipliers compound faster than ×1.15 prices, with no caps at all.
- **Kittens Game:** caps are the wall, but storage is buildable without limit and the storage techs multiply it.
- **Antimatter Dimensions:** a hard cap exists only where it turns into prestige.
- **Factorio:** land is effectively unlimited, and pollution is absorbed per chunk and cut per machine by modules.
- **Anno:** finite islands, so you settle new ones and densify the houses already built.

Aura should keep **Notice as the one hard budget** ("growth is the crime") and make everything else soft, while giving the player levers that compound fast enough to grow the budget.

### Formulas

| Thing | Current | Proposed |
| --- | --- | --- |
| Land | +2 plots, 100 Ag + 40 St × 1.3^k | **+3 plots, 60 Ag + 20 St × 1.2^k** per zone |
| Dike | +2 plots, 100 St + 100 Bread × 1.5^d | **+3 plots, 80 St + 80 Bread × 1.2^d** |
| Terraces | 2,000 St quarried × 1.6^n, max 10 | **500 × 1.3^n, max 20** |
| Storehouse, Library | 1 Hearth plot each | **No plot**; price ×1.15 and caps ×1.25 unchanged |
| Price invariant | none (claimed but false) | Growth ≤ ×1.25 per purchase for any capped good, else paid from the Gate |
| Form-tree goods | × 2.5^m | **× 1.25^m** (Insight stays ×2.5, drawn from the Gate) |
| Cottage Notice | zone factor (Bocage 1.5) | **0.25 in any zone** |
| Mentem | Notice ×0.85; 2,000 × 2.5^m Insight | **Notice ×0.8; 2,000 × 2^m Insight** |
| Optional | | Plot absorption 0.02 Notice/min per owned plot; Improve (+1 slot per type, 400 × 3^l Silver); hand arrival 20 s / (1 + Cottages/10); Charter legacy |

**Choices that still matter:**
- Notice still sits at 60–72 at rest in the model below, so every building remains a spend from the Notice budget.
- The Bocage (×1.5) against the Marsh and Polder (×0.5 and ×1.0) is still a real trade.
- Land still escalates ×1.2 per zone, so the player picks *which* zone to grow.
- Storehouses cost Silver and Stone instead of a Hearth plot, and the Hearth still has to choose between Quarries and Sanctums.
- Mentem competes with the bells for Insight.

### What a player has at minutes 10, 30, 60 and 90

`model2.py` is a crude greedy model, **not the sim**. It assumes:
- hands arrive at 1 per 20 s while housed;
- income is 0.16 Silver/s per hand, ramping to ×1.5 once the Form trees start after minute 40;
- the player builds only while Notice at rest stays at 70 or less.

It is optimistic about the current rules: the real careful sim is shown for comparison.

| Minute | Current rules: **real sim** (careful seed 1) | Current rules: model | Proposal: model |
| --- | --- | --- | --- |
| 10 | 24 hands, 22 buildings, 30 plots, Notice 38 | 37 hands, 26 buildings, 32 plots, Notice 69 | 37 hands, 27 buildings, 34 plots, Notice 42 |
| 30 | 45 hands, 36 buildings, 40 plots, Notice 59 | 38 hands, 28 buildings, 35 plots, Notice 66 | **77 hands, 56 buildings, 65 plots**, Notice 72, 10 land, 5 terraces |
| 60 | 38 hands, 35 buildings, 41 plots, Notice 79 | 62 hands, 47 buildings, 50 plots, Notice 68 | **137 hands, 102 buildings, 105 plots**, Notice 70, 21 land, 9 terraces |
| 90 | 56 hands, 38 buildings, 48 plots, Notice 64 | 77 hands, 60 buildings, 62 plots, Notice 61 | **207 hands, 164 buildings, 157 plots**, Notice 64, 34 land, 4 dikes, 13 terraces, 12 Storehouses, ~75 Silver/s |

That is 4× the covenant of today's sim by minute 90, with Notice still pressed against the 50–75 band. The one hard budget stays hard, and everything else becomes a price the player can reach. **Validate with the sim** after F8's strategy fixes. Targets:
- at least 100 buildings by minute 60;
- Notice at rest between 55 and 75;
- the bells land 5–10 minutes apart (`gate.md`).

---

## 4. What in economy.md is unclear, unspecified or contradicts the code

1. **Storage claim contradicts the numbers** (F2): "storage always keeps up with prices and the covenant never locks itself out of a purchase" is false for land, dikes, the Form trees and Endow.
2. **Hands eat, or they don't?** *Hands* says "Hands don't eat: the covenant feeds them", then "Unassigned hands are idle and still eat", and the section's Why says "every new hand eats". The code has no food upkeep, so the last two are wrong.
3. **"Slots" means two things:** the zone table's "Building slots" (called "plots" everywhere else) and a building's "Worker slots". Use *plots* for land and *worker slots* for jobs.
4. **Hand arrival also needs Eels:** arrival waits on 10 Eels per hand (`growT` resets without them), which makes the Eels a throughput cap of 0.5 Eels/s at full speed. economy.md says "without Eels nobody comes" but not that arrival pauses and restarts its 20 s timer.
5. **Vis sites and Notice:** Vis sites take no plot, but the code counts them in Notice (Marsh ×0.5). economy.md doesn't say.
6. **Storage buildings make Notice** (Hearth ×0.5 before the Aegis). Not stated in economy.md, and it affects F2's trade-off.
7. **Bread and Eels caps:** the code computes floor(base × Storehouses × research) + floor(Salt in stock / 5), so the Salt bonus is not multiplied by Storehouses. The table's "Storehouse (×1.25 each); +1 per 5 Salt" leaves the order open. While selling (the default), Salt in stock is about 0, so the bonus is 0.
8. **A lost dike** (the Four Winds): the code lowers the Polder's plots but leaves its Salt Meadows standing and worked, so a zone can be over-full. Unspecified: should a Meadow be lost, idled, or kept?
9. **Land purchases:**
   - It's unstated that land has no maximum.
   - It's unstated that Scissy can be bought into after the first bell. The code allows it: any zone with plots > 0.
   - Buying land doesn't change Notice, and economy.md should say so, because it matters to F1's absorption option.
10. **Terraces count Stone produced, not Stone stored:** the code counts Quarry output, including Stone lost at the cap or poured into the Gate. Good, but unstated.
11. **"Pilgrims' Hostel: Bocage (with Quarries)"**: it's unclear whether this means it unlocks with Quarries or needs one built.
12. **Housing is plot-bound, and the doc doesn't say so:** the zones' Why says "once a zone is full, growth comes from … putting more hands to work". But hands need Cottages, and Cottages need Bocage plots, so a full Bocage also stops hand growth. This coupling is the heart of the expansion problem and should be stated.
13. **No Parameters table** for land, dikes and terraces together (`process.md` asks for one per mechanic), and no `[PLAYTEST]` marker on the ×1.3 and ×1.5 curves, which the sim shows never being exercised.
