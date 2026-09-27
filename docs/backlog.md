# Backlog

Features we plan or seriously consider building next. None of this is the current game until it moves into `design/`; each entry is a starting point for a design, not a spec. Ideas that are parked with no plan, or tried and set aside, live in `icebox.md`.

Following `process.md`, the design grows from the endgame: entries that sharpen the Gate and the late game come first.

## The endgame

### Three different Rites

The 3 Rites of the Drowned Gate ask for different things instead of the same conditions at rising cost.

- **The Bells Beneath the Tide:** Stone and hands, as the Rites work now.
- **The Knight Unburied:** needs the Drowned Knight's Barrow worked, and costs one magus a Twilight roll (see Warping and Twilight).
- **The Tide Stands Still:** performing it adds about +30 Notice at once, because the whole bay sees it. The player must arrive with Notice low, so the finale pulls every system in. It also bends a Hermetic limit (see below).

### Great works that bend the Hermetic limits

Hermetic magic has limits no magus can break: nothing against the Divine, nothing permanent without vis (the Limit of Energy), nothing that changes a thing's essential nature, and ritual effects that follow the moon's cycle. The game pays lip service to them in flavour text and research names, and explains existing rules through them (Devices and the Aegis cost vis because of the Limit of Energy).

The endgame and the great works then **bend** them, which is what makes them great:
- The eels' wyrm is an eel that has changed its essential nature. The magi don't know how, and that should frighten them.
- *The Tide Stands Still* holds back a tide the moon commands.
- Later great works (the Salt-Wife Breakthrough, Bonisagus's missing Folio) can each challenge one limit, and an ending can hint that a limit is not as fixed as the Order teaches.

The magic guidelines (what each Technique and Form pair can do, and at what level) appear the same way: as the vocabulary of flavour text ("a Rego Aquam ward", "a Perdo Aquam ritual") long before they're ever mechanics.

### A late tier of research and Gate works

Research ends at 2,500 Insight while the Rites need 75,000, so the late game has too little to buy. Add a tier between 5,000 and 50,000 Insight, and purchases on the Gate itself. The late game never waits (`vision.md`).

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
