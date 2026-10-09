# Feature coverage and outstanding work

## Delivery status

**Playable reconstruction; the requested complete-fidelity target remains unmet.** This report distinguishes working systems from approximations. Presence on the map is not a claim that a location's original layout has been reproduced completely.

There are nineteen named location representations, 110 building records, including the separate lookout structure, 147 searchable chests, and 108 initial ground pickups. Exact historical counts and placements are not reproduced. Additional chest and eliminated-bot drops appear during a match.

## Island and locations

The island uses an authored coastline, sculpted heightfield, irregular hills and cliffs, vegetation, roads, Loot Lake, river channels, and a southern swamp. Relative location positions follow the original Chapter 1 geography. Coordinates, elevations, shapes, distances, and boundaries are **approximate**, with no source heightmap or extracted original geometry. The world spans about 2,304 game units; it is not a surveyed recreation of Epic's scale.

| Location | Playable representation | Material differences / missing detail |
|---|---|---|
| Tilted Towers | Twelve building blocks, clock tower, multistory interiors, streets, storefronts, awnings, roof equipment, vehicles, benches | Street widths, footprints, clock tower interior, individual landmark facades, and room plans are incomplete approximations |
| Pleasant Park | Ten residential houses, central sports field, goals, gazebo, perimeter streets, porches and fences | House shapes, gardens, exact block spacing and floor plans differ |
| Retail Row | Residential side, NOMS and sporting-goods shops, shelves, parking area | Store footprints, back rooms, individual houses and street layout differ |
| Greasy Grove | Residential side, Durrr Burger building and burger head, commercial block | Restaurant silhouette/interior and road layout are approximate |
| Salty Springs | Five houses, streets and gas station | Basement networks and source-specific house layouts are missing |
| Dusty Depot | Three separately colored, enterable warehouses, crates, yard and truck | Roof geometry, warehouse orientation/spacing and exact props differ |
| Loot Lake | Shallow slow-traversal water, central house island, smaller islands, docks and shoreline structures | Shoreline, islands, factory placement and lakebed are approximate; no original water shader |
| Tomato Town | Pizza Pit, tomato head, gas station, surrounding buildings and tunnel structure | Restaurant shape and tunnel traversal are simplified; the terrain does not reproduce the original tunnel cavity exactly |
| Anarchy Acres | Farmhouse, red barn, sheds, silos, fields, windmill, fences, hay | Shares a farm layout kit with Fatal Fields; the original distinct arrangement is not fully reconstructed |
| Fatal Fields | Farmhouse, barns/sheds, tilled rows, crops, silos, windmill | Field boundaries, barns and interior plans are approximate; shares the farm kit |
| Wailing Woods | Dense tree region, traversable hedge maze, central cabin, loot | Hedge plan is an authored approximation, not the historical maze layout |
| Lonely Lodge | Lodge buildings, tall wooden lookout, stairs and wooded surroundings | Log construction, lookout supports, paths and terrain differ |
| Moisty Mire | Low wetland, large trees, shallow pools, wooden walkway and shack | Swamp channels, tree density, prop distribution and nearby prison layout differ |
| Flush Factory | Industrial buildings, chimneys, tanks, pipes and service yards | Factory footprint, toilet production props and complete industrial interiors are not reproduced |
| Shifty Shafts | Lower excavated mine floor, timber supports, ceiling, rail tracks, crates, chests and stair approach | Mine tunnel network and exact entrances are simplified; terrain seams remain possible |
| Snobby Shores | Five separated residential properties, mixed roofs/materials, pools and fences | The five source houses' distinct silhouettes, basements and full plots are not accurately reproduced |
| Haunted Hills | Stone church/tower, graveyard, tombstones and smaller stone structures | Church silhouette and crypt interiors are approximate |
| Junk Junction | Scrap cars and stacks, warehouses, fenced yard | Vehicle piles, crane/machinery and exact scrapyard layout are incomplete |
| Lucky Landing | Red-framed plaster buildings, pagoda-style roofs, cherry tree courtyard and lanterns | Roof curvature, courtyard plan, interiors and individual building silhouettes differ |

Selected unnamed landmarks include a prison, an industrial area northeast of Flush, an indoor soccer structure, isolated houses, campsites, bridges, an RV park and a dirt track. **The complete original set of unnamed landmarks, terrain paths and isolated structures is not present.**

## Visual assets and rendering

