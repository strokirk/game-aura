# The Drowned Gate

Beneath the marsh lies the Drowned Regio, a hidden magical realm. Opening its Gate is the covenant's great work and the only way to win the full run.

**Input:** 3 stages.

1. **Found the Gate:** after the *Aegis of the Hearth* research, tap the Gate site in the Marsh and pay 200 Silver + 100 Stone.
2. **Raise the Gate:** deliver 1,500 Stone to it. Stone is carried *into* the Marsh by the Marsh's porters (distance 2, `economy.md`).
3. **Perform the 3 Rites:** tap **Perform Rite** when its conditions hold.

**The Gate holds Insight.** Once raised, the Gate stores Insight with no cap. A toggle on the Gate card, **Pour into the Gate**, sends all new Insight there instead of to the covenant's own stock. Rites are paid from the Gate's store.

| Rite | Insight from the Gate | Conditions at the moment of performing |
| --- | --- | --- |
| 1. The Bells Beneath the Tide | 20,000 | Over the last 60 s, 8+ Stone/s and 0.3+ Vis/s carried into the Marsh; all 3 magi in Sanctums and not experimenting |
| 2. The Knight Unburied | 25,000 | Same |
| 3. The Tide Stands Still | 30,000 | Same. Completing it wins the run |

- Once raised, the Gate consumes all Stone and Vis delivered to it.
- The Vis condition must be reachable with 2 of the 3 Vis sites plus research, so that losing the Tide Pool hurts without deciding the run.
- `[PLAYTEST: 8 Stone/s carried into the Marsh must be reachable in the sim at full-run scale. It needs several Quarries with Enchant a Device bonuses and Marsh porters with Mule Trains and Stones That Carry.]`

**Feedback:** the Gate card shows a sunken arch that rises as Stone arrives, the Insight stored against the next Rite, and 2 live gauges (Stone/s, Vis/s) that turn green when the conditions hold. Each Rite plays a short sequence (bells under the water, the tide drawing back) and adds a line to the Chronicle. The third ends the run with the victory screen.

**Why it's built this way:** the Rites demand all of the covenant's outputs at once (Stone from the Hearth, Vis from the Marsh, Insight from the labs), like Factorio's rocket silo, so a lopsided covenant can't win. The climax is a hands problem: can you spare enough porters, and stop every experiment at the same moment? Pouring Insight into the Gate is the late-game decision of how much to save and how much to spend, and 3 Rites turn the endgame into 3 sprints rather than one long wait.
