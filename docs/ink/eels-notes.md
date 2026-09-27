# Eels thread: design notes

**Cause.** The lip of the Tide Pool is cracked where the harvesters kneel, and the pool has been leaking vis into the channel below it. The prose first says so in beat 4, or in beat 3 if the player stops the thread there. Before that the player only gets clues:

| Beat | Clue |
|---|---|
| b1 | The eel rent is doubled, and some eels are longer than a man's arm. |
| b2 | The Tide Pool yields less Vis ("four pawns, expected five"). This is mechanical: Vis ×0.8. |
| b3 | A three-foot eel turns up in a font a mile inland. |
| b4 | Eels are living in the brine. |
| b5 | A twelve-foot eel, and eels crossing a dry road. |

Eel size by beat: an arm's length (b1), 3 ft (b3), 12 ft (b5). After an early stop the epilogue eel is 1.5 ft.

**Mundane suspicion of the magi.** Rogier (b3), Perrine (b4), Hamon (b5) and Rogier's sermon (b7) each point at the magi.

## Beats

- **Open** means `eels_state == 0`.
- **Ns** is N seconds of current net income (the `+60s` tag form).
- Every beat fires once.

| Knot | Trigger | Summary | Choices → effects |
|---|---|---|---|
| `eels_1_first_catch` | 1220, about 60 s in (trial) | Guillaume pays double rent; some eels are longer than his arm | **Salt them:** `bread +15`, took++. **Sell at Dol:** `silver +10, notice +2`, took++. **One stick:** `bread +6`, trust++ |
| `eels_2_the_weir` | year ≥ 1221 (trial, about 150 s in) | The fishers want a weir below the Tide Pool; Aldric notes the pool yields less | **Pay 20 Silver:** `unlock:eel_weir, mod:tide_pool:vis:0.8:600`, took++. **Let them build:** `mod:eel_share:bread:1.3:240` if trust > 0, else 1.15; also `mod:tide_pool:vis:0.8:600`, took++. **Look:** Sabine if `has_sabine`, else Aldric. `block:experiment:<who>:60`, sets `looked`, `looker` and `looked_year`, and avoids the Vis penalty |
| `eels_3_the_font` | year ≥ 1224, open | The priest brings a 3 ft eel from the font and asks what the magi keep | **Lid:** `silver -30s, notice -6`. **Shrug:** `notice +8`. **Stop (early):** if looked, `vis -5`; if not, `vis -8` and `block:experiment:<sabine or aldric>:180`. Either way `notice -5`. Rego Aquam ward |
| `eels_4_the_pits` | year ≥ 1229, open | Eels in the salt-works' filter pits; Perrine asks if the magi breed them | **Diggers:** `silver -40s, notice -5`. **Leave it:** `mod:eel_pits:silver:0.85:300, bread +25, notice +6`, took++. **Stop (mid):** `vis -10, block:experiment:aldric:300, notice -5`. The cause is stated here, and the looker's year is recalled |
| `eels_5_the_road` | year ≥ 1235, open | Hamon, the bishop's sergeant, counts eels on the road; a 12 ft eel | **Bribe:** `silver -60s, notice -10`. **Lie:** `notice +10`. **Stop (late):** `vis -20, destroy:tide_pool`, `block:experiment` 300 on Aldric plus Sabine or Hervé (whoever exists), `notice -8`. Perdo Aquam |
| `eels_6_spring_tide` | year ≥ 1241, open | Aude pays (took×10+10) sticks and warns about the spring tide | **Stop (late):** `vis -20, destroy:tide_pool, block:experiment:all:600, notice -8`. **Bank the salt-works:** `silver -120s` if trust > 0 (her cousins dig), else `-180s`; `notice +6`; sets `pans_banked`. **Buy the cart:** `bread +40, notice +5`, took++ |
| `eels_7_flood` | first year boundary ≥ 1245, open | Eel flood | All choices get `mod:tide_pool:vis:0.5:0`, plus `destroy:salt_pan:{lost}` only if lost > 0. **Shovel:** `bread +60, notice +6, block:build_salt_pan:240`. **Sell:** `silver +60s, notice +min(6 + 2×took, 12)`. **Burn:** `notice +8, block:build_salt_pan:120` |
| `eels_9_the_wyrm` | `eels_state == 4` and year ≥ `eels_end_year + 1` | A 90 ft wyrm leaves the Tide Pool hollow for the sea, cutting a 12 ft channel; one magus's Sanctum starts sinking (`sinking_magus`) | **Ritual:** choice tag `cost:vis:25`; `block:experiment:<magus>:600, notice +12`. **Timber:** `strike:all:60, notice +15`. **Let it sink:** `mod:sanctum_<magus>:assistant_slots:-1:0`, `trait:sanctum:<magus>:sunken_damp`, `trait:sanctum:<magus>:undercroft`, `notice +12` |
| `eels_8_rent` | `eels_state > 0` and year ≥ `eels_end_year + 3` | Epilogue, with one line per ending | **Rent, trust > 0:** `bread +5, notice -5`. **Rent, trust ≤ 0:** `bread +5`. **Flood, bony salt:** `silver +30s, notice +5` |

