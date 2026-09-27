# Backlog

Features we plan or seriously consider building next. None of this is the current game until it moves into `design/`; each entry is a starting point for a design, not a spec. Ideas that are parked with no plan, or tried and set aside, live in `icebox.md`.

Following `process.md`, the design grows from the endgame: entries that sharpen the Gate and the late game come first.

## The endgame

### Walking back from the Gate

**The problem, from play.** After the first Rite, the next one asks for the same things again plus more Insight. At Gate-stage scale (3 magi at Lab Total 16–18, 6 Lab Texts, every Vis site worked), Study the Vis makes about 30 Insight/s, so the 55,000 Insight for Rites 2 and 3 is about 30 minutes of one loop with no new decision. It's worse than that: *Vis to the Gate* is a standing toggle, and once it's on, the labs get no Vis. The sim's careful strategy turns it on when the Gate is raised and makes 1,508 Insight in the Gate stage's 20 minutes. The endgame is where the player knows the most, and it asks the least of them. The fix follows `process.md`: start from the ending, give it several ways in, then decide what each earlier system is worth by then.

**The ending.** The run is still won by opening the Drowned Gate with 3 Rites before 1260. What changes:

1. **Each Rite asks for something different**, so each one pulls in a different part of the covenant.
2. **Each Rite has 2–3 ways to perform it.** The player picks the way that suits the covenant they built, and the Chronicle's last line names the ways they chose.
3. **The Rites can be performed in any order** once the Gate is raised. Which one to prepare next is itself a decision.
4. **Insight is one currency among several.** The Rites need about 20,000 Insight in all, down from 75,000, and the rest of their price is Stone, Vis, Silver, Notice headroom, hands and magi's time.

| Rite | Fixed demand | Ways | What it pulls in |
| --- | --- | --- | --- |
| **The Bells Beneath the Tide** | Over the last 60 s: 4 Stone/s and 0.3 Vis/s delivered to the Gate | **Ring them:** all 3 magi idle, 8,000 Insight. **Cast them:** 1,500 Silver to bell-founders from Dol, Notice +10, magi keep working | Quarries, porters and routes; labs or the salt trade |
| **The Knight Unburied** | The Drowned Knight's Barrow worked by 2 hands | **Dig:** 22 hands at the Barrow for 240 s, so everything they normally do stops. **Call him up:** 30 Vis, and one magus is gone for 180 s and comes back with a trait, positive or mixed at even odds (see Warping and Twilight). **Bargain:** an ink knot with the Knight, priced by what the covenant did to the marsh | Hands; Vis and a magus; the story so far |
| **The Tide Stands Still** | Notice +30 at once, since the whole bay sees it, and Notice can't fall below 30 for the rest of the run. It can't be the last Rite, so the player has to live with it. Reaching 100 on that tick is Renounced | **Hold it with Insight:** 12,000 Insight. **Hold it with the magi:** all 3 magi and 60 Vis for 120 s. **The wyrm's channel:** only if the eels flooded and the wyrm cut its channel (`eels_9`, which doesn't play yet); the channel is already open, so this way costs 5,000 Insight | Notice (Endow, Bribe, pulling down Bocage buildings); Vis or the labs; the eels |

`[PLAYTEST: every number in this table. The sim should show that each way is the best one for at least one strategy, or the way is dead weight.]`

- **Why several ways:** the player who built tall labs, the one who built a salt fortune and the one who kept Notice low all reach the Gate, each by their own road. That's the Factorio rocket (every output at once) crossed with Slay the Spire's paths to the same boss.
- **Why the wyrm way:** *Losing is fun*. The eels' worst ending opens a door. A flooded covenant gets a cheaper finale for a covenant it has already damaged.

### What the endgame outgrows, and what it keeps

By the Gate, some systems have done their job. Each one should hand itself off loudly instead of lingering as a chore: a system with nothing left to decide either automates, collapses in the UI, or becomes something to pull down for its slot. The rest must still offer decisions or be worth retuning.

**Outgrown** (the game says so and gets them out of the way):

| System | Why it's done | How it hands off |
| --- | --- | --- |
| Bread and Farms | Hands stop growing once housing is full; Bread only needs to stay positive | Late research *Tithe Barns* (about 2,000 Insight): the steward moves Farm hands to keep Bread ≥ 0. The Bocage card collapses to one line |
| Libraries and the Insight cap | The Gate holds Insight with no cap | Founding the Gate says so on the Library card: "The Gate holds more than any shelf". Pulling Libraries down for Quarries is the intended trade |
| Early research (the first 8 items) | All bought | The Research tab hides bought items behind a "Known (8)" line |
| Baseline Insight | The floor, never the engine | Nothing to do; it stays visible |
| Strongbox and the tax collector | Silver is spent faster than it's stored; Notice 50 is below where a late covenant lives | The tax card becomes a Chronicle line after its third crossing |
| Porters per zone | The same numbers every minute | The Autocrat (below) takes them over, a little below the best pace |

