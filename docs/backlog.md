# Backlog

Features we plan or seriously consider building next. None of this is the current game until it moves into `design/`; each entry is a starting point for a design, not a spec. Ideas that are parked with no plan, or tried and set aside, live in `icebox.md`.

Following `process.md`, the design grows from the endgame: entries that sharpen the Gate and the late game come first.

## The endgame

### No More Sea: the story first

*"And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea."* (Revelation 21:1)

Following `process.md`, here's the ending as a story before any mechanics.

The Breton legend puts Ys, the drowned city, under the bay of Douarnenez, and says that at low tide you can hear its bells. The covenant finds out the Bretons had the wrong bay. The monks of Mont-Saint-Michel say the bay was the forest of Scissy until the sea took it in 709. The covenant finds out that both are true. Ys lies in the Drowned Regio, and the regio holds back the sea. Its seven bells, once rung, let the sea go.

From about 1235 the covenant rings the bells one by one. Each bell is an apocalypse in small, echoing Revelation. The bay runs red, a star falls in the marsh, the sun dims. Each one gives the covenant something new to work: drowned oak, a star-stone, a hidden hour. Each one also wakes something new that it has to deal with. When the seventh bell rings, the tide goes out and doesn't come back. The forest of Scissy stands in the sand, Ys's towers stand in the mud, and the monks across the bay watch the Merveille's windows face dry land. That's the win.

The mundane covenant has been doing the same thing all along. The Marais de Dol really was won from the sea with dikes, from the 11th century onward. Every dike the covenant builds pushes the sea back an acre. No More Sea is where the dikes and the bells meet.

### Rules for the endgame

