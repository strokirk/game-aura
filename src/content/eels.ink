// Aura: the eel thread. Knots are called by the engine; none divert to another.
// Mechanical effects are tags on the lines after a choice.
// "+60s" = 60 seconds of current net income of that good.

// Set by the engine before each knot (read-only here)
VAR year = 1220
VAR notice = 0
VAR silver = 0
VAR silver_rate = 0     // current net Silver per second
VAR vis = 0
VAR salt_pans = 1
VAR has_sabine = false
VAR has_herve = false
VAR sinking_magus = "aldric"  // whose Sanctum sinks in eels_9 ("aldric" | "sabine" | "herve")

// Story memory
VAR eel_level = 0       // 0 none, 1 big rent, 2 weir, 3 font, 4 salt-works, 5 road and after
VAR eels_state = 0      // 0 ongoing, 1 stopped early, 2 stopped mid, 3 stopped late, 4 flooded
VAR eels_end_year = 0   // year the thread ended (for the epilogue trigger)
VAR took_eels = 0       // times the covenant took the surplus
VAR fisher_trust = 0    // Guillaume's family's opinion of the covenant
VAR looked = false      // a magus inspected the channel in beat 2
VAR looker = ""         // "sabine" or "aldric"
VAR looked_year = 0
VAR weir_built = false
VAR pans_banked = false
VAR aude_met = false
VAR wyrm_choice = ""    // eels_9: "ritual" | "timber" | "sank"

=== eels_1_first_catch ===
Spring {year}. Guillaume brings the eel rent: two sticks, fifty eels.
The monks who held this land before you got one stick.
Three of the eels are longer than his arm. He holds one up so you can see.
"Good year," he says.
~ eel_level = 1
* [Salt them for the kitchen.]
    The cook packs them in the old wine cask. The hands eat eel until Easter. # res:eels:+15
    ~ took_eels = took_eels + 1
* [Sell the second stick at Dol.]
    Guillaume sells them for you. At market people ask where eels that size come from. # res:silver:+10 # notice:+2
    ~ took_eels = took_eels + 1
* [Take one stick. The rent is one stick.]
    Guillaume shrugs and carries the rest home. His wife sends up a pie. # res:bread:+6
    ~ fisher_trust = fisher_trust + 1
- -> DONE

=== eels_2_the_weir ===
Guillaume is back with two cousins.
Below the Tide Pool the channel is thick with eels. They want to put a weir across it: stakes, wattle, a basket at the narrow end.
{fisher_trust > 0:"You were fair about the rent. Half the catch to the covenant."|"A third of the catch to the covenant."}
Aldric mentions the Tide Pool gave four pawns of Vis this winter. He expected five.
~ eel_level = 2
* {silver >= 20} [Pay for the stakes and wattle. (20 Silver)]
    The weir goes in by May. The basket is full the first night. # res:silver:-20 # unlock:eel_weir # mod:tide_pool:vis:0.8:600
    ~ weir_built = true
    ~ took_eels = took_eels + 1
* [Let them build it at their own cost.]
    They build it. Your share comes up every Friday in a wet sack. # mod:eel_share:bread:{fisher_trust > 0:1.3|1.15}:240 # mod:tide_pool:vis:0.8:600
    ~ took_eels = took_eels + 1
