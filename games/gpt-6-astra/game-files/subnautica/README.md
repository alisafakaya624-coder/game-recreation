# Subnautica: The Crater — browser adaptation

**A playable, condensed adaptation, not a complete recreation of the original game.** It has an explorable ocean, survival, crafting, scanning, construction, three vehicles, saving, and a shortened story with a launch ending. Its replacement models, geography, interiors, ecology, audio and content coverage fall short of the requested original-game fidelity and completeness. Read [COVERAGE.md](COVERAGE.md) before assessing it as a benchmark.

Reference target: **original Subnautica, PC/Steam 1.0, released 23 January 2018**. No Below Zero content is intentionally included. The release date is documented by [Unknown Worlds](https://unknownworlds.com/en/news/subnautica-xbox-one-launch-plans). Many detailed values have not been verified against an archived 1.0 installation; the [reference ledger](REFERENCES.md) states what was actually checked.

## Launch

Use START GAMES in the top-level package folder, then choose this game.
The runtime is included. No installation is needed.

## First expedition

You begin in the water beside Lifepod 5. Return to the surface or enter the lifepod to refill oxygen. The white/orange pod's underside is the interaction point; look at it within reach and press **E**.

Gather the visible mineral and mushroom samples nearby. Three titanium craft a standard oxygen tank. One copper and two acid mushrooms make a battery; that battery plus titanium makes a scanner. Use the lifepod fabricator, then equip the tank or select tools in **Tab → Inventory**. Equipment in your inventory is not automatically equipped.

The repair tool needs titanium, cave sulfur and silicone rubber. Creepvine seed clusters in the nearby kelp make rubber. Repair the radio by interacting with it while carrying the repair tool. The radio enables distress signals. Follow the PDA's **Survival log**, scan fragments, build a mobile vehicle bay and progress into deeper water. There is no conventional in-game world map.

The in-game Survival log gives the adaptation's progression route and resource requirements. It includes additional guidance that is not part of the original interface. Full story spoilers and practical route notes are in [WALKTHROUGH.md](WALKTHROUGH.md).

Creative starts with exploration equipment, all supported blueprints and no survival costs. It is useful for inspecting the world. Survival includes food, water, oxygen and health; Freedom omits food and water loss; Hardcore uses permanent death and suppresses oxygen warnings. These modes approximate their original counterparts.

## Controls

| Input | Action |
|---|---|
| Mouse / arrow keys | Look |
| W A S D | Swim or walk |
| Space / C | Ascend or descend; Space powers Prawn thrusters |
| Shift | Swim faster |
| E | Interact, gather, enter a vehicle; E in Cyclops opens its interior |
| Q | Exit a vehicle or shelter |
| Left mouse | Use tool; hold to scan, repair, cut or drill |
| 1–5 | Select a quick slot; select additional tools in Inventory |
| Tab | PDA, inventory, equipment, blueprints, databank, log and signals |
| B | Habitat builder catalogue, if carrying a builder |
| Left / right mouse during preview | Place / cancel a construction preview |
| R | Exchange a battery/power cell; rotate a construction preview |
| F | Flashlight or vehicle lights |
| X | Installed vehicle defense/shield |
| G | Installed Prawn grapple; press again to release |
| V | Cyclops silent running |
| H | Controls and key remapping |
| Escape | Close a panel or pause |
| F1 | Hide/show the HUD |

Construction uses nearby compartment connections. Build a compartment and a hatch before entering. Build equipment inside the compartment where you want to use it. Solar panels work near the surface during daylight; deep bases need other power. Lockers, fabricators, battery chargers, growth beds, hull reinforcement and repairs affect the simulation. Multi-level interconnected interiors and original docking behavior are not implemented.

Install vehicle modules from Inventory while beside the compatible vehicle. R prioritizes a nearby vehicle's power cell over handheld equipment. Bring spare cells before a long descent. The Seamoth, Prawn and Cyclops have different movement, power use and depth limits. Repair a vehicle from outside with the repair tool.

## Sound, settings and saves

Audio begins after a user gesture. Options provide separate master, effects, ambience, music and voice controls, subtitles, optional device speech, and a directional audio test. Headphones enable the intended HRTF cues. The supplied soundscape is synthesized; it does not use the original recordings. Human headphone/speaker listening and the requested horror quality have not been certified.

Pause → Save writes to one of three browser-local slots. Load Game offers load, export, import and delete actions. A previous valid save is kept as a backup. Save before leaving: there is no periodic autosave. The Neptune launch saves the pre-launch state so you can reload and keep exploring.

Saves are tied to the **browser, host and port**. Changing from `localhost` to `127.0.0.1`, changing ports or using another browser creates a different storage origin. Export important saves as JSON before clearing browser data. Export/import also works between browsers. Preferences persist separately.

Death in Survival/Freedom returns you to the pod. Newly gathered materials can be left in a recovery cache; tools and inventory retained at shelter are treated differently. This is a simplified rule, not an exact reproduction of original death behavior. Hardcore deletes the current local save on death.
