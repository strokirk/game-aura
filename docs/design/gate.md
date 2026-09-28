# The Drowned Gate and the Seven Bells of Ys

*"And there was no more sea."* (Revelation 21:1)

The Breton legend puts Ys, the drowned city, under the bay of Douarnenez. The covenant finds out the Bretons had the wrong bay: Ys lies in the Drowned Regio under the marsh at Mont-Dol, and its seven bells hold back the sea. Opening its Gate and ringing all seven is the covenant's great work and the only way to win the full run.

## The Gate

1. **Found the Gate:** after the *Aegis of the Hearth* research, pay 200 Silver + 100 Stone on the Gate tab.
2. **Raise the Gate:** pour 600 Stone into it (below). Stone poured past 600 goes to the Gate's store.
3. **Ring the bells:** seven, in order, each paid from the Gate's store.

**Pouring.** The Gate stores goods with no caps. On the Gate card each good has a **pour** switch: while it's on, that good's net income goes to the Gate instead of the Hall, and so does whatever of it the Hall holds, every tick. Poured Salt isn't sold. Silver from Salt sold at the Hall is Silver income, so it pours with Silver. Experiments' Insight goes to the Gate while Insight is poured.

**Why pouring:** the bells cost far more than any Hall can hold, so the Gate is the covenant's second treasury, and deciding what to pour is deciding what the Hall goes without. Pouring Vis starves the labs; pouring Stone stops the Devices; pouring Insight stops the research.

## The bells

A bell rings when the Gate holds its price. Ringing it takes the price from the store, opens something new and wakes something the covenant must live with, and plays its story (`src/content/ys.ink`). Each bell echoes Revelation.

| # | Bell | Price from the Gate | Opens | Wakes |
| --- | --- | --- | --- | --- |
| 1 | **The Bell of Scissy** (8:7, a third of the trees burnt up) | 5,000 Insight, 300 Stone | **Scissy**, the drowned forest: a zone of 6 plots for **Bog-oak Camps** (60 Silver + 30 Stone, 3 workers, 0.1 Bog-oak/s each), worked only at low tide (the first 30 s of every minute). **Enchant a Great Device**: 20 Vis + 20 Bog-oak, 300 s, +100% output for a building type | The drowned dead: Notice +1/min while any Bog-oak Camp is worked |
| 2 | **The Bell of Blood** (8:8, a third of the sea became blood) | 15,000 Insight, 1,000 Salt | The bay runs red with vis: every Salt-works worker also makes 0.02 Vis/s, and Eel Weirs ×2 | The fish die and the fishers rage: Notice +2/min, for good |
| 3 | **The Bell of Wormwood** (8:10, a star falls) | 30,000 Insight, 150 Vis | **Wormwood**, a fallen star: a fourth Vis site at 0.24 Vis/s per worker, three times the Tide Pool | The wells turn bitter and the hands drink ale: fuelled work burns ×1.5 Bread |
| 4 | **The Bell of Darkness** (8:12, a third of the sun darkened) | 70,000 Insight, 500 Vellum | **The hidden hour**: the first 60 s of every 5 minutes are dark. Notice generation stops, and running experiments advance twice as fast | Crops fail: Farms ×0.5, for good |
| 5 | **The Bell of the Pit** (9:2, the bottomless pit opens) | 150,000 Insight, 300 Bog-oak | **The Drowned Knight** rises and serves: a fourth magus at Lab Total 15 who works from Ys and needs no Sanctum | Every year, *Things from the Pit* come for the most crowded zone: ward them with 30 Vis, or lose 2 of its commonest building |
| 6 | **The Bell of the Four Winds** (7:1, the four winds held) | 300,000 Insight, 2,000 Stone | **The Couesnon** turns: point the river at a zone to double its output. It can be moved once a year | Every year a storm breaches a dike: mend it with 200 Stone + 200 Bread, or lose it and its two plots |
| 7 | **No More Sea** (21:1) | 450,000 Insight, 200 Vis, and 300 each of Silver, Salt, Stone, Bread, Eels, Vellum and Bog-oak | The tide goes out and does not come back. When its story ends, the run is won | The whole bay watches: it rings only while Notice is under 50 |

The Insight prices grow about ×3 a bell early and ×1.5–2 late, because the careful sim's Insight income grows about that fast; each good in a price is 3–10 minutes of that good's income. Over 50 seeds the careful sim raises the Gate at a median minute 28, rings the first bell at 34, and the seventh at 72 (61–91): `balance.md`. `[PLAYTEST: the prices are fitted to the careful sim, not to people.]`

**Feedback:** the Gate card shows each good's store and pour switch, the next bell with what it opens and wakes, a bar per good in its price with the time to fill it, and the Ring button. A card lists the bells rung, the tide at Scissy, the hidden hour, and the Couesnon's picker. Each bell adds a line to the Chronicle and plays its story.

**Dev menu:** *Fill the Gate for this bell* sets the store to the next bell's price, so every bell can be tried in one sitting.

## Why it's built this way

- **Each bell adds to the plate and never takes something off.** A bell opens a zone, a good, a site, a person or a lever, and wakes a pressure that keeps the older systems busy: Blood makes the Salt-works a Vis source and makes Notice a standing cost; Wormwood makes Bread matter again; Darkness turns Notice into a window to exploit; the Pit and the storms put buildings and dikes at risk every year.
- **Number go up.** Prices grow ninety-fold, from 5,000 to 450,000 Insight, and the Form trees are how the labs keep up.
- **Losing is fun.** A covenant that falls at the fifth bell has still raised a knight from his barrow and darkened the sun; every bell it rang stays in the Chronicle.
- Taken from Revelation's seven trumpets for the set-pieces, and from Factorio's rocket for the final price in every good at once.
