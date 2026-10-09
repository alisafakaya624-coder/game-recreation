# Coverage and acceptance report

Build 0.1.0, reviewed 2026-09-04. Reference target: Elden Ring PC / Steam base game, App 1.10, Regulation 1.10.

## Acceptance result

**The requested complete, exceptionally faithful recreation has not been achieved.** This delivery is a playable, condensed interpretation with substantial original-game content missing. The initial Limgrave area is not being presented as the finished requested game. The later scenes extend its campaign but do not reproduce the original world at its real scale or detail.

The official patch identity is verified. The implementation is not a port, emulator, reconstruction from original data, or a frame-accurate simulation of 1.10. All numerical combat, movement, scaling, and economy values are replacement values unless explicitly stated otherwise.

## Implemented gameplay

| System | Delivered behavior | Fidelity limit |
|---|---|---|
| Connected world | 30 location scenes connected by declared exits and progression gates | Compressed scenes and coordinates; many real connecting areas and routes absent |
| Opening Limgrave | First Step, Church of Elleh, road and forest, Gatefront ruins, open cellar, Stormgate, lake, distant Stormveil, broken great bridge and Divine Tower | Broad location relationships are referenced; metrics, masonry layout, enemy and loot placements are approximations |
| Terrain | Deterministic height fields, elevated ridges, lake basin, site plateaus, scattered boulders, grass and trees | Not the original height map; no original terrain survey |
| Movement | Walk/run, sprint, jump, crouch, directional dodge, backstep, load-dependent speed/dodge, gravity and fall damage | Original speeds, acceleration, fall thresholds, animations and recovery frames unverified; ladders absent |
| Camera | Third-person orbit, zoom, keyboard camera, lock-on, target switching, basic obstruction handling | Not the original camera; no full large-enemy or confined-space tuning |
| Attacks | Separate startup, active and recovery phases; per-swing hit set; directional reach, line-of-sight, stamina, buffered follow-up input | Directional volume checks rather than animated mesh sweep collision; all timings and dimensions approximate |
| Variants | Light, heavy, charged, running, jumping, rolling, guard counter, critical, skill and paired damage profiles | Animation library is small; paired and two-handed movements are not original move sets |
| Defense | Frontal blocking, stamina depletion, guard break, parry window, stance break, dodge invulnerability | Simplified poise and defense; no complete damage type or resistance table |
| Magic | Glintstone Pebble, Glintstone Arc and Catch Flame; catalyst/stat checks; FP use; moving projectile collision | Only these three spells; no full spell inventory, buffs, seals, or casting-speed scaling |
| Status | Weapon blood-loss buildup; simplified rot/poison behavior and bolus removal | Sleep, madness, frostbite and death blight systems missing; no complete per-enemy resistances |
| Equipment | 11 selected weapon entries; visible weapon silhouettes, shield, paired blade, cloak; two-handed damage; simple affinities and Storm Stomp | Shared procedural armor silhouette; armor presets largely affect weight/defense and cloak visibility, not faithful complete outfits; original item descriptions not reproduced |
| Character creation | Ten named base-game origins, starting attributes, name, cloak color | No detailed face/body editor; starting equipment sets are reduced; numerical data not extracted from a 1.10 build |
| Progression | Runes, attribute leveling, smithing stones, a replacement +12 upgrade track, merchant stock, crafting kit and one recipe | Economy, stock, prices, recipes, upgrade rules and drops deliberately compressed |
| Grace and death | Discovery, checkpoints, rest, ordinary-enemy respawn, persistent boss defeat, resource restoration, rune drops/recovery and replacement on second death | No Stakes of Marika selection, original grace-menu inventory or exact reset rules |
| Flasks | Crimson/cerulean allocation, charges, Golden Seed and Sacred Tear upgrades, timed use | Original upgrade costs, healing tables and item limits not reproduced |
| Torrent | Unlock through Melina, mount/dismount, outdoor restrictions, faster movement, double jump, mounted attack reach, damage and forced dismount | Substitute quadruped model; no faithful riding animations, spirit springs, mounted move sets, resurrection charge rules or detailed mount physics |
| Spirit Ashes | One visible spectral companion, FP cost, active-encounter restriction, one use until rest | Simplified AI and health; no original ash inventory, NPC summon system or rebirth-monument placement |
| Quests | Condensed Melina, Ranni, Fia, Corhyn/Goldmask, Dung Eater, Roderika and Three Fingers state chains | Most NPCs and quest steps absent; dialogue is original replacement prose; dependencies and failure conditions differ |
| Endings | Six text-based ending choices behind simplified flags; Frenzied Flame overrides other choices | No original cinematics, complete quests or verified normal-input complete playthrough |
| Menus | Title, creation, HUD, equipment, inventory, status, crafting, map, journal, settings, dialogue, merchants, smithing, grace, death and ending | Inspired proportions, colors and typography; replacement icons and sounds; not pixel-matched |
| Map | Separate surface/underground display, discovered-node travel, map fragments and combat restrictions | Diagram of compressed travel nodes, not the original map or surveyed underground alignment; dungeon-specific restrictions missing |
| Time | Persistent time of day, lighting/sky changes, ambient motes | No complete regional weather system, rain or weather-dependent enemy behavior |
| Saving | Versioned JSON schema, browser persistence, import/export, permanent progression flags | One save slot; no cloud save; import checks cover supported fields but are not a general security boundary |
| Performance | Local assets, one active region, merged rigid geometry, distant-enemy culling, moving near-ground-cover patch, quality settings | No production streaming pipeline, complete LOD hierarchy, exhaustive hardware benchmark or guaranteed stable frame target |