- Authored replacement building parts, weapons, vehicles, vegetation, props, glider and Battle Bus; no extracted Fortnite models or textures.
- Textured brick, boards, roofing, metal, floors, grass and foliage; directional sunlight, atmosphere, distance fog, shadows and sky.
- Enterable doors/windows, floors, stairs, simple furniture, sleeping areas, kitchens, stores and roof spaces in the modular buildings. Stair flights and upper-floor openings are aligned, including the lookout cabin. Stair access into pitched-roof attics is not provided; flat roofs are reached by stairs.
- Three original authored characters, Ranger, Kestrel and Breaker, with different geometry, outfits and hair, articulated joints, and custom movement, swing, jump, drop, glide, reload and healing animation. No third-party character models or clips are used. They remain stylized replacements and do not reproduce the original skins exactly.
- Environmental geometry is instanced into spatial batches. Furniture, pickups, signs, bots and distant batches use visibility ranges. Tree canopies switch to lower-detail geometry beyond 220 units. **There is no network asset streaming or sophisticated mesh LOD system:** local asset files load at startup.
- Fidelity remains substantially below the requested original-game standard. Terrain silhouettes, water, models, vegetation density, urban density, interiors, facial detail and animations require further art work.

## Building and destruction

Implemented: walls, floors, ascending ramps and raised roof pieces; 5.12-unit grid and 3.84-unit walls; 90-degree rotation; placement ghosts; ten-material costs; wood/brick/metal models and generated sounds; rapid construction stages and health, completing in 0.28/0.40/0.55 seconds for wood/brick/metal; a supported subset of edits; two-material repairs; damage; structural connectivity and collapse.

Limitations: snapping is to a global grid, not the original island's full architectural grid; placement overlap and support rules are simplified; edit selection uses an overlay; ramp edits only support half-width forms; roof edits omit quarters rather than implementing all historical shape transformations. Build timing, health tuning, damage appearance, animation and sound are approximations. There is no trap system.

Trees, rocks, vehicles, chests, modular wall/floor parts and player builds can be damaged and harvested. Removed parts stop colliding. Some decorative elements, standalone landmarks, roof accents, fences and terrain are not fully destructible or do not propagate support exactly. Building collapse uses broad building support checks. Loot has simplified falling behavior; chests and all props do not have full physics. Terrain cannot be excavated.

## Combat and inventory

Implemented: third-person movement, shoulder camera collision, aim, jump, run, crouch, harvesting, health, shields, five equipment slots plus pickaxe, pickups, chest searching, ammunition, reloads, recoil/spread, hitscan fire, sniper/hunting projectiles, rockets/explosions, healing, inventory reordering and dropping.

Available families: assault rifle, burst rifle, SCAR-style rifle, pump/tactical shotguns, SMG, pistol, hand cannon, scoped sniper, hunting rifle, rocket launcher, small/large shields, bandages, medkit and Chug Jug. This is **not the complete v3.1.0 rarity/weapon/item table**. Grenades, traps, supply drops, crossbow, minigun, suppressed/scoped variants, bush disguise and several period items are absent. Damage, spread, projectile speed, reloads, healing and drop probabilities are not fully historically verified. There is no exact original hitbox or animation system.

No sprint meter, sliding, mantling, swimming strokes, drivable vehicles, modern weapons or unrestricted glider redeploy. Water slows walking; it does not enable later swimming mechanics. Movement values and water behavior are approximations.

## Match flow, bots and menus

Implemented: lobby → waiting island → Battle Bus → drop → glide → landing → loot/combat/build/storm → elimination or victory → results → replay. Spectating supports living bots and switches after elimination. Quick and longer storm schedules are available.

The player and all bot passengers travel on the bus. Bots jump at staggered route positions, fall, deploy gliders, steer toward landing targets and land on actual terrain or rooftops before looting and fighting. Their flight simulation continues after the player jumps. Up to sixteen visible waiting-island characters walk, jump and swing before boarding. Their navigation combines local grid search and steering, with door interaction, nearby loot collection, combat, basic building and storm goals. They can become stuck or make poor choices in complicated interiors, mines, steep cliffs and multistory buildings. Bot ammunition, healing/shield acquisition, aiming and weapon attacks are simplified. Bot health, loot and combat are real simulation state; no prerecorded gameplay is used.

**No multiplayer/networking exists.** “99 bots” means 99 browser-local opponents, not connected players.

Menus include mode selection, inventory, settings, map/minimap, compass, health/shield, hotbar, materials, elimination feedback, victory/results, local profile/challenges and a three-character locker. Settings and local statistics persist. Item Shop, historical Battle Pass rewards, Epic account linking, matchmaking, friends/parties and purchases are clearly marked unavailable. Lobby composition uses period-inspired typography/colors over the game scene; it is not the original Season 3 lobby background or exact interface.

## What is still required for the user's full target

The remaining work is substantial: exact v3.1.0 map and terrain reconstruction; distinct, verified layouts and assets for every location; complete original interior plans and unnamed landmarks; much higher-quality characters, vehicles, weapons, foliage, architecture, effects and animations; exhaustive building/edit/support/destruction rules; the complete historical item pool and tuning; stronger navigation and landing decisions for bots; accurate period menus; robust streaming/LOD; and a broader performance and gameplay test matrix. This delivery must not be described as that completed target.
