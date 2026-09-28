# Proposal: Virtues and Flaws

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

Before the run began, the player looked at Hervé and gave him *Dark Secret*: nobody at Mont-Dol knew he had once been a priest. It paid for *Puissant Lab*, and for 20 years Hervé was the covenant's best magus. In 1243 the bishop's clerk recognised him at the market in Dol. The player could pay 1,200 Silver the covenant didn't have, or let Notice jump by 20 in the year the Gate was raised. They paid, and the Rites came a year late.

## What it is

Ars Magica builds each magus from **Virtues** (strengths) and **Flaws** (weaknesses and troubles), and a character takes Flaws to pay for Virtues. Aura's traits (`traits.md`) are the same idea, but the player never chooses them: each magus rolls 1 positive and 1 negative trait at the start.

This proposal adds a **founding screen** where the player builds each founder: 1 free Virtue, and up to 2 Flaws, each paying for 1 more Virtue. Virtues and Flaws are ordinary magus traits: Virtues are positive, Flaws are negative. **Story Flaws** are a new kind of Flaw: each starts a story thread with a guaranteed bad beat.

## Input

On **New run** (full run and stage scenarios; the trial keeps its preset Aldric):

1. The founding screen shows Aldric, Sabine and Hervé side by side.
2. For each founder: pick 1 **Virtue** from 3 offered (rolled from the list below).
3. Optionally, pick up to 2 **Flaws** from 4 offered. Each Flaw taken adds 1 more Virtue pick from 3 new offers.
4. **Roll for me** fills everything at random with 1 Virtue and 1 Flaw, which is the game's behaviour today.

No 2 founders may share a Flaw. Sabine and Hervé are built now, even though they arrive later.

## System

Virtues and Flaws are traits with a tone and a mechanical effect; they use the trait model unchanged. Breakthroughs still offer positive traits, now drawn from the Virtue list.

**Virtues:**

| Virtue | Effect | Story |
| --- | --- | --- |
| Affinity with Vim | This magus's experiments cost 50% less Vis | Raw magic comes to them like a tame hound |
| Gentle Gift | Assistants in this magus's Sanctum give +35% instead of +25% | Servants don't flinch when they pass |
| Diligent Scholar | Study costs 25% less | Reads by candlelight until dawn |
| Puissant Lab | Lab Total +3 | Their hands know the work |
| Inventive Genius | *Write a Lab Text* and *Enchant a Device* run 25% faster | Improves every tool they touch |
| Cautious Sorcerer | Botch chance −3 points (never below 0) | Measures twice |
| Well-Connected in Dol | Bribes cost 30% less | Dines with the lord's steward |
| Hermetic Prestige | The Quaesitor's audit (Notice 90+) doesn't stop this magus's Study | The Quaesitor was their pupil |
| Second Sight | Discovery chance +3 points | Sees what isn't meant to be seen |
| Luck | Once per year, a botch by this magus becomes a success | Things fall their way |

**Flaws:**

| Flaw | Effect | Story |
| --- | --- | --- |
| Blatant Gift | 1 fewer assistant slot in this magus's Sanctum | Servants find reasons to be elsewhere |
| Absent-Minded | Experiments cost 10% more Vellum and Vis | Half-finished notes on every surface |
| Clumsy Magic | Botch chance +3 points | Their spells leave scorch marks |
| Driven | Can't choose Abort at a check-in; Steady and Push only | Never lets a thing go |
| Susceptible to the Divine | Each Endowment gives this magus Lab Total −1 | The church bells make their teeth ache |
| Slow Reader | Study costs 25% more | Learns by doing, badly |
| **Hunted by a Rival** (Story) | Notice +0.5/min, and the *Rival* thread | A rival magus writes to the Tribunal every season |
| **Dark Secret** (Story) | The *Secret* thread | Someone at Dol could ruin them |

**Story Flaw threads** (ink, played by the engine like the eels):

