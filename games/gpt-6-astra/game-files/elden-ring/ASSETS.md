# Assets and replacements

All runtime assets are local. There are no extracted FromSoftware meshes, textures, animations, voices, music or proprietary game-data files in this build. Names and setting references identify the fan interpretation; they do not imply affiliation.

## Third-party assets

| Asset | Source | License | Local use |
|---|---|---|---|
| Three.js r170 | https://github.com/mrdoob/three.js/tree/r170 | MIT, included in `vendor/THREE-LICENSE.txt` | WebGL renderer and math |
| Mossy Stone Wall | https://polyhaven.com/a/mossy_stone_wall | CC0 1.0 | Substitute ruined masonry |
| Aerial Grass Rock | https://polyhaven.com/a/aerial_grass_rock | CC0 1.0 | Substitute ground surface |
| Mossy Rock | https://polyhaven.com/a/mossy_rock | CC0 1.0 | Substitute boulders and cliff fragments |
| Bark Brown 02 | https://polyhaven.com/a/bark_brown_02 | CC0 1.0 | Substitute tree bark and wood |

Each texture set includes the 1k diffuse, OpenGL normal and roughness JPGs. The twelve files passed MD5 checks against Poly Haven's API manifests during collection. [Poly Haven's license page](https://polyhaven.com/license) states that its assets use CC0. Direct file URLs and verification details are in `assets/asset-manifest.json`.

## Original substitutes

- All terrain, architecture, armor, weapons, creatures, props and animated forms are procedurally authored in this project's code. They are approximations, not original asset replicas.
- Tree canopies, ground-cover blades, cloak weave/trim, metal wear, sky/cloud shading, the Erdtree, particles, spell effects and map diagram are generated locally.
- All sounds are synthesized with Web Audio. Original music, voice acting, enemy recordings, weapon Foley and menu sounds are absent.
- HUD icons are replacement canvas drawings or system glyphs. Georgia/Times New Roman and system sans-serif fonts replace the original typefaces.
- NPC dialogue and item summaries are newly written, condensed text. They do not reproduce the complete original scripts.
- The supplied screenshots and additional location screenshots were used for reference only. They are not runtime textures, traced collision maps or the rendered game world.

The original implementation code is supplied for the user's project. Third-party asset rights and trademarks remain with their respective owners. The MIT notice applies to the bundled Three.js library; Poly Haven textures retain their CC0 dedication.
