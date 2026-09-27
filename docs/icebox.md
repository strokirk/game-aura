# Icebox

Ideas that aren't in the current design and aren't planned next. **Parked** ideas could come back; each notes where its fuller write-up lives. **Set aside** ideas were tried or specified and dropped, with the reason, so they aren't argued again without new information. Planned and seriously considered features live in `backlog.md`.

Nothing here is part of the game until it moves into `design/`.

## Parked

### The Arts and the Forms of vis

5 Techniques and 6 Forms instead of 1 Lab Total, a Lab Total per pair, and several kinds of vis. The game starts with Vim vis only; more Forms can come back once the single kind is fun. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §9.

### Traits on places and roads

Site traits (*Fertile Ground*, *Old Roman Road*, *Sheltered Hollow*, *Faerie-Claimed* with its yearly Tithe that turns into *Faerie Friend*, *Parish Glebe*, *Flood-Prone*) and road traits (*The Miller Loves the Baker*, *Her Brother Carries It*, *Well-Worn Track*, *Damp Road*, *Bad Blood*, *Smuggler's Path*). Natural homes: the 3 Vis sites, the zones, and the porters' routes. Fuller write-up: `archive/mvp-spec-v1.md` §12.

### Tribunal politics

5 rival covenants with attitudes that drift, lobbying, a Library Exchange for books, and a deck of 16 motions including Renunciation. The Tribunal itself is in `backlog.md`; this is the fuller politics around it. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §15.

### Journeys into the Regio

4 levels of 5 × 5 rooms, 8 moves per journey, caches, hazards and a Guardian per level; the source of Gate Seals and the Keystone. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §8.

### Several Notice tracks

Mundane, Church, Order and Faerie tracks with their own thresholds; raids with Hold, Sally and Hide postures; a Quaesitor who walks the covenant looking for violations. The Order's Notice is the one that matters (`design/notice.md`). Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §12.

### Divine intervention

For extreme circumstances only: a covenant that draws the Church's full attention faces the Dominion itself (a saint's miracle, an interdict, the archangel of Mont-Dol), a rarer and harsher judge than the Order.

### Seasons and the tide cycle

4 seasons with their own yields, and a 60 s tide that floods the flats and cuts routes. Spring tides as a Vis burst are in `backlog.md`. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §3.

### A map of the region

A point graph of named places (Mont-Dol, Dol, the salt flats, Mont-Saint-Michel) where things travel node to node.

### Mods

Game data in json5 validated by zod once non-programmers edit it; scripted effects through Lua (wasmoon) or TypeScript mod files.

### Visual-novel scenes

Event cards with layered manuscript-art portraits and backgrounds, for conversations between characters.

### Platforms

Installable web app, Tauri for desktop, Capacitor for iOS and Android.

### Tabletop version

Rules converted to rounds, cubes and a d10. Fuller write-up: Claude Docs, *Aura MVP — Game Design Spec* §22.

## Set aside

### A 96 × 96 tile map with rotated buildings and directional ports

Too fiddly for a phone, and every spatial decision that mattered came down to which ring or zone a building was in.

### Nodes on rings joined by drawn lines carrying continuous flows

In playtest the lines felt neither satisfying nor medieval, and the map got messy as they crossed. Porters carry the same idea (distance matters, find the bottleneck) without drawing.

### Node levels with ×1.5 output per level

Buying buildings in quantity with ×1.15 costs is easier to read and fits hands as workers.

### Insight from a passive rate alone

Most of the run became waiting. Experiments make Insight something the player does.

### Unlimited storage

Players ended up awash in everything except Stone and Insight.

### Every system visible from the first minute

Overwhelming. Staged unlocks and the trial scenario replace it.

### Morale, rations and wages

More rules without more decisions at this scale.

### A Season Council where every magus picks an action each season

Too slow for an incremental game; experiments give the same choice at the player's own pace.