**Flood loss.**

- Unbanked: `lost = (salt_pans × 2) / 3`, integer division.
- Banked: `salt_pans / 3`.
- Always clamped to at most `salt_pans − 1`, so the flood never takes the last salt-works. No other cap.
- When `lost == 0`, the knot drops the destroy tag and the ruin line.

**The escalating cost of stopping.**

| Beat | Vis | Also costs |
|---|---|---|
| b3 | 5 (8 if nobody looked) | 180 s of one lab if nobody looked |
| b4 | 10 | Aldric's lab for 300 s |
| b5 | 20 | The Tide Pool, and 2 labs for 300 s |
| b6 | 20 | The Tide Pool, and every lab for 600 s |

The flood costs about two thirds of the salt-works and halves the Tide Pool permanently.

## Tags used

- `res:<good>:<±N>`
- `res:<good>:<±N>s`
- `notice:<±N>`
- `unlock:eel_weir`
- `mod:<id>:<target>:<mult>:<s|0>`. Ids: `tide_pool` (target vis), `eel_share` (bread), `eel_pits` (silver).
- `block:experiment:<aldric|sabine|herve|all>:<s>`
- `block:build_salt_pan:<s>`
- `destroy:tide_pool`
- `destroy:salt_pan:N`
- **New, b9:** `#cost:vis:N` as a **choice tag**, inside the brackets (`* [text #cost:vis:25]`). inkjs exposes it on `choice.tags`. The engine greys the choice out when it can't be afforded, and deducts the cost when the choice is picked. There is no separate `res:` tag, so nothing is charged twice. Earlier beats still use ink guards; converting them is optional.
- **New, b9:** `strike:all:<s>` stops all worker and porter output for that many seconds.
- **New, b9:** `trait:sanctum:<magus>:<trait_id>` adds a trait to that magus's Sanctum.
- **New, b9:** `mod:sanctum_<magus>:assistant_slots:-1:0` is an additive delta, which bends the `mod` shape (it is normally a multiplier). A cleaner shape would be `slots:sanctum:<magus>:-1`.

Some tags are dynamic. inkjs evaluates them, and this was tested: `{lost}`, `{sell_notice}`, the trust multiplier, and the magus name in b3. Some effects come from a conditional line that has its own tags, and those tags arrive on the second line after the choice. The engine should collect tags from every line until the knot hits `DONE`.

The `s` guards use `silver >= silver_rate * N`. If `silver_rate ≤ 0`, the choice is free and always shown.

## New building (proposed): Eel Weir

- **Unlock:** `unlock:eel_weir` (b2, the paid option).
- **Placement and cost:** Marsh, 15 Silver, 1 hand.
- **Output:** Bread. Eels are food, so no new good is needed.
- **Rate while open:** 0.3 Bread/s × (1 + 0.5 × `eel_level`).
- **Rate after a stop:** ×1.
- **Rate after a flood:** ×3 for one year, then ×1.

