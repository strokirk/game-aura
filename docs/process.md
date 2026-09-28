# How we design

## Growing the design

Design starts from a story. Like Tarn Adams writing a freeform story before building the Dwarf Fortress mechanics to produce it, write what should happen in a run in plain prose first, then design mechanics that can interact, sometimes in surprising ways, to make that story possible. The eels thread began this way.

Design starts at the endgame: the Drowned Gate, the Rites, the most impressive things a covenant does. The game grows from there in two directions:
- **Into the middle:** prerequisites, obstacles and distractions that stand between the start and the endgame.
- **Past the end:** even more impressive things to do once the current endgame is fun.

A new system earns its place by creating decisions, not by filling time. When in doubt, prefer a system that can go wrong loudly to one that makes the player wait.

## Stories are written apart from design

A story that seeds new mechanics is written by an **independent writer**: a subagent that only writes the story and never designs. The same agent never both writes a story and extracts design from it. Its raw output is shown to the user **inline, in the conversation**, and new systems are proposed from it together, with the user. Story content for existing mechanics (such as the Seven Bells' ink) can be drafted by such a writer too; the author interprets it into ink and keeps the raw text in `docs/ink/` for reference.

## Writing design docs

- **Describe the current game in the present tense.** Design docs say what the game is, not how it got there. History belongs in `archive/`; planned features belong in `backlog.md`; parked and rejected ideas belong in `icebox.md`. Leave out "we changed", "no longer" and "instead of X": they confuse people and agents alike.
- **Every mechanic answers 5 questions:**
  1. **Input:** what the player does.
  2. **System:** what the game calculates, with formulas, conditions and edge cases.
  3. **Feedback:** what the player sees and hears.
  4. **Parameters:** concrete numbers, in a table.
  5. **Why:** what the action is for, what it costs, and what decision it creates. For reactive systems, why the player is forced into it and what they can do about it. Name the game we're borrowing from and what exactly we take from it.
- **Be specific.** Numbers and names, not "various", "some" or "many".
- **Mark what isn't settled.** `[PLAYTEST: …]` marks a value to validate. `[OPEN QUESTION: …]` marks an undecided design.
- **Numbers are starting points.** The balance simulation (`design/balance.md`) is the source of truth for anything that can be computed.
- **Decide 0, 1 or N up front** (`design/data-model.md`).

## Objective critique

The author of a design never grades it. Reviews go to **independent subagents**: fresh agents that haven't seen the work being produced, given only the file paths and the questions. They judge better than the author because they read what the doc says, not what the author meant.

A review checks 4 things:

| Lens | Question |
| --- | --- |
| Specificity | Could someone implement this without guessing? Are there undefined terms, missing numbers, unhandled edge cases? |
| Purpose | Why does the player do each action? Is it a real decision, or is there a dominant choice? Are there stretches with nothing to decide? |
| Standalone | Does the doc make sense without this conversation or an older doc? |
| Maths | Do the numbers add up, and is the game winnable but not trivially, and losable by plausible play? |

Rules for reviews:
- **Maths is computed, never estimated.** A reviewer runs the sim, a script, or the tests, and reports what it ran and what came out.
- **Each finding comes with a concrete fix**, with numbers where possible, ranked by severity.
- **The author fixes, then a new independent reviewer checks the result.** The same reviewer doesn't re-grade its own suggestions.
- **Generated content** (ink threads, traits, research items) is scored by a separate judge agent against a written rubric, then run through the balance tests to check it doesn't break the target ranges.
