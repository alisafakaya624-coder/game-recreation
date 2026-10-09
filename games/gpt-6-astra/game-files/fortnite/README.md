# Chapter One — playable browser reconstruction

This is a local 3D battle royale game targeting the **original 2018 Chapter 1 Season 3, v3.1.0** island. It includes all nineteen requested location names and playable representations, an offline Solo match against bots, and an Explore mode.

**This is not a complete, visually faithful reproduction of Fortnite.** The island, architecture, characters, animations, historical tuning, and several systems are approximations. See [FEATURE_COVERAGE.md](FEATURE_COVERAGE.md) for the material gaps against the requested scope. No real multiplayer is implemented.

## Launch

Use START GAMES in the top-level package folder, then choose this game.
The runtime is included. No installation is needed.

## Play

Choose **PLAY** for a Solo match. The waiting phase lasts 10 seconds, followed by the Battle Bus. Press Space to jump, steer toward a location, land, search chests, and survive the storm. All opponents run locally.

Choose **CHANGE → EXPLORE** for immediate access to Tilted Towers with weapons and materials. Press M to open the island map; Explore mode has a location selector and Travel button. It has no storm or opponents and does not award match results.

Click the game to capture the mouse. If the in-app browser denies pointer lock, hold the right mouse button and drag to look, or use the arrow keys. Escape opens the menu or releases the mouse. Local matches pause while a menu, map, or inventory overlay is open.

| Action | Input |
|---|---|
| Move / run | W A S D / Shift |
| Look | Mouse; arrow keys or right-button drag as fallback |
| Jump / leave bus / deploy glider | Space |
| Crouch | Ctrl or C |
| Shoot / harvest / place build | Left mouse |
| Aim / change build material | Right mouse |
| Interact, open door, search chest, pick up | E |
| Reload / rotate build | R |
| Pickaxe | Backtick or 0 |
| Equipment | 1–5; mouse wheel |
| Build mode | Q |
| Wall / floor / ramp / roof | F1 / F2 / F3 / F4 |
| Edit / repair nearby player build | G / H |
| Confirm edit | Confirm button or G |
| Map / inventory | M / Tab or I |
| Menu | Escape |

The inventory supports drag-and-drop reordering and dropping an item. Select a healing item and use the fire control to consume it. Match pace, graphics, sensitivity, volume, character selection, and local statistics persist in this browser.

## Characters and responsiveness

Open **LOCKER** in the lobby to choose **RANGER**, **KESTREL** or **BREAKER**. Their models, rigs and animations are original code. Their silhouettes, hairstyles and outfits differ. The character choice is saved in this browser.

Waiting-island bots walk, jump and swing their pickaxes. All match bots board the bus, jump at different points, descend and deploy gliders. Looting and fighting begin after they land. No bots start on the main island before the bus flight.

Building responds immediately and reaches full construction health in **0.28 seconds for wood, 0.40 for brick and 0.55 for metal**. This faster timing follows the requested play preference and differs from the historical game's timing. Pickaxe hits occur during the strike portion of the custom swing.

The interior stairs use open flights and floor cutouts. Small towers have clear landings, the prison and onshore isolated homes have level foundations, and the lookout stairs enter the top cabin through an open floor.
