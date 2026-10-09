# Elden Ring browser interpretation

This is an offline, playable fan interpretation targeting the **PC / Steam base game, App 1.10 and Regulation 1.10**. It is **not a complete Elden Ring recreation**, and it does not meet the requested original-game visual or mechanical fidelity. The complete coverage and remaining work are in [COVERAGE.md](COVERAGE.md).

The game contains a connected opening Limgrave area, 30 compressed location scenes, 30 simplified named boss encounters, equipment and leveling, persistent saves, and six condensed ending branches. Shadow of the Erdtree and Nightreign are excluded.

## Launch

Use START GAMES in the top-level package folder, then choose this game.
The runtime is included. No installation is needed.

## Controls

| Input | Action |
|---|---|
| WASD | Move |
| Shift | Sprint |
| Drag the world with the mouse, or arrow keys | Free camera |
| Mouse wheel | Camera distance |
| Left mouse click or J | Light attack |
| Hold K, then release | Heavy / charged attack |
| Space | Dodge; neutral input performs a backstep |
| C | Jump; a second press gives Torrent a double jump |
| X | Crouch |
| Q or right mouse | Guard |
| K after a successful guard | Guard counter |
| V | Parry with a one-handed shield |
| B | Weapon skill |
| F | Selected sorcery or incantation, with the required catalyst |
| Tab / Z | Lock target / change target |
| E | Interact, rest, collect, talk, or travel |
| R / 3 | Use flask / switch crimson and cerulean flasks |
| 1 / 2 | Cycle weapon / spell |
| Y | Toggle two-handed grip |
| T | Summon or dismiss Torrent after Melina's accord |
| G | Summon Spirit Ashes during an encounter, after acquiring the bell |
| I / M / H / Escape | Equipment / map / help / menu |

Menus generally leave combat running. Resting at grace is safe. Map access and fast travel are blocked during combat. This build requires keyboard and mouse; it has no gamepad or touch controls.

## First journey

Start at the First Step. The ruined Church of Elleh is down the slope to the north and slightly west. Rest inside, talk to Kalé, and find the smithing table. Follow the route northeast through the trees to Gatefront.

The camp has a map stele beside the road, a greatsword at a carriage, and an open cellar with the Whetstone Knife. Rest at the Gatefront grace and accept Melina's accord to unlock leveling and Torrent. From there, follow the road northwest through Stormgate to Stormveil.

J makes camera steering and combat easier to combine than repeated mouse clicks. Lock on with Tab. Watch for an enemy's windup, dodge through the swing, then attack during recovery. Heavy attacks and guard counters break stance. Walk close and use a light attack for the critical follow-up.

## Campaign and ending paths

This is the build's compressed progression, not a guide to the original game:

- Stormveil leads through Margit and Godrick into Liurnia. A cliffside bypass also connects Limgrave to Liurnia.
- Find the glintstone key at the western lake rocks to enter Raya Lucaria. Rennala grants a second Great Rune.
- The Dectus halves are pickups in eastern Limgrave and Dragonbarrow. The lift in Liurnia opens Altus Plateau.
- Two Great Runes plus the Draconic Tree Sentinel unlock Leyndell. Morgott opens the Rold route to the Mountaintops.
- Fire Giant opens the Forge transition to Farum Azula. Maliketh changes the capital to its ashen scene.
- Defeat Gideon, Godfrey, Radagon, and Elden Beast in the ashen scene. Interact near the northern altar to select an available ending.
- Ranni's condensed branch runs through Caria Manor, Radahn, Nokron's Mimic Tear, Nokstella, and Astel. Fia requires Fortissax. Goldmask requires Corhyn and Morgott. Dung Eater requires Mohg the Omen. The Three Fingers commit the save to Frenzied Flame. See the Journey menu for current flags.

Optional connections include Weeping Peninsula, Redmane, Mt. Gelmir and Volcano Manor, Siofra, Ainsel, Deeproot, Castle Sol, Consecrated Snowfield, Haligtree, Elphael, and Mohgwyn.

## Saves

The browser saves every eight seconds during play, at grace, and after important changes. It stores the character, attributes, equipment, upgrades, materials, flasks, discovered graces, fragments, defeated bosses, quest flags, dropped runes, current location, and ending.

Use **System → Export save** for a portable JSON backup. **Import save** validates and restores it. A new journey replaces this build's browser save. Clearing browser site data removes local progress. Saves are specific to the browser and local URL origin, including the port.
