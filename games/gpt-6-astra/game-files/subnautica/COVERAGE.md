# Coverage and limitations

**The full requested recreation has not been achieved.** This deliverable is a playable, condensed browser adaptation. It is more than an underwater scene, but it is not the complete original game. Its visuals and sound do not meet an assertion of exceptional original-game fidelity, and its full fresh-save 3D completion route has not been playtested end to end.

Build: Crater 0.1. Reference target: original PC/Steam Subnautica 1.0, 23 January 2018. Coverage assessed 4 September 2026. Later community references are used as supporting evidence, not proof that every detail matches that release. No Below Zero assets, vehicles or named environments were intentionally incorporated.

Status meanings:

- **Implemented**: the stated behavior exists and connects to the adaptation's simulation. This does not certify parity with the original.
- **Partial**: a playable approximation or a subset exists; important original behavior/content is missing.
- **Missing**: absent or represented only by decoration.
- **Unverified**: reference accuracy or an acceptance condition has not been established by the checks performed.

## Starting area and visual presentation

| Requirement | Status | Actual implementation / gap |
|---|---|---|
| Connected starting loop | Implemented | Lifepod, breathable interior, local gathering, fabricator, inventory, tools, scanner, oxygen, radio and reachable kelp. No opening escape/fire cinematic. |
| First-person 3D world | Implemented | Three.js/WebGL 2; fixed terrain, surface, caves, landmarks, creatures, vehicles and player camera. |
| Recognizable original art at gameplay distance | Partial | Procedural replacement models evoke several silhouettes and colors. Many remain visibly simple composite shapes. Tools lack modeled player hands. No original mesh, rig or texture library. |
| Shallow light, water and surface crossing | Partial | Animated water, water/air fog transition, sky, daylight cycle, directional shadows, procedural caustics and soft light-shaft planes. No physical scattering, refraction or calibrated water optics. |
| Particles and flashlight | Partial | Suspended particles and a bounded spotlight; distance fog retains uncertainty. No actual volumetric light transport or particulate beam occlusion. |
| Bioluminescence | Partial | Emissive plants, eyes, creature markings and alien materials; selected local lights. Emission does not consistently illuminate nearby surfaces. |
| Detailed coherent vegetation | Partial | Instanced tapered grass, creepvines, coral tubes/fans, mushrooms, bulbs and blood kelp. Layout and density are authored replacements and are sparse or repetitive in several areas. |
| Surface islands | Partial | Two raised islands with terrain, resources and landmark interactions. Original paths, floating support organisms, complete vegetation and vistas are absent. |
| Aurora | Partial | Large exterior silhouette, entrance interaction, one walkable compartment, cutter/repair requirements, captain's code and rocket blueprint function. Original scale, deck layout, fires, rooms, cargo route, explosion and environmental narrative are not reproduced. |
| Wrecks | Partial | Three exterior shells with corresponding enclosed corridors, bulkhead progression, debris and data boxes. Original distinct layouts and much of the exterior/interior correspondence are missing. |
| Degasi and alien facilities | Partial | Three Degasi sites and four alien facilities with interiors, terminals and progression uses. Replacement rectangular layouts; no faithful room-by-room reconstruction. |
| Original HUD / PDA / menu fidelity | Partial | Styled oxygen/vital meters, quick slots, inventory grid, signals, modal fabricator and PDA. Layout and typography are reinterpretations. Extra objective/biome labels and route hints are departures. |

## Geography and biome checklist

The surface covers a roughly 3.8 km diameter disk. Region sites are fixed and blended into terrain; seeded decoration does not change between saves. Eight authored cave passages join the deep routes. The cave surface is a generated union mesh, not extracted original terrain. Coordinates, outlines, elevations, tunnels, spawn positions and scales are **approximations**. Naming every biome does not constitute reproducing its geography.