| Thread | Beats |
| --- | --- |
| The Rival | Years 1228, 1238, 1248: a letter to the Tribunal. Each beat: pay 30 s of Silver income per beat so far, or Notice +8 × the beat number (8, 16, 24). The third beat can be ended for good by sending the magus away for 1 year (360 s) to answer in person |
| The Secret | Rolled year between 1232 and 1248: discovered. Pay 60 s of Silver income × (years since 1220 ÷ 10), or Notice +20 and this magus can't Study for 5 years. Before then, once, the magus can **Confess** (from their card): Notice +10 at once and the thread ends |

Both beats scale with the covenant's income through the existing `res:silver:<n>s` tag (`stories.md`), so they bite at any stage.

**Edge cases:**
- Susceptible to the Divine counts Endowments made before the magus arrives.
- A Breakthrough that would offer a Virtue the magus has offers another.
- The LT 25 Breakthrough removes 1 Flaw of the player's choice. Story Flaws can't be removed this way; their threads end in play.

## Feedback

- The founding screen: 3 portrait cards, each with Virtue slots (gold) and Flaw slots (dark red); a picked Flaw unlocks a gold slot with a small "paid for by *Dark Secret*" line.
- Each offer shows its effect in one line and its story line in italics.
- Story Flaws carry a ribbon: "Starts a story."
- In play, Virtues and Flaws are traits and show as they do today (`traits.md`).
- The Chronicle's first line names them: "Founded 1220 by Aldric the Cautious, Sabine of the Gentle Gift, and Hervé, who had a secret."

## Parameters

| Parameter | Value |
| --- | --- |
| Free Virtues per founder | 1, from 3 offered |
| Max Flaws per founder | 2, from 4 offered; each adds 1 Virtue from 3 offered |
| Virtues | 10 |
| Flaws | 8, 2 of them Story Flaws |
| Rival beats | 1228, 1238, 1248; Notice +8, +16, +24 or 30 s of Silver income × beat |
| Secret | 1232–1248; Notice +20 or 60 s × (years since 1220 ÷ 10) of Silver income; Confess for Notice +10 |

`[PLAYTEST: a player who takes 6 Flaws gets 9 Virtues against the default 3. Run the sim with the strongest 9 (Puissant Lab on all 3 is +3 LT each) and with the weakest 6 Flaws; if max Flaws always wins, cap Flaws at 1 per founder or make Flaws buy only from a smaller offer.]`

## Why

- **The founders are 3 copies of each other**, told apart by 2 random traits. Choosing them makes the run the player's own before the first second, and lets a player plan a covenant shape (one reckless experimenter, one scholar, one who keeps the lord sweet).
- **Flaws the player chose are stories the player owns.** Ars Magica's rule that Flaws pay for Virtues makes every Flaw a bet: Dark Secret is a cheap Virtue now against an unknown bill later. That's a decision, not a penalty.
- **Story Flaws make the run a story generator from the start**, feeding the ink system with threads the player opted into, the way Wildermyth's personalities and Crusader Kings' secrets do.
- **The existing traits keep working.** 6 of the 18 are today's magus traits; the model and UI don't change.
- **Borrowed from:** Ars Magica's Virtues and Flaws; FTL and Slay the Spire's run setup, where a choice before the run shapes it; Crusader Kings' secrets and hooks; Darkest Dungeon's quirks.

## Cost to build

- Data: 10 Virtues and 8 Flaws in the existing trait shape (6 already exist); 2 ink threads.
- Code: the founding screen; seeded offers; Confess, a magus action that plays a knot.

## What this leaves out on purpose

- **Major and Minor Virtues and Flaws.** Ars weighs them 1 or 3 points. One weight keeps the screen to one decision per slot; add weights when there are Virtues worth 3.
- **Houses of Hermes.** A House is a bigger, run-shaping choice (`backlog.md`); it fits on the same founding screen later.
- **Virtues and Flaws on the covenant itself** (Ars's Boons and Hooks). The Sanctum traits already cover places; the covenant as a whole can take Boons when rival covenants exist.
