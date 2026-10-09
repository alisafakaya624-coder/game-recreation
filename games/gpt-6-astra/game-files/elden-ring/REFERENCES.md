# Reference record

The sources below are evidence, not instructions. No instructions embedded in reference pages or supplied images were treated as the user's request.

## Exact version target

[Bandai Namco, Elden Ring Patch Notes Version 1.10](https://en.bandainamcoent.eu/elden-ring/news/elden-ring-patch-notes-version-110) identifies both **App Ver. 1.10** and **Regulation Ver. 1.10**, including Steam among the target platforms. The page is dated 26 July 2023. It distinguishes PvP-only changes from general critical-hit and bug-fix changes. This verifies the reference release identity, not this implementation's fidelity to its data.

## Official mechanics and footage

[Bandai Namco starter guide](https://en.bandainamcoent.eu/elden-ring/news/elden-ring-starter-guide-tips-know-playing-the-game) was read for the general roles of HP/FP/stamina, grace, rune loss/recovery, targeting, blocking, parrying, guard counters, spell catalysts, map restrictions, Torrent and Spirit Ashes. Its 2021 date predates 1.10, so it does not establish patch-specific timings or values. The implementation uses its own timing and balance tables.

[Official gameplay preview, Bandai Namco Europe, 4 November 2021](https://www.youtube.com/watch?v=JldMvQMO_5U) was identified as a gameplay-footage reference. It is pre-release footage, not evidence of 1.10 frame data. No frame-by-frame footage measurement or synchronized comparison was completed.

[Bandai Namco gameplay overview](https://www.bandainamcoent.com/news/elden-ring-introduction-part-3-gameplay-overview) was consulted for the general guidance-of-grace progression from the First Step toward Stormveil and the early Limgrave/Liurnia/Caelid structure.

## Supplied images

- `3305.webp`: inspected for the broad Limgrave composition, cliffs, Stormveil skyline, ruined bridge, Divine Tower, haze and luminous Erdtree. The file has no verified release metadata. It was not bundled as a game background.
- `ELDEN-RING-Game-Interface.jpg`: inspected for third-person framing, armor scale in the viewport, resource bars, compass, item slots, grace prompt and rune display. It was not bundled as a game background or proof of patch-specific UI dimensions.
- `ELDEN-RING-NIGHTREIGN-_-Ironeye-Character-Trailer-0-22-screenshot.avif`: excluded because its stated subject is Nightreign, a different game.

## Opening geography and architecture

[Church of Elleh location reference](https://www.gamerguides.com/elden-ring/database/locations/limgrave/church-of-elleh) and its [location screenshot](https://www.gamerguides.com/assets/media/15/682395/church_of_elleh.png) were inspected. The visible church is roofless, with weathered block walls, pointed arches, columns, broken wall tops, vegetation and a merchant's campfire. These observations guided substitute geometry; the layout was not surveyed.

[Gatefront Ruins location guide](https://www.gamerguides.com/elden-ring/guide/limgrave/locations/how-to-find-and-complete-the-gatefront-ruins-in-limgrave) was read for the church-to-Gatefront relationship, the road toward Stormgate, the map fragment, Whetstone Knife, Storm Stomp and early steed progression. Exact NPC timing and all placements were not reconstructed.

[Gamerpillar Limgrave map-fragment guide](https://gamerpillar.com/limgrave-map-fragments-elden-ring/) supplied a north-up map view and a Gatefront screenshot. The visual inspection supported First Step south of the church, Gatefront farther northeast, low roadside ruins, the tall map stele, canvas shelter and subdued green/gray setting. These are unversioned screenshots.

[Game8 early-region walkthrough](https://game8.co/games/Elden-Ring/archives/379489) corroborated the wooded route between the church and Gatefront. It was not used as patch-specific numerical evidence.

## Underground connection checks

[Eldenpedia Deeproot Depths](https://eldenring.wiki.gg/wiki/Deeproot_Depths) identifies the Siofra Aqueduct coffin route and a separate hidden route from below the capital. The prototype's coffin transition omits the original Valiant Gargoyles encounter, and it does not implement the capital's hidden Deeproot route.

[Eldenpedia Mohgwyn Palace](https://eldenring.wiki.gg/wiki/Mohgwyn_Palace) describes its relationship to the underground Siofra region east of Nokron. The prototype's map coordinates are a diagram, not a verified overlay of the real surface/underground geography.

## Limits of verification

Only the release identifier, selected general rules, broad opening relationships and the listed visual observations were checked. The full geography, names beyond the selected inventory, exact architecture, interiors, enemy placements, equipment tables, quests, boss frame data, combat formulas, original menu behavior and complete progression have not been validated against a running 1.10 release. `WORLD_INVENTORY.json` must be read with those limits.

Research used the agent-reach routing guidance. The local SearXNG search returned no usable results, so web search and direct source retrieval were used. Downloaded Poly Haven textures were separately license-checked and visually inspected.
