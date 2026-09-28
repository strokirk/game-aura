# The Tribunal

`[PROTOTYPE: a first cut to try in play. Every number is a starting point.]`

The Order of Hermes governs itself by region. Every 7 years the magi of the Normandy Tribunal, which takes in Brittany and so Mont-Dol, meet to hear complaints, pass judgements and trade favours. A covenant that arrives quiet and rich in vis is listened to; one the whole bay is talking about is watched.

## Input

None in the moment: the Tribunal comes to the player. What the player controls is the state the covenant arrives in, **Notice** and **Vis**, in the years before each meeting. The Notice card shows the year of the next Tribunal and the covenant's influence if it met today.

## System

**When:** the first Tribunal meets at the start of 1227, then every 7 years: 1227, 1234, 1241, 1248, 1255. It meets in the full run and the stage scenarios, not in the trial. A meeting is an event card.

**Influence:**

Influence = ⌊(100 − Notice) / 20⌋ + ⌊Vis in the Hall / 20⌋, never below 0.

A quiet covenant (Notice 30) with a full store of 60 Vis has 3 + 3 = 6 influence. A loud one (Notice 80) with 10 Vis has 1 + 0 = 1.

**Decrees:** the Tribunal picks 2 activities at random from the list below and decrees them suspect until the next Tribunal (7 years). While a decree stands, that activity's Notice is ×3. A decree lapses at the next meeting, which draws 2 new ones (they may repeat).

| Decree | Suspect activity | Effect while it stands |
| --- | --- | --- |
| On the salt trade | Salt-works | Their Notice ×3 |
| On quarrying the Mount | Quarries | Their Notice ×3 |
| On pilgrims | Pilgrims' Hostels | Their Notice ×3 |
| On dealings with fishermen | Eel Weirs | Their Notice ×3 |
| On the enclosure of the Bocage | Farms | Their Notice ×3 |
| On the reclaiming of land | Salt Meadows | Their Notice ×3 |
| On reckless experiment | Botches | Notice per botch ×3 (+15 instead of +5) |

**Gifts:** the Tribunal rewards a covenant it respects. For every 2 points of influence, one gift, each drawn at random:

| Gift | Effect |
| --- | --- |
| A Lab Text from the Tribunal's library | +1 Lab Text |
| A device from a Verditius magus | +1 Device on the covenant's most-worked producer |

**Edge cases:** a covenant with 0–1 influence gets no gift but still gets its decrees. Decrees on a building the covenant doesn't have cost nothing, which is the luck of the draw. The draws use the run's seeded generator, so a run replays exactly.

## Feedback

- The Tribunal card names the influence and where it came from ("Notice 30: 3, Vis 60: 3"), each decree, and each gift.
- The Notice card lists the standing decrees and the year they lapse, the year of the next Tribunal, and the influence if it met now.
- A Chronicle line for each meeting.

## Parameters

| Parameter | Value |
| --- | --- |
| First meeting, interval | 1227, every 7 years |
| Influence per 20 Notice below 100 | 1 |
| Influence per 20 Vis in the Hall | 1 |
| Decrees per meeting | 2 |
| Notice multiplier of a decreed activity | ×3 |
| Influence per gift | 2 |

## Why

- **It gives Notice and Vis a deadline.** Between meetings the player decides how quiet and how vis-rich to arrive: bribing the lord or sending eels to the monks a year before the Tribunal buys influence, and hoarding Vis instead of burning it in the lab buys gifts. That's a new use for both, and a reason to hold back.
- **Decrees reshape the next 7 years.** A decree on the salt trade makes the covenant's main income loud, so the player shifts to pilgrims, lays off salt-boilers, or pays for it in Endowments. The draw is random, so no single build is always safe.
- **Losing is fun.** A loud covenant gets no gifts and still gets decrees that make it louder; the Tribunal is where a covenant sliding toward Renunciation feels the Order's attention for the first time.
- Taken from Ars Magica's Tribunals, where influence is traded and the Code is interpreted; and from Crusader Kings' council laws and Civilization's World Congress, where a periodic vote changes the rules everyone plays by.

## Not yet

`backlog.md` keeps the fuller Tribunal: sending a magus to represent the covenant, rival covenants and votes on motions, and spending influence to strike a decree.
