// Aura: the Seven Bells of Ys. Each knot plays once, after its bell has rung.
// Drafted from an independent writer's raw scenes (docs/ink/ys-notes.md); mechanics are tags after each choice.

// Set by the engine before each knot (read-only here)
VAR year = 1250
VAR notice = 0
VAR has_sabine = false
VAR has_herve = false

=== ys_1 ===
Equinox low water. The bell tolls under the mud like a cow bellowing in a buried cellar, and Guillaume drops his basket.
The tide goes out past the eel stakes, past the last salt-pan, past every mark his grandfather cut. Then the forest rises: black bog-oak, snapped at shoulder height, steaming in the cold.
Between the stumps lie the drowned of 709, brown as saddle-leather, fists still full of acorns. A quarry hand swears one of them turned its head toward Mont-Dol.
* [Run out among the stumps and hack the heart from the oldest oak.]
    It comes home dripping on six shoulders, heavier than stone. # res:bog_oak:+60 # notice:+4
* [Bury the drowned in Christian ground, and fetch Rogier before he hears of it.]
    Rogier blesses four hundred graves in a week and asks no questions, which is its own kind of question. # notice:-10 # block:experiment:all:60
* [Say nothing. Only the eels saw.]
    The eels saw. By morning the weirs are full to bursting. # res:eels:+80 # notice:+2
- -> DONE

=== ys_2 ===
The second bell rings at dawn like a slaughterhouse door slamming. The bay goes red, the red of an opened artery, clotting at the tideline into a skin the gulls won't touch.
Mullet float up by the thousand. Perrine's brine boils pink and crusts into salt that tastes of pennies.
Guillaume stands at the gate with forty fishermen, all gaffs and gutting knives. Hamon stands at the back of the mob, counting faces.
{has_sabine:Sabine plunges her hand into the Tide Pool|Aldric plunges his hand into the Tide Pool} and draws it out gloved in blood to the elbow. It is warm. The sea has a pulse.
* [Open the gate and tell Guillaume the whole truth.]
    He listens. He does not use the gaff. He goes home and tells everyone, which is worse, and better. # notice:-12 # res:eels:-40
* [Harvest the blood-salt. Pay Perrine triple to keep the fires lit.]
    Every grain is vis now. The pans run day and night. # res:silver:-60s # mod:salt_pan:salt:2:600
