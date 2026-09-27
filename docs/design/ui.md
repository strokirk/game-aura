# Screens and interface

Mobile first: one column, a bottom tab bar, and thumb-sized targets. Desktop uses the same layout with wider cards.

## Screens

| Screen | Kind | Contents |
| --- | --- | --- |
| Title | Top level | Title, tagline, hero image (manuscript art), Continue (if a run is saved), New run (scenario choice; the trial is labelled "Short trial"), Options |
| Options | Top level, and an overlay from Pause | Sound, number format, text size, reduced motion, dev menu toggle |
| Game | Top level | Header: year and years left, year bar, speed (pause / 1× / 2×), menu. Resource strip: amount, cap and rate for each good. Compact Notice gauge (`notice.md`). **Tabs:** Covenant (zones, buildings, hands, porters), Magi (cards, experiments, Study), Research, Chronicle (log of events and ink beats) |
| Event card | Overlay, pauses | Ink text and choices, or a system card (Breakthrough, check-in, audit) |
| Confirm | Overlay | "Are you sure?" for destructive actions |
| Pause | Overlay, pauses | Resume, Options, Restart, Quit to title |
| End | Top level | Win or loss variant: title, cause, the Chronicle, stats, Play again |

The screen stack lives in the UI: a top-level state (Title, Options, Game, End) plus an overlay stack. The core knows nothing about screens; it exposes `outcome: null | {kind: 'win' | 'loss', cause}` and the queue of pending events.

## Saving

- A save is the scenario, the seed and the action log, plus a snapshot for fast loading (`../tech.md`).
- The game autosaves at every year boundary and when quitting to the title. Continue resumes the saved run. A finished run deletes its save.
- Closing the app pauses the run.

## The end screen

- **Stats:** outcome, in-game year, real time played, peak Notice, total Insight produced, experiments run (and botched), traits gained, bribes and Endowments paid.
- **The Chronicle** is 3 lines built from templates:
  1. "Founded 1220 by Aldric, Sabine and Hervé."
  2. The most notable story, by priority: how the eels thread ended ("The eels were stopped in 1224." / "In 1245 the eels drowned the salt-works."), else the first Discovery ("[Magus] found [trait] in [year].").
  3. The ending: "In [year] the tide stood still." / "In [year] the Order renounced them." / "In 1260 the covenant faded from memory."
- **Why:** losing is fun only if the loss is remembered. The Chronicle gives a Renounced covenant the same weight as a victorious one.

## Open questions

- `[OPEN QUESTION: Offline progress. Mobile idle players expect it, but it conflicts with a fixed deadline.]`
- `[OPEN QUESTION: A 4× speed for the late game?]`