| Environment | Status | Present features; material omissions |
|---|---|---|
| Safe Shallows | Partial | Pale sand, low ridges, coral tubes, mushrooms, fans, grass, small fish, pod; cavelets and true reef layout absent. |
| Kelp Forest | Partial | Green visibility, tall ribbons and luminous seed clusters, Stalkers; original density, root structure and exact boundaries absent. |
| Grassy Plateaus | Partial | Red vegetation, raised ground, wreck, pod, Reefbacks and Sand Shark; original pillars and four-region topology not matched exactly. |
| Mushroom Forest | Partial | Orange-brown mushroom trees, purple groundcover, fragments and wreck; fewer trees and simplified branching/caps. |
| Jellyshroom Cave | Partial | Purple passage, glowing mushroom substitutes, magnetite and Degasi site; original cave shape and Crabsnakes missing. |
| Bulb Zone | Partial | Purple bulbs, samples, mineral pool and deep entrance; Ampeels and original arches absent. |
| Grand Reef | Partial | Blue bulbs/anchor-like plants, resource pools and Ghost; true anchor-pod structures and reef layout absent. |
| Deep Grand Reef | Partial | Dark connecting passage, Degasi habitat and Crabsquid; original chambers and distribution absent. |
| Sparse Reef | Partial | Muted sparse ground and resources; exact gullies and rock formations absent. |
| Sea Treader's Path | Partial | Fixed southwest region and a walking-shaped Sea Treader; no herds, sediment harvesting or full path ecology. |
| Underwater Islands | Partial | Elevated rock islands and wreck; exact islands, suspended ecosystem and vertical routes not matched. |
| Mountains | Partial | Steeper terrain, island adjacency and Reaper; original caves, arches and spawn counts absent. |
| Dunes | Partial | Open low-vegetation sand and a Reaper; original dunes, craters and wreck network absent. |
| Crag Field | Partial | Darker, rougher ground and mineral distribution; distinct original spires and ecology incomplete. |
| Crash Zone | Partial | Turbid palette, Aurora, salvage and Reaper; exact debris field, mesas, radiation extent and multiple spawn locations absent. |
| Blood Kelp Zone | Partial | Pale blood-kelp shapes, dark water and northern descent; original canopy and adult Ghost population incomplete. |
| Blood Kelp Trench | Partial | Separate southwest descent with blood oil and deep resources; exact narrow ravine absent. |
| Lost River | Partial | Green water, brine surfaces, skeleton, Ghost, disease facility and lava connection; seven original sub-biomes, tree cove and faithful fossils absent. Brine is visual, not an acid simulation. |
| Inactive Lava Zone | Partial | Rock cavern, animated lava surfaces, kyanite, Sea Dragon and thermal facility; lava castle and original chamber geometry absent. |
| Lava Lakes | Partial | Deep orange cavern, containment facility and cure interactions; complete lake geography and second dragon territory absent. |
| Crater Edge | Partial | Shelf drop, dark water and an additional Ghost trigger; original infinite void behavior and population rules absent. |

## Systems checklist

