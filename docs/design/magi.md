# Magi, experiments and Study

Magi are the covenant's heart and its only named people. Each has a portrait, a Lab Total (LT, starting at 10) and traits (`traits.md`).

## The founders

- **Aldric** starts with a Sanctum.
- **Sabine and Hervé** arrive when the covenant reaches 10 hands (full run only). Each waits in the Hall, doing nothing, until the player builds their Sanctum.

## Baseline research

A magus in a Sanctum makes 0.02 × LT Insight/s (0.2/s at LT 10). It's deliberately small: the floor, not the engine. A magus produces no baseline Insight while running an experiment.

## Study

- **Input:** tap a magus → Study.
- **System:** raises LT by 1 for 20 × 1.35^(LT − 10) Insight. Unavailable while Notice is 90 or higher (`notice.md`).
- **Why:** LT scales both baseline Insight and experiment yields, at an ever-steeper Insight price.

| LT | Study cost to next |
| --- | --- |
| 10 | 20 |
| 15 | 90 |
| 20 | 402 |
| 25 | 1,803 |

## Breakthroughs

- At LT 15 and LT 20, and on every experiment **Discovery**, the player picks 1 of 2 positive traits. They're drawn at random from the positive magus and Sanctum traits that this magus and their Sanctum don't already have. A Sanctum trait goes on that magus's Sanctum.
- At LT 25, the Breakthrough instead removes 1 negative magus trait of the player's choice (if any).
- **Feedback:** an event card with the 2 choices and a line of flavour.

## Experiments

Experiments are the Insight engine. A magus in a Sanctum starts one; it runs for a fixed time and then resolves.

| Recipe | Base cost | Base time | Result |
| --- | --- | --- | --- |
| Study the Vis | 5 Vis | 60 s | 15 × LT Insight (150 at LT 10) |
| Write a Lab Text | 20 Vellum | 180 s | Permanent: +10% to all experiment yields |
| Enchant a Device | 10 Vis + 50 Stone | 240 s | Permanent: +25% output for 1 chosen building type |

**Input:**
- Pick a magus, pick a recipe, and optionally commit up to 5 extra Vis. Each extra Vis gives −10% time, +15% yield and +2 percentage points of botch chance.
- At the halfway check-in (experiments of 120 s or longer), choose:
  - **Push:** yield +30%, botch chance +10 points.
  - **Steady:** no change.
  - **Abort:** end now and refund half the costs.

**System:**
- Assistants in the Sanctum shorten the time: each assistant adds +25% speed.
- At the end, one roll with the run's seeded random number generator: base botch chance 5%, base discovery chance 5%, otherwise success.
  - **Success:** the full yield.
  - **Botch:** the costs are lost, Notice +5, and a one-line consequence ("Aldric's eyebrows will grow back").
  - **Discovery:** the full yield, plus a Breakthrough.

**Feedback:** each magus card shows a progress ring, the time left and the stakes ("150 Insight · 7% botch"). A finished experiment raises a badge on the Magi tab.

**Why:** experiments turn waiting into bets the player places, with a return every 1–3 minutes (the Kittens Game and Cookie Clicker rhythm). Botches feed Notice, so the lab joins the core tension. The Lab Text is the long-term multiplier the player chooses to invest in, and it gives Vellum a steady use. The check-in is a small Cultist Simulator moment: the same experiment can be played safe or pushed.
