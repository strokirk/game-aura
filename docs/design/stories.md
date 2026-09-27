# Stories (ink)

Stories are written in [ink](https://github.com/inkle/ink) and add flavour and small stakes. Each thread is a series of **knots** (beats) the engine plays as event cards when their trigger conditions are met.

## Threads

| Thread | Files | Summary |
| --- | --- | --- |
| The eels | `src/content/eels.ink`, `docs/ink/eels-notes.md` | The marsh eel fisheries grow rich, then too rich. Unchecked, the eels flood the salt-works. They can be stopped at several points, each later stop costing more, and they tempt the player with cheap food all along |

The full run plays beats 1–8 on the triggers in `docs/ink/eels-notes.md`. The wyrm (beat 9) needs Sanctum traits, `strike:all` and choice `cost:` tags, which the engine doesn't have yet, so it doesn't play. Stage scenarios start after the thread's early beats and play no story.

The eels thread's first 2 beats play inside the trial scenario and can cost it: taking the weir, paid or not, cuts the Tide Pool's Vis to 80% for 10 minutes, while sending a magus to look first avoids the cut, which slows the experiments the trial's win depends on.

## The ink contract

**Who decides what:**
- The engine decides when a knot plays. Trigger conditions are TypeScript data. Each knot is self-contained and ends in `DONE`.
- Ink never calls game code. Choices carry effect tags, which the core parses into the same effect type that research and traits use.

**What ink can read:** before each knot, the engine sets these read-only variables: `year`, `notice`, `silver`, `silver_rate`, `vis`, `salt_pans`, `has_sabine`, `has_herve`, `sinking_magus`. `silver_rate` is floored at 1, so "N seconds of Silver" never costs 0.

**What the engine reads back:** a whitelist of ink variables (`eel_level`, `eels_state`), used for rates such as the Eel Weir's.

**Effect tags:**

| Tag | Effect |
| --- | --- |
| `res:<good>:<±n>` | An absolute amount of a good |
| `res:<good>:<±n>s` | n seconds of the current net income of that good, so the effect scales across the run |
| `notice:<±n>` | Notice, at once |
| `destroy:<building>:<n>`, `destroy:tide_pool` | Remove buildings or a Vis site |
| `mod:<id>:<target>:<mult>:<seconds>` | A multiplier; 0 seconds means permanent |
| `mod:sanctum_<magus>:assistant_slots:<±n>:0` | A permanent change to a Sanctum's assistant slots (an additive delta, the one exception to `mod` being a multiplier) |
| `block:experiment:<magus\|all>:<seconds>`, `block:<action>:<seconds>` | Block an action for a time |
| `strike:all:<seconds>` | Stop all worker and porter output |
| `trait:sanctum:<magus>:<trait_id>` | Add a trait |
| `unlock:<id>` | Reveal something (e.g. `unlock:eel_weir`) |
| `cost:<good>:<n>` (choice tag) | The choice's price. The engine greys the choice out when it can't be paid, and deducts the cost when it's chosen |

**Rules:**
- Tags may be dynamic, e.g. `destroy:salt_pan:{lost}`; inkjs evaluates them.
- The engine collects tags from every line of the knot until `DONE`, not just the first line after a choice.
- Unaffordable choices are shown greyed out, never hidden, so the player learns a way out exists before they can afford it.
- In ink arithmetic, bracket mixed `*` and `/`: `a * 2 / 3` evaluates as `a * (2 / 3)`.
- The ink story state is part of the game `State`, and ink's random seed comes from the run's generator, so story choices replay deterministically.