**Keeps its value** (worth retuning every minute):

| System | Its endgame role |
| --- | --- |
| **Hands** | Every Rite way costs hands or frees them. Still the scarcest thing |
| **Routes** | Where each flow goes: Hall, Gate, a Sanctum, or Dol's market (below). The Rite windows need them flipped at the right moment |
| **Experiments** | Push or steady, and extra Vis, still decide the Insight rate. Devices retarget to Quarries or Vis sites as the next Rite needs |
| **Study** | LT 20→21 costs 402 Insight against a Rite's 8,000, so it stays a real competitor for Insight |
| **Notice** | The Tide Rite makes it a budget to save, not a line to stay under. Endow, Bribe and pulling down Bocage buildings all return |
| **Vis** | Contested three ways: labs, the Bells' flow and the Tide's 100 Vis |
| **Silver** | Endowments, bribes, the bell-founders and hiring. A salt fortune is a way to win, not a pile |
| **Stories** | The eels' late beats (1241 spring tide, 1245 flood, the wyrm) land in the endgame and change what the Rites cost |

### Short loops in the endgame

`vision.md` says the late game never waits. At the Gate the player should always have one of these running:

| Loop | Period | The decision |
| --- | --- | --- |
| Experiments | 40–180 s | Recipe, extra Vis, push or steady |
| A Rite window | 60–180 s | Flip routes and hands to meet a fixed demand, then flip them back |
| Spring tides (below) | About 90 s | Spare a porter to catch the Vis burst, or not |
| A bribe wearing off | About 10 min | Bribe again, or time the Tide Rite before Notice creeps back |
| Gate works and late research | One every 2–4 min | What to buy next |

### Routes: move X from Y to Z

The earliest prototype let the player send goods from one building to another, and the choice itself ("send Vis from the Regio Spring to Sabine's Sanctum") was fun. The drawn lines weren't (`icebox.md`). Routes keep the choice and drop the drawing.

- **Input:** each source's card has a **Send to** picker. Sources are the Vis sites, the Quarries, the zones and the Hall's stock of each good. Destinations are the Hall, the Gate, a named Sanctum, or Dol.
- **System:** a route is `{good, from, to}`. The Gate's two toggles (*Pour into the Gate*, *Vis to the Gate*) become 2 routes, not special cases. New destinations:
  - **A Sanctum:** Vis goes straight to that magus's lab stock, uncapped by the Hall's Vis cap, but the Hall gets none.
  - **Dol:** Stone, Vellum or Bread sold at 1 Silver per unit, with Notice +0.1 per unit sold. The market is the escape valve that makes a surplus a decision.
- **Data:** routes are a list (`data-model.md`). A good with no route goes to the Hall.
- **Windows:** a route to the Gate can be opened for 60 s and closes itself, so feeding a Rite window doesn't starve the labs for the rest of the run.

### The covenant graph

At the endgame the covenant has become a machine, and the player should be able to see it.

- **Input:** a **Graph** view on the Covenant tab, from the Gate onward, and a snapshot of it on the end screen.
- **System:** read-only. Columns left to right: sources (buildings grouped by zone), carriers (porters per zone, Gate porters), the Hall, sinks (Sanctums, the Gate, Dol, hands eating). Edges are the flows `rates()` already knows (zones to the Hall, Gate porters, `rates().gate`), and later the routes, each labelled with its live rate. Experiments pay Vis in lumps, so a Sanctum's edge shows its average Vis per experiment. Edge width follows the rate, and an edge whose porters are the bottleneck is red. Nothing new is computed; it draws what `rates()` already knows.
- **Why:** Factorio players screenshot their factories. The graph is the proof of mastery, and on the end screen it's the Chronicle's picture: a won covenant and a Renounced one both leave a drawing of what they became.

### Gate works and a late research tier

Research ends at 2,500 Insight, so the late game has too little to buy. Add about 5 items between 1,500 and 3,500 Insight, about 12,000 in all, so the tier doesn't bring back the Insight grind the Rites lose. Gate works are bought with other goods, within the caps (Stone 200, Vis 60, Silver 1,500 at the Gate stage):

| Gate work | Cost | Effect |
| --- | --- | --- |
| Cistern | 150 Stone + 20 Vis | The Gate stores up to 30 Vis and releases it during a Rite window, so the window can be banked in advance |
| Rite Texts | 40 Vellum each, up to 3 | −1,000 Insight on the next Rite. Gives Vellum a use after Lab Texts |
| Bell tower | 800 Silver | The Bells' *Cast* way costs Notice +5 instead of +10 |