1. **A bell adds to the plate. It never takes something off.** Each bell opens a new zone, good, action or synergy, and wakes a new pressure. Nothing the covenant already runs becomes pointless, and several old things become more valuable.
2. **Nothing is ever enough.** Every good has at least 3 uses and at least 1 sink that never fills. +1,000 of anything is always welcome.
3. **Producers make more than one thing.** Most buildings feed two chains, so no building is only the answer to one shortage.
4. **Number go up.** Bell prices grow about ×3.5 per bell, from 10,000 to 20,000,000 Insight. Production keeps up through the magical research trees below, whose multipliers compound. 75,000 Insight isn't a wall; it's about what bell 2 costs.
5. **Always grow.** Pulling buildings down goes. Growth comes from new land (dikes, terraces, the bells' zones) and from the trees, so the player never has to shrink to change shape.

### The Seven Bells of Ys

Built: `design/gate.md`. Still open: whether a partial run (stopped at a bell) earns its own Chronicle ending.

### Every good, many uses

The game already has Bread as work fuel, alms, pilgrims, Eels for the monks, Salt kept or sold, dikes and Bog-oak (`design/`). The rest of this table is still a candidate list.

| Good | Made by | Uses |
| --- | --- | --- |
| **Bread** | Farms, polder fields, salt-meadow flocks | Feeds hands (and ale, after Wormwood). **Alms:** a standing gift of Bread to the poor of Dol, 200 × 2^n Bread for Notice generation −1/min for good: Endow's Bread twin. The parish loves a covenant that feeds it. **Pilgrims:** feed the *miquelots* crossing to Mont-Saint-Michel at a hostel: Bread in, Silver out. **Diggers:** every dike and terrace is paid in Bread, because the labour was fed, not waged. **The Herbam tree** |
| **Eels** (new good; the Eel Weir makes Eels, not Bread) | Eel Weirs, the eels thread | **Fish days:** medieval Christians ate no meat on about a third of days, so hands eat Eels instead of Bread on fish days. **Rent:** sold in sticks of 25 at Dol for Silver. **Render:** after the Bell of Blood, fat eels render Vis. **The Aquam tree** |
| **Salt** (kept as a good, not sold on arrival) | Salt Pans | **Sell** at Dol. **Preserve:** salted Eels and Bread raise their caps. **Brine** for the bells. **The Aquam tree** |
| **Stone** | Quarries | Buildings, the Gate, **dikes**, **terraces** (below), a **chapel** for the parish (a permanent Notice cut that also raises the Divine aura). **The Terram tree** |
| **Vellum** | Parchmenters, salt-meadow flocks | Lab Texts; **letters** to the Order (Notice −5 each, 50 Vellum × 1.5^n); **copies** sold to other covenants (Vellum + Insight → Silver). **The Mentem tree** |
| **Vis** | Vis sites, Salt Pans (after Blood), Eels (after Blood) | Experiments, Devices, the Aegis, the bells, wards against the Pit. **The Vim tree** |
| **Bog-oak** (new) | Scissy | Dikes that don't breach, Sanctum upgrades (+1 assistant), great Devices (+100% instead of +25%, repeatable, cost ×1.15 each) |
| **Silver** | Salt, pilgrims, rent, copies | Buildings, Endow, Bribe, hiring diggers |
| **Insight** | Magi | Research trees, Study, bells |

### Producers that feed two chains

| Producer | Makes | Why it matters |
| --- | --- | --- |
| Salt meadow (a new polder) | Bread (mutton) + Vellum (sheepskin) | The bay's salt-meadow flocks are real. Reclaiming land feeds the labs |
| Quarry | Stone + **Hearth slots** | Quarrying Mont-Dol cuts terraces: the first terrace opens after 2,000 Stone quarried, each next one after ×1.6 more, up to 10. The Hearth grows as the hill shrinks, but the hill runs out |
| Salt Pan | Salt + Vis (after Blood) | The main income becomes a lab supply |
| Eel Weir | Eels + Vis (after Blood) | The eels' temptation grows teeth |
| Library | Insight cap + Insight (copying Vellum) | The Library is never outgrown |
| Pilgrims' hostel | Silver + Notice with the Church | Bread becomes money, at a price |

### Land from the sea

Built: `design/economy.md`, *Land from the sea*. Still open: a new polder is salt grass for 5 years before it can be fields.

### Magical research trees

Built: `design/research.md`, *The Form trees*.

### Short loops in the endgame

| Loop | Period | The decision |
| --- | --- | --- |
| Experiments | 40–180 s | Recipe, extra Vis, push or steady |
| Spring tides and Scissy | About 90 s | Put hands in the drowned forest while the tide is out |
| The hidden hour | 60 s every 5 min | Everything loud and every experiment goes into the dark |
| Alms, pilgrims and letters | Whenever a stock fills | Which good becomes Notice, Silver or goodwill |
| Dikes and their storms | Minutes | Build, mend, or bank Bog-oak |
| Tree nodes | Every 1–2 min | What to multiply next |

### Routes: move X from Y to Z

The earliest prototype let the player send goods from one building to another, and the choice ("send Vis from the Regio Spring to Sabine's Sanctum") was fun. The drawn lines weren't (`icebox.md`). Routes keep the choice and drop the drawing.

- **Input:** each source's card has a **Send to** picker: the Hall, the Gate, a named Sanctum, the hostel, the poor of Dol, or the market.
- **System:** a route is `{good, from, to, share}`. The Gate's two toggles become routes. With many uses per good, routes are how the player spends a flow without clicking every second.
- **Data:** routes are a list (`data-model.md`). A good with no route goes to the Hall.

### The covenant graph

At the endgame the covenant is a machine, and the player should be able to see it.

- **Input:** a **Graph** view on the Covenant tab, and a snapshot of it on the end screen.
- **System:** read-only. Columns left to right: sources, carriers, the Hall, sinks. Edges are the flows `rates()` computes, and later the routes, each labelled with its rate. Width follows the rate, and a bottleneck edge is red.
- **Why:** Factorio players screenshot their factories. On the end screen the graph is the Chronicle's picture of what the covenant became.

### Suggested order to build

1. ~~Bread with uses~~, 2. ~~Dikes and terraces~~, 3. ~~the Form trees~~ and 4. ~~Bells 1–7~~: built (`design/economy.md`, `design/gate.md`, `design/research.md`). Bread is now work fuel rather than food, and Eels are the gift to the monks rather than fish-day food.
5. **Routes**, and the covenant graph.
6. **Balance:** the careful sim rings 2 of 7 bells. The trees, the bell curve and the Gate's pour rules need tuning until a good player rings all seven in about 80 minutes.

### Great works that bend the Hermetic limits



Hermetic magic has limits no magus can break: nothing against the Divine, nothing permanent without vis (the Limit of Energy), nothing that changes a thing's essential nature, and ritual effects that follow the moon's cycle. The game pays lip service to them in flavour text and research names, and explains existing rules through them (Devices and the Aegis cost vis because of the Limit of Energy).

The endgame and the great works then **bend** them, which is what makes them great:
- The eels' wyrm is an eel that has changed its essential nature. The magi don't know how, and that should frighten them.
- *No More Sea* ends a tide the moon commands.
- Later great works (the Salt-Wife Breakthrough, Bonisagus's missing Folio) can each challenge one limit, and an ending can hint that a limit is not as fixed as the Order teaches.

The magic guidelines (what each Technique and Form pair can do, and at what level) appear the same way: as the vocabulary of flavour text ("a Rego Aquam ward", "a Perdo Aquam ritual") long before they're ever mechanics.

## The magi and their labs

### Houses of Hermes

Each founder belongs to a House, picked at the start of a run. Each House is 1 strong passive: Verditius makes Devices cheaper, Jerbiton makes Endowments cheaper, Bonisagus boosts Lab Texts, Criamon courts Twilight, Merinita draws the Faerie. The choice of 3 Houses gives each run a different shape, the way FTL's ships do.

### Warping and Twilight

Built for botches (`design/magi.md`). Still open: pushed experiments and extra Vis adding Warping directly, and a permanent Final Twilight that takes a magus for good.

### A botch table

A botch rolls on a small table instead of always giving +5 Notice: a lab fire (a Sanctum trait), a vis blowout (the aura spikes), a visible effect (Notice), or Warping.

### The yearly Aegis

The Aegis of the Hearth is recast every midwinter for Vis, or the Hearth's Notice factor returns. A recurring vis sink and a beat in every year.

### The Tribunal

A prototype is built (`design/tribunal.md`): influence from Notice and Vis, 2 random decrees that triple an activity's Notice, and gifts. Still open: sending a magus to represent the covenant, rival covenants and votes on motions, and spending influence to strike a decree. Fuller write-up of rival covenants and motions: Claude Docs, *Aura MVP — Game Design Spec* §15.

### Redcaps

A Redcap visits once a year: sell surplus Vis, buy another covenant's Lab Text, and hear rumours that queue story threads. Taken from Kittens Game's trade caravans and the shop in Slay the Spire.

### The Autocrat

A named steward, unlocked mid-run, who assigns porters automatically. It plays a little below the best pace, so micromanaging still pays. The incremental game's automation arc (Antimatter Dimensions' autobuyers), dressed in Ars Magica's covenant steward.

### Named hands

Every 10th hand who arrives has a name and a line. When *Jehan the thatcher* leaves in a famine, the Chronicle says so.

### Covenant seasons

Ars Magica covenants have seasons of life: Spring, Summer, Autumn and Winter. The run's eras follow them, starting from the Spring covenant of 1220. Fuller write-up of eras and Turnings: Claude Docs, *Aura MVP — Game Design Spec* §14.

### Spring tides

The bay has some of the largest tides in Europe. Every 90 s or so a spring tide lets the player tap the Tide Pool for a burst of Vis, if a porter stands ready. Optional, rewards attention, like Cookie Clicker's golden cookie.

## Stories

### More story threads

Every run draws 2–3 threads from a pool of 4–5, as FTL and Slay the Spire draw events. Candidates: one per Vis site (the Drowned Knight, the Regio Spring's faerie), the Mont-Saint-Michel monks building the Merveille who want the covenant's Stone, and the rival behind *Hunted by a Rival*, ending in a duel of certámen. Fuller write-up of more great projects: Claude Docs, *Aura MVP — Game Design Spec* §13.

### A storyteller

Randomness that feels meaningful: a simple storyteller that picks events by the covenant's state and recent history, rather than rolling each one independently. A quiet stretch is followed by trouble; a covenant riding high draws a rival; a famine is remembered by the next event. Taken from RimWorld's storytellers and Left 4 Dead's AI director. See `vision.md`, *A story generator*.

### A Chronicle worth retelling

One line per year, chosen from that year's biggest event, plus an epitaph for each magus. Dwarf Fortress's legends mode, on a budget.

## Meta

### Starting again, stronger

A lost run leaves something behind: a Chronicle across runs, Legacy cards, new founders and Houses, story variants of the Gate. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §18.