| System | Status | Present behavior and limitation |
|---|---|---|
| Swimming, walking and surface motion | Implemented / approximate | Acceleration, ascent/descent, sprint, fins and Seaglide; simple collision and surface handling. No accurate buoyancy, climbing animation or complete ladder traversal. |
| Survival / game modes | Partial | Health, oxygen, food, water, heat, radiation, equipment protection, death/cache, four modes. Numerical rates and death semantics are simplified. Food spoilage, thirst subtleties and original environmental hazards are incomplete. |
| Inventory / equipment | Implemented / approximate | Unique item IDs, 6×8 footprint packing, equipment slots, storage, consumption, dropping and transfer. Automatic packing, no rotation/manual rearrangement; item sizes and slot inventory are not fully verified. |
| Crafting | Partial | 102 item definitions and 68 recipes; material chains, station/blueprint/resource/capacity requirements and crafting outputs. These are not the complete original inventory or recipe set. Several costs and gating rules are approximations. Uraninite is collectible but has no nuclear-fuel production chain. |
| Fragment scanning | Partial | Held scan action, progress, unique fragments and blueprint thresholds; limited fragment sites. Cyclops fragments share one nine-fragment counter instead of separate original component categories. |
| Tool functions | Partial | Scanner, knife, flashlight, repair, cutter, builder, Seaglide, stasis, propulsion and air bladder. Cutter doors are simplified flags, stasis is a cone/range action, propulsion moves a target rather than a physical held object, air bladder supplies a brief upward impulse. |
| Batteries / power cells | Implemented / approximate | Finite charge, swaps that retain battery type/charge, ion capacity and power-limited charging. Charge consumption, charger timing and numbers of vehicle cell slots are simplified. |
| Base building | Partial | 22 parts, preview, costs, rotation, placement rules, removal, storage, power, oxygen, hull integrity, flood level, reinforcement and repair. Proximity replaces a full connection graph. No coherent multi-room/multi-floor traversal or accurate snapped original models. |
| Habitat parts | Partial | Rooms, straight/glass corridors, hatches, windows, foundations, reinforcement, solar, thermal, bioreactor, Moonpool, observatory, storage/equipment, growbed, bed, chair and ladder. Nuclear reactors, water filtration, alien containment, scanner rooms, curved/T/X corridors and many original furnishings missing. Chair is decorative. Built ladders do not connect floors; the pod ladder reaches its roof. |
| Base machinery / farming | Partial | Actual energy budgets, timed growbed output, organic reactor fuel, charging and crafting power consumption. Plants share one five-minute growth rule. Thermal generation uses depth rather than sampled vent temperature. No complete farming/aquarium ecosystem. |
| Seamoth | Partial | Drivable, animated exterior, cockpit, power, damage/destruction, depth modules, storage, light and perimeter defense. Simplified silhouette/materials; no faithful entry animation, sonar or docking animation. |
| Prawn Suit | Partial | Thruster/ascent/sinking controls, cockpit, depth/storage modules, resource gathering, powered drill and grapple. Drill doubles selected small mineral yields instead of mining large deposits. Grapple is a timed pull to a mesh hit. No full articulated locomotion, jump-jet heat or original arm physics. |
| Cyclops | Partial | Drivable craft, cockpit, walkable single-level interior, fabricator/storage, modules, engine state, silent running and shield. No original decks, cameras, six-cell bank, detailed fire/flood system, damage map, vehicle bay or faithful collision hull. |
| Docking | Partial | Moonpool transfers stored energy to a nearby small vehicle. No physical docking/undocking sequence or Cyclops docking. |
| Navigation | Partial | Depth, compass equipment, beacon deployables, PDA signals and route hints. No world-map UI. Several original radio coordinates/visibility rules are replaced by explicit guidance. |
| Settings / input | Implemented / approximate | Audio channels, device speech toggle, subtitles, graphics tiers, sensitivity, FOV, invert, camera motion, remapping, fullscreen. Not every fixed shortcut/mouse binding is remappable. Graphics tiers mainly alter rendering resolution and shadows. |
| Saving | Partial | Player, inventories, item identity/charge, equipment, containers, discoveries, recipes, story, construction, flood/power/fuel, growth, vehicles, beacons and caches persist. Creature AI/health/positions, displaced resource positions and some visual transients reset. No full original save-format compatibility. |

## Creatures, horror and sound

