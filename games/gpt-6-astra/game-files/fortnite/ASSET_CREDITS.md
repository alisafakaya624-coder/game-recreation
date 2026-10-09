# Asset credits

## Runtime library

Three.js **r170** and its BufferGeometryUtils are vendored locally in `vendor/` under the MIT license. See `vendor/THREE-LICENSE.txt` and [Three.js](https://github.com/mrdoob/three.js/tree/r170). Imports were adjusted to use the local module.

## Original characters and animations

Ranger, Kestrel and Breaker were authored for this game in `src/avatars.js`. They have distinct body proportions, facial geometry, hair, clothing, equipment and colors. Every body mesh and joint rig is generated from original code. There are no downloaded character models, third-party character textures, imported skeletons or animation clips in the active game or viewer packages.

Movement and action poses are authored in `src/avatars.js` and `src/character.js`: idle breathing, walking, running, crouching, jumping, falling, gliding, aiming, reloading, healing and pickaxe windup/strike/recovery. Two-bone arm posing keeps hands on the equipment. Distant airborne bots use a simpler original silhouette. These designs and animations are replacements, not exact copies of Fortnite's original skins or clips.

The pickaxe has an authored curved wooden shaft, beveled asymmetric metal head, collar, rivets, wrapped grip and end cap. No character model or animation file is loaded at startup.

## Generated foliage

- Runtime file: `assets/foliage.png`.
- Method: OpenAI's built-in ImageGen tool, one new seamless texture; no Fortnite image was used as an edit input.
- Copied into the game and applied to authored canopy geometry.

Prompt:

> Use case: stylized-concept
>
> Asset type: seamless foliage diffuse albedo texture for a browser game, to wrap around organic tree canopy lobes.
>
> Primary request: Square seamless repeating albedo texture covering the entire image, dense clusters of small rounded oak leaves, hand-painted stylized 3D game foliage, rich olive-green and yellow-green leaves with restrained cool dark green recesses, original Chapter 1 Fortnite-inspired broadleaf art direction.
>
> Composition/framing: A flat texture tile, uniform leaf scale throughout, full edge-to-edge coverage with seamless repeating edges on both axes.
>
> Constraints: No trunk, no isolated tree, no sky, no transparency, no ground, no text, no directional cast shadows, no vignette, no panel borders. Generate exactly one texture.

## Authored replacements

Terrain, architecture, building pieces, weapons, vehicles, vegetation geometry, glider, bus, props, procedural canvas materials, map drawing, interface, and synthesized audio were authored for this browser build. They are replacements, not Epic's extracted assets. The default fonts are system fonts. The reference screenshots and footage are not bundled as game backgrounds or gameplay.

Fortnite names and branding identify the fan reconstruction's subject. This is an unofficial local game with no Epic account connection, purchases or endorsement.