The engine reads `eel_level` and `eels_state`. This is the standing temptation not to stop. If Eels should be a separate good, swap `res:bread` for `res:eels`.

## VARs

**Engine-set, read-only:** `year, notice, silver, silver_rate, vis, salt_pans, has_sabine, has_herve, sinking_magus`. `sinking_magus` is `"aldric"`, `"sabine"` or `"herve"`, and is only read by b9. The engine should pick a magus who has a Sanctum.

| VAR | Meaning |
|---|---|
| `eel_level` | Set by each beat: 1 (b1), 2 (b2), 3 (b3), 4 (b4), 5 (b5). Drives weir output |
| `eels_state` | 0 open, 1 stopped early (b3), 2 stopped mid (b4), 3 stopped late (b5 or b6), 4 flooded |
| `eels_end_year` | Year the thread closed. Epilogue trigger |
| `took_eels` | Times the surplus was taken. Read in b6 (rent size) and b7 (Notice for the Sell choice) |
| `fisher_trust` | +1 for a fair rent in b1. Used in b2 (share ×1.3 vs ×1.15), b6 (banking costs 120s instead of 180s, and Aude's tone), and b8 (−5 Notice) |
| `looked`, `looker`, `looked_year` | A magus inspected the channel in b2. Makes the b3 stop cheap; referenced in b3 and b4 |
| `weir_built` | Paid for the weir in b2. Used for text in b4, b5 and b8 |
| `pans_banked` | Banked in b6. The flood takes a third instead of two thirds |
| `aude_met` | Set in b6. Picks the name in the b8 epilogue |
| `wyrm_choice` | Set in b9: `"ritual"`, `"timber"` or `"sank"`. Not read yet; it is there for later beats |

## Endings

1. **Stopped early (b3):** 5–8 Vis. Ordinary eels afterwards.
2. **Stopped mid (b4):** 10 Vis and 5 minutes of Aldric's lab. The cause is revealed.
3. **Stopped late (b5 or b6):** 20 Vis, the Tide Pool is lost for good, and 2 labs × 5 min or all labs × 10 min.
4. **Flood (b7), then the wyrm (b9):** about two thirds of the salt-works (a third if banked), and the Tide Pool at half yield permanently.

## Traits (b9)

| Trait | Tone | Effect | Story | Removal |
|---|---|---|---|---|
| Sunken Damp (`sunken_damp`) | − | 20% of the Vellum delivered to this Sanctum spoils | The ground floor sits below the marsh. Water runs down the walls | Pay 100 Silver to raise the floor. Undercroft stays |
| Undercroft (`undercroft`) | ± | This Sanctum's Insight ×1.25; Notice +0.5 per minute | The cellar opens into a dressed-stone passage older than the church at Dol. Nobody dug it | None |

## Balance risks

- Stops are paid in Vis, which the Tide Pool supplies. A player who spends all their Vis on experiments sees the stop options greyed out and can't take them.
- Losing the Tide Pool in a late stop removes 1 of 3 Vis sites. Check that the Gate's 0.5 Vis/s requirement is still reachable. The flood's halved Tide Pool plus lost salt-works should still hurt more.
- Two thirds of the salt-works with no cap is harsh for a salt-heavy build. The `−1` floor stops it ending the run outright, but a player near high Notice could spiral.
- The weir multiplier reaches ×3.5 at `eel_level` 5. If never stopping turns out to be the dominant food strategy, tune the weir, not the flood.
- In the trial, the b2 ×0.8 Vis for 600 s outlasts the trial itself. It is meant to be felt, but check that 500 Insight is still winnable after paying for the weir.
- In b3 the "Lid" choice costs 30s of Silver and the "Seal" costs 5 Vis, both small. A player with Vis will always seal, which is intended.
- The b9 Notice (+12 to +15) lands a year after the flood's +6 to +12. Together they can push a mid-60s covenant past 75 in two years. That is intended as the loud end of the thread, but watch for runs that end at the 90 audit.
- Undercroft's ×1.25 Insight may make letting the Sanctum sink the best choice for a lab-heavy run, which is fine: it's the mixed option. If it dominates, raise its Notice.