| Requirement | Status | Actual implementation / gap |
|---|---|---|
| Small ecosystem | Partial | Catchable Peepers and Bladderfish, cooking/water processing; simplified swimming, silhouettes and populations. Most original fish and plants missing. No complete feeding/reproduction/food-web simulation. |
| Stalkers / Sand Sharks | Partial | Predation, nearby pursuit, retreat and distinct ranges. No Stalker metal collection, tooth production behavior, accurate burrowing or species-specific full attack rigs. |
| Reefbacks | Partial | Large peaceful wandering animals and long low calls; simplified body reef and locomotion. |
| Crabsquids | Partial | Deep predator with proximity attacks and power-draining EMP against lit vehicles. Simplified movement and morphology. |
| Reapers | Partial | Large patrolling models in Crash Zone, Mountains and Dunes; directional calls, pursuit, damage, cooldown/retreat and a brief vehicle grab slowdown. No original mandible rig, accurate spawn set or collision-aware grab animation. |
| Ghosts | Partial | Emissive elongated creatures in reef/river/void, territorial distance limit and retreat. Adult/juvenile proportions, charge behavior and void escalation are not faithfully recreated. |
| Sea Dragons / Emperor | Partial | Lava predator and a containment-area Emperor model with cure/egg interactions. No fireball attacks, full original animation, spoken performance or accurate scale/rig. |
| Creature collision | Partial | Terrain/cave proximity constrains movement. Rocks, wrecks, bases and vehicles do not have a complete navigation/avoidance system; clipping is possible. |
| Horror pacing | Partial / unverified | Quiet shallows, drop-offs, different visibility, distant real-source calls, roaming predators, oxygen/depth/power decisions and calmer shelter. No user study or human playtest establishes that encounters are frightening. No claim of matching the original's tension. |
| Spatial audio | Implemented / approximate | HRTF panners, listener orientation, distance attenuation, moving sources, distance low-pass, generated stereo reverberation and warning ducking. Numerical output checks pass. |
| Biome soundscapes | Partial | Multiple layers for ambience, breathing, motion, machinery, sparse notes and creature calls. Biome/depth filters and gains differ, but several biomes share the same source layers. This is not a library of original biome recordings. |
| Occlusion / acoustics | Partial | Shelter/depth filtering and reverb changes. No geometry ray tests, portal acoustics or accurate sound transmission through hulls. |
| Effects / warnings | Partial | Synthesized collection, scan, repair, construction, door, impact, water, engine and warning sounds. Optional browser speech and subtitles. No authentic PDA/radio voices, original music or creature recordings; hull creaks/leaks and many specific equipment sounds absent. |
| Audio acceptance | Unverified | Offline stereo, attenuation, mute and non-clipping checks were performed. No physical headphone/speaker listening, long-session loop audit, calibrated loudness study or masked-warning comprehension test was performed. |

## Story, performance and acceptance

The playable story is an **adapted dependency chain**: repair radio → distress pod → quarantine/infection discovery → Aurora plans → Degasi/deep route → disease research → thermal plant/blue tablet → containment/incubator → five-sample enzyme recipe → hatching/cure → quarantine shutdown → five Neptune stages → launch/credits. Optional pods, three wrecks and three Degasi sites can be visited.

All prose, radio summaries, notifications and ending presentation are substituted writing. There are no original recordings or cinematics. The full timeline, Sunbeam event, Aurora explosion, staged disease narrative, complete PDA archive, Orange Tablet/laboratory route, original access requirements, alien caches, time capsule and original ending sequence are missing. Facility barriers use terminal requirements rather than complete physical door geometry. Some visits can occur out of the intended original order.

The rules test can craft through the condensed dependency chain and reach the ending flags. It supplies raw ingredients through a simulated storage/gathering helper; it is **not** proof that a fresh player can find every item and traverse every route in the rendered game. A complete fresh-save ending playthrough without fixtures/developer intervention remains unverified.

Surface terrain streams in fixed tiles with instanced vegetation and resources. Analytic terrain/cave collision exists independently of loaded render tiles. All cave terrain, landmarks and main fauna are loaded rather than fully streamed. Vegetation/detail transitions can pop, and many separate decorative meshes remain expensive. Browser screenshots show functioning scenes, but stable frame pacing across large player bases, prolonged travel and low-end hardware is unverified. Short capture-time FPS readings are not a formal performance benchmark.

See [VALIDATION.md](VALIDATION.md) for the exact checks and their limits. The remaining fidelity, completeness and acceptance gaps above are material; this report does not classify the adaptation as the original complete game.
