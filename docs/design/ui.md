# Screens and interface

Mobile first: one column, a bottom tab bar, and thumb-sized targets. Desktop uses the same layout with wider cards.

## Screens

| Screen | Kind | Contents |
| --- | --- | --- |
| Title | Top level | Title, tagline, hero image (manuscript art), Continue (if a run is saved), New run (scenario choice; the trial is labelled "Short trial"), Options |
| Options | Top level, and an overlay from Pause | Sound, number format, text size, reduced motion, dev menu toggle |
| Game | Top level | Header: year and years left, year bar, speed (pause / 1× / 2×), menu. Resource strip: a grid of compact chips, one per good in play (stock or flow), each an icon, the amount and its rate; the name and cap are in the tooltip, and the amount turns red when full. Compact Notice gauge (`notice.md`). **Tabs:** Covenant (Notice, zones, buildings, hands, porters), Magi (an *every idle magus: full Vis* button, then cards with a manuscript portrait, Warping, Twilight and traits, experiments with Begin and Full Vis, Study), Research and Gate (each appears when revealed), Chronicle (log of events and ink beats) |
| Event card | Overlay (a dialog), pauses | A manuscript picture when the card has one, then ink text and choices, or a system card (Breakthrough, check-in, audit, Twilight, raid, storm). A choice with a price is greyed out until it's affordable |
| Confirm | Overlay | "Are you sure?" for destructive actions |
| Pause | Overlay, pauses | Resume, Options, Restart, Quit to title |
| End | Top level | Win or loss variant: manuscript picture, title, cause, the Chronicle, stats, Play again |

## Reading the game

- **Runs start paused**, so the player can read the covenant before time moves. The 1× button pulses until play starts. Space pauses and resumes.
- **Game terms are highlighted in all prose**, Old World style: event cards, choices, blurbs, goals and the Chronicle. Each term shows its icon and a dotted underline; tapping it explains it. Hermetic Arts ("Rego Aquam") are explained as a Technique and a Form. The terms and their explanations are data (`src/data/glossary.ts`).
- **Sudden changes float**: an experiment's Insight, an event's cost or a botch's Notice rises from the resource as "+150" or "−20", green when it helps and red when it hurts. Steady income doesn't float.
- **Numbers use tabular figures**, so ticking values don't shift the layout.
- **Idle hands lead the header**: "3 idle · Hands 26/26", orange while any hand is idle, because hands are the scarcest resource. Hand steppers disable + when nobody is idle, and − at zero.
- **Every number says what it does where the player decides**: a magus card shows what their Lab Total gives right now (Insight a second while reading, Insight per Study the Vis), and the Study button shows the gain. An experiment shows its odds as one bar (red botch, gold discovery) with the consequences in words.

The screen stack lives in the UI: a top-level state (Title, Options, Game, End) plus an overlay stack. The core knows nothing about screens; it exposes `outcome: null | {kind: 'win' | 'loss', cause}` and the queue of pending events.

## Saving

- A save is the scenario, the seed, the legacy and the action log, plus a snapshot for fast loading (`../tech.md`).
- The game autosaves at every year boundary and when quitting to the title. Continue resumes the saved run. A finished run deletes its save.
- Closing the app pauses the run.

## The end screen

- **The title:** one huge word, Dark Souls style: **RENOUNCED**, **THE LINE IS BROKEN**, **THE HILL IS EMPTY** (the last hand left) or, for a win, **NO MORE SEA**. Under it, the cause and two lines of epitaph.
- **The nag:** a loss in the full run ends with "But the Gate still waits under the tide, and the Gate remembers", and names what the next covenant will inherit ("Aldric III will climb the hill and find 14 Lab Texts under the hill, a hill that already hums at Magic 5"). The button is **Found a new covenant**.
- **Stats:** the year it ended and the time played, Insight gathered, experiments (botched, discoveries), peak Notice, the magi with their ages, and the aura.
- **The Chronicle:** its last lines.
- **Why:** losing is fun only if the loss is remembered, and only if it leads somewhere. Cultist Simulator's "the work continues".

## The legacy

Every full run that ends, lost or won, adds to the **legacy**, and legacies **stack**. The next covenant starts from all of it:

| Legacy | Each run adds |
| --- | --- |
| Aura | Starting Magic +⌊(peak Magic − starting Magic) ÷ 2⌋. Inherited Magic adds no Notice |
| The Buried Library | Every Lab Text written this run. *Dig Out the Old Library* recovers all of them for 100 Insight each |
| Heirlooms | 1 Device, on the building type with the most Devices made this run; every heirloom starts built |
| The chairs | The numerals carry on: the next covenant opens with the next Aldric |

- The legacy lives in the browser's storage and in each save, so a run replays exactly. Stage scenarios and the trial neither use nor add to it.
- The Chronicle's first line names the covenant: "The third covenant of Mont-Dol is founded in spring 1220, on the ruins of the last."
- **Why:** number go up across runs, as every prestige layer does. The first covenant is the hardest; later ones race, and the challenge becomes the year.

## Open questions

- `[OPEN QUESTION: Offline progress. Mobile idle players expect it, and with no deadline it no longer breaks the run; but the magi would age while the player is away.]`
- `[OPEN QUESTION: A 4× speed for the late game?]`