Late research candidates: *Tithe Barns* (above), *The Autocrat*, *Spring Tides* (below), *Deep Quarrying* (Quarries ×1.5), and *Moon-Reckoning* (Rite windows 45 s instead of 60 s, since rituals follow the moon).

### Suggested order to build

1. *Vis to the Gate* as a 60 s window instead of a standing toggle, with the sim strategies opening it only for a Rite. Then distinct Rites in any order (the Tide never last), one way each (the first way in each row above), with the Insight cut to 8,000 / 0 / 12,000, and `gate.md` rewritten in the same change. The Gate stage starts with 4,000 Insight in the Gate instead of 12,000. Tune it all with the sim. To settle before building:
   - The Gate's `rites` count becomes a list of Rite ids, and the Gate card lets the player pick which Rite to prepare.
   - Only the Bells keep the Stone/s and Vis/s window. The Knight needs the Barrow worked; the Tide needs the Notice headroom.
   - *Dig* is a timed Gate action that takes 22 idle hands off their jobs for 240 s and returns them. If hunger takes hands mid-dig, the dig takes them first and fails below 22.
2. The covenant graph, read-only, drawn from what `rates()` already has.
3. The second and third ways per Rite, and Gate works.
4. Routes to Sanctums and Dol, replacing the Gate's toggles.
5. The late research tier, the Autocrat and spring tides.

### Great works that bend the Hermetic limits


Hermetic magic has limits no magus can break: nothing against the Divine, nothing permanent without vis (the Limit of Energy), nothing that changes a thing's essential nature, and ritual effects that follow the moon's cycle. The game pays lip service to them in flavour text and research names, and explains existing rules through them (Devices and the Aegis cost vis because of the Limit of Energy).

The endgame and the great works then **bend** them, which is what makes them great:
- The eels' wyrm is an eel that has changed its essential nature. The magi don't know how, and that should frighten them.
- *The Tide Stands Still* holds back a tide the moon commands.
- Later great works (the Salt-Wife Breakthrough, Bonisagus's missing Folio) can each challenge one limit, and an ending can hint that a limit is not as fixed as the Order teaches.

The magic guidelines (what each Technique and Form pair can do, and at what level) appear the same way: as the vocabulary of flavour text ("a Rego Aquam ward", "a Perdo Aquam ritual") long before they're ever mechanics.

## The magi and their labs

### Houses of Hermes

Each founder belongs to a House, picked at the start of a run. Each House is 1 strong passive: Verditius makes Devices cheaper, Jerbiton makes Endowments cheaper, Bonisagus boosts Lab Texts, Criamon courts Twilight, Merinita draws the Faerie. The choice of 3 Houses gives each run a different shape, the way FTL's ships do.

### Warping and Twilight

Pushing an experiment or committing extra Vis adds Warping to the magus instead of plain botch chance. At a threshold the magus enters Twilight: they come back with a strange mixed trait, or are gone for a year. Taken from Darkest Dungeon's roll at 100 stress, which ends in an affliction or a virtue.

### A botch table

A botch rolls on a small table instead of always giving +5 Notice: a lab fire (a Sanctum trait), a vis blowout (the aura spikes), a visible effect (Notice), or Warping.

### Aging, longevity and apprentices

The run lasts 40 years. Portraits grey; a longevity ritual is a vis sink, and without one a magus's Lab Total slowly falls after about 1240. An apprentice takes 15 years: one taken in 1225 passes the Gauntlet around 1240 as a 4th magus. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §11.

## The covenant

### The aura

The game is called *Aura*: in Ars Magica an aura is a place's supernatural character (Magic, Divine, Faerie or Infernal) and its strength. Each zone has one. A Magic aura adds to Lab Totals for Sanctums and Vis sites there; a Divine aura subtracts. Endowing the Parish raises the Divine aura in the Bocage, so the cheapest permanent Notice fix costs lab power. The Aegis and the Gate raise the Magic aura as the regio seeps up. Mont-Dol, where St Michael fought the Devil, is a natural Divine hotspot above a Magic marsh.

### The yearly Aegis

The Aegis of the Hearth is recast every midwinter for Vis, or the Hearth's Notice factor returns. A recurring vis sink and a beat in every year.

### The Tribunal

The Tribunal meets every 7 years, about 5 times in a run. It judges the covenant's Notice and holds votes. Most Tribunals are routine; some are critical. A covenant can send a magus to represent it, who handles routine Tribunals automatically so a run isn't constantly interrupted. To be developed. Fuller write-up of rival covenants and motions: Claude Docs, *Aura MVP — Game Design Spec* §15.

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