## World inventory

Every region requested in the brief has a named scene or a connected scene containing it. That does **not** mean the original playable spaces are recreated. The machine-readable inventory lists the actual nodes and gates.

| Region or group | Delivered scene treatment |
|---|---|
| Limgrave | Largest connected outdoor scene; four graces; church, camp and cellar |
| Weeping Peninsula | Southern scene with a reduced Castle Morne-style enclosure and Leonine encounter |
| Stormveil | Cliffside skyline in Limgrave plus a separate wall, stair and courtyard scene with Margit and Godrick |
| Liurnia | Shallow flooded area, columns, distant academy towers, key pickup, Albus |
| Raya Lucaria | Long academic hall/courtyard, pointed arches, bookshelves and moon motif; Red Wolf and Rennala |
| Caria Manor | Walled manor court, towers, Loretta and Ranni |
| Caelid / Dragonbarrow / Redmane | Dry red/gray region treatments and connected selected encounters |
| Altus / Gelmir / Volcano Manor | Golden plateau, dark volcanic slopes, lava and a manor/temple enclosure |
| Capital Outskirts / Leyndell | Houses, gold roof silhouettes, major arches, towers and Erdtree backdrop; selected bosses |
| Shunning-Grounds | Enclosed corridor with pipe rings, water, Mohg the Omen and Three Fingers |
| Mountaintops / Castle Sol / Snowfield | Snow palettes, mountain silhouettes, selected fortress geometry and progression gates |
| Haligtree / Elphael | Large branch/trunk forms, canopy path approximation, city braces and Malenia |
| Farum Azula | Broken columns and elevated ruin fragments; Godskin Duo and Maliketh approximations |
| Ashen capital | Ash palette variation, revised boss sequence and ending interaction |
| Siofra / Ainsel | Star-lit underground chambers, water and large columns |
| Nokron / Nokstella | Simplified Eternal City façades, spires, river scenes and transition nodes |
| Deeproot / Lake of Rot / Mohgwyn | Root forms, scarlet or blood-colored water, selected encounters and quest interactions |
| Roundtable Hold | Enclosed hall, central table and chairs, fire and service NPCs |

Stormveil, Raya Lucaria and Leyndell do not contain their full original route networks, interiors, shortcuts, rooftops, bridges, lifts or exact enemy placements. Decorative towers generally remain closed. Several reused geometry functions provide their structural pieces; those scenes should not be mistaken for verified original layouts.

## Boss coverage

The 30 selected boss entries have different ordered attack-pattern combinations, windups, effects and some phase-dependent moves. They share the core combat engine and a small substitute animation/model library. They are **not accurate recreations of the named encounters**.

Examples of omitted encounter identity include Rennala's scholar puzzle, Radahn's festival summons and mounted presentation, Rykard's Serpent-Hunter encounter design, Fire Giant's anatomy and limb interactions, the real Godskin Duo pair, Malenia's full two-health-bar phase structure and Waterfowl timing, Maliketh's original acrobatics, and the Elden Beast's full movement and arena behavior.

The selected inventory includes all thirteen major bosses explicitly named in the request, plus seventeen others. Most optional bosses and repeated field/dungeon encounters are absent. Tree Sentinel, Agheel, many dragons, Crucible Knights, Erdtree Avatars, Burial Watchdogs, Bell Bearing Hunters, Night's Cavalry, Deathbirds, tunnel/catacomb bosses, and most other variants are not implemented. **A complete version-specific encounter census has not been completed.**

## Online and expansion scope

Everything is offline. There is no matchmaking, networking, co-op, competitive multiplayer, player messaging, bloodstain replay or live phantom activity. The spectral companion is an explicitly local NPC simulation.

Shadow of the Erdtree, the Land of Shadow, its bosses/items/quests, Nightreign, and later Tarnished Edition content are outside this build. The supplied Ironeye Nightreign image was excluded as a reference for the base game.

## Validation and visual review

`tests/browser-results.json` contains the measured integration results. `npm test` checks save behavior, attack windows, death/recovery, economy mutations and the declared travel graph. The browser harness stages isolated states and directly exercises the game's update functions; it is not proof of a complete user-input campaign playthrough.

The First Step, Church approach and interior, Gatefront, and menus were inspected in the browser. Camera framing, sparse foreground vegetation, a church ground-height mismatch, missing Shunning-Grounds palette data and retained scene resources were found and corrected during review.

The scene compositions were compared qualitatively with the supplied screenshots and additional Church/Gatefront references. Exact camera pose, lens, geometry, animation timing, lighting and patch-specific gameplay footage were **not** matched or measured. The supplied references contain far more detailed terrain, character models, architecture and material work than this build.

The requested visual-fidelity bar remains unmet. A full normal-input playthrough, all ending branches, every original quest, every combat interaction, and sustained worst-case performance have **not** been verified. Completing the original request would require substantially more reference collection, licensed high-detail character/environment assets, authored animations, level construction, encounter implementation and testing.
