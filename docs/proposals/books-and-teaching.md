# Proposal: books and teaching

*Status: proposal. Not part of the game until it moves into `design/`.*

## The story this makes possible

Sabine was the best of them by 1230 and knew it. Instead of pulling further ahead, she spent a whole year writing a summa, and Hervé read it through the winter of 1232, gaining 4 Lab Totals without spending a scrap of Insight the Gate would need. In 1239 the rats got into the Library, which had too many books for its shelves, and the summa was lost the season before Aldric was due to read it.

## What it is

Today a magus improves only by **Study**, which converts Insight into Lab Total. Every magus competes with research for the same Insight, and the 3 magi never help each other.

This proposal adds 2 ways for the magi to raise each other, paid in **lab time and Vellum** instead of Insight:

- **Books** that one magus writes and the others read. They live in the Library.
- **Teaching**, where one magus spends time with another.

*Write a Lab Text* stays as it is; a Lab Text is also a book and needs a shelf.

## Input

- **Write a Summa** (lab recipe): a magus writes down what they know. Needs Lab Total 12+ and a free shelf.
- **Read** (lab recipe): a magus reads a Summa whose level is above their Lab Total.
- **Teach** (from a magus card): pick a teacher and a student. Both must be idle in their Sanctums.

## System

**A Summa** has a **level** = the author's Lab Total at completion − 4. It takes 300 s and 40 Vellum. Botch and Discovery apply; a botched Summa is lost with its Vellum.

**Reading** takes 60 s and no goods. On completion the reader's Lab Total rises by 1, as long as it's still below the Summa's level. A magus can't read their own Summa. Reading counts as an experiment (no baseline Insight while reading; assistants speed it up).

**Teaching** takes 90 s of both magi. The student gains +2 Lab Total, capped at the teacher's Lab Total − 3. Teaching needs the teacher's Lab Total to be at least the student's + 4.

**Shelves.** Each Library holds 4 books (Summae and Lab Texts). The Hall holds 2 more with no Library. A book beyond the shelves still works but is **damp**: at each year boundary, each damp book has a 10% chance to be lost (a Lab Text lost this way takes its +10% with it). Pulling down a Library makes its books damp.

**Study stays.** The Insight-bought Study is unchanged. It's the only way for the best magus to rise, since nobody can read or be taught above what the others know.

**Edge cases:**
- A Summa's level never falls, even if its author later suffers a trait that lowers their Lab Total.
- Books are covenant property: they stay if their author leaves or dies.
- 2 magi can't read the same Summa at the same time (1 copy).

## Feedback

- The Library building card becomes a shelf: a row of spines, each labelled ("Sabine's *Summa of the Tide*, level 14"), damp ones drawn grey-blue with a drip icon, and "Shelves 5 / 6".
- A magus card's Read button shows "Lab Total 11 → 12 · free · 60 s" next to Study's "Lab Total 11 → 12 · 27 Insight".
- Losing a damp book is an alert and a Chronicle line: "1239: the rats took Sabine's *Summa of the Tide*."

## Parameters

| Parameter | Value |
| --- | --- |
| Write a Summa | Lab Total 12+; 300 s; 40 Vellum; level = author's LT − 4 |
| Read | 60 s; +1 LT while below the level |
| Teach | 90 s of both; +2 LT; teacher ≥ student + 4; cap teacher − 3 |
| Shelves | 4 per Library, 2 in the Hall |
| Damp book | 10% lost per year |

**What a Summa is worth, computed.** An author at LT 18 writes a level-14 Summa (300 s, 40 Vellum). Each of the other 2 magi, starting at LT 10, reads to 14: 4 reads each, 8 × 60 s = 480 s of their lab time. Study would have cost 20 + 27 + 36 + 49 = 132 Insight per magus, 264 in all. The author also gave up 300 s of *Study the Vis* (1,350 Insight at LT 18, for 25 Vis). So a Summa is a bad trade early, when Insight buys research that compounds, and a good one late, when Study from LT 20 to 24 costs 402 + 543 + 733 + 990 = 2,668 Insight per magus and every Insight is needed for the Rites. `[PLAYTEST: check the crossover is around the middle of the run, when the juniors trail the best magus by 4+.]`

## Why

- **The magi are 3 copies of one engine.** Nothing a magus does helps another. Books and teaching give the covenant a reason to specialise: one magus climbs with Insight, writes, and the others follow for Vellum and time.
- **It gives LT growth a second currency.** Late in the run, Study's exponential Insight cost competes directly with the Rites; lab time and Vellum don't. That's a real late-game decision: pay Insight now, or spend a magus's time.
- **It gives the Library a job.** Today it's +500 Insight cap. With shelves, a Library holds the covenant's knowledge, so pulling one down is a real loss.
- **Vellum gets a second use**, on top of Lab Texts, with a real price.
- **Borrowed from:** Ars Magica's summae, reading and training (a book's level is capped by its author, and books are a covenant's wealth); Crusader Kings' education, where one character raises another; Kittens Game's storage buildings, which hold what you've made.

## Cost to build

- Data: 2 lab recipes, 1 magus action, a shelf count on the Library.
- Code: a list of books on the covenant (N from the start, `data-model.md`); a two-magus action; the yearly damp roll.

## What this leaves out on purpose

- **Book quality**, **tractatus** and **different subjects.** A book has one level. Add them if the Arts return from the icebox.
- **Buying and selling books.** Belongs with Redcaps (`backlog.md`).
- **Copying books.** A Summa is one copy; losing it is the story.
- **Apprentices** as students. They belong with aging and apprentices (`backlog.md`); teaching is written so that an apprentice can later be a student.