* {has_sabine} [Send Sabine to look at the channel first. (Sabine's lab idle)]
    Sabine stands in the channel for an hour. The water is warm for March. The eels all face upstream, toward the pool, and hardly move. She tells Guillaume to fish somewhere else. He fishes it at night. # block:experiment:sabine:60
    ~ looked = true
    ~ looker = "sabine"
    ~ looked_year = year
* {not has_sabine} [Go and look at the channel yourself. (Aldric's lab idle)]
    Aldric stands in the channel for an hour. The water is warm for March. The eels all face upstream, toward the pool, and hardly move. He tells Guillaume to fish somewhere else. Guillaume fishes it at night. # block:experiment:aldric:60
    ~ looked = true
    ~ looker = "aldric"
    ~ looked_year = year
- -> DONE

=== eels_3_the_font ===
Rogier, the priest at Dol, walks up with a bucket. In it is an eel he took out of the font on Sunday. It is three feet long.
The font is filled from the church well, a mile from the marsh.
He asks what the magi keep in their tower.
{looked:{looker == "sabine":Sabine|Aldric} is looking at the bucket, not the priest.}
~ eel_level = 3
* {silver >= silver_rate * 30} [Pay for a lid on the font. (30 s of Silver)]
    He takes the silver. He leaves the eel. # res:silver:-30s # notice:-6
* [Tell him eels go where they like.]
    He writes that down, and the date. # notice:+8
* {looked} {vis >= 5} [Seal the Tide Pool's outflow. (5 Vis)]
    {looker == "sabine":Sabine|Aldric} sets a lead ring in clay on the lip of the pool, with a Rego Aquam ward cut into the lead. By Easter the channel runs cold. Guillaume's catch drops to one stick a week. # res:vis:-5 # notice:-5
    ~ eels_state = 1
    ~ eels_end_year = year
* {not looked} {vis >= 8} [Find where the eels come from. (8 Vis, a lab idle)]
    {has_sabine:Sabine|Aldric} wades the channels for a week. The eels all come from below the Tide Pool, where the lip is cracked. A lead ring in clay and a Rego Aquam ward close it. The channel runs cold by Easter. # res:vis:-8 # block:experiment:{has_sabine:sabine|aldric}:180 # notice:-5
    ~ eels_state = 1
    ~ eels_end_year = year
- -> DONE

=== eels_4_the_pits ===
Perrine, who runs the salt-works, comes up with sand on her boots.
There are eels in the filter pits, under the salt-sand. Brine should kill an eel in a day. These are fat.
The boilers dig out two hundred before they can draw brine.
She asks, quietly, whether the magi are breeding them.
{weir_built:Guillaume has rebuilt his weir twice.|Guillaume's cousins have lost four baskets.}
~ eel_level = 4
* {silver >= silver_rate * 40} [Pay diggers to clear the pits. (40 s of Silver)]
    Six men dig every morning. The fires stay lit. The diggers take the eels home. # res:silver:-40s # notice:-5
* [Leave it. The boilers can dig around them.]
    The boilers lose one morning in seven to digging. The hands eat eel pie four days a week. The boilers talk about it in Dol. # mod:eel_pits:silver:0.85:300 # res:eels:+25 # notice:+6
    ~ took_eels = took_eels + 1
* {vis >= 10} [Have Aldric follow the eels to their source. (10 Vis, Aldric's lab idle)]
    Aldric wades upstream for two days. Every eel comes from below the Tide Pool. The lip is cracked where the harvesters kneel, and the pool has been bleeding vis into the channel for years. He closes it with lead, clay and a Rego Aquam ward. # res:vis:-10 # block:experiment:aldric:300 # notice:-5
    {looked:{looker == "sabine":Sabine points out that she said so in {looked_year}.|Aldric says he stood in that channel in {looked_year} and did nothing.}}
    ~ eels_state = 2
    ~ eels_end_year = year
- -> DONE

=== eels_5_the_road ===
Hamon, the bishop's sergeant, stopped his horse on the Dol road last night. Eels were crossing it. He counted to three hundred and gave up.
{weir_built:Last week an eel broke Guillaume's weir. It was twelve feet long.|Guillaume's cousins saw an eel twelve feet long in the channel.}
Hamon asks which of the magi keeps them.{notice >= 60: He asks twice.}
~ eel_level = 5
* {silver >= silver_rate * 60} [Give Hamon a barrel of salted eel and silver. (60 s of Silver)]
    He takes both. He says he saw nothing on the road. # res:silver:-60s # notice:-10
* [Tell him the tides are high this year.]
    He looks at the road, which is dry. # notice:+10
* {vis >= 20} [Drain the Tide Pool and seal it. (20 Vis, lose the Tide Pool, two labs idle)]
    {
    - has_sabine:
        Aldric and Sabine cut a ditch to the sea and let the pool out. Sabine's Perdo Aquam takes the last water from the spring. They cap the hollow with clay and lead. # res:vis:-20 # destroy:tide_pool # block:experiment:aldric:300 # block:experiment:sabine:300 # notice:-8
    - has_herve:
        Aldric and Hervé cut a ditch to the sea and let the pool out. Hervé's Perdo Aquam takes the last water from the spring. They cap the hollow with clay and lead. # res:vis:-20 # destroy:tide_pool # block:experiment:aldric:300 # block:experiment:herve:300 # notice:-8
    - else:
        Aldric and six hands cut a ditch to the sea and let the pool out. His Perdo Aquam takes the last water from the spring. He caps the hollow with clay and lead. # res:vis:-20 # destroy:tide_pool # block:experiment:aldric:300 # notice:-8
    }
    ~ eels_state = 3
    ~ eels_end_year = year
- -> DONE

=== eels_6_spring_tide ===
Guillaume's daughter Aude pays the eel rent now. This year it is {took_eels * 10 + 10} sticks. She brings them in a cart.
The channels below the Tide Pool are black with eels. At low water they lie on the banks.
{fisher_trust > 0:"At the spring tide the sea comes in," she says. "They'll go up. Up is your salt-works."|She says it to the cart, not to you: "Spring tide. They'll go up. Up is your salt-works."}
~ aude_met = true
* {vis >= 20} [Drain the Tide Pool and seal it. (20 Vis, lose the Tide Pool, every lab idle)]
    It takes every magus a fortnight. They cut a ditch, let the pool out, and a Perdo Aquam ritual dries the spring. The eels in the channels die in a month. The smell lasts longer. # res:vis:-20 # destroy:tide_pool # block:experiment:all:600 # notice:-8
    ~ eels_state = 3
    ~ eels_end_year = year
* {fisher_trust > 0} {silver >= silver_rate * 120} [Bank the salt-works with earth. Aude's cousins will dig. (120 s of Silver)]
    Aude's cousins and thirty hands cut turf all summer. Hamon rides out twice to count them and writes to the bishop. # res:silver:-120s # notice:+6
    ~ pans_banked = true
* {fisher_trust <= 0} {silver >= silver_rate * 180} [Bank the salt-works with earth. (180 s of Silver)]
    Forty hired men cut turf all summer. Hamon rides out twice to count them and writes to the bishop. # res:silver:-180s # notice:+6
    ~ pans_banked = true
* [Buy her whole cart.]
    The cook serves eel at every meal until Michaelmas. # res:eels:+40 # notice:+5
    ~ took_eels = took_eels + 1
- -> DONE

=== eels_7_flood ===
~ temp lost = (salt_pans * 2) / 3  // parens needed: ink parses a * 2 / 3 as a * (2 / 3)
{pans_banked:
    ~ lost = salt_pans / 3
}
~ lost = MIN(lost, salt_pans - 1)
~ lost = MAX(lost, 0)
~ temp sell_notice = MIN(6 + took_eels * 2, 12)
The spring tide comes in at night.
{lost > 0:By morning {lost == 1:one salt-works is|{lost} of the salt-works are} full of eels to the rim. More are coming over the dikes.|By morning the channels, the road and the ditches are full of eels.}
{pans_banked && lost > 0:The earth banks hold the rest.}
The Tide Pool is two feet lower. Aldric looks at it for a long time.
~ eels_state = 4
~ eels_end_year = year
* [Shovel them out and salt them.]
    It takes all summer. The cellars are full. # res:eels:+60 # mod:tide_pool:vis:0.5:0 # notice:+6
    {lost > 0:
        The sand beds and pits of {lost} salt-works are fouled past saving. # destroy:salt_pan:{lost} # block:build_salt_pan:240
    }
* [Sell them at Dol, a cartload a day.]
    Eels are free in Dol for a year. Everyone knows where they come from. # res:silver:+60s # mod:tide_pool:vis:0.5:0 # notice:+{sell_notice}
    {lost > 0:
        The sand beds and pits of {lost} salt-works are fouled past saving. # destroy:salt_pan:{lost}
    }
* [Burn them on the flats.]
    The smoke goes straight up for three days. The next Sunday, Rogier preaches on the plagues of Egypt and looks at the hill. # mod:tide_pool:vis:0.5:0 # notice:+8
    {lost > 0:
        The sand beds and pits of {lost} salt-works are fouled past saving. # destroy:salt_pan:{lost} # block:build_salt_pan:120
    }
- -> DONE

=== eels_8_rent ===
{eels_state:
- 1: Guillaume brings the eel rent: one stick. Ordinary eels. He holds up the biggest anyway. It is a foot and a half.
- 2: Guillaume brings the eel rent: one stick.{weir_built: His cousins took the weir down and used the stakes for a pigsty.}
- 3: {aude_met:Aude|Guillaume} brings the eel rent: one stick. The Tide Pool is a dry hollow with a lead ring in it. Children dare each other to stand in it.
- 4: Perrine still finds eel bones in the salt. She sells it at Dol as Mont-Dol salt, with bones. It costs more.
}
* {eels_state < 4} {fisher_trust > 0} [Take the rent.]
    They stay for a drink. In Dol they say the magi pay fair. # res:eels:+5 # notice:-5
* {eels_state < 4} {fisher_trust <= 0} [Take the rent.]
    They do not stay for a drink. # res:eels:+5
* {eels_state == 4} [Let her.]
    Nobody asks for the bones back. # res:silver:+30s # notice:+5
- -> DONE

=== function magus_name(m) ===
{
- m == "sabine": ~ return "Sabine"
- m == "herve": ~ return "Hervé"
- else: ~ return "Aldric"
}

// Flood path only. Cost tags sit on the choice itself (choice.tags); the engine greys out and charges them.
=== eels_9_the_wyrm ===
Spring {year}. At dawn something comes out of the Tide Pool hollow. It is not an eel. It is ninety feet long.
It goes straight to the sea. The ground behind it rolls like water and leaves a channel twelve feet deep.
Half of Dol watches.
{magus_name(sinking_magus)}'s tower leans toward the channel. It sinks a hand's width an hour.
* [Hold it up with a Rego Terram ritual. (25 Vis, {magus_name(sinking_magus)}'s lab idle 10 min) #cost:vis:25]
    {magus_name(sinking_magus)} stands in the mud a night and a day with a lead rod in each hand. The tower stops at a lean of one foot in twelve. Hamon writes to the bishop. The bishop writes to the archbishop at Tours. # block:experiment:{sinking_magus}:600 # notice:+12
    ~ wyrm_choice = "ritual"
* [Shore it up with timber. Every hand, one minute.]
    Forty men drag the quay timber up the hill and prop the tower on the channel side. The whole of Dol watches them do it. Hamon writes to the bishop. The bishop writes to the archbishop at Tours. # strike:all:60 # notice:+15
    ~ wyrm_choice = "timber"
* [Let it sink.]
    By evening the ground floor is under the marsh. The cellar has dropped into a passage nobody dug. The walls are dressed stone, older than the church at Dol. Water runs down them. Hamon writes to the bishop. The bishop writes to the archbishop at Tours. # mod:sanctum_{sinking_magus}:assistant_slots:-1:0 # trait:sanctum:{sinking_magus}:sunken_damp # trait:sanctum:{sinking_magus}:undercroft # notice:+12
    ~ wyrm_choice = "sank"
- -> DONE