* [Ride for Dol and confess to Rogier before Hamon's report reaches the bishop.]
    Rogier hears it all and gives a penance nobody has given before. # notice:-6 # res:silver:-30s
- -> DONE

=== ys_3 ===
At the third bell a star falls. Every soul from Cancale to Avranches sees it drag its green-white tail across the sky. It doesn't hiss into the bay. It sings one long bent note, and strikes.
Within a week every well from Dol to Pontorson is bitter. Milk sours in the udder. The hands drink ale and all dream the same dream: a street paved in blue glass under green water.
Rogier preaches from the cathedral steps with a tongue gone green: "And the name of the star is called Wormwood!"
{has_herve:Hervé|Aldric} claws through the steaming mud and lifts out a lump of star-iron the size of a lamb's heart. It is still ringing.
* [Break the star-iron and burn it in the labs.]
    The tower hums for a month. # res:vis:+80 # notice:+6
* [Drink the bitterness yourselves, so the villages don't have to.]
    Every magus lies sick for a season, and the wells of Dol run a little sweeter. # block:experiment:all:180 # notice:-12
* [Bottle the wormwood water and sell it to the monks as holy water.]
    The monks are terrified, and they pay in silver. # res:silver:+120s # notice:+8
- -> DONE

=== ys_4 ===
The fourth bell rings at noon, and a third of the sun is bitten out clean. The light that's left is brown, like light through a jar of old honey.
Then an hour is cut out of the day. The Merveille's bell strikes None and then Vespers with nothing in between. Hamon wakes on the strand with his sword drawn and wet.
Inside the stolen hour the tide stops, hard as slate, and the magi walk on the sea. Far out, where only mud should be, a candle burns in a window that faces Mont-Dol. Someone in Ys has kept it lit for seven hundred years.
* [Walk out across the frozen sea to the candle, and knock.]
    The door opens. What is inside comes home in {has_sabine:Sabine's|Aldric's} satchel, and it is heavy with vis. # res:vis:+100 # block:experiment:{has_sabine:sabine|aldric}:300
* [Use the stolen hour to lift the bishop's letters from Hamon's saddlebags.]
    The letters burn in the Hearth. The bishop never learns what he nearly knew. # notice:-20
* [Leave a hand inside the hour as a watchman.]
    You never learn how long he aged. But the star-stone gives more every dark hour now. # mod:wormwood:vis:1.5:0
- -> DONE

=== ys_5 ===
The fifth bell doesn't ring. It cracks, and the Drowned Knight's Barrow splits open like a loaf, and smoke pours out as from a great furnace.
The Knight climbs out: seven feet of barnacled mail, a helm full of scuttling crabs, a face the sea has polished to pearl. He kneels toward the Archangel's footprint on the hill. Then he turns to the covenant, and waits for orders. He has been waiting since 709.
The locusts come after him, the size of men, with the faces of drowned sailors and wings that roar like chariots. They hunt anyone without the seal on their brow.
* [Give the Knight his first order: take the Merveille's stone.]
    He comes back at dawn dragging a cartload of dressed granite. Across the bay, the monks ring every bell they have. # res:stone:+2000 # notice:+20
* [Seal every brow in the parish with your own blood.]
    Peasant and priest and sergeant alike. It takes the magi a week and most of their blood. # notice:-15 # block:experiment:all:240
* [Challenge the Knight on Michael's footprint, and learn whose side the rock is on.]
    The rock is on nobody's side. The Knight yields anyway, and brings you the oak of his own barrow. # res:bog_oak:+200 # notice:+5
- -> DONE

=== ys_6 ===
At the sixth bell the corners of the world come unbound. The north wind smells of ice and Englishmen; the west wind carries drowned church-music; the south is hot and red with dust; the east is full of Norman curses.
The Couesnon rears out of its bed like a hooked eel and carves new channels overnight. The Mount is in Brittany, then Normandy, then Brittany, faster than any notary can write.
Perrine stands on the boiling-house roof above six feet of flood, lantern high, roaring at God. Rogier rings the bells of Dol against the storm, but the bells of Ys are louder, and closer.
* [Bind the fifth wind, the one nobody names, into Aldric.]
    Aldric becomes a corner of the world. He is quieter now, and every vis site pulls toward him. # block:experiment:aldric:600 # mod:fifth_wind:vis:1.5:0
* [Break the last dikes yourselves, and let the country open.]
    The sea pours into the polder and pours out again full of eels. # destroy:salt_meadow:2 # res:eels:+500 # notice:+10
* [Turn the maddened Couesnon toward Ys, and let the river dig the city out.]
    The river digs all night. In the morning Scissy stands higher, and blacker. # mod:bog_camp:bog_oak:2:0 # notice:+5
- -> DONE

=== ys_7 ===
The seventh bell is silence. Half an hour of it, over heaven and the bay: no gull, no wave, no heartbeat.
Then the tide goes out past Tombelaine, past Granville, past the edge of the world, and it doesn't come back. Forty miles of grey mud steam under a sun too white, like a drawn sword.
Ys stands in the mud: towers of green-veined marble, streets of blue glass, bells in every steeple still dripping. Its people, pale as shell, bow to Mont-Dol. The monks of the Merveille cross the mud behind a raised cross, weeping, and Guillaume trudges among them with his empty basket.
On the hill, the Archangel's footprint fills with the last water in the world. In the heart of Ys an empty throne faces the hill.
* [Walk down into Ys and take the throne.]
    The covenant of Mont-Dol rules a city nobody else can see.
* [Kneel on the footprint, all of you, and let Michael finish what he started.]
    Nobody knows who won. The footprint is dry by morning.
* [Walk the empty bay to the monks, and share their bread.]
    The abbot breaks the loaf in two. Neither of them says a word about the sea.
- -> DONE
