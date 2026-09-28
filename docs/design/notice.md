# Notice

Notice is the attention the covenant draws, and the Order of Hermes is the one that judges it. The Code of Hermes forbids a magus to bring ruin on the Order through dealings with mundanes. The Order cares little about what the magi do in their labs; it cares that the lord of Dol is asking questions and the bishop is writing letters. So mundane unrest is the evidence, and the Order passes sentence: at 100 the covenant is Renounced. Bribing the lord and endowing the parish calm the witnesses, which is why they lower the Order's Notice.

Notice is the game's pollution: growth makes it, and too much of it ends the run.

**Input:** indirect (what you build and where), plus direct levers: **Endow the Parish**, **Give Alms**, **Eels for the Monks**, **Bribe the Lord** (all from year 1226), and the *Aegis* and *Marsh Mist* research.

**System:**

- **Generation per minute** = 0.35 × Σ(buildings in each zone × that zone's factor) + the bells' wakes (`gate.md`) − 1 per Endowment − 1 per Alms, then ×0.6 with Marsh Mist, never below 0.
  - Zone factors: Hearth 0.5 (0 after the Aegis), Bocage 1.5, Marsh 0.5.
  - Hands add no Notice; buildings do.
- **One-off rises:** a botched experiment adds 5 at once; ink choices add or remove Notice through tags (`stories.md`).
- **Decay per minute** = 10% of current Notice.
- Generation and decay together make Notice settle at an **equilibrium of 10 × generation per minute**, which it approaches with a time constant of about 10 minutes. A covenant generating 8 per minute settles at 80.
- **Thresholds** fire when Notice rises past them and re-arm once it drops 5 below.

| Threshold | Event | Shown as | Player response |
| --- | --- | --- | --- |
| 50 | Tax collector: lose 10% of your Silver | Alert | None: a warning that costs money |
| 75 | Strike: the porters of the zone carrying the most goods stop for 60 s | Alert with a button | Pay 5% of your Silver to end it at once, or wait |
| 90 | The Quaesitor's audit: Study is unavailable while Notice is 90+ | Event card, once per crossing | Endow, bribe, or stop building |
| 100 | **Renounced**: the run is lost (full run) | End screen | — |

- **Endow the Parish:** pay 500 × 2^n Silver (n = Endowments so far: 500, 1,000, 2,000…) to reduce generation by 1 per minute, permanently. It lowers the equilibrium by 10.
- **Give Alms:** pay 200 × 2^n Bread (n = Alms so far) to reduce generation by 1 per minute, permanently: Endow's Bread twin. The poor of Dol pray for a covenant that feeds them.
- **Eels for the Monks:** send 50 × 1.5^n Eels across the sands to the abbey of Mont-Saint-Michel (monasteries took their rents in eels) to lower current Notice by 15 at once. Bribe's twin, paid in kind.
- **The hidden hour:** after the fourth bell, Notice generation stops for 60 s of every 5 minutes.
- **Bribe the Lord:** pay 100 × 2^n Silver (n = bribes so far) to lower current Notice by 20 at once. The equilibrium doesn't move, so Notice creeps back over about 10 minutes.

**Feedback:** a compact gauge in the header shows current Notice, threshold ticks and a hollow marker at the equilibrium it's heading for. Tapping it expands Endow, Bribe and the top 3 contributing building types. Every Build button shows "+X Notice at rest", its change to the equilibrium. The Bribe button shows "back in ~X min".

**Why it's the core tension:** every building raises the equilibrium, so the player spends from a Notice budget as well as a Silver one, and the deadline forbids simply stopping. Every lever costs something: Endowments double in price and need Silver storage to afford, bribes wear off, and the Aegis and Mist cost Insight the Gate also needs. Farms and Parchmenters can only live in the loud Bocage.

**Rationale:** proportional decay is Factorio's pollution absorption: Notice becomes a waterline that tracks the covenant's size instead of a meter that only fills. Showing the equilibrium on every button is the incremental habit of showing the next number, applied to the cost. Endow versus Bribe is the classic permanent-versus-temporary spend.
