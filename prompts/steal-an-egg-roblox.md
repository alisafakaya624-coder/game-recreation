# STEAL AN EGG — Full One-Shot Recreation Prompt (Roblox / Luau)

> **How to use this prompt.** Give this whole document to the building AI, together with the `reference/` image folder (and optionally the `.mp4` clips) that ship with it. Every image is referenced by filename in **§22 Reference Media Index**. Numbers tagged **[VERIFIED]** were read directly off the live game (screenshots taken 2026‑09‑29) or official Roblox APIs. **[SOURCE]** means the community wiki, guide sites, or dozens of YouTube videos agree on it. **[DESIGN]** means the real value is hidden server-side, so this document gives a tuned implementation value that reproduces the observed behaviour. Keep **[VERIFIED]** and **[SOURCE]** values exactly. **[DESIGN]** values are tuning knobs: expose them in one `Config` module.

---

## 0. YOUR MISSION

You are an expert Roblox game developer (Luau, Roblox Studio, server-authoritative architecture, UI design). Build a **complete, playable, faithful recreation of the Roblox game "Steal An Egg"** (place 107778070777162, created 2026-07-25, peak 14.3M concurrent players). Build it in **one pass**, entirely from code, so it runs when the place is opened and Play is pressed.

Hard requirements:
1. **Everything is generated from scripts.** Build the map, walls, nests, plots, pens, treadmills, signs, hub buildings, guardians, eggs and pet models procedurally at server start (`WorldBuilder`, reading `MapSpec`). Nothing may depend on hand-placed parts, so the build is reproducible. **The only uploaded assets allowed are the Codex-generated UI art pack (§17.15)**, mapped in `Assets.luau`. Every element that uses an art-pack image must have an asset-free fallback (see "Asset-free techniques" below), so the game still runs correctly with an empty `Assets.luau`. No other uploaded assets: no Animation, Sound, Decal, Image or Mesh uploads. Use Parts / WedgeParts in a Unions-free voxel style, `SurfaceGui` and `BillboardGui`. Color surfaces with solid colors, a checker made from alternating parts, or a `SurfaceGui` grid. Use `Texture` instances only with built-in Roblox texture ids you are sure of.
2. **Server-authoritative.** All money, speed, eggs, pets, purchases, steals, hits and timers are validated on the server. Clients only render and request.
3. **Persistent data** via `DataStoreService` with session locking, autosave and `BindToClose`.
4. **Full UI** matching §17 (HUD, Shop, Pet Index, Growing Eggs, Pets, Sell, Trails, Fuse, Treadmill board, Pen board, notifications, announcements, and the Roblox player list fed by `leaderstats`).
5. **Monetization plumbing** through `MarketplaceService` (game passes plus developer products with `ProcessReceipt`). Use placeholder IDs in a `Products` config. Make every Robux feature testable in Studio via a test flag that only works inside Studio (§14).
6. **Use Codex native image generation** for the map concept images and the UI art pack, and verify the built map with **fresh-context subagents** (§0.4–0.5). Deliver `map_concepts/`, `ui_assets/` and `verification/map_report.md` with the code.
7. Deliver a **Rojo-compatible file tree** (below). If you have Roblox Studio MCP tools, create the same hierarchy directly in Studio instead. Both are acceptable.
8. Code quality: typed Luau (`--!strict` where practical), modules, no deprecated APIs (`task.wait`, `task.spawn`, not `wait`/`spawn`), and `RemoteEvent` rate limits.

**Asset-free techniques (mandatory).** Use these for all animations, belt scrolling, sounds and particles, because no uploaded asset exists for them. Use them for icons too, as the fallback whenever an art-pack id (§17.15) is missing:
- **Icons:** emoji TextLabels (🛒 📖 👟 💵 🐾 🧪 🌙 ☀️ 🗑 🎁 ⭐) or Frame compositions.
- **Robux symbol:** `utf8.char(0xE002)` in a TextLabel. Verify it renders in Studio; if not, use a hexagon made of two rotated Frames.
- **Button texture:** omit the "L/stud" overlay.
- **Treadmill belt:** alternating thin dark stripe parts moved by CFrame every frame (no Texture scrolling).
- **Poses and motion:** the arms-up carry pose, guardian bites/swings/walks and pet walks use client-side `Motor6D.Transform` / CFrame math in `RunService.Stepped` (no Animation assets).
- **Treadmill run:** keep calling `Humanoid:Move(forward)` while an `AlignPosition` holds the root part at the belt center, so the default Animate script plays the run cycle.
- **Particles:** use the built-in default ParticleEmitter texture.
- **Sounds:** any `SoundId` left empty in Config is skipped silently. Built-ins you may try: `rbxasset://sounds/electronicpingshort.wav`, `rbxasset://sounds/swordslash.wav`, `rbxasset://sounds/swordlunge.wav`, `rbxasset://sounds/button.wav`, `rbxasset://sounds/clickfast.wav`, `rbxasset://sounds/snap.wav`, `rbxasset://sounds/action_jump.mp3`, `rbxasset://sounds/uuhhh.mp3`.

### 0.1 Required file tree
```
default.project.json       -- Rojo mapping (below)
src/
  ReplicatedStorage/
    Shared/
      Config.luau            -- ALL tunables ([DESIGN] numbers) + feature flags
      Zones.luau             -- §3 zone table
      PetData.luau           -- §21 appendix A (every pet), generated table
      PetVisuals.luau        -- §21 appendix A2 (ModelFactory looks)
      LimitedEggs.luau       -- §21 appendix B
      Rarities.luau          -- §21 appendix C (order, colors, glow)
      Mutations.luau         -- §21 appendix D
      Treadmills.luau        -- §21 appendix E
      Trails.luau            -- §21 appendix F
      SpeedMultipliers.luau  -- §21 appendix G
      PenLevels.luau         -- §21 appendix H
      Products.luau          -- §21 appendix I (Robux ids/prices)
      Formulas.luau          -- income, weight, grow time, walk speed, guardian speed, number formatting
      NumberFormat.luau      -- K/M/B/T/Qa/Qi/Sx formatting (§4.9)
      Remotes.luau           -- creates/returns all RemoteEvents/Functions
      MapSpec.luau           -- §0.5 M2: every map element (position/size/color), the ONLY input of WorldBuilder
      Assets.luau            -- §17.15: generated UI art -> rbxassetid map (with fallbacks)
      ModelFactory.luau      -- voxel builders for eggs, pets, guardians (§20)
  ServerScriptService/
    Main.server.luau         -- boots services in order
    Services/
      DataService.luau
      WorldBuilder.luau      -- builds the whole map (§2, §3)
      PlotService.luau       -- plot assignment, pens, placement, hatching, income, offline pile
      CycleService.luau      -- global 5-min day/night + egg reset (§5)
      SpawnService.luau      -- nests, global deterministic egg rolls, announcements
      CarryService.luau      -- pickup, carry, drop, steal completion, safe zone
      GuardianService.luau   -- guardian AI (§7)
      CombatService.luau     -- bat, traps, ragdoll/knockback (§10)
      TreadmillService.luau  -- steps -> speed (§9)
      ShopService.luau       -- cash purchases (treadmills, trails, pen, slots), Robux receipts
      IndexService.luau      -- discovery, rewards, bat skins
      SellService.luau, FuseService.luau
      BoostService.luau      -- timed boosts, friend boost, x2 money
      LeaderboardService.luau -- leaderstats (Money/s, Speed) + OrderedDataStore world boards
      TutorialService.luau
      EventService.luau      -- Phase 2 live events (§15), feature-flagged
  StarterPlayer/StarterPlayerScripts/
    Client.client.luau       -- boots controllers
    Controllers/ HUDController, ShopUI, IndexUI, EggsUI, PetsUI, SellUI, TrailsUI, FuseUI,
                 BoardsUI, AnnouncementUI, CarryFX, TreadmillFX, CameraFX, SoundController,
                 TutorialUI, LeaderboardUI (world boards; fallback panel only, §17.6), InputController (mobile/console buttons)
  StarterGui/  (created from code by controllers; ScreenGuis with ResetOnSpawn=false)
map_concepts/   -- Codex concept images + README.md (prompts, attached refs)
ui_assets/      -- Codex UI art pack + README.md
verification/   -- captures/round_N/*, map_report.md (fresh-verifier JSON per round)
```

`default.project.json`:
```json
{
  "name": "StealAnEgg",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": { "Shared": { "$path": "src/ReplicatedStorage/Shared" } },
    "ServerScriptService": { "$path": "src/ServerScriptService" },
    "StarterPlayer": { "StarterPlayerScripts": { "$path": "src/StarterPlayer/StarterPlayerScripts" } }
  }
}
```

### 0.2 Build order (so each step is testable)
1. Config, data modules and `NumberFormat`; unit-check the formulas in §4 with asserts in Studio.
2. **Map pipeline §0.5:** M1 Codex concept images → M2 `MapSpec.luau` → M3 `WorldBuilder` (hub, 7 plots, safe zone, 12 lanes, walls, signs, nests) + geometry checks → M4 captures → M5 fresh-context verifiers, looping until every area passes.
3. `DataService` + `PlotService`: plot claim, pen, treadmill unlock.
4. `CycleService` + `SpawnService`: eggs appear in nests, with the reset banner.
5. `CarryService` + `GuardianService`: steal loop end-to-end.
6. Placement, growth, hatch, pets, income.
7. Treadmill/trails/multipliers; walk speed mapping.
8. Combat (bat, traps).
9. **UI art pack** via Codex (§17.15), uploaded and mapped in `Assets.luau`; then all UI. Optionally run M4–M5 on the UI screens.
10. Shop/Robux, Index, Sell, Fuse, Tutorial, Leaderboards.
11. Phase 2 events (feature-flagged off by default except Admin-Abuse boosts, which admins can trigger).

### 0.3 Acceptance test (run it mentally, then implement so it passes)
A new player joins → gets an empty plot (7 per server) → the tutorial arrows point to the Forest nests → the player holds **E** on an egg → the chicken guardian wakes with a roar and chases → the player crosses the **SAFE ZONE** line → "You stole an EGG!" → places the egg in the pen → the timer counts down → presses **E** "Hatch" → the pet pops out saying "Mama!", shows a billboard, walks around the pen and emits "+$1" popups → money ticks up → "Upgrade your Pen!" → the player buys base level 1 for $1K, which unlocks the treadmill → stands on it and sees "+2/step" → Speed rises → the Lake sign turns green at 900 → at 4:50 on the cycle clock night falls (10 s, walls up, everyone teleported home, eggs grow ×30), then "ALL EGG RESET!" and new eggs appear in every nest → rare spawns are announced server-wide. The Roblox player list (Tab) shows every player's Money/s and Speed from `leaderstats`. All data survives a rejoin.

### 0.4 NATIVE IMAGE GENERATION WITH CODEX (required tooling)
You have access to **OpenAI Codex CLI with native image generation** (feature `image_generation`, stable). Use it for two jobs:
- **(a) the map concept images** that drive the world build (§0.5, mandatory);
- **(b) the UI art pack** (§17.15).

If **you are Codex**, call your built-in image generation tool directly. Any other agent (Claude Code, Cursor, etc.) calls Codex headlessly from the shell, **one image per call**:
```bash
codex exec --skip-git-repo-check -s workspace-write -C "<output folder>"   "The attached images are real screenshots of the Roblox game Steal An Egg. Use your image generation tool to create ONE <aspect> image: <detailed description>. Match the screenshots' art style, colors and proportions. Save it in the current directory as <name>.png and reply with the saved path only."   -i "reference/<real screenshot 1>" -i "reference/<real screenshot 2>" < /dev/null
```
⚠️ **Put the prompt BEFORE the `-i` flags.** `-i` accepts multiple files, so a prompt placed after `-i` gets swallowed as another image path and Codex fails with "No prompt provided". This was verified on Codex CLI 0.150.1.

Rules:
- **Always attach real references with `-i`** (1–4 images from `reference/`, chosen per §22). References anchor the style and keep the concept faithful to the real game rather than a generic Roblox look.
- A call takes ~1 minute. Afterwards, **check the file exists and open/view it yourself** before relying on it. If it is off-target, regenerate with a corrected prompt (max 3 tries per image).
- If Codex errors with *"The '<model>' model requires a newer version of Codex"*, run `codex update`, or pass `-m <model>` using any slug listed by `codex debug models` (e.g. `-m gpt-5.6-sol`).
- **Expect drift:** in our test, a correctly prompted blueprint still put the treadmills behind the pens, used grey stone hub walls and moved SELL/Fuse to the back. Concept images guide *style and composition*; the §2/§3 numbers and the `reference/` screenshots always win.
- Keep every prompt you used: write them to the folder's `README.md` next to the images (filename → prompt → attached refs) so the verifiers (§0.5 M5) and a human can audit them.
- Generated images are **design targets and original UI art in the game's style**. Do not try to reproduce the real game's logo or copy its exact artwork pixel-for-pixel.
- If Codex is unavailable, say so in your output and continue: procedural UI shapes instead of the art pack, and the §2/§3 text alone as the map target. Verification (M4–M5) still runs against the `reference/` screenshots.

### 0.5 MAP PIPELINE: GENERATE → SPEC → BUILD → VERIFY (mandatory, do this BEFORE and AFTER `WorldBuilder`)

The map must match the real game as closely as possible. Follow these five stages in order.

**M1 — Generate the map concepts with Codex** (save to `map_concepts/`):

| File | Aspect | What to generate | Attach with `-i` |
|---|---|---|---|
| `00_world_blueprint.png` | 16:9 | Top-down orthographic level-design blueprint of the WHOLE map, labeled. Hub (walled, 7 pens in a row with treadmills in front, SELL booth, Fuse Machine, TRAILS SHOP arch, FREE chest, leaderboard boards) → SAFE ZONE marker (black italic "SAFE ZONE" letters with a white outline painted on the grass, blue/white pill caps at both ends) → 12 end-to-end walled lanes in order (Forest … Angels & Demons), each tinted in its §3 floor/wall colors. At 75% of each lane's length, the sleeping guardian (at its §3.1 `guardianHeight`) lies at the center of 5 separate small straw nests (one egg each, ~10–14 studs apart). The speed sign stands at the lane entrance. | `guides/map_biome_map_eldorado.webp`, `guides/pvp_safe_zone_gameboost.webp`, `wiki/ui__ZONE_1.png`, `ingame/ingame_001_spawn_base_overview.jpg` |
| `01_hub_overview.png` | 16:9 | 3/4 elevated view of the hub: pen row, treadmills, Upgrade Pen boards, SELL, Fuse, Trails Shop, FREE chest, world leaderboard boards, the painted SAFE ZONE marker and the Forest lane mouth. | `ingame/ingame_001_…`, `ingame/ingame_frame_pets_in_pen_income_popups.jpg`, `guides/fuse_machine_ign.webp`, `youtube_storyboards/NqQ3999exGQ_fresh_account_hud_00.jpg` |
| `02_pen_closeup.png` | 4:3 | One plot close-up: fenced pen (level-1 wood), treadmill with black screen panel, Upgrade Pen board, Unlock board. | `wiki/ui__Pen_the_enclosur_idk.png`, `wiki/ui__New_treadmill.png`, `guides/treadmill_base_eldorado.webp` |
| `10_forest.png` … `21_angels_demons.png` (12 files, numbered by zone order) | 16:9 | For each zone: the view from the lane entrance looking down the lane, with walls, floor theme, props and the zone sign. Also show the sleeping guardian (Z z Z) at its §3.1 `guardianHeight` (e.g. the Forest chicken is 14 studs, about 3× the avatar), lying at the center of 5 separate small straw nests, each holding one themed egg, ~10–14 studs apart. Everything follows its §3 row. Angels & Demons needs 3 images: `21a_angels`, `21b_demons`, `21c_merged`. | that zone's `wiki/zone__*.png` + `wiki/guardian__*` or `guides/guardian_NN_*` + (if present) `guides/biome_*` |

Use the §3 table text verbatim inside each zone prompt, and add: "Roblox blocky studded-plastic style; a standard 5-stud-tall Roblox avatar in the scene for scale; lane 150 studs wide, walls 70 studs tall; bright daylight."

**M2 — Write `MapSpec.luau` before any building code.** It is a single data module listing every map element with **exact position, size, rotation, color and material**:
- hub walls and floor checker, plots and pens (per level), treadmills, boards, hub buildings;
- the painted SAFE ZONE marker and the night wall;
- per-lane walls, floor tiles, boundary strips, signs, the 5 straw nests (one egg slot each), and the guardian's height, sleep pose and position at the center of its nests;
- every prop instance.

Derive the numbers from §2/§3 (they win whenever they conflict with a concept image) and use the concept images for everything the text leaves open (prop placement, composition, silhouettes, color balance). `WorldBuilder` must build **only** from `MapSpec`, so verifier fixes are data edits.

**M3 — Build.** Run `WorldBuilder`. Also run the automated geometry checks and fail loudly if any is false:
- lanes are contiguous, with no gaps or overlaps;
- each guardian territory equals its lane bounds;
- the safe zone covers the full hub front;
- no spawn point or nest intersects a part;
- a `PathfindingService:CreatePath()` path computes successfully from every plot to every nest (the center 60 studs of every lane are clear);
- walls have no holes;
- the part count stays within budget (target < 25,000 parts for the whole map; use MeshParts/unions sparingly and `CollisionFidelity = Box` for props).

**M4 — Capture the build from fixed cameras** into `verification/captures/round_<N>/`.
- **Tool:** if you have the Roblox Studio MCP, use `screen_capture` with `camera_position` / `look_at_position` in Edit mode, after running the builder via `execute_luau`. Otherwise use a Play-mode camera script + screenshot tool.
- **Camera set** (studs; the hub center is (0, 0, −115); lane k spans Z = 260·(k−1) → 260·k):
  - `world_topdown`: position (0, 2600, 1450), look at (0, 0, 1450). Use a high FOV or several tiles stitched.
  - `hub_34`: (0, 120, −330) → (0, 0, −60).
  - `hub_topdown`: (0, 400, −115) → (0, 0, −115).
  - `pen_close`: at the local plot, (plotX + 30, 25, plotZ + 45) → the plot center.
  - For each lane k: `lane_k_entrance` (0, 18, 260·(k−1) − 20) → (0, 5, 260·k); `lane_k_nest` (40, 22, 260·(k−1) + 175) → the center of the nest area, where the guardian sleeps (0, 2, 260·(k−1) + 195).
- Also capture one **player-height** shot per lane (0, 6, 260·(k−1) + 10) → (0, 6, 260·k) to judge scale.

**M5 — Verify with FRESH-CONTEXT subagents** (the builder is biased toward its own work, so it must not grade itself).
- Spawn **one verifier per area**, in parallel: the hub, each of the 12 zones (Angels & Demons forms count separately), and one whole-world verifier.
  - In Claude Code use the Agent/Task tool with a new agent. In Codex use a new `codex exec` session. Otherwise open a new chat.
- Each verifier gets **only**:
  - that area's concept image(s);
  - that area's real `reference/` images;
  - the verbatim §2/§3 text for that area (including its §3.1 `guardianHeight`);
  - that area's captures.
  - Nothing else: no conversation history, no code.
- **Verifier prompt (use verbatim, fill the brackets):**
  > You are a strict level-design QA reviewer with no prior context. Compare the BUILT captures of [area] against (1) the concept image(s), (2) the real game screenshots, (3) the written spec. Score each 0–10:
  > 1. overall layout & proportions;
  > 2. wall style/colors;
  > 3. floor theme/colors;
  > 4. props (types, count, placement, clear 60-stud run path);
  > 5. nests (5 separate small straw nests with one egg each, ~10–14 studs apart around the guardian, at 75% of the lane);
  > 6. guardian (species look, height ≈ its `guardianHeight`, sleeping pose, Z z Z, at the center of its nests);
  > 7. signage (zone name, recommended speed, placement);
  > 8. lighting/atmosphere;
  > 9. scale vs a 5-stud avatar;
  > 10. faithfulness to the real game's look.
  >
  > Return JSON only: `{"area": "...", "scores": {...}, "total": 0-100, "blocking_issues": ["..."], "fixes": [{"element": "...", "problem": "...", "change": "exact MapSpec edit with coordinates/sizes/hex colors"}]}`. Be concrete. Do not praise.
- **Pass rule:** `total ≥ 85` **and** no blocking issues.
  - Otherwise apply the fixes to `MapSpec`, rebuild, recapture (round N+1), and send the new captures to a **brand-new** verifier. Never reuse a verifier, so each judgment starts from fresh context.
  - Max **4 rounds** per area. If an area still fails, record why.
- Log every round to `verification/map_report.md`: area, round, score, issues, and the fixes applied. Include this report and the final captures in your deliverable.
- **Recommended:** run the same M4–M5 loop for the main UI screens (HUD, Shop, Pet Index, Growing Eggs, Pets) against `reference/ingame/*` screenshots once the UI is built.

---

## 1. THE GAME IN ONE PAGE

**Genre:** Simulation / Tycoon hybrid of "Steal a Brainrot" (base with units that earn money), "+1 Speed / Escape Tsunami" (train a Speed stat to reach farther zones) and "Grow a Garden" (growth timers, mutations, weekly admin events). **Server size: 7 players [VERIFIED API].** Genre label: Simulation → Tycoon. There are no rebirths, no trading, no codes, no private servers, and you cannot steal pets from other players' bases [SOURCE]. PvP happens only in the field: players bat or trap egg carriers to make them drop eggs, then grab them.

**Core loop**
1. **Train Speed** on your personal treadmill (each training tick adds "+N/step" = treadmill factor × (trail + Robux Speed Multiplier + boosts), see §4.6).
2. **Run** down one long straight line of walled biome lanes (12 zones, from Forest to Angels & Demons). Each zone has a **recommended Speed** sign (red if yours is lower, green if higher).
3. **Steal** an egg from the zone's nest (hold **E**). The sleeping **Guardian** wakes and chases the carrier; bigger eggs are heavier and slow you. If caught you are flung/ragdolled and drop the egg, and the guardian carries it back to the nest. Other players can bat you or trap you to steal it.
4. **Cross the SAFE ZONE line** at your base → "You stole an EGG!" → the egg goes to your egg inventory.
5. **Place** eggs in your **pen**. They **grow** (10 s to 18 h+, longer for bigger eggs; ×30 during the 10-second night; ×2 with a pass).
6. **Hatch** → a **pet** with a random **weight (kg)**, **gender (♂/♀)** and possible **mutation** (Silver/Golden/Rainbow…). Pets walk around your pen and earn **$/s** automatically.
7. **Spend money** on pen upgrades (+1 pet slot per level), treadmill tiers, trails, and the fuse machine. **Complete the Pet Index** for lump-sum cash + Speed rewards and bat skins.
8. Every **5 minutes** (UTC-aligned, synchronized across all servers) night falls for ~10 s: everyone in the field is teleported home, then **ALL EGGS RESET** and fresh eggs spawn. Rare spawns (Secret/Eternal/Divine) are **announced server-wide**.

**Progression pacing:** starting Speed is **10**, starting money **$0** [SOURCE]. The first treadmill costs **$1,000** [SOURCE]. Numbers escalate to Speed in the trillions and money in quadrillions (suffixes K, M, B, T, Qa) [VERIFIED/SOURCE].

**Art direction:** bright, blocky, **voxel "Minecraft-meets-Roblox" animals** built from cubes with pixel-like face details. The world has saturated green studded grass, tall **orange/brown checkerboard lane walls with a green top trim**, and a cartoon UI (fat rounded **Fredoka One** text with thick black outlines, bright green/cyan/red buttons). See `reference/official/*`, `reference/ingame/*`, `reference/wiki/*`.

---

## 2. WORLD LAYOUT (build it in `WorldBuilder`)

Everything lies on a single straight axis. **+Z points away from the base, toward deeper zones.** All sizes are in studs and are **[DESIGN]**, chosen to match the look in `reference/guides/map_biome_map_eldorado.webp`, `reference/wiki/ui__ZONE_1.png`, `reference/wiki/ui__Zone_all.png` and `reference/ingame/*`.

```
 Z=-230 ┌───────────────── HUB / BASE AREA (walled, 440 x 230) ─────────────────┐
        │ [spawn pad] [leaderboard boards]  [THE LAB/RIFT portal]  [FREE chest] │
        │ ┌Plot1┐┌Plot2┐┌Plot3┐┌Plot4┐┌Plot5┐┌Plot6┐┌Plot7┐   (pens + treadmills)│
        │  [TRAILS SHOP arch]        [Fuse Machine]     [SELL booth]           │
 Z=0    ╞══════════ SAFE ZONE marker (painted letters, ~4 deep) ════════════════╡
        │                 1. FOREST lane (width 150, walls 70 tall)             │  sign: "SPEED: DEFAULT"
 Z=260  ├───────────── thin boundary strip + zone sign ─────────────────────────┤
        │                 2. LAKE lane                                          │  sign: 900
        ...  (12 lanes, each 260 long)  ...
 Z=3120 └── 12. ANGELS & DEMONS lane → end wall (+ hidden waterfall shrine) ────┘
```

### 2.1 Hub / base
- **Floor:** bright green (`Color3.fromRGB(96, 200, 60)`) with a darker checker every 8 studs (`(84, 180, 52)`) and a studs-style surface. Walls around the hub are 70 tall with the same orange checker as the lanes.
- **7 plots** in one row across X, centered, 58 studs apart, at Z ≈ −120. Each plot contains:
  - **Pen:** a rectangular wooden fence (brown `(150, 90, 50)` rails, dark posts `(80, 50, 30)`, X-braced panels as in `reference/ingame/ingame_001_spawn_base_overview.jpg` backgrounds), with a double gate facing +Z. Level 1 inner size is **36 × 36**. Each pen level adds **+4 studs of depth** (the pen "goes back further" [SOURCE]), up to 36 × 80 at level 12. Fence color changes with level: wood (L1–4), iron grey (L5–7), gold (L8–10), diamond cyan (L11–12) [SOURCE: "regular ones are wooden… gold or even diamond"]. Some pens in `reference/guides/ui_growing_eggs_panel_grow_all_allthings.webp` show a purple fence; purple for L9–10 is acceptable.
  - **Treadmill** pad in front of the pen gate (toward the safe zone), rotated to face −Z so the runner faces the hub. It is locked until bought (a grey hologram with the sign "Unlock: [treadmill icon] $1K").
  - **Upgrade Pen board:** a black sign standing on two legs at the pen's front-left corner (see `reference/ingame/ingame_001_spawn_base_overview.jpg`). It reads `Upgrade Pen` (white), `Level 5 > Level 6` (green) and a red button showing a `$50B` price chip; the button is green when affordable. At penLevel 0 it reads `Upgrade Pen` / `Unlock Pen Level 1` / `$1K` (§8.3).
  - **Treadmill Upgrade board** next to the treadmill: `Upgrade` / `Level 5 > Level 6` / two buttons `[$3B] [R$199]`; at max `Level MAX`. The treadmill itself is locked until **base level 1** is bought ($1K).
  - An **owner billboard** above the pen: "[DisplayName]'s Pen", visible to everyone, plus a house icon that only the owner sees (created by a LocalScript).
- **SAFE ZONE marker** at Z = 0 across the full hub width (`reference/guides/pvp_safe_zone_gameboost.webp`, `reference/wiki/ui__ZONE_1.png`): a ~4-stud-deep strip of bold italic **black "SAFE ZONE" letters with a white outline**, repeated and painted on the grass. Build it as a SurfaceGui on a thin, CanCollide-false part lying on the floor (Z = 0 to −4), with a blue `(40, 120, 255)` / white rounded pill cap at each end. Everything at Z < 0 is the safe zone: no bat, no traps ("Cannot use items in safe zone."), and guardians never enter.
- **Hub buildings** (positions [DESIGN], all near the safe zone line so they're on the way):
  - **SELL booth:** a red/white striped awning on 4 thin grey poles, with a floating red **"SELL"** billboard and a glowing **sell circle** on the floor; stepping in opens the Sell UI.
  - **Fuse Machine:** a blue voxel machine with 3 chimneys, a glowing white screen with a "?" and a heart-light panel. Billboard: "Fuse Machine" (cyan) and "0/3" (white).
  - **TRAILS SHOP:** an arch with a sign; walking under it opens the Trails UI.
  - **FREE chest:** a red-and-gold treasure chest with a green "FREE!" billboard, right next to the TRAILS SHOP arch. It gives **+10,000 Speed once** after the player likes, favorites and joins the group [SOURCE]. In the remake, simply claim once; show text "Like + Favorite + Join the group for FREE 10K Speed!".
  - **World leaderboard boards** next to the treadmill row (tall blue-framed SurfaceGui boards listing names + values), global via `OrderedDataStore`: "MOST MONEY/s" [VERIFIED storyboard `reference/youtube_storyboards/NqQ3999exGQ_fresh_account_hud_00.jpg`; SOURCE WIKI leaderboards] and "MOST SPEED" [DESIGN], each showing the top 50 [DESIGN].
  - **Lab/Rift portal** (Phase 2): a purple crystal portal "THE RIFT", later "Dr. Scramble's Lab".
- **Spawn:** players spawn on their own plot. The first spawn walks through the hub.

### 2.2 Lanes (zones)
- **12 lanes**, each **150 wide × 260 long**, placed end to end from Z = 0 to Z = 3120. Each lane is bounded by **70-stud-tall walls** on both sides.
  - Wall texture: orange/brown **checkerboard** (`(214, 120, 64)` / `(190, 100, 52)`, 6-stud squares) with a **grass-green top edge** 3 thick. For zones with special themes, recolor walls (see the zone table). There are no walls between consecutive lanes (open corridor); a **2-stud lighter strip** on the floor marks each boundary.
- At each lane **entrance** (low Z end) put a **zone sign**: an orange/brown wooden post sign on the left side facing −Z showing the zone name and `Recommended Speed: 10K`. On each client, make the number **red** if that player's Speed < requirement and **green** otherwise [SOURCE]. Forest shows `SPEED: DEFAULT`.
- The **nest area** sits at **75% of the lane length**, centered in X. The **Guardian** sleeps at its center, curled up, with a floating blue **"Z z Z"** billboard that bobs, plus a snoring sound. Its size comes from the zone's `guardianHeight` (§3.1).
- Around the sleeping guardian sit **5 separate small straw nests**, one egg each (`reference/guides/guardian_10_cherry_blossom_ign.webp`). Each nest is a low ring of rotated thin tan/brown straw parts, radius ~3 studs; a bigger egg simply sits on top of it.
  - Place the 5 nests evenly on a ring around the guardian, with radius `R = max(9, 3 + guardianLength/2 + 4)` (guardianLength = the guardian's horizontal bounding-box length). Neighbouring nests end up ~10–14 studs apart (further apart for giant guardians).
  - If a cycle rolls a giant egg (up to 18 studs), push its nest outward along its ray until neighbouring eggs keep ≥ 2 studs of clearance.
- Scatter theme props along each lane from the zone table (hedge blocks, cacti, pyramid, ice crystals, lava cracks, bubbles, bones, planets, sakura trees, temple ruins, clouds/golden pillars). Keep the center 60 studs clear for running.
- **Night wall:** at the safe zone line, a **giant white wall** (full lane width, 90 tall) rises out of the ground at night start and sinks at day start [SOURCE: "giant white wall… once this wall comes back down all the eggs reset"].
- **End of map:** a closing wall at Z = 3120, decorated per the last zone.
- **Falling:** lanes are floored everywhere; add invisible kill-bricks only above walls ("the game kills you when you land on the barriers" [SOURCE]).

---

## 3. ZONES (biomes): order, speed gates, guardians, themes

Recommended speeds are **[SOURCE]**: the wiki, 30+ videos and in-game signs all agree. The recommended speed is **not a hard wall**. Anyone can walk in, but guardians will catch under-speed carriers (§7). **Pets per zone and spawn odds are in Appendix A.**

| # | Zone | Recommended Speed | Guardian (voxel model) | Floor | Walls | Props / mood |
|---|---|---|---|---|---|---|
| 1 | **Forest** | DEFAULT (0) | **Chicken**: white blocky chicken, red comb, yellow beak (14 studs tall, §3.1) | green grass checker `(96,200,60)/(84,180,52)` | orange checker, green top | hedge cubes (dark green), grass tufts, a few trees |
| 2 | **Lake** | **900** | **Swan** (early videos: goose): white, orange beak, long neck | grass with a large shallow blue pond `(70,150,255)` around the nest | orange checker | reeds, lily pads, rocks |
| 3 | **Desert** | **10,000** | **Scorpion**: tan/sand, big claws, raised stinger | sand checker `(236,205,130)/(222,190,115)` | sandstone-tinted checker | stepped **pyramid**, cacti, bones |
| 4 | **Jungle** | **40,000** | **Tiger**: orange with black stripes | dark green checker `(60,150,50)` | mossy green-brown | big leaves, vines, jungle trees, mud |
| 5 | **Snow** | **170,000** | **Yeti**: white fur, black horns/face, blue eyes (`reference/official/thumbnail_3_77977678889221_768x432.png`) | white/pale-pink checker `(240,245,255)/(225,230,245)` | icy blue-white | big **ice crystals** (cyan glass), snow piles, snowfall particles |
| 6 | **Volcano** | **700,000** | **Cerberus** (three-headed hellhound): black rock with lava-orange cracks, flaming heads | dark basalt `(35,35,45)` with glowing orange **lava crack** neon lines | charcoal with red glow | burnt trees, lava pools (damage-free), embers |
| 7 | **Abyss Ocean** | **2,500,000** | **Moby**: huge white blocky whale | deep blue sand `(30,60,140)` with caustic light | dark navy | **9 air-bubble domes** in triangle groups (decorative), coral, kelp; a hidden cave in the left wall (Phase 2) |
| 8 | **Prehistoric** | **18,000,000** | **T-Rex**: green (`reference/guides/guardian_08_prehistoric_trex_ign.webp`) | tan dirt `(200,170,110)` | brown rock | ferns, bones, a volcano backdrop, bushes |
| 9 | **Cosmic** | **700,000,000** | **Cosmic Skeleton Boss**: black crowned humanoid, angry skull face, white fur chest; talks/growls loudly | black/purple starfield checker `(40,20,70)/(55,30,90)` with neon star dots | dark purple | floating ringed **planets**, crystals, low gravity feel (visual only) |
| 10 | **Cherry Blossom** | **2,500,000,000** | **Oni Tiger** (some videos say Kitsune). Build it from `reference/guides/guardian_10_cherry_blossom_ign.webp`: a white fox-like beast with red swirl markings, a pink-tipped tail and a pink flame aura | pink/white checker `(255,200,220)/(250,225,235)` | pale pink | a **torii gate** at the entrance, sakura trees, drifting petal particles, the Sakura Incubator (Phase 2) |
| 11 | **Titan Temple** | **7,000,000,000** | **Gorilla King**: giant black gorilla with a gold crown; leaps | mossy stone `(90,110,80)` | dark stone with vines | stone ruins, torches, waterfall backdrop, temple steps |
| 12 | **Angels & Demons** | **20,000,000,000** | **Angel Guardian** (golden-armored winged knight with spear) or **Demon Guardian** (red/black winged demon) | Angel form: white marble + gold; Demon form: red volcanic rock | Angel: white/gold; Demon: black/red | floating sky islands, waterfalls, golden pillars / red spikes. **Every cycle the zone rolls its form**, identically on every server (§5.2): Angels 47.5%, Demons 47.5%, **Merged 5%** [DESIGN odds]. Merged has both guardians and both egg pools, with every non-Legendary weight ×2 ("extra luck"). A hidden **Secret Shrine** is behind the waterfall (Phase 2). |

Coming next in the real game (optional stub, Phase 3): **13. Enchanted Forest / Mystic** (crystal, moon, mushrooms, waterfall), announced for 2026-10-03.

### 3.1 Zone config shape (`Zones.luau`)
Shape only: this is one entry of the list; the real values for every zone come from the §3 table and the lists below.
```lua
{ id = "Forest", order = 1, recommendedSpeed = 0, minSpeedSmallEgg = 6, guardian = "Chicken", guardianHeight = 14,
  laneLength = 260, floor = {Color3.fromRGB(96,200,60), Color3.fromRGB(84,180,52)},
  wall = {Color3.fromRGB(214,120,64), Color3.fromRGB(190,100,52)}, props = {"Hedge","Tuft","Tree"},
  announceEmoji = "🌲", indexWeapon = "Forest Bat" }
```
- `minSpeedSmallEgg`: the lowest Speed that escapes with a normal-size egg (BlurryBacon's tested minimums). It is used only by the guardian speed model (§4.5); the zone sign still shows `recommendedSpeed`. Values: Forest 6 [DESIGN], Lake 1,200, Desert 9,500, Jungle 35,000, Snow 160,000, Volcano 560,000, Abyss Ocean 1.5M, Prehistoric 12.5M, Cosmic 275M, Cherry Blossom 1B, Titan Temple 3.6B, Angels & Demons 7.7B.
- `guardianHeight` (studs, bounding-box height) [DESIGN, from the reference renders]: Forest 14, Lake 16, Desert 12, Jungle 14, Snow 20, Volcano 18, Abyss Ocean 26, Prehistoric 30, Cosmic 24, Cherry Blossom 22, Titan Temple 34, Angels & Demons 26. The attack range (§7) and the nest ring around the sleeping guardian (§2.2) derive from it.

Emojis for announcements: Forest 🌲, Lake 🦢, Desert 🏜️, Jungle 🌴, Snow ❄️, Volcano 🌋, Abyss Ocean 🌊, Prehistoric 🦖, Cosmic 🪐, Cherry Blossom 🌸, Titan Temple 🗿. Angels & Demons uses the current form as the zone word: "Angels 😇", "Demons 😈", or "Angels & Demons 😇😈" when Merged [VERIFIED: in-game banner read "A Secret Pure Jellyfish Egg spawned in Angels 😇!"].

---

## 4. CORE FORMULAS (`Formulas.luau`)

### 4.1 Size (Scale), weight and pet income [SOURCE: decompiled client config published by stealanegg-wiki.com, consistent with the Fandom Income Calculator]
Every egg/pet has a hidden **Scale** (s). Displayed **weight = pet.modelWeight × s³** (kg). Scale 2 = 8× the reference weight; Scale 5 = 125×.
```
sizeFactor(s) = s^1.85                                   if s <= 5
              = 19.637875755794113 * (s/5)^1.2           if s > 5     -- continuous at 5; diminishing returns
mutMult       = 1 + Σ max(0, m.mult - 1)                  -- different mutations stack ADDITIVELY; each distinct mutation counts once
petIncome     = max(1, round(pet.income * sizeFactor(s) * mutMult * (x2MoneyPass and 2 or 1)))
liveIncome    = round(petIncome * serverBoost(admin 2x) * tempCashBoost(2x Cash Booster))
playerIncomePerSec = Σ equipped liveIncome * (1 + friendBoost)
```
Reference values: s = 1.26 (2× weight) → 1.53×; s = 2.15 (10×) → 4.14×; s = 4.64 (100×) → 17.1×; s = 5 → 19.64×; s = 10 → 45.1× [SOURCE, both sources agree].
- **friendBoost** = +10% per friend in the same server, +5% with Roblox Premium, shown under the money counter as "Friend Boost: +35%" [VERIFIED text in the HUD; the exact rule is DESIGN].
- **Egg preview income** (the inventory tooltip on unhatched eggs) uses the same formula.
- Examples of multi-mutation totals: Silver+Golden ×2.7, Golden+Rainbow ×5, Rainbow+Parasite ×5.5 [SOURCE].

### 4.2 Scale roll for spawned eggs [DESIGN; the real distribution is server-side]
```
local function gaussian(r) return math.sqrt(-2*math.log(1 - r:NextNumber())) * math.cos(2*math.pi*r:NextNumber()) end
u = rng:NextNumber()
if     u < 0.002 then s = rng:NextNumber(3.7, 6.7)      -- "Giant"  (50x-300x weight)   0.2%
elseif u < 0.017 then s = rng:NextNumber(2.15, 3.7)     -- "Huge"   (10x-50x)           1.5%
elseif u < 0.097 then s = rng:NextNumber(1.44, 2.15)    -- "Big"    (3x-10x)            8%
else                  s = math.exp(gaussian(rng) * 0.15)  -- normal: ~0.74-1.35
end
s = math.clamp(s, 0.6, rarityMaxScale[rarity] * zoneScaleFactor)
```
- `rarityMaxScale`: Common–Rare 6.7, Epic 5.8, Legendary 5.3, Mythic 4.9, Cosmic 4.6, Secret 4.3, Eternal 3.9, Divine 3.4 ("depending on how rare the animal is, the egg can only get so big" [SOURCE]).
- `zoneScaleFactor`: 1.0 for zones 1–8, 0.93 for Cosmic, 0.85 for Cherry and Titan, 0.8 for Angels & Demons ("areas very high up show lower kg" [SOURCE]). Limited eggs (Appendix B) use this same roll with `zoneScaleFactor = 1`.
- Admin "Egg Size Boost" multiplies s by ∛3 (×3 weight). Global hard cap: s ≤ 150 (config fusion cap).
- Display weight as `"1,688,125Kg"` (comma-grouped integer + `Kg`) [VERIFIED].

### 4.3 Grow (hatch) time [DESIGN fit to observed timers]
```
growSeconds = pet.growSeconds * (s >= 1 and s^1.95 or s)
```
(An admin 100×-weight Unicorn, s = 4.64, took 9d 23h against a 12 h base [SOURCE].)
- Growth credit per real second: 1 normally, **30 during night** (the config grants 300 s of growth credit spread over the 10 s night [SOURCE]), ×2 with the **x2 Growth** pass, ×1.25 with a growth boost. These multiply.
- **Eggs keep growing while the player is offline** at ×1 [SOURCE: confirmed by the fan-wiki owner].

### 4.4 Walk speed from the Speed stat [SOURCE: "the client converts Speed Power into movement speed with a curved formula"; exact curve DESIGN]
```
walkSpeed(speed) = math.min(16 + 9.5 * math.log10(1 + speed), Config.WALK_SPEED_CAP)   -- WALK_SPEED_CAP = 150
```
Examples: 10 → 25.9, 900 → 44.1, 10K → 54, 1M → 73, 1B → 101.5, 20B → 114, 1T → 130, 100T → 149.
- The cap of 150 is a [DESIGN] choice, kept in Config as `WALK_SPEED_CAP`. The real creator-panel slider went up to 300 ("WalkSpeed 300 ≈ normal max", ENY2@03:31).
- The server always applies `walkSpeed(effSpeed)`, where `effSpeed` (§4.5) includes the 1.25× Speed boost and the admin 2× Speed boost.
- **Carry slowdown:** each pet has an `eggWeight` field (1–10; Appendix A). While carrying:
  ```
  carryMass         = eggWeight * s^3
  carryWalk(player) = walkSpeed(effSpeed) * math.clamp(1 - 0.06 * math.log(math.max(carryMass, 1), 2), 0.45, 1)
  ```
  A normal Forest egg has no slowdown; a Scale-3 Cosmic egg drops to ~0.52× ("small eggs don't slow you, big eggs slow you a lot" [SOURCE]). JumpPower scales by the same factor. When not carrying, `carryWalk(player) = walkSpeed(effSpeed)`.
- **Slow Mode** HUD toggle [VERIFIED UI; behavior SOURCE]: "move at normal walking speed instead of your fast movement speed" (WalkSpeed 16) for precise positioning near eggs, shops and your pen. It does not change the Speed stat.
- The server sets WalkSpeed; the client never does. Re-apply on respawn, boost changes and speed changes.

### 4.5 Guardian chase speed (relative model) [DESIGN; the game compares your Speed against a configured guardian speed]
```
-- Zones.luau: minSpeedSmallEgg per zone (BlurryBacon tested minimum, §3.1):
-- Forest 6 [DESIGN], Lake 1200, Desert 9500, Jungle 35000, Snow 160000, Volcano 560000,
-- Abyss Ocean 1.5e6, Prehistoric 12.5e6, Cosmic 275e6, Cherry Blossom 1e9, Titan Temple 3.6e9, Angels & Demons 7.7e9
effSpeed      = player.Speed * speedBoostMult * adminSpeedMult
reqEff        = zone.minSpeedSmallEgg * math.max(s, 0.6)^1.8          -- egg size enters ONLY here
r             = math.max(effSpeed, 1) / reqEff
guardianSpeed = carryWalk(player) * math.clamp(r^(-0.3), 0.6, 1.75)   -- relative to the carrier's ACTUAL speed; recomputed every 0.2 s
```
- At `minSpeedSmallEgg` with a normal egg the guardian matches your speed, and the 0.8 s head start lets you escape.
- At BlurryBacon's "comfortable" values it runs at 0.68–0.91× your speed.
- An egg with 2× weight needs 1.5× the Speed; an egg with 8× weight needs 3.5×.
- A Speed-10 player carrying a normal Forest egg escapes (r = 1.67, so the chicken runs at 0.86× your speed).
- `speedBoostMult` = 1.25 while the 1.25× Speed boost is active; `adminSpeedMult` = 2 while the admin 2× Speed boost is active. Both also feed `walkSpeed(effSpeed)` (§4.4).

### 4.6 Treadmill gain [SOURCE: client code]
```
tick every 1.0 s while running on the belt:
gain = treadmill.factor * (1 + (trail.mult - 1) + (2^speedMultTier - 1) + (tempSpeedBoost - 1))
       * treadmillBoosterMult * eventTreadmillMult
```
- Trail, the permanent Robux Speed Multiplier and the timed Speed boost **add** to each other; the treadmill factor multiplies the sum.
- `tempSpeedBoost` (additive, +1) = 2 while a Robux TIMED_SPEED_* boost is active ("Speed 5 Minutes … 4 Hours"; WIKI: "temporary Speed-boost bonus adds"), else 1.
- `treadmillBoosterMult` = 2 while a **2x Treadmill Booster** (shops / chest) is active, else 1. It is multiplicative on the final gain, like `eventTreadmillMult` (the Admin Treadmill ×4/×8): "double all the speed you get while on the treadmill" (VZS2@03:00).
- The 1.25× Speed boost and the admin 2× Speed boost do NOT change treadmill gain. They multiply `effSpeed` everywhere it is used: the guardian check (§4.5) and `walkSpeed(effSpeed)` (§4.4).
- Examples: Basic ×2 + Grey trail ×1.5 = 3/step. Angelic ×2,000 + Divine ×14 = 28,000/step. Angelic ×2,000 with x4096 and the Divine trail ≈ 8.22M/step — the observed "8.2M max" [SOURCE]. The Admin Treadmill (event) applies ×4 or ×8 on top.
- Display: floating "+8.2M" per tick and "+2,000/step" on the treadmill screen.

### 4.7 Sell value [SOURCE ≈100× income]
`sellValue(pet) = floor(petIncome_without_player_multipliers * 100)`, where `petIncome_without_player_multipliers = pet.income * sizeFactor(s) * mutMult` (no x2 Money pass, no boosts, no friend boost). Eggs sell for `floor(previewIncome * 60)` [DESIGN].

### 4.8 Index rewards [SOURCE]
Cash reward = **100 × pet base income**. Speed reward = the per-pet `indexSpeed` in Appendix A / B (e.g. Chicken +420, Dog +460, Fox +720 [VERIFIED in-game]).

### 4.9 Number formatting (`NumberFormat.luau`) [VERIFIED style]
- `abbreviate(n)`: <1,000 → `tostring(math.floor(n))` ("703"). Otherwise pick the suffix k (**K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc**) and compute `v = math.floor(n / 10^(3k) * 10) / 10`, i.e. **truncate** (never round) to 1 decimal, then drop a trailing ".0". Examples: 410,699 → "410.6K" (not "410.7K"), 25,900,000,000 → "25.9B", 56,000 → "56K", 5,300,000 → "5.3M" [VERIFIED: the same player shows "410,699" in the player list and "410.6K" on the HUD].
- Money: `"$" .. abbreviate(n)`. Income: `"$" .. abbreviate(n) .. "/s"`. Popups: `"+$" .. abbreviate(n)`.
- Speed on the HUD: abbreviated ("410.6K"). In the player list (§17.6) values are comma-grouped below 1M and abbreviated above. Examples: "FatFrogIII 10.9B 101B", "manager 6M 410,699" [VERIFIED].
- Timers [VERIFIED]:
  - HUD: `"in {m}m {s}s"` / `"in {s}s"`, no zero padding ("in 5m 44s", "in 34s");
  - the featured countdown pads minutes and seconds to 2 digits ("10d 12h 04m 49s");
  - the egg billboard shows up to 3 units ("2h 54m 10s");
  - a Growing Eggs row shows 2 units ("2h 54m").
- Weight: `"1,688,125Kg"` [VERIFIED].
- Use doubles; values up to 1e21 must format correctly.

---

## 5. DAY/NIGHT CYCLE, EGG RESET & GLOBAL SPAWNING (`CycleService`, `SpawnService`)

### 5.1 Cycle [SOURCE + VERIFIED HUD]
- The cycle is **300 s**, aligned to UTC (`cycleId = floor(os.time() / 300)`, `t = os.time() % 300`) so **every server resets at the same moment** [SOURCE: global resets at :00/:05/:10…].
- **Day:** t = 0 → 290. **Night:** t = 290 → 300 (10 s) [SOURCE ~10 s; VERIFIED HUD counted "in 4m 47s" right after day start].
- **Bottom-right HUD timer:** during the day, a moon icon with "in 4m 47s" (time until night). During the night, a **sun icon** with "in 9s" (time until day) [VERIFIED].
- **Night start** (t = 290):
  1. Raise the white **night wall** at the safe zone.
  2. **Teleport every player** not in the hub back to their plot, with a screen fade and the text "Night has fallen!". Carried eggs are **lost** (they return to their nest).
  3. Remove all field eggs (nests empty) and put guardians to sleep.
  4. Sky/lighting switches to night (ClockTime 0, dark blue ambient, stars).
  5. Placed eggs **grow ×30**. Show a small **"x30" moon badge** above the Growing-Eggs HUD button [VERIFIED].
  6. Every placed egg's timer visibly speeds up.
  7. Show a countdown on the lane-facing side of the night wall: a giant black SurfaceGui digit (~60 studs tall) counting 10…1 (`reference/guides/pvp_safe_zone_gameboost.webp` shows "2" on the white wall).
- **Day start** (t = 0, new cycleId):
  1. Lower the wall.
  2. Spawn new eggs in all 12 zones (5 each).
  3. Show the top-center banner **"ALL EGG RESET!"** [VERIFIED], white bold with black stroke, 3 s. If no Secret+ egg spawned anywhere, append a smaller line "Nothing spawned." [SOURCE: "All eggs reset. Nothing spawned.", TAN@23:00].
  4. Post the rare announcements (§5.3).
  5. Sunrise lighting (ClockTime 7 → 14 over the day).
  6. Angels & Demons takes its new form from the global form roll (§5.2), identical on every server.
- Admins (Phase 2) can force "Next Day".

### 5.2 Nest eggs: global rolls, per-player availability
Each zone has **5 eggs per cycle** (5 nest slots) [SOURCE: videos "all five eggs"; config capture "Forest 5 eggs, other zones 50" = 10 zones × 5].
```
for each zone z, slot k = 1..5:
  local rng   = Random.new(cycleId * 1000 + z.order * 10 + k)   -- globally deterministic: SAME species + mutations on every server
  species     = weightedPick(zonePets(z), rng)                  -- weights = Appendix A "chance" (per-zone sums = 100)
  mutations   = rollMutations(rng)                               -- see below
  scale       = rollScale(serverRng)                             -- per SERVER (sizes differ between servers) [SOURCE]
  spawnId     = cycleId .. ":" .. z.id .. ":" .. k
```
- **Mutation roll** [SOURCE: config]: weighted table None 89 / Silver 6 / Golden 4 / Rainbow 1; after a non-None result there is a **50% chance of a second roll** (None or duplicate adds nothing). Luck boosts scale the non-None weights, but only for admin-spawned eggs; they never change the global nest rolls (see the Angels & Demons bullet below).
- **Per-player availability** [SOURCE: two-account capture showed two players on the same server in the same cycle with different Forest egg lists; the record ID included player + cycle + nest]: every player sees **their own copy** of the cycle's 5 eggs per zone. Stealing an egg removes it **only for the thief**; other players still see and can steal their own copy. The server keeps the list and the client renders the nest eggs it is told about (`EggState` remote; `NestRemove(spawnId)` removes one), so there's no visible-model desync. Stealing goes through `RequestStealBegin` / `RequestSteal` (§6.1).
  - Consequence (matches videos): two players can both take the Secret egg, but the **guardian only chases one carrier at a time**, so "you want to be the second person to grab it".
- **Claim-once across servers:** after a completed steal, store the spawnId in the player's `claimedSpawns` (keep only the current and previous cycleId). Eggs whose spawnId is already claimed are not sent to that player on any server [SOURCE: "once you collect a secret in one server you can't pick it up in another"].
- **Carried and dropped eggs are shared, real objects:** when a player picks up their copy, the server creates a real replicated egg model welded above their head that everyone sees. If it is dropped (bat, trap, guardian, Drop button) it becomes a **shared loose egg** any player can grab (§6.4).
- With 5 slots per zone and the Appendix A weights, the natural rates come out as observed: a Secret appears somewhere in ~40% of cycles, an Eternal about every 40 minutes, and a Divine about once per day [checked against SOURCE].
- **Angels & Demons form roll** (identical on every server): `Random.new(cycleId * 7919 + 12):NextNumber()` → < 0.475 Angels, < 0.95 Demons, else Merged.
  - Angels rolls the Light pets and Demons the Dark pets (Appendix A `side`).
  - Merged: the 5 slots draw from the union of both sides with every non-Legendary weight ×2 ("extra luck"). The Light guardian chases Light eggs and the Demon guardian chases Dark eggs.
  - Admin "Egg Luck" boosts apply only to admin-spawned eggs (or are broadcast to all servers via `MessagingService`); they never change the global nest rolls.
  - The announcement zone word is "Angels 😇", "Demons 😈", or "Angels & Demons 😇😈" for Merged.

### 5.3 Rare spawn announcements [VERIFIED format]
If rarity ∈ {Secret, Eternal, Divine}, all players see a top-center banner:
`A {Mutation }{Rarity} {Pet} Egg spawned in {Zone} {emoji}!`, for example **"A Secret Pure Jellyfish Egg spawned in Angels 😇!"** and "A Golden Eternal El Maja Egg spawned in Abyss Ocean 🌊!".
- One RichText span colors the whole phrase `{Mutation }{Rarity} {Pet} Egg` in the rarity text color. Secret = `#1E1E1E` fill + `<stroke color="#FFFFFF" thickness="2">`. The rest ("A", "spawned in {Zone} {emoji}!") is white with a black stroke [VERIFIED `reference/ingame/ingame_frame_secret_egg_spawn_announcement.jpg`, zoomed]. Example: `A <stroke color="#FFFFFF" thickness="2"><font color="#1E1E1E">Secret Pure Jellyfish Egg</font></stroke> spawned in Angels 😇!`
- The banner shows for 6 s, and several stack vertically.
- Divine spawns also play a special fanfare (`SpawnNoiseDivine`) and flash the screen edges gold.
- **Top-left "Rare Eggs" list:** small rows (egg icon, `Secret T-Rex – Prehistoric`) for every Secret+ egg in any nest this cycle. A row is removed for a player once that player has claimed that spawnId, or when the cycle ends [SOURCE].

### 5.4 Egg visuals in nests
- Each species has its own egg look (§20.1). Size is `baseEggHeight(3 studs) * clamp(s, 0.6, 6)` (s = Scale); the true kg keeps growing past the visual cap [SOURCE].
- **Rarity glow** (PointLight + ParticleEmitter sparkles):
  - Common–Rare: none.
  - Epic: faint purple sparkle. Legendary: orange sparkle. Mythic: red sparkle. Cosmic: indigo sparkle.
  - **Secret: rainbow-cycling glow. Eternal: sun-gold glow with glowing text. Divine: white-gold beam of light up to the sky.**
- Mutation look on the egg: **Golden** = metallic gold (`(255,200,40)`, Reflectance 0.3, coin sparkles); **Silver** = `(200,205,215)`, Reflectance 0.35; **Rainbow** = hue-cycling color via Heartbeat.
- Nest eggs have **NO billboard**. The species is recognisable only by the egg model (§20.1), and the rarity only by its glow (above) ["rely on the egg's shape", Fandom; no nest billboards in `reference/guides/guardian_10_cherry_blossom_ign.webp`]. The ProximityPrompt shows `ObjectText = "Egg"`, `ActionText = "Steal"` [VERIFIED "Egg / Steal" in `reference/guides/guardian_02_lake_swan_ign.webp`]. Name, weight and preview income appear only in the inventory tooltip after the steal, and on placed eggs.

---

## 6. STEALING & CARRYING (`CarryService`)

### 6.1 Pickup
- Each nest egg has a **ProximityPrompt**: ActionText `"Steal"`, ObjectText `"Egg"` (never the species; §5.4), KeyboardKeyCode E, `HoldDuration = clamp(0.3 + 0.25*log2(max(eggWeight*s^3,1)), 0.3, 2.5)`, MaxActivationDistance 8 + egg radius. Thumbnails show "E – Egg Steal" [SOURCE].
- **Client/server flow:** nest eggs are per-player, so the client creates the nest egg models and their prompts locally (a prompt on a client-created part only fires on that client).
  - On `PromptButtonHoldBegan` the client fires `RequestStealBegin(spawnId)`; on `prompt.Triggered` it fires `RequestSteal(spawnId)`.
  - The server re-checks everything, including the distance from the root part to the authoritative slot position (≤ MaxActivationDistance + 4) and that ≥ HoldDuration − 0.15 s passed since `RequestStealBegin`. Only then does it create the replicated carried egg.
- Server validation on `RequestSteal`:
  - the player is alive, in that zone's lane, and not carrying;
  - the egg still sits in the nest (not carried);
  - the spawnId is not in the player's `claimedSpawns`;
  - the egg inventory is not full (eggs cap: 40 unplaced eggs [DESIGN]; show "Your egg inventory is full!").
- On pickup, **wake the guardian** (§7) immediately.
- **One egg at a time** [SOURCE].

### 6.2 Carrying
- **Pose:** both arms held straight up, done client-side with `Motor6D.Transform` on the shoulders every `RunService.Stepped` (no Animation asset; §0 "Asset-free techniques"). The egg model is welded above the head at `head + (0, 1 + eggHeight/2, 0)` (`reference/official/thumbnail_1_119722099122044_768x432.png`, game icon). The egg keeps its glow and sparkles ("Your egg is glowing").
- **Carrier HUD:**
  - A **"RUN!!"** banner at top center: white bold text on a dark-red rounded pill (`#8B1A1A`, black stroke) about 0.12 × 0.045 of the screen, pulsing scale 1.0↔1.06 [VERIFIED storyboard `reference/youtube_storyboards/B7URwCQ1sFw_area_signs_guardians_02.jpg`].
  - A **red danger vignette** on the screen edges (four edge Frames with a `UIGradient` fading to transparent, transparency pulsing 0.3↔0.6; no image asset needed).
  - A red **"🗑 Drop"** button at bottom center (red `#E3262B` rounded rectangle, white trash icon + "Drop") [VERIFIED storyboard].
  - For very heavy eggs (carryMass > 200), a light camera shake while moving.
- Movement penalty per §4.4. The carrier **cannot** reset, use the bat, place traps, or sit. "You can't teleport home while carrying."
  - Reset block (client): when carrying, run `repeat local ok = pcall(StarterGui.SetCore, StarterGui, "ResetButtonCallback", false) task.wait(0.2) until ok` (SetCore throws until the CoreScripts register); set it back to `true` after.
  - Server: if a carrier's Humanoid dies anyway (kill-brick, fall, exploit), the egg drops at the death position as a loose egg (§6.4). The player respawns on their plot.
- **Manual drop** (Drop button or key **G**): the egg falls in front of the carrier as a free egg (§6.4).

### 6.3 Completing the steal
- When the carrier's HumanoidRootPart crosses **Z < 0** (the front edge of the SAFE ZONE), the steal completes:
  - remove the egg from the world;
  - add it to the player's **egg inventory** `{species, weight, scale, mutations, spawnId}`;
  - add the spawnId to `claimedSpawns`;
  - toast **"You stole an EGG!"** (big green text with a pop and confetti) [VERIFIED text via SOURCE];
  - sound "ding + cheer";
  - if the pet species is undiscovered in the Index, mark the Index button with a "!" (discovery happens on hatch).
- The guardian stops at its territory edge anyway (§7), so crossing the line is always safe.

### 6.4 Dropped (loose) eggs
- A dropped egg sits on the ground with a ProximityPrompt "Pick Up" (hold 0.3 s). **Any** player can take it [SOURCE]. Loose eggs are server-created, so this prompt fires on the server; `RequestPickupLoose(looseId)` is the same action from custom mobile/console buttons (same server checks).
- If it lies **inside its home lane**, the guardian (if awake) walks to it, picks it up and **carries it back to the nest** [SOURCE: "bro took the egg all the way back"]; then it goes back to sleep.
- If it lies **outside its home lane** (for example dropped in an earlier lane after a bat hit), it stays **8 s** [DESIGN], then fades out and reappears in its nest slot [SOURCE: "it's going to reset in a second"].
- Eggs clipped out of bounds reset to the nest after 3 s.
- Night removes all loose eggs.
- A loose egg keeps `originUserId` and `spawnId`. When it resets (the guardian returns it, or the 8 s timeout ends), it reappears only in the origin player's nest list. If another player completes the steal with it, the thief gets it and it is removed for the origin player too.

---

## 7. GUARDIANS (`GuardianService`)

One guardian per zone (two in Angels & Demons Merged). They are server-controlled Models with a `Humanoid` (or a custom CFrame mover for giant ones). Use **network ownership = server**. Their state machine:

| State | Behavior |
|---|---|
| **Sleeping** | Curled pose at the center of its 5 nests (§2.2), "Z z Z" billboard, snore loop (3D sound, 60-stud rolloff). Ignores everyone. |
| **Waking** | Triggered when any egg of its nest is picked up. Plays a roar plus a red **"!"** billboard for **0.8 s** (the head start), then targets **the carrier of that egg** (one target at a time; the first grabber is the one chased [SOURCE]). |
| **Chasing** | Moves toward the target at `guardianSpeed` (§4.5), recomputed every 0.2 s. Use `Humanoid:MoveTo` with a straight line (lanes are open). If stuck >1.5 s or >60 studs behind for >4 s, **teleport** to 25 studs behind the target [SOURCE: "the dude just teleported"]. Big guardians (Gorilla King, Cosmic Skeleton) do a **leap** every ~4 s that covers 30 studs [SOURCE]. |
| **Attack** | When within `4 + guardianHeight*0.35` studs (§3.1): swing/bite motion (CFrame/`Motor6D.Transform`, no Animation asset), then **hit the carrier**. The server drops the egg immediately at the hit position and fires `Knockback(velocity, ragdollSeconds)` to the victim's client (§10.3) with velocity `guardianLookVector * 90 + Vector3.new(0, 55, 0)` and 1.5 s, which knocks the player away from the guardian and up [SOURCE: "yeeted me", "launches them backwards"]. Screen shake plus a "BONK" sound. Guardians **do not kill** players; they only fling (optional [DESIGN]: Cosmic+ guardians use a ragdoll of 2.5 s). |
| **Retrieving** | If the dropped egg is inside its lane, walk to it, pick it up (the egg welds to the guardian's mouth or hands) and carry it back to its nest. |
| **Returning** | If the target leaves the territory (the lane bounds, from its start Z to its end Z), stop at the boundary and turn around. Apply the target rule below (retarget or retrieve); if nothing is left, walk back to its sleep spot among the nests and sleep. It keeps sleeping until the next pickup. |
| **Night** | Forced back to Sleeping at the nest. |

- **Territory:** exactly its lane `[zoneStartZ, zoneEndZ]`. It never enters the safe zone or other lanes [SOURCE: "we got it to the next biome, he's not going to take it back"].
- Guardians ignore traps and bats (they are not players) [SOURCE].
- **Target rule:** the guardian keeps its FIRST target (the first player to pick up one of its nest eggs this wake) until that chase ends. The chase ends on a catch, or when the target crosses its lane boundary, drops the egg, or dies. Then, if another carrier of one of its eggs is still inside its lane, it retargets the one with the earliest pickup time. Otherwise it retrieves loose eggs in its lane and goes back to sleep. Later grabbers are ignored while it is busy [SOURCE: VIN4@13:31 "It's always the first person that grabs it that dies"; VIN4@02:02 "let this guy get chased… I'll just grab it after"].
- In Angels & Demons Merged form, the Light guardian only reacts to Light eggs and the Demon guardian only to Dark eggs (§5.2).
- **Sound:** a unique roar per species (reuse built-in Roblox sounds; see §18).

---

## 8. BASE: PLOTS, PENS, EGG PLACEMENT, HATCHING, PETS, INCOME (`PlotService`)

### 8.1 Plot assignment
- On join, assign the first free of the 7 plots and set the player's spawn to the plot. On leave, clear the plot (despawn models) after saving.
- A floating owner label over the pen shows "[DisplayName]'s Pen" to everyone; a house icon next to it is visible only to the owner (LocalScript).

### 8.2 Base (pen) levels and pet slots [SOURCE: config table; VERIFIED board "Level 5 > Level 6  $50B"]
The **Upgrade Pen** board sells base levels (Appendix H). **Level 1 ($1K) unlocks the treadmill** ("upgrade your garden for $1,000"). Active (equipped) pet slots per level:

| Level | 0 (start) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Price to reach | — | $1K | $1M | $75M | $500M | $1B | $50B | $500B | $1T | $25T | $100T | $500T | $5Qa |
| Active pets | 7 | 7 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 |

- **+1 EQUIP** (Pets panel header + base UI) is a shortcut for buying the NEXT base level (same counter and price as the Upgrade Pen board, Appendix H), e.g. "11/11 Active [+1 EQUIP $1B]" at level 4. It is hidden at level 12. Max active pets = 19 [SOURCE: stealanegg-wiki base-upgrades "The +1 EQUIP [$1B] button offers the next active slot"; VSF2P@43:34 "500 million for an extra slot" at level 3 → 4].
- Each level also enlarges the pen (+4 studs deep) and upgrades the fence color (wood → iron → gold → diamond).
- **Placed eggs:** at most **30** growing at once [SOURCE] ("You have too many eggs placed."). Minimum spacing is 4 studs ("Too close to another egg.").
- **Inventory caps** [DESIGN; the real egg inventory is "ridiculously small compared to pet inventory"]: 200 pets, 40 unplaced eggs.

### 8.3 Upgrade Pen board behavior
Clicking the price button (ProximityPrompt "Upgrade" or SurfaceGui button) buys the next level with money. The board then shows the next level, or "MAX" at 12. The price button is red when unaffordable and green when affordable.
- Board text: `Upgrade Pen` / `Level {n} > Level {n+1}` / the price of level n+1 (live: "Level 5 > Level 6 $50B"). At penLevel 0 it reads `Upgrade Pen` / `Unlock Pen Level 1` / `$1K` [DESIGN; a storyboard shows "Level 1 > Level 2 $1K" for this first purchase, so the real board may count from 1. Keep the Appendix H price ladder either way].
- The tutorial hint "Upgrade your Pen!" appears right after the first hatch (§16).

### 8.4 Placing an egg
- Stolen eggs are in the **egg inventory**, shown in the custom backpack/hotbar as egg entries named after the species (hotbar slots 3–10 = keys 3–9 and 0; §17.4). They are **virtual inventory entries**, not one `Tool` instance per egg. Selecting one enters client placement mode: a **ghost preview** follows the mouse or thumbstick on the pen floor (green if valid, red if invalid) → click or tap to place [SOURCE: "drag to hotbar, place anywhere in your pen"].
- Server validation: inside own pen bounds, spacing rule, placed-count cap, and not carrying.
- The placed egg shows a **BillboardGui**:
  - line 1: rarity (colored)
  - line 2: `"{Mutation} {Pet} Egg"`
  - line 3: the timer `"2h 54m 10s"`, which turns into **"Egg Ready!"** (green, bouncing) when done
  - line 4: the weight, e.g. "545Kg"
- A **"Skip Growth!"** Robux ProximityPrompt (E hold) is attached [SOURCE]. Its price tier comes from Appendix I (Instant Hatch tier by remaining time). The purchase goes through `RequestPurchaseIntent("INSTANT_HATCH", eggId)` so the receipt knows which egg it is for (§14).
- **Eggs visibly grow** from 60% to 100% of their final model scale over the timer [SOURCE].

### 8.5 Hatching
- When ready, a ProximityPrompt **"Hatch"** (E, 0.5 s hold). Eggs can also be opened from the **Growing Eggs** panel ("Open" button) or with **Grow All** (Robux) [SOURCE].
- Hatch sequence (client VFX, ~2.2 s):
  1. The egg shakes ×3 with rising pitch.
  2. Cracks appear (a darker overlay).
  3. A white flash (screen `Frame` fade) and a burst of rarity-colored particles; for Secret+ add a column of light and a camera zoom.
  4. Shell shards fly out and stay 3 s.
  5. The pet pops out toward the camera, then lands.
  6. A speech bubble **"Mama!"** plays with a cute voice blip [SOURCE: every video; pets also say "Call me mama!", "I am your mother!", "Dada!"].
- Result:
  - **gender** 50/50 (♂ blue `(80,160,255)` / ♀ pink `(255,110,190)`) [VERIFIED: hover shows ♂/♀];
  - weight = the egg's weight; mutations = the egg's;
  - `Mama` bubble.
- If the player has a free slot the pet is **auto-equipped** into the pen; otherwise it goes to the pet inventory with the toast "Pen full! Pet sent to inventory."
- **Index discovery** (§11): if the species is new, show "NEW PET DISCOVERED!" and light up the Index "!" badge.
- **Badges:** "Hatched Secret!", "Hatched Eternal!", "Hatched Divine!" (BadgeService, placeholder ids). Also award **"WELCOME!"** on first join (real badge 2590480615884365; `reference/official/badges/WELCOME_2590480615884365.png`).

### 8.6 Pets in the pen
- Pets roam randomly inside the pen with a walk animation (bob and step), pause and turn. There is a 15% chance of an idle "dance" (spin/hop). Giant pets are just scaled up and may clip through the fence visually; that's fine and matches the real game.
- **Pet billboard** (always on, scaled with pet size; AlwaysOnTop false):
  - line 1: rarity word in its gradient color, e.g. "Mythic" in crimson;
  - line 2: `"{Mutation} {Name}"` in white;
  - line 3: `"$62K/s"` in green.
  - Fonts: FredokaOne with a black UIStroke of 2 [VERIFIED `reference/ingame/*`].
- **Hover / tap info** (client raycast):
  - A small tooltip near the pet with the gender symbol above the weight, on two lines: "♂" / "1,688,125Kg" [VERIFIED].
  - A world-space tooltip shows the pet's name and rarity on two lines ("Gigantus" / "Eternal" in the rarity color), as in every shop capture [VERIFIED].
- **Income popups:** every **1 s** each equipped pet spawns a floating `"+$X"` (green, black stroke) above it that rises 4 studs and fades over 1.1 s [VERIFIED `reference/ingame/ingame_001_spawn_base_overview.jpg`]. The popup size scales with the pet's model size (giant pets make huge "+$5.3M" text). Throttle to at most 12 popups/s per client for performance.
- Money is credited **automatically every second** on the server. There is no collect pad [VERIFIED: money rose continuously while idle].

### 8.7 Offline earnings
- When the player rejoins, compute `offline = min(now - lastOnline, 24h) * incomePerSec * 0.10` [SOURCE ~10%].
- Spawn a **giant pile of cash** (stacked green bill blocks with a "$" billboard showing the amount) in the middle of the pen. Walking into it claims it with a big popup "+$1.8T Offline Earnings!" [SOURCE].
- Store the unclaimed pile as `offlinePending` in the player data, so leaving before walking into it doesn't lose it.
- A SurfaceGui sign at the pen reads `You earn $716B per day offline` (= `abbreviate(incomePerSec × 0.10 × 86400)`) [SOURCE: WIKI base-upgrades screenshot "You earn 716 billion per day offline"]. Optionally mirror it as small top-center text (VSM@03:00).

### 8.8 Pets panel (paw button)
- A list of owned pets sorted by income, with a checkbox for equipped. Buttons: **Equip Best**, **Auto Equip Best** (toggle), **Unequip All**, **Favorite** (star, protects from Sell All).
- The header shows `"Equipped 8/9"`, plus a **"+1 Equip"** button showing the price of the next base level (it buys that level, §8.2; hidden at level 12).
- Pet cards use the rarity gradient (§21 C), render, name, rarity and income, plus weight and gender.
- There is also a **"Hide other players' pets"** toggle (a performance setting) [SOURCE].

---

## 9. SPEED: TREADMILL, SPEED MULTIPLIER, TRAILS, BOOSTS (`TreadmillService`)

### 9.1 Treadmill
- Every plot has a treadmill in front of its pen. The player must **unlock it for $1,000** [SOURCE]. This purchase is **Base Level 1** (§8.2): the Unlock board and the Upgrade Pen board share the same level counter. Before that it is a translucent grey hologram with the board "Unlock: [icon] $1K".
- **Using it:** step onto the belt. The server detects the player standing on the belt part (a `Touched` + region check every 0.2 s, owner only). An `AlignPosition` holds the root part at the belt center while the client keeps calling `Humanoid:Move(forward)`, so the default Animate script plays the **run cycle** in place. The belt "scrolls" by moving alternating thin dark stripe parts along it by CFrame every frame (no Texture; §0 "Asset-free techniques"). Press **Space/Jump** to get off [SOURCE].
- **Every training tick** (every 1.0 s while on the belt; the run animation plays continuously):
  - `Speed += gainPerStep` (§4.6);
  - show a floating green **"+X"** above the runner and a persistent label on the treadmill screen **"+3,000/step"** [SOURCE];
  - play a soft footstep tick.
- Speed only grows while on the treadmill [SOURCE].
- The treadmill has a tall **black screen panel** in front of the runner. Before 2026-08-25 the real game played short vertical videos there ("Reels"); Roblox policy removed that. **Do NOT implement a video feed.** Show the player's live stats on the screen instead ("SPEED 410.6K", "+2/step", multiplier "x4K", trail "x14").
- The **red "Shop" button variant** appears on the HUD while on the treadmill (cart with a lightning bolt) and opens the shop straight to the SPEED section [SOURCE]. A small **"x8 Speed ▶ x16"** button offers the next multiplier tier while on the treadmill [SOURCE].
- **Treadmill tiers** (Appendix E) are bought on the **Treadmill Upgrade board** with money **or** Robux; each is also in the Shop's "UPGRADE TREADMILL!" card [VERIFIED: card shows `[R$299] [$75B]` for Freeze→Lucky Block]. Each tier swaps the treadmill model's theme (§20.4).
- Badge **"Angelic Treadmill!"** when buying Angelic.

### 9.2 Speed Multiplier (Robux, 12 sequential tiers) [VERIFIED + API]
Each purchase doubles the permanent Speed Multiplier: tier n = ×2ⁿ, up to ×4,096 ("x4K"). It feeds the additive bonus sum in §4.6, so without a trail each tier doubles your gain. They must be bought in order. The shop card reads **"DOUBLE Your SPEED   x1 ▶ x2   [R$3]"** and always shows only the next tier [VERIFIED]. After tier 12 the card shows **"x4K MAX"** with no price button. Prices are in Appendix G. The HUD speed label shows the active multiplier in brackets when >1: **"5.8B (x4K)"** [SOURCE].

### 9.3 Trails
- Bought at the **TRAILS SHOP** (hub arch) with money or Robux (Appendix F). Only one trail is equipped (the best owned is auto-equipped). Trails **multiply treadmill gain only** [SOURCE].
- Visual: a `Trail` instance, colored per trail, lifetime 0.6 s. A Trail's width comes from the distance between its attachments: put Attachment0 and Attachment1 **2 studs apart vertically at the waist** (`WidthScale` stays at its default 1). Divine is a rainbow ColorSequence; Galaxy is a purple/blue nebula gradient; Secret is black/white striped (sequence); Moonbloom is aqua with petal particles.
- Trail shop UI cards: a runner silhouette in the trail's color, the name, the rarity (colored), a footer "x20 Speed" and buttons `[$5Qa] [R$1199]` [VERIFIED card style `reference/wiki/ui__Zrzut_ekranu_2026-09-16_211650.png`].
- Badge **"Divine Trail!"** on buying Divine.

### 9.4 Timed boosts (`BoostService`)
| Boost | Effect | Duration | Source |
|---|---|---|---|
| 2x Treadmill Booster | `treadmillBoosterMult = 2`: ×2 on the final treadmill gain (multiplicative, §4.6) | 10 min | Experiment/Boss shop, Monster Chest (Phase 2) |
| 1.25x Speed | `speedBoostMult = 1.25`: multiplies `effSpeed` for the guardian check and walk speed (not treadmill gain) | 5 min | shops (Phase 2) |
| 2x Cash Booster | ×2 income (`boosts.cash2x`) | 10 min | shops (Phase 2), Robux X2_EARNINGS (15 min) |
| Timed Speed (Robux) | `tempSpeedBoost = 2`: adds +1 to the §4.6 bonus sum | 5 m / 30 m / 1 h / 4 h for 90/120/250/499 R$ | API dev products |
| Admin Abuse boosts | ×2 earnings, ×2 speed (`adminSpeedMult`), ×3 egg size, ×2 luck (admin-spawned eggs only), ×2 mutation, admin treadmill ×4/×8 (`eventTreadmillMult`) | event | §15.1 |

- Buying the same boost again **stacks duration** [SOURCE].
- Active boosts show as text lines above the Speed counter, e.g. **"X2 Treadmill Boost (13m 36s)"** in cyan italic (§17.1) [SOURCE].

### 9.5 Other Speed sources
- **Index rewards** (§11).
- **FREE chest:** +10,000 once.
- **Robux speed packs:** +150K/+1M/+10M/+50M/+500M/+1B [VERIFIED].
- **Pay-on-fail offer [SOURCE]:** when a guardian catches the player, show a small top-center popup "Need more speed? +150K SPEED [R$79]" sized to the current zone. Throttle to once per 3 minutes. Pack per zone (Appendix I speed packs) [DESIGN mapping]:
  - Forest–Snow: +150K (R$79);
  - Volcano–Abyss Ocean: +1M (R$249);
  - Prehistoric: +10M (R$699);
  - Cosmic: +50M (R$1499);
  - Cherry Blossom / Titan Temple: +500M (R$1999);
  - Angels & Demons: +1B (R$2999).

---

## 10. PVP: BAT & TRAPS (`CombatService`)

### 10.1 Bat & index weapons (hotbar slot 1) [VERIFIED slot 1 = wooden bat; weapon stats SOURCE: config]
- A `Tool` given to everyone. Click or tap to swing: a 0.25 s swing motion (arm `Motor6D.Transform`, no Animation asset), **0.6 s cooldown** [DESIGN].
- The server hit check uses a cone in front of the attacker: base range 7 studs + `RangeBonus`, 70° [SOURCE: "if you're close you can hit"].
- On a hit, **if the target is carrying, the server drops the egg immediately** at the hit position (§6.4), then fires `Knockback(dir * Force * 2.6 + Vector3.new(0, 40, 0), Duration)` to the target's client (§10.3), so the target **ragdolls for `Duration` s**.
- It can't be used, and players can't be hit, inside the hub or safe zone ("Cannot use items in safe zone."). Guardians and pets are unaffected.
- Bats also break Great Bloom trees, drones and boss crystals (Phase 2).
- **Weapon ladder:** completing a world's Index (all 8 species) unlocks its weapon, which is equipped from the Index page's **"Equip Bat!"** button. Each tier is ×1.1 Force/Duration and +1.875 range:

| Weapon | Unlock | Force | Ragdoll Duration (s) | Range bonus | Look |
|---|---|---|---|---|---|
| Bat | start | 35 | 0.5 | 0 | plain wooden baseball bat |
| Forest Bat | Forest 8/8 | 35 | 0.5 | 0 | wood with leaves |
| Lake Bat | Lake 8/8 | 38.5 | 0.55 | 1.875 | blue, water |
| Desert Bat | Desert 8/8 | 42.35 | 0.605 | 3.75 | sandstone |
| Jungle Bat | Jungle 8/8 | 46.585 | 0.6655 | 5.625 | green, vines |
| Snow Bat | Snow 8/8 | 51.2435 | 0.73205 | 7.5 | ice |
| Volcano Bat | Volcano 8/8 | 56.36785 | 0.805255 | 9.375 | obsidian + lava |
| Abyss Ocean Bat | Abyss 8/8 | 62.004635 | 0.885781 | 11.25 | teal coral |
| Prehistoric Bat | Prehistoric 8/8 | 68.205099 | 0.974359 | 13.125 | bone club |
| Cosmic Bat | Cosmic 8/8 | 75.025608 | 1.071794 | 15 | purple galaxy |
| Katana | Cherry Blossom 8/8 | 82.528169 | 1.178974 | 16.875 | pink sakura katana (Prismatic) |
| Titan Axe | Titan Temple 8/8 | 90.780986 | 1.296871 | 18.75 | golden electric axe (Prismatic) |
| Celestial Blade | Angels & Demons 16/16 | 99.86 | 1.4266 | 20.625 | white-gold/red split blade [DESIGN extrapolation] |

### 10.2 Bear traps (hotbar slot 2) [VERIFIED: slot 2 shows a spiked trap icon with "x3"]
- Every player has **3 bear traps** (the slot shows "x3"; infinite supply, max 3 placed [SOURCE]).
- Clicking places a spiked jaw trap (grey metal ring with teeth, a bit flower-like) on the ground 4 studs ahead. Traps can't be placed in the safe zone or hub.
- A trap persists until it is triggered or the owner leaves. The owner can pick it back up (a ProximityPrompt visible only to the owner).
- **Trigger:** only a player **carrying an egg** who steps on it (including the owner) [SOURCE]:
  - the carrier is **stuck for 3 s** (conflicting sources: 2 s in videos, 5 s and 7 s in guides; DESIGN 3);
  - **the egg drops**;
  - the trap snaps (animation + clank) and returns to the owner's count;
  - toasts: "You got trapped!" to the victim and "You trapped somebody!" to the owner.
- Guardians ignore traps.

### 10.3 Knockback & ragdoll (used by guardian catches and bat hits)
Player characters are network-owned by their own client, so velocity changes made by the server are overwritten or ignored, and Roblox has no built-in ragdoll. So:
- The server decides the hit and fires `Knockback(velocity: Vector3, ragdollSeconds)` to the victim's client. That client:
  1. sets `Humanoid.PlatformStand = true` (or `Humanoid:ChangeState(Enum.HumanoidStateType.Physics)`);
  2. swaps each Motor6D for a `BallSocketConstraint` (build the constraints once per character and set `Humanoid.BreakJointsOnDeath = false`);
  3. sets `HumanoidRootPart.AssemblyLinearVelocity = velocity`;
  4. restores the Motor6Ds and the Humanoid state after `ragdollSeconds`.
- The server drops the egg immediately at the hit position, and checks the victim's displacement over the next 0.5 s (anti-exploit: a client that ignores the knockback is rubber-banded or flagged).
- Guardian: velocity = `guardianLook*90 + Vector3.new(0,55,0)`, 1.5 s. Bat: `dir*Force*2.6 + Vector3.new(0,40,0)`, ragdoll = the weapon's Duration.

---

## 11. PET INDEX (`IndexService`) [VERIFIED UI]

- **Discovery** happens on the first hatch of a species. Each species has **Reward: $cash + Speed** (Appendix A: cash = 100 × base income). Rewards are claimed per pet (**CLAIM!**) or all at once (**CLAIM ALL (n)!**).
- The Index HUD button shows a **red badge with the number of unclaimed rewards** [VERIFIED "5"].
- **Layout** (see `reference/ingame/ingame_010_index_forest_chicken.jpg`):
  - The window is titled **"Pet Index"**: white FredokaOne text on a **cyan→blue diagonal-striped header**, with a red square **X** close button (white X, dark outline).
  - **Left scroll area:** one **section per zone** in order.
    - A **zone art card** (a vertical image of the biome with the zone name in white, e.g. "Forest") sits beside a **4×2 grid of pet tiles**.
    - **Tiles are laid out in Appendix A row order.**
    - **Tile:** a rarity-gradient background (Common grey, Uncommon green, Rare blue, Epic magenta/purple, Legendary yellow-orange, Mythic red, Cosmic indigo, Secret white/light-grey, Eternal light-blue/white, Divine yellow-white [unverified]; Appendix C), the pet render (a ViewportFrame) or a **black silhouette with "???"** if undiscovered, and the name on top.
    - A **red border** means discovered but unclaimed; a **white border** means selected.
    - Under the grid is a **progress bar "3/8"** (green fill) with the zone's **bat icon** at the right end; at 8/8 it becomes an **"Equip Bat!"** button.
  - **Right detail pane** (its background uses the selected pet's rarity gradient: grey for Chicken, green for an Uncommon):
    - the big pet render;
    - name, rarity, and `"$1/s"` in green (undiscovered shows "??? / Uncommon / ???");
    - below, a green-bordered **Rewards:** box with a cash icon "$100" and a shoe icon "+420";
    - a green **CLAIM!** button (grey **CLAIMED!** when done). It stays green even for undiscovered pets [VERIFIED]; clicking it then shows the toast "Discover this pet first!".
  - **Bottom:** a wide blue **"CLAIM ALL (5)!"** button with a book icon.
  - **Right side outside the window:** two tab buttons, **"World"** (blue with a globe) and **"Limited"** (gold/brown). Limited lists the Robux/event egg pets (Appendix B).
- Angels & Demons shows 16 tiles (Light row set, Dark row set) plus the 2 fusion tiles (Equinox, Aetheron).
- Completing all 6 pets of the Brainrot/Limited egg unlocks the **Bee Cannon** weapon (Phase 2, optional) [SOURCE].

---

## 12. SELL BOOTH (`SellService`)
- Stepping into the sell circle opens **Sell**: a grid of owned pets and eggs (cards with value), plus **Sell** (selected), **Sell All** (skips favorites and equipped), and a confirm dialog "Are you sure? — Yes, I'm sure I want to sell." [SOURCE text].
- Values follow §4.7. Only pets with `source = "admin"` (granted by admin or creator tools) sell for $0. Limited-egg pets (Appendix B) sell normally [SOURCE: CRL1@12:32 sold a Froggo from the Monster Egg for $4M].

## 13. FUSE MACHINE (`FuseService`) [VERIFIED UI via guide screenshot; rules SOURCE: config]
- A ProximityPrompt at the blue machine next to the SELL stand opens the **"Fuse Machine"** window. It has no striped header: the "Fuse Machine" title overlaps the window's top-left corner [VERIFIED `reference/guides/fuse_machine_screen_ign.webp`]. Contents:
  - title "Bring **3** same Pets to Fuse", subtitle "**Better pets** give more **Luck** ☘!";
  - three slots ("Empty" + green **+** buttons), with pipes leading down to an egg-silhouette output;
  - a bottom counter "3 Pet Left" that becomes **"FUSE $X"**.
- Machine billboard: "Fuse Machine" (cyan) and "0/3".
- **Rules:**
  - exactly 3 pets of the **same species**. Pets that are favorited or already in another fuse, and "CannotFuse" species (Crane), are rejected. Equipped pets are allowed; they are unequipped first ("it also takes pets placed on your plot");
  - **Fee** = 3 minutes of the three pets' combined income × a mutation factor (×1 no mutations; ×2 if any pet has one mutation; ×3 if any pet has two or more);
  - **Output** = 1 **egg** of that species (hatch it normally);
  - **Scale** = the average of the three input Scales × a factor drawn in two steps: pick a band, then a uniform value inside it. Bands fitted to the WIKI calculator's Chicken-trio example (39.93% heavier, 60.07% lighter, 0.91% under 2 kg) [SOURCE]:
    ```
    0.50–0.63 : 0.91%   0.80–1.00 : 59.16%   1.00–1.26 : 19.72%
    1.26–1.71 : 9.88%   1.71–2.00 : 9.33%    2.00–4.00 : 1.00%
    then while rng:NextNumber() < 0.01 and scale*2 <= 150 do scale *= 2 end
    ```
    The result can be smaller than every input. ELD's Scorpion example (≈0.65×) is an outlier;
  - input mutations are lost; the output rolls the normal mutation table with luck ×(1 + 0.25 × number of mutated inputs).

---

## 14. SHOP & MONETIZATION (`ShopService`) [VERIFIED screenshots in `reference/ingame/`: `ingame_002_shop_featured_extinction_egg.jpg`, `ingame_003_shop_passes_growth_money.jpg`, `ingame_004_shop_speed_double.jpg`, `ingame_005_shop_upgrade_treadmill.jpg`, `ingame_006_shop_speed_packs.jpg`, `ingame_007_shop_speed_packs_2.jpg`, `ingame_008_shop_money_packs.jpg`, `ingame_009_shop_money_packs_2.jpg`]

**Shop window:**
- Title **"Shop"**: white FredokaOne on a **bright green diagonal-striped header**, red X close.
- Dark charcoal body with a subtle stud pattern, vertically scrolling.
- **Right-side jump tabs** (outside the window): **Featured** (red "%" price-tag icon), **Speed** (blue sneaker), **Money** (cash stack).
- The HUD Shop button has a red **"!"** badge when a new featured item exists.

**Sections, in order:**
1. **"-- FEATURED --"** (yellow text). A limited egg banner card:
   - a red **"New!"** tag, the big yellow title **"EXTINCTION EGG"**, "Limited Time!", and a white countdown **"10d 12h 04m 49s"** computed from `endsAtUnix - os.time()` (Appendix B) [VERIFIED];
   - a fiery background;
   - the pet odds tiles in a row: 39% / 24% / 18% / 11% / 6.5% / 0.5%, plus a special rainbow-bordered tile **"SKELETAL 1%"** [VERIFIED];
   - buy buttons: `[🎁][R$3499 50 Eggs (strikethrough R$5,959)] [🎁][R$799 10 Eggs] [🎁][R$249 3 Eggs] [🎁][R$99 1 Egg]`. The 🎁 are purple gift buttons.
   - Make the featured egg data-driven (Appendix B) so it can swap to Monster/Luminous/Brainrot eggs.
2. **"-- PASSES --"** (yellow). Two cards [VERIFIED]:
   - **"x2 Growth"** on a rainbow card with a stopwatch and fast-forward icon: "Eggs Grow **x2** faster!" `[🎁][R$467]`
   - **"x2 Money"** on a yellow card with a gold coin "x2" and cash icon: "Get **x2** Money!" `[🎁][R$399]`
3. **"-- SPEED --"** (cyan).
   - Card **"DOUBLE Your SPEED  x1 ▶ x2  [R$3]"** (a bag of sneakers icon).
   - Card **"UPGRADE TREADMILL!"** (rainbow text): current treadmill model → red arrow → next model, with `[R$299] [$75B]`.
   - Then 6 speed-pack cards on a blue background with sneaker art growing bigger: **+150K SPEED R$79, +1M SPEED R$249, +10M SPEED R$699, +50M SPEED R$1499, +500M SPEED R$1999, +1B SPEED R$2999**, each with a 🎁 gift button [VERIFIED].
4. **"-- MONEY --"** (green). Cash cards on a green background: **$24K R$49, $200K R$99, $800K R$249, $4M R$499, $8M R$799** [VERIFIED]. The art grows: bills → stacks → money bag → safe.

**Implementation:**
- Game passes: `x2 Money` and `x2 Growth` (UserOwnsGamePassAsync plus PromptGamePassPurchaseFinished). A pass counts as owned if `UserOwnsGamePassAsync` (pcall, cached per session) is true OR it is in the player's `giftedPasses` (§19.1).
- Everything else is a developer product with `ProcessReceipt`. It must be idempotent: store processed PurchaseIds in the player data and return `PurchaseGranted` only after the grant is saved.
- **Purchase intents** (receipts carry only `PlayerId`, `ProductId` and `PurchaseId`, so contextual products need this): before any contextual prompt, the client calls `RequestPurchaseIntent(kind, arg)` (the eggId for INSTANT_HATCH_n, the targetUserId for GIFT_*).
  - The server stores `pendingIntent[player][productId] = {arg, t = os.clock()}` (60 s TTL) and validates it (e.g. the egg's remaining time fits tier n). Only then does it call `MarketplaceService:PromptProductPurchase`.
  - `ProcessReceipt` is ONE callback for all products:
    - return `NotProcessedYet` if the player isn't in the server, their data isn't loaded, or the save fails;
    - resolve the intent. If the egg has already hatched, apply it to the placed egg with the most remaining time within the tier; if there is none, store a "free skip" credit;
    - write the PurchaseId into `processedReceipts` in the SAME `UpdateAsync` as the grant, then return `PurchaseGranted`.
- **Gift buttons** open a small player picker for the same server; they set a GIFT intent, call the "[GIFT]" product and grant to the target (optional; feature flag). Gifted passes go into the target's `giftedPasses`.
- After any purchase show the custom dialog **"Purchase successful! Thank you so much! 😊 [OK!]"** with confetti [SOURCE].
- Also include: Instant Hatch tiers (per-egg "Skip Growth!"), **INSTANT GROW ALL!** (R$199), Timed Speed boosts, and **2x Earnings** (R$99, ×2 income for 15 min).
- **LUCK_BOOST_1/2/3** (49/99/199 R$) are the Sakura Incubator "Great Bloom odds" boosters: ×2 / ×4 / ×8 for the egg in the incubator (Spirit Bloom 5% at 150% charge → 10/20/40%). Phase 2 only (§15.3) [SOURCE: created the day before the Incubator launched; 49 + 99 + 199 = 347 R$ matches "spend like 300 Robux to make this a 40% chance"]. There is no personal nest luck: nest species are rolled from a global seed (§5.2).
- `Config.TEST_PURCHASES = true` grants products instantly without prompting, but it is honoured only when `RunService:IsStudio()`. Live servers always use real prompts.
- **Never** make Robux the only path: treadmills and trails are all purchasable with in-game money.

---

## 15. LIVE EVENTS (`EventService`) — Phase 2, all behind `Config.Features.*` flags

The real game ships a new weekly update every **Saturday 15:00 UTC**, together with an **Admin Abuse** live session [SOURCE]. Implement the framework and the listed events. Recurring events run on UTC-aligned timers so every server agrees. The HUD's second bottom-right timer (a flask icon) shows **"in 5m 44s"** until the next event [VERIFIED].

### 15.1 Admin Abuse (admin-triggered)
- Admins (a UserId whitelist in Config) get an **Admin Panel** (a top-right button) with:
  - spawn egg (species, zone, size multiplier 0.1–100, mutation, quantity);
  - force Next Day;
  - toggle global boosts;
  - start Capture-the-Egg;
  - an announcement text box.
- Global messages use the chat-banner style: a verified-check name tag, colored name and message at the top center, e.g. **"Admin ✅ started DR. SCRAMBLE'S MECH! Jump in the portal at spawn and take him down!"** and **"Dr. Scramble ✅: My MECH is complete! Find my portal in Volcano if you dare!"** [VERIFIED].
- Start banner: **"The admins are raining chaos from the sky"**, with the sky tinted purple (the "admin sky") [SOURCE].
- Boosts show as icons at bottom right: "2x Earning Boost – Your pets earn more cash.", "2x Speed Boost – Everyone runs faster.", "Egg Size Boost – Bigger eggs", "Egg Luck Boost", "2x Mutation Boost", "Admin Treadmill x4/x8" [SOURCE].
- Admin-spawned eggs are announced as "Rare eggs are spawning on the map!" [SOURCE].
- Admin toggles are per-server. "Egg Luck" and "2x Mutation" apply only to admin-spawned eggs (or broadcast the toggle to all servers via `MessagingService`); they never change the global nest rolls (§5.2).

### 15.2 Capture the Egg (admin or scheduled)
A special egg drops in a lane: **"Golden Oni Tiger Egg drops at night. Hold it the longest to keep it."** / **"Hold the egg to earn time."** [SOURCE]
- A barrier stops the holder from leaving the lane.
- A holder is slowed ×0.8; bat hits make them drop it.
- The event lasts 3 minutes. A live leaderboard of hold-seconds is shown; the winner gets the egg.

### 15.3 Great Bloom + Sakura Incubator (Cherry Blossom, every 30 min)
- The Incubator is unlocked by bringing a hatched **Crane** to the dormant tree ("Dormant Sakura tree – The tree sleeps. Bring it a crane."), then a cutscene: "Cherry blossom incubator unlocked".
- **Every 30 min:** "The Great Bloom has begun! Break trees, collect crystals, mutate your eggs." Crystal cherry trees appear in the lane. Click them to break them (HP 10–40) and they drop **Sakura Crystals**. The window lasts ~3 min (285 s in the config) [SOURCE: ELD, GB, BB, SAET].
- **Incubator UI:**
  - "Place egg" (unplaced eggs only);
  - "Deposit Sakura crystals to charge your egg. You have 105 crystals.";
  - Charge 0–150%: 1,000 crystals = 100% (Mutate unlocks), capped at 150% = 1,500 crystals;
  - possible results **Bloom (×1.25)** or **Spirit Bloom (×2.5)**. The Spirit Bloom chance is 2.5%, rising to 5% at 150%. The Robux boosters LUCK_BOOST_1/2/3 (x2/x4/x8, Appendix I) raise it to 10/20/40%.
  - Result text: "Your Mammoth egg is now Bloom." [SOURCE]

### 15.4 Rift Boss (Abyss Overlord), every 30 min at :00/:30
- Countdown "Something big is coming in 1 minute" → a portal opens → arena.
- **Phases:** destroy the 5 crystals (5 HP each) [SOURCE: WIKI; one video says 10 HP], then hit its hands ("That hand is its weakness", 100 dmg per bat hit when it faints), then "His shield is broken".
- **Rewards:** 1,200 Boss Tokens, Boss Mastery +1, and a chance of a Rift egg.
- **Boss Shop** (prices in Boss Tokens, WIKI): Mutation Consumable / Shard 400 (Fractured ×2.75, 10% success on a placed egg), 2x Cash 10m 175, 2x Treadmill 10m 200, 1.25x Speed 5m 225.
- **Rift Sacrifice:** give 3 requested pets, receive 1 Rift Egg (banners Riftborn / Riftbeasts / Shattered, rotating every 3 h globally, with pity) [SOURCE].

### 15.5 Dr. Scramble
- **Drones** every 30 min: "Dr. Scramble's running an experiment." Drones have 3 / 5 / 10 HP and drop **Samples** (10 / 65 / 200); the weapon auto-swings.
- **Mech boss** every 30 min: 30,000 HP, 3 phases, "He's overheating. Hit him now.", "Core overload". Rewards: 1,050–1,700 Samples and a 100-kill milestone track.
- **Experiment Shop** (the green flask HUD button):
  - Scrambled Mutation consumable 475 (×2.75, 10% success, "Consumable fizzled" on fail, "Scramble mutation applied" on success);
  - 2x Cash 10m 275; 1.25x Speed 5m 375; 2x Treadmill 10m 375;
  - limited eggs Experiment #001 6,500 and Nibbles #013 2,950.
  - Error text: "Not enough samples. Defeat drones to earn more."
- **Lab** (replaces the Rift): submit 3 recipe **eggs** → 1 banner egg; the recipe rotates hourly; pity 100 guarantees the top reward [SOURCE].

### 15.6 Angels & Demons Secret Shrine (fusion room)
- The entrance is a floor symbol plus the left waterfall, which teleports you into a room with two machines, **"Eternal Fusion"** and **"Divine Fusion"**. Each has a **Light pad** and a **Dark pad**.
- Two players stand on the pads holding the opposite pets:
  - **Pegasus + Skeleton Horse → Equinox** (Eternal, 10 h egg);
  - **ArchAngel + World Burner → Aetheron** (Divine, 18 h egg).
- UI text: "Partner needs Pegasus on the light pad. Both pets will be used up." / "Fusing. Stay on your pad."
- Each player receives the fused egg, keeping **their own pet's weight and mutations**. Each fusion type is allowed once per account [SOURCE].

### 15.7 Hungry Frog / parasites (Update 2)
- Infested eggs (spider-tooth look) spawn from Snow onward. Bring one home and feed its parasite to the Hungry Frog next to the Sell booth; each parasite fills 20%.
- At 100% you get a **Monster Chest** spin: 1.25x growth, 1.25x speed 5m, 2x treadmill 5m, fly-swatter bat, Parasite Egg (Parasite mutation ×3), Monstrous mutation [SOURCE].

---

## 16. TUTORIAL (`TutorialService`) [SOURCE, VERIFIED text where marked]
Steps, persisted in data; the top-center instruction text is white FredokaOne with a black stroke and a bounce-in:
1. **"Steal an Egg!"** Red chevron arrows are painted on the ground from the plot to the Forest nests (animated scrolling), and an arrow billboard hovers over one egg. A **guaranteed tutorial egg** spawns only for this player: Chicken or Dog, **Golden**, Scale 1.05, **grow time 5 s** [SOURCE: first pets are usually Golden; tutorial egg hatches in seconds]. **Any** Forest egg completes this step, not just the tutorial egg (VSF2P@00:30). The chicken guardian is 50% slower for tutorial players.
2. **"Bring it back to your base!"** Arrows point home; the safe zone line pulses.
3. **"Place the egg in your pen!"** The egg entry is auto-selected and the ghost is shown.
4. **"Hatch the egg!"** once ready.
5. **"Upgrade your Pen!"** right after the first hatch, with confetti (arrow to the Upgrade Pen board; $1K = base level 1 = treadmill unlock) [VERIFIED storyboards `QSA8L3lm9MI_shop_tutorial_00/01`]. If the player can't afford it yet, they keep stealing; the step completes when level 1 is bought.
6. **"Use your treadmill to become faster."** [VERIFIED text via SOURCE]. Stays until Speed ≥ 900.
7. End: **"Reach the Lake! (900 Speed)"**.

---

## 17. UI SPECIFICATION (match `reference/ingame/*` screenshots closely)

### 17.0 Global style rules
- **Font:** `Enum.Font.FredokaOne` for all titles, buttons, billboards and popups. For the big HUD numbers and timers use a heavy **italic** face: `label.FontFace = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Heavy, Enum.FontStyle.Italic)` (a `Font` object goes in the `FontFace` property, not `Font`). Roblox does not synthesise italics, and GothamSSm is not known to ship an italic face, so verify at startup that the italic face renders. If it doesn't, use `Font.fromEnum(Enum.Font.FredokaOne)` with `Enum.FontWeight.Bold`.
- **Every text** has a black `UIStroke` (Thickness 2–3, `ApplyStrokeMode.Contextual`) — the signature "cartoon outline" look.
- **Buttons:**
  - saturated fill with a vertical `UIGradient` (lighter top);
  - `UICorner` 10–12 px;
  - a darker 3 px `UIStroke` border of the same hue;
  - no "L/stud" pattern overlay (the real buttons have one, but it needs an image asset; omit it);
  - on hover: scale ×1.05 via `UIScale` tween 0.08 s; on click: squash ×0.92 then back; click sound.
- **Windows:** a header bar with a diagonal-stripe gradient (Shop = lime green `#4CDB2E→#2FB51A`, Pet Index = cyan `#3FD0FF→#1C8FE8`). The title sits left in 42 px white FredokaOne with a black stroke. A **red square close button** (`#E3262B`, dark red stroke, white "X") is inset at the top-right. The body is dark charcoal `#2A2D36` with a 3 px black outer stroke and 14 px corners. Windows open with a pop tween (scale 0.8→1, Back easing, 0.18 s) and dim the background 30%.
- **Badges:** a red circle `#E3262B` with a white number or "!" and a black stroke, at the top-right corner of the HUD buttons.
- All ScreenGuis: `IgnoreGuiInset = true`, `ResetOnSpawn = false`, `ZIndexBehavior = Sibling`. Use scale sizing with `UIAspectRatioConstraint` on square elements. The reference resolution is 1456×819; every position below is given as a fraction of the screen.

### 17.1 HUD — left side (see `reference/ingame/ingame_001_spawn_base_overview.jpg`)
| Element | Position / size (scale) | Look |
|---|---|---|
| **Shop** button | x 0.010, y 0.403, w 0.093, h 0.062 | green `#35D12E`, a white shopping-cart icon left, "Shop" text, a red "!" badge top-right. Turns **red** (cart + lightning icon) while on the treadmill and jumps to SPEED. |
| **Index** button | x 0.010, y 0.476, w 0.093, h 0.064 | cyan-blue `#18A9F0`, an open-book icon, "Index", a red count badge ("5") |
| **Slow Mode** toggle | x 0.010, y 0.556, pill w 0.058 h 0.040, label to the right | a dark rounded pill with a lime-green square knob (left = off). Label "Slow Mode" in white 20 px. |
| Boost lines | above the Speed row, x 0.01, from y 0.84 upward | e.g. "X2 Treadmill Boost (13m 36s)" in **cyan** `#4FD8FF` italic 16 px [VERIFIED storyboard `B7URwCQ1sFw_area_signs_guardians_02.jpg`] |
| **Speed** row | `AnchorPoint (0, 0.5)`, center y ≈ 0.89 [VERIFIED `ingame_hud_bottomleft_speed_money.png`]. Icon at x 0.008: a winged blue sneaker with a small yellow "+" badge that opens SPEED packs. Text at x 0.052, h 0.052 | **pink-red** `#FF3D6E` italic heavy text "410.6K", with " (x4K)" appended when multiplied. Optional: the value turns magenta while the 2× treadmill boost is active and yellow during the admin ×6 boost |
| **Money** row | `AnchorPoint (0, 0.5)`, center y ≈ 0.96. Icon at x 0.008: a green cash stack with **no** badge (clicking it still opens MONEY packs [DESIGN]). Text at x 0.052, h 0.052 | **lime green** `#3DFF3D` italic heavy "$25.9B" |
| Friend Boost | x 0.052, just under the Money text (center y ≈ 0.985); while it is visible, move the Speed and Money rows up by 0.025 [DESIGN] | white 14 px "Friend Boost: +35%" (hidden when 0) |

### 17.2 HUD — right side
| Element | Position | Look |
|---|---|---|
| **Growing Eggs** button | x 0.951, y 0.366, 0.038 × 0.066 (square) | a **red** `#E4262C` rounded square, dark-red stroke, a white/cream egg icon. At night a small moon + "x30" label floats above it [VERIFIED]. |
| **Pets** button | x 0.951, y 0.461 | an **orange** `#F59A23` square with a white paw icon |
| **Experiment Shop** button (Phase 2) | x 0.951, y 0.561 | a **green** `#40C83C` square with a bubbling flask icon |
| Extra event buttons (Phase 2) | continue downward | Boss mastery (bottle), etc. |
| Shop side-tabs (only while the Shop is open) | x 0.80–0.88, y 0.30–0.60 | icon + label: "Featured" (a red % tag), "Speed" (a sneaker), "Money" (cash), in white stroked text |
| Index side-tabs (while the Index is open) | x 0.82, y 0.26 / 0.35 | the big buttons **"World"** (blue + globe) and **"Limited"** (gold/brown + star) |

### 17.3 HUD — bottom-right timers [VERIFIED]
- Two rows sit on a dark translucent rounded strip (black, 60% transparency):
  - row 1: a green flask icon + **"in 5m 44s"** (next Phase-2 event; hide the row if events are off). While an event runs, it shows "Event ends in X" instead (storyboard `B7URwCQ1sFw_area_signs_guardians_02.jpg`);
  - row 2: a **moon icon + "in 4m 47s"** (time until night) or a **sun icon + "in 9s"** (time until day, during night).
- Text is white italic heavy, 30 px, with a black stroke, and turns red `#FF4040` when ≤ 30 s remain [VERIFIED red at "in 20s" and "in 9s", white at "in 4m 47s"]. Position x 0.845–0.99, y 0.84–0.97.

### 17.4 HUD — bottom center
- **Custom hotbar** (hide the default Backpack with `SetCoreGuiEnabled(Backpack,false)`): small dark translucent square slots 0.024 × 0.043 at y 0.93, with slot numbers at the top-left.
  - **10 slots**, numbered 1–10 [VERIFIED `reference/guides/ui_growing_eggs_panel_grow_all_allthings.webp`]: slot 1 = **Bat** (wooden bat icon); slot 2 = **Traps** with a count "x3" [VERIFIED]; slots 3–10 = egg entries.
  - Eggs are virtual inventory entries, not one `Tool` instance per egg: selecting one enters client placement mode (§8.4).
  - An expand arrow opens the **backpack** grid (all eggs, with a hover tooltip showing the egg's rarity, name, weight and preview income) [SOURCE].
  - Keys 1–9 and 0 select; console LB/RB; mobile tap.
- While carrying: a red **"Drop"** button (trash icon) above the hotbar.

### 17.5 HUD — top center
- **Instruction line** (tutorial).
- **"RUN!!"** (white text on a dark-red pill) while carrying.
- **Announcement stack** (§5.3), with admin chat-banners (§15.1) and the reset banner **"ALL EGG RESET!"**.
- **Countdown banners** ("Something big is coming", "The battle will begin in 8 seconds").
- Optional small line mirroring the pen sign "You earn $716B per day offline" (§8.7).

### 17.6 HUD — top-left and top-right
- **Top-left** (below the Roblox topbar): the **Rare Eggs** list (§5.3).
- **Top-right: the Roblox built-in player list** [VERIFIED `reference/ingame/ingame_hud_leaderboard_people_money_speed.png`]. The captured panel ("People | Money/s | Speed" header, tiny X at the top-left, commas below 1M and suffixes above, sorted by the first stat, e.g. "FatFrogIII 10.9B 101B", "manager 6M 410,699") is Roblox's own PlayerList showing `leaderstats`.
  - Create `leaderstats` with NumberValues **`Money/s`** (created first, so the list sorts by it) and **`Speed`**. Do NOT disable the CoreGui PlayerList.
  - Fallback, only if your Studio build doesn't abbreviate large values: hide the PlayerList with `SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false)` and build a panel 0.124 × 0.143 at (0.873, 0.044), with the same header and rows formatted per §4.9 (truncating `abbreviate`, commas below 1M), local player highlighted.

### 17.7 Shop window (§14 content) [VERIFIED: the eight `reference/ingame/ingame_002_…` to `ingame_009_…` shop screenshots listed in §14]
- Measured on the 2560 × 1387 captures: `Size = UDim2.fromScale(0.61, 0.61)`, `AnchorPoint (0.5, 0.5)`, `Position (0.5, 0.5)`, with a `UIAspectRatioConstraint` of 1.84. The header is 15% of the window height.
- Section title bars: centered 34 px text **"-- FEATURED --"** (yellow `#FFE338`), **"-- PASSES --"** (yellow), **"-- SPEED --"** (cyan `#46D8FF`), **"-- MONEY --"** (lime).
- Cards: 14 px corners, a 3 px dark stroke, a themed gradient background, the big glossy icon art (the §17.15 art-pack images; fallback: emoji TextLabels or simple Frame compositions). The Robux price button is lime green `#3FE03A` with the Robux glyph `utf8.char(0xE002)` and a white number; the gift button is a purple square `#B65BFF` with a white gift icon.
- Money-price buttons (e.g. `$75B` on the UPGRADE TREADMILL! card) are **red when unaffordable and green when affordable** [VERIFIED red "$75B"].
- The featured egg card has a fiery orange-red gradient background, odds tiles with dark rounded frames, a pet ViewportFrame and a % label in the bottom-right in white stroke. The "50 Eggs" button has an animated rainbow gradient border and a red strikethrough old price above it.

### 17.8 Pet Index window — see §11 and `reference/ingame/ingame_010_index_forest_chicken.jpg` [VERIFIED]. `Size = UDim2.fromScale(0.61, 0.645)`, `AnchorPoint (0.5, 0.5)`, `Position (0.5, 0.48)`, same `UIAspectRatioConstraint` as the Shop.

### 17.9 Growing Eggs panel (red egg button) [SOURCE `reference/guides/ui_growing_eggs_panel_grow_all_allthings.webp`]
- A slide-out panel from the right edge, ≈ 0.22 × 0.33 of the screen (x 0.766–0.986, y 0.354–0.683), titled **"Growing Eggs"**, with a yellow **"Grow All"** button (Robux) in the header.
- **Rows:** an egg icon (colored per species), a progress bar with remaining time **"2h 54m"**, and a green **▶ (skip, Robux)** button. When ready the row shows a green **"Open"** button that hatches remotely.
- A small red ">" tab collapses it.

### 17.10 Pets panel (paw) — §8.8. Card grid 4 columns; the top bar holds "Equipped 8/9 [+1 Equip $75M] [Equip Best] [Unequip All]" and a search box (9 slots = base level 2; "+1 Equip" buys level 3 for $75M, §8.2).

### 17.11 World boards (SurfaceGui / BillboardGui)
- **Upgrade Pen board** (`reference/ingame/ingame_001_spawn_base_overview.jpg`): black board, white "Upgrade Pen", green "Level 5 > Level 6", and a red pill button with a white shuriken/sparkle icon and "$50B". It is green when affordable. At penLevel 0: "Unlock Pen Level 1" / "$1K" (§8.3).
- **Treadmill board:** "Upgrade", "Level 5 > Level 6", `[$3B]` `[R$199]`, or "Level MAX". The money button is red when unaffordable and green when affordable.
- **Zone sign:** a wooden sign with "Jungle" / "Recommended Speed" and "40K", red or green per player (local SurfaceGui text color).
- **Pet billboard** and **egg billboard** per §8.
- **Fuse / Sell / Trails** floating titles.
- **Nametag:** the default Roblox name.

### 17.12 Notifications / toasts
- Bottom-center-up stack, max 3: short white FredokaOne text with a black stroke, sliding up and fading after 2.5 s.
- Error toasts are red ("Not enough money!", "Cannot use items in safe zone.", "Too close to another egg.", "You have too many eggs placed.", "Your egg inventory is full!").
- Success toasts are green ("You stole an EGG!", "Purchase successful!").

### 17.13 Screen effects
- Red edge vignette while carrying or chased.
- A white flash on hatch.
- Confetti (UI particles) on purchase and on "You stole an EGG!".
- Night: a blue color-correction tint plus stars.
- Screen shake on guardian hits and heavy carries.

### 17.14 Platform support
- Mobile: all HUD buttons are tappable, with on-screen **Drop / Swing / Trap** buttons.
- Console: `ContextActionService` bindings (ButtonX swing, ButtonY drop, DPad hotbar); menus are navigable with `GuiService.SelectedObject`.

### 17.15 UI ART PACK (generate with Codex native image gen, §0.4)
Generate original glossy cartoon icons in the game's style into `ui_assets/`. Attach the matching `reference/ingame/*` screenshot with `-i` so style and colors match. Request "centered, transparent background (or solid #00FF00 background), no text unless specified, 1024×1024". Then post-process with a small Python/PIL script:
- chroma-key the #00FF00 background to alpha if needed;
- trim;
- resize to 256×256 (icons) or 512×256 (cards);
- save as PNG.

| File | Used by | Description |
|---|---|---|
| `icon_shop_cart.png` | Shop button | white shopping cart with a bold dark outline |
| `icon_shop_cart_lightning.png` | red treadmill Shop button | cart + yellow lightning bolt |
| `icon_index_book.png` | Index button | open blue book |
| `btn_eggs.png` | Growing Eggs button | cream egg on a glossy red rounded square |
| `btn_pets.png` | Pets button | white paw on a glossy orange rounded square |
| `btn_flask.png` | Experiment Shop button | bubbling green flask on a glossy green rounded square |
| `icon_speed_sneaker.png` | Speed counter | blue winged sneaker |
| `icon_plus_badge.png` | the "+" badge on the Speed sneaker (the cash stack has none) | yellow square "+" with a dark border |
| `icon_cash_stack.png` | Money counter | green banknote stack with a yellow band |
| `icon_moon_cloud.png` / `icon_sun.png` | night/day timer | crescent moon with cloud / bright sun |
| `icon_gift.png` | gift buttons | white gift box |
| `icon_trash.png` | Drop button | white trash can |
| `icon_percent_tag.png`, `icon_sneakers_tab.png`, `icon_money_tab.png` | Shop side tabs | red % price tag; sneakers; cash |
| `icon_globe.png`, `icon_star_limited.png` | Index tabs | globe; gold star |
| `card_x2_growth.png`, `card_x2_money.png` | PASSES cards | rainbow stopwatch with fast-forward arrows; gold "x2" coin with cash |
| `card_speed_1..6.png` | speed packs | sneaker art escalating: 1 pair → pile → bag → overflowing chest |
| `card_cash_1..5.png` | cash packs | bills → stacks → big stacks → money bag → safe |
| `card_double_speed.png` | DOUBLE Your SPEED | a bag of blue sneakers |
| `banner_featured_extinction.png` | FEATURED card background | fiery orange-red volcanic backdrop with bones (no text) |
| `zonecard_<zone>.png` ×12 | Index zone art cards | vertical 1:2 biome painting per zone (Forest trees, Lake mountains + water, Desert pyramid, …) |
| `trail_<name>.png` ×11 | Trails shop cards | blocky runner silhouette with that trail's ribbon |
| `icon_zzz.png`, `icon_alert.png` | guardian billboards | blue "Z z Z"; red "!" |
| `bubble_mama.png` | hatch speech bubble | white speech bubble (the text "Mama!" is rendered in-game, not baked) |

**Uploading and wiring:**
- **With the Roblox Studio MCP:** serve the folder locally (`python -m http.server 8765` inside `ui_assets/`), then call `upload_image` with `http://localhost:8765/<file>.png` URLs in batches. It returns a `rbxassetid://` map.
- **Otherwise:** use Studio's Asset Manager bulk import, or Open Cloud Assets API with a user-provided key.
- Write the resulting ids into `Shared/Assets.luau`. Every UI element must still render if an id is missing: fall back to the emoji TextLabel or Frame composition from §0 "Asset-free techniques" (🛒 cart, 📖 book, 👟 sneaker, 💵 cash, 🐾 paw, 🧪 flask, 🌙 / ☀️ timers, 🗑 drop, 🎁 gift, ⭐ limited).
- These art-pack images are the ONLY uploaded assets in the game (§0 requirement 1). Animations, sounds and particles never use uploads.
- For the Robux price icon, don't generate one: use Roblox's built-in Robux glyph `utf8.char(0xE002)` in a Builder Sans text label. Verify it renders in Studio; if not, draw a hexagon from two rotated Frames.

---

## 18. AUDIO & VFX
- **Music:** a light, bouncy, "Grow a Garden"-style loop in the hub and lanes (a calm marimba/ukulele feel). Leave the Config id empty (music off) unless you know a royalty-free Roblox library track id. Separate boss music for events.
- **SFX list** (Config ids). Any `SoundId` left empty is skipped silently (§0 "Asset-free techniques"). Suggested built-ins: UI click = `rbxasset://sounds/button.wav` / `clickfast.wav`; steal whoosh = `swordslash.wav`; hit = `swordlunge.wav`; ragdoll grunt = `uuhhh.mp3`; trap snap = `snap.wav`; reset chime = `electronicpingshort.wav`; fling = `action_jump.mp3`. Everything else may stay empty:
  - UI click and pop
  - purchase cash-register "cha-ching"
  - repeating soft coin ticks for income ("money money money")
  - steal pickup "whoosh"
  - guardian **roar** per species and a **snore** loop while asleep
  - hit "bonk"
  - ragdoll grunt
  - trap snap
  - egg crack ×3, then hatch fanfare (bigger for rarer)
  - pet voice "**Mama!**" (a high-pitched blip or TTS-like chirp)
  - reset chime on "ALL EGG RESET!"
  - Divine spawn fanfare
  - treadmill footstep ticks
  - night whoosh and wall rumble
- **VFX** (every `ParticleEmitter` uses the built-in default texture, tinted by `Color`; no uploaded images):
  - rarity sparkles on eggs;
  - a rainbow glow for Secret, a gold sun glow for Eternal, a white-gold sky beam for Divine;
  - mutation particles: Golden coin sparkles, Silver metallic glints, Rainbow hue cycle, Bloom pink petals, Spirit Bloom blue-green wisps, Fractured purple shards, Scrambled green toxic bubbles;
  - trails;
  - money popups;
  - hatch flash and shell shards;
  - a dust puff on landing after being flung;
  - "Z z Z" and "!" billboards on guardians.
- **Lighting:** bright daytime (`Lighting.Brightness 2.5`, `ClockTime 14`, outdoor ambient `(140,140,140)`), with slight `Bloom` and `ColorCorrection` saturation +0.15. Night uses ClockTime 0 with blue ambient. Zone-specific atmosphere changes client-side as the player enters a lane (Volcano red haze, Cosmic purple, Abyss blue fog, Snow white fog).

---

## 19. DATA, NETWORKING, ANTI-EXPLOIT

### 19.1 Player data schema (`DataService`, DataStore "SAE_PlayerData_v1", key `"u_" .. userId`)
Shape only (field names, types and defaults); fields like `species, weight` list the record's keys. Real data comes from the Appendix modules.
```lua
{
  version = 1,
  money = 0, speed = 10, speedMultTier = 0,             -- tier n => x2^n
  treadmillLevel = 0,                                    -- 0 = locked, 1 = Basic ... 11 = Astral
  trailsOwned = {}, equippedTrail = nil,
  penLevel = 0, -- 0 = start (7 slots, treadmill locked); buying level 1 ($1K) from EITHER the Unlock board or the Upgrade Pen board sets BOTH penLevel and treadmillLevel to 1
  pets = { [petId] = { species, weight, scale, mutations = {"Golden"}, gender = "M", equipped = true, favorite = false, source = "egg" } },  -- source: "egg" | "limited" | "fuse" | "admin"
  eggs = { [eggId] = { species, weight, scale, mutations = {}, spawnId } },               -- unplaced inventory
  placed = { [eggId] = { species, weight, scale, mutations, pos = {x,z}, remaining = 5400, total = 5400 } },
  index = { [species] = { discovered = true, claimed = false } },
  batSkin = "Bat", unlockedBats = {"Bat"},
  claimedSpawns = { ["58901234:Forest:3"] = true },     -- prune to current+previous cycle
  boosts = { treadmill2x = 0, cash2x = 0, speed125 = 0, growth125 = 0, timedSpeed = 0 },   -- unix end times
  passes = { x2Money = false, x2Growth = false }, giftedPasses = {}, -- owned = UserOwnsGamePassAsync(pcall, cached per session) OR giftedPasses[key]
  settings = { hideOtherPets = false, slowMode = false },
  offlinePending = 0,                                   -- unclaimed offline cash pile (§8.7)
  processedReceipts = { [purchaseId] = true },          -- keep last 200
  tutorialStep = 1, freeChestClaimed = false,
  lastOnline = 0, stats = { steals = 0, hatches = 0, timePlayed = 0, highestIncome = 0 },
}
```
- Use `UpdateAsync`, session locks (store `lockedBy = JobId, lockTime`), autosave every 120 s and on leave, and `BindToClose` with a 25 s budget. Retry with backoff. Kick with a friendly message if data fails to load; never overwrite with defaults.
- Store money and speed as numbers (doubles) — values reach 1e18+.
- **OrderedDataStores** "SAE_TopIncome" and "SAE_TopSpeed" store `v < 1 and 0 or math.floor(math.log10(v) * 1e6)` (ordered stores need integers under 2^53, and log10(0) = −inf). Decode with `10^(x/1e6)`. They are updated every 5 min.

### 19.2 Remotes (all in `Remotes.luau`, server validates everything)
- **client → server:** `RequestStealBegin(spawnId)`, `RequestSteal(spawnId)`, `RequestPickupLoose(looseId)`, `RequestPlaceEgg(eggId, x, z)`, `RequestHatch(eggId)`, `RequestDropEgg()`, `RequestSwing()`, `RequestPlaceTrap(pos)`, `RequestPickupTrap(trapId)`, `RequestBuy(kind, id)`, `RequestPurchaseIntent(kind, arg)`, `RequestEquipPet(petId, bool)`, `RequestEquipBest()`, `RequestSetAutoEquipBest(bool)`, `RequestUnequipAll()`, `RequestFavorite(petId, bool)`, `RequestSell(ids)`, `RequestFuse(petIds)`, `RequestClaimIndex(species|"ALL")`, `RequestEquipBat(skin)`, `RequestToggleSlowMode(bool)`, `RequestSetSetting(name, value)` (e.g. hide other players' pets), `RequestTutorialAck(step)`, `RequestClaimFree()`.
- **server → client:** `Notify`, `Announce`, `StateSync` (a compact player-state diff), `CycleSync`, `EggState` (the player's own nest list), `NestRemove(spawnId)`, `Knockback(velocity, ragdollSeconds)`, `BoostSync`, `HatchFX`, `StealFX`.
- Per-remote **rate limits** (for example Swing 4/s, Place 5/s, Buy 3/s). Drop and log violators.

### 19.3 Anti-exploit (the real game was plagued by teleport and auto-steal scripts)
- Server-side **position sanity:** track root positions every 0.25 s. Reject steals completed with an implied speed > `walkSpeed * 1.6 + 20` studs/s, or teleports >80 studs without a server teleport. Rubber-band or kick repeat offenders.
- Egg pickup distance is checked on the server.
- Speed and money only change inside services.
- Guardians are server-owned.
- Never trust client timers.
- Disconnecting while carrying returns the egg to its nest (no disconnect exploit).

---

## 20. PROCEDURAL VOXEL ART (`ModelFactory`)

Everything is built from anchored/welded **blocky Parts** (SmoothPlastic, or Plastic for a studded look) to recreate the chunky voxel style (`reference/wiki/pet__*`, `reference/official/*`). Keep the part count ≤ 60 per pet, ≤ 120 per guardian, and ≤ 25 per egg. Group into a Model with a PrimaryPart "Root" (invisible, CanCollide false, anchored for pen pets moved by CFrame tweening, or unanchored with AlignPosition/AlignOrientation).

### 20.1 Eggs
- **Base shape:** a stack of 5 cylinders/blocks approximating an egg silhouette (a voxel ellipsoid 2.4 wide × 3 tall at scale 1). The top half is narrower.
- **Species theming:** primary color + a band/spot pattern color + a feature from the pet:
  - Chicken: plain tan with light speckles.
  - Brr Brr Patapim: tan with green leaves.
  - King Snake: green with lime bands.
  - Unicorn: white/pink crystal with a small horn on top ("looks like a cupcake").
  - T-Rex: brown with bony spikes and orange hexagon plates (`reference/official/thumbnail_1_119722099122044_768x432.png`).
  - Yeti: blue with a snowflake.
  - Cosmic: dark galaxy with a ring (planet egg).
  - Angels: white with little wings.
  - Demons: red-black with horns.
  - Cherry Blossom: white/black with pink sakura.
  - Titan: mossy stone with a glowing orange core and vines.
  - Dragons: scaled, with 2 small wing stubs.
  - Ice Dragon egg is icy; Lava Dragon egg is the same egg in red [SOURCE].
- Auto-derive a default from the pet palette (Appendix A2) for species without a special rule.
- **Special eggs:**
  - Brainrot/Limited = a golden "?" lucky-block egg;
  - Monster = dark stone with blue cracks and glowing eyes;
  - Luminous = green overgrown with glowing runes;
  - Extinction = a red/orange spiky egg with bone horns;
  - Biohazard = a green-tech biohazard egg (`reference/official/game_icon_512.png`).

### 20.2 Pets — archetype builders
Implement ~14 parametric archetypes. Each takes `(palette {primary, secondary, accent, eye}, features {horns, wings, tail, mane, crown, spikes, flames, stripes, spots, glow, fins})`:
- `Quadruped` (dog, fox, bear, tiger, camel, lion-likes, walrus, mammoth, rhinotaur);
- `Bird` (chicken, bird, owl, duck, swan, toucan, penguin, dodo, crane, dove);
- `Fish` (catfish, parrotfish, swordfish, shark, koi, whale shark, orca, beluga, manta);
- `Lizard` (axolotl, gecko, iguana, salamander, crocodile);
- `Snake`;
- `Arachnid` (spider, scorpion, sand spider, spideron, crustacia);
- `Ape` (chimp, gorilla, yeti, cosmic gorilla, gorilla king);
- `Dragon` (ice, lava, cosmic, lunar, void, ember) — winged quadruped with a long tail;
- `Dino` (t-rex biped, triceratops, bronto long-neck, ankylosaurus, mosasaurus);
- `SeaMonster` (kraken with tentacles, leviathan serpent, el maja);
- `Horse` (unicorn with a horn, pegasus with wings, skeleton horse bone-white/black, centaur, equinox half-white/half-black);
- `Insect` (centapede, moth, mantis);
- `Humanoid` (cosmic skeleton boss, gargoyle, imp, archangel, world burner, brainrots);
- `Blob` (frog, jellyfish, chilli).

**Pet visual details:**
- **Faces:** 2 black square eyes with a white 1-voxel highlight; a small mouth or beak.
- **Idle animation:** a bob of 0.15 studs at 2 Hz. **Walk:** legs swing ±25°. Both are CFrame / `Motor6D.Transform` math on the client (no Animation assets).
- **Base size:** the pet's `displayScale = clamp((weight/pet.modelWeight)^(1/3), 0.5, 25) * archetypeBaseSize`, i.e. `clamp(s, 0.5, 25) * archetypeBaseSize` (archetype base ~3–5 studs; bosses bigger).
- **Mutation materials:**
  - Golden: every part `(255,196,40)`, Reflectance 0.25, Metal material;
  - Silver: `(205,210,220)`, Metal;
  - Rainbow: a per-part hue offset, cycled client-side;
  - Bloom: pink tint plus petal particles;
  - Spirit Bloom: teal-green glow;
  - Fractured: dark-purple crystal shards attached;
  - Scrambled: green neon veins plus toxic bubbles.

### 20.3 Guardians
Same archetypes with more detail (crown for Gorilla King and Cosmic Skeleton, three heads for Cerberus, wings and spear for Angel, bat wings and horns for Demon), scaled so the model's bounding-box height equals the zone's `guardianHeight` (§3.1: Forest 14 … Titan Temple 34 studs). A sleeping pose sets the body low with the head on its paws, at the center of its 5 nests (§2.2).

### 20.4 Treadmills (11 themes) [SOURCE images `reference/wiki/treadmill__*`]
- **Common frame:** a belt platform 6×12, side rails, and a tall front frame with a **black screen panel** (8×6) facing the runner. The belt is scrolled with moving stripe parts (§9.1), not a Texture.
- **Themes by tier:**
  1. **Basic:** dark charcoal `#3A3D45` with studded rails and a diamond-tread belt (`reference/guides/treadmill_base_eldorado.webp`).
  2. **Sci-Fi:** white with a cyan glow.
  3. **Flame:** black with gold rails and flame particles.
  4. **Celebrity:** gold/red carpet.
  5. **Golden:** gold/black.
  6. **Freeze:** icy blue crystals.
  7. **Lucky Block:** covered in yellow "?" blocks with a rainbow belt.
  8. **Hacker:** dark pillars with green matrix screens and a green belt.
  9. **Demonic:** lava/fire pillars with a red-orange belt.
  10. **Angelic:** white pillars, wings, halos and a gold belt.
  11. **Astral:** a dark frame with cyan crystals, gold trim and a glowing cyan belt.

---

## 21. DATA APPENDICES (paste into the `Shared/` modules verbatim)

### Appendix A — `PetData.luau`: every biome pet [SOURCE: in-game index cards + decompiled config + Fandom modules]
- `income` = base $/s at Scale 1 with no mutation.
- `modelWeight` = kg at Scale 1.
- `eggWeight` = carry-weight factor (1–10).
- `growSeconds` = base hatch time.
- `chance` = % weight inside that zone's nest roll. Each zone sums to 100; Angels & Demons sums to 100 per `side` (200 in total; the fusion pets are 0).
- `indexSpeed` / `indexCash` = Index discovery rewards. Angels & Demons values are per pet (Fandom detail pages + Pet Index utility); a mirror with no data copies its pair (Imp = Sacred Moth 8M, Centaur = RazorFang 90M, ArchAngel = World Burner 600M).
- `side` marks Angels & Demons Light/Dark pets. Mirror pairs share their hatch time (World Burner = ArchAngel = 18 h).
- `fusionOnly` pets never spawn in nests (Shrine fusions only).
- **Index tiles are laid out in Appendix A row order** (verified against the live index and storyboards).
- Angels & Demons odds reuse the Cherry Blossom/Titan Temple curve [DESIGN; the real values are unpublished]. Config note: this gives the A&D Secrets 5.1% per slot per side, while every other zone's Secrets are ≤ 1.8%, so A&D alone produces a Secret in ~23% of cycles. That is acceptable; keep the A&D weights in Config so they can be tuned.

```lua
-- AUTO-GENERATED from research data (Fandom modules + in-game index cards). Chance = % weight inside that zone's nest roll.
return {
  ["Forest"] = {
    { name = "Chicken", rarity = "Common", income = 1, modelWeight = 8, eggWeight = 1, growSeconds = 10, chance = 34, indexSpeed = 420, indexCash = 100, },
    { name = "Dog", rarity = "Common", income = 2, modelWeight = 25, eggWeight = 1, growSeconds = 15, chance = 24, indexSpeed = 460, indexCash = 200, },
    { name = "Bird", rarity = "Uncommon", income = 8, modelWeight = 5, eggWeight = 1, growSeconds = 25, chance = 17, indexSpeed = 500, indexCash = 800, },
    { name = "Burrowing Owl", rarity = "Rare", income = 35, modelWeight = 8, eggWeight = 1, growSeconds = 40, chance = 10, indexSpeed = 560, indexCash = 3500, },
    { name = "Raccoon", rarity = "Rare", income = 45, modelWeight = 19, eggWeight = 1, growSeconds = 50, chance = 7, indexSpeed = 620, indexCash = 4500, },
    { name = "Bear", rarity = "Epic", income = 240, modelWeight = 220, eggWeight = 2, growSeconds = 120, chance = 2.5, indexSpeed = 820, indexCash = 24000, },
    { name = "Fox", rarity = "Epic", income = 180, modelWeight = 28, eggWeight = 1, growSeconds = 90, chance = 4.5, indexSpeed = 720, indexCash = 18000, },
    { name = "Brr Brr Patapim", rarity = "Legendary", income = 1800, modelWeight = 800, eggWeight = 2, growSeconds = 300, chance = 1, indexSpeed = 1000, indexCash = 180000, },
  },
  ["Lake"] = {
    { name = "Frog", rarity = "Common", income = 3, modelWeight = 3, eggWeight = 2, growSeconds = 15, chance = 29.274167, indexSpeed = 2000, indexCash = 300, },
    { name = "Duckling", rarity = "Common", income = 4, modelWeight = 3, eggWeight = 2, growSeconds = 20, chance = 23.217443, indexSpeed = 2250, indexCash = 400, },
    { name = "Catfish", rarity = "Uncommon", income = 12, modelWeight = 35, eggWeight = 2, growSeconds = 30, chance = 17.160719, indexSpeed = 2500, indexCash = 1200, },
    { name = "Turtle", rarity = "Rare", income = 60, modelWeight = 100, eggWeight = 2, growSeconds = 50, chance = 12.113448, indexSpeed = 2750, indexCash = 6000, },
    { name = "Trulimero Trulicina", rarity = "Epic", income = 260, modelWeight = 140, eggWeight = 2, growSeconds = 90, chance = 8.075632, indexSpeed = 3000, indexCash = 26000, },
    { name = "Swan", rarity = "Epic", income = 320, modelWeight = 22, eggWeight = 2, growSeconds = 120, chance = 5.551997, indexSpeed = 3500, indexCash = 32000, },
    { name = "Axolotl", rarity = "Legendary", income = 2800, modelWeight = 28, eggWeight = 2, growSeconds = 300, chance = 4.037816, indexSpeed = 4000, indexCash = 280000, },
    { name = "Leviathan", rarity = "Cosmic", income = 220000, modelWeight = 5000, eggWeight = 2, growSeconds = 1500, chance = 0.568777, indexSpeed = 5000, indexCash = 22000000, },
  },
  ["Desert"] = {
    { name = "Jerboa", rarity = "Common", income = 6, modelWeight = 2, eggWeight = 2, growSeconds = 20, chance = 26.585432, indexSpeed = 7200, indexCash = 600, },
    { name = "Fennec", rarity = "Uncommon", income = 18, modelWeight = 8, eggWeight = 2, growSeconds = 30, chance = 20.450332, indexSpeed = 8100, indexCash = 1800, },
    { name = "Camel", rarity = "Rare", income = 75, modelWeight = 700, eggWeight = 2, growSeconds = 45, chance = 15.337749, indexSpeed = 9000, indexCash = 7500, },
    { name = "Tob Tobi Tob Tob", rarity = "Epic", income = 325, modelWeight = 700, eggWeight = 3, growSeconds = 75, chance = 12.270199, indexSpeed = 9900, indexCash = 32500, },
    { name = "Snake", rarity = "Legendary", income = 3600, modelWeight = 45, eggWeight = 3, growSeconds = 150, chance = 9.20265, indexSpeed = 10800, indexCash = 360000, },
    { name = "Scorpion", rarity = "Mythic", income = 18500, modelWeight = 75, eggWeight = 3, growSeconds = 300, chance = 6.646358, indexSpeed = 14400, indexCash = 1850000, },
    { name = "Sand Spider", rarity = "Mythic", income = 16000, modelWeight = 120, eggWeight = 3, growSeconds = 240, chance = 8.180133, indexSpeed = 12600, indexCash = 1600000, },
    { name = "Royal Sphinx", rarity = "Cosmic", income = 280000, modelWeight = 4000, eggWeight = 3, growSeconds = 1800, chance = 1.327147, indexSpeed = 18000, indexCash = 28000000, },
  },
  ["Jungle"] = {
    { name = "Toucan", rarity = "Rare", income = 110, modelWeight = 5, eggWeight = 3, growSeconds = 40, chance = 20.005214, indexSpeed = 8100, indexCash = 11000, },
    { name = "Chimpanzee", rarity = "Rare", income = 90, modelWeight = 65, eggWeight = 3, growSeconds = 30, chance = 26.006779, indexSpeed = 7200, indexCash = 9000, },
    { name = "Crocodile", rarity = "Epic", income = 420, modelWeight = 400, eggWeight = 3, growSeconds = 60, chance = 17.004432, indexSpeed = 9000, indexCash = 42000, },
    { name = "Gorilla", rarity = "Legendary", income = 4800, modelWeight = 190, eggWeight = 3, growSeconds = 120, chance = 13.003389, indexSpeed = 9900, indexCash = 480000, },
    { name = "Orangutini Ananassini", rarity = "Legendary", income = 5500, modelWeight = 140, eggWeight = 3, growSeconds = 150, chance = 11.002868, indexSpeed = 10800, indexCash = 550000, },
    { name = "Spider", rarity = "Mythic", income = 22000, modelWeight = 120, eggWeight = 4, growSeconds = 270, chance = 7.852047, indexSpeed = 12600, indexCash = 2200000, },
    { name = "Tiger", rarity = "Mythic", income = 28000, modelWeight = 260, eggWeight = 4, growSeconds = 360, chance = 5.001304, indexSpeed = 14400, indexCash = 2800000, },
    { name = "King Snake", rarity = "Secret", income = 3500000, modelWeight = 10000, eggWeight = 4, growSeconds = 5400, chance = 0.123968, indexSpeed = 18000, indexCash = 350000000, },
  },
  ["Snow"] = {
    { name = "Penguin", rarity = "Rare", income = 140, modelWeight = 16, eggWeight = 4, growSeconds = 45, chance = 29.444067, indexSpeed = 12800, indexCash = 14000, },
    { name = "Walrus", rarity = "Epic", income = 600, modelWeight = 200, eggWeight = 4, growSeconds = 60, chance = 21.570745, indexSpeed = 14400, indexCash = 60000, },
    { name = "Polar Bear", rarity = "Legendary", income = 7000, modelWeight = 650, eggWeight = 4, growSeconds = 120, chance = 18.335133, indexSpeed = 16000, indexCash = 700000, },
    { name = "Sabertooth Tiger", rarity = "Mythic", income = 35000, modelWeight = 350, eggWeight = 4, growSeconds = 240, chance = 14.020984, indexSpeed = 17600, indexCash = 3500000, },
    { name = "Mammoth", rarity = "Mythic", income = 42000, modelWeight = 2000, eggWeight = 4, growSeconds = 300, chance = 11.86391, indexSpeed = 19200, indexCash = 4200000, },
    { name = "King Mammoth", rarity = "Cosmic", income = 400000, modelWeight = 25000, eggWeight = 4, growSeconds = 900, chance = 4.171033, indexSpeed = 22400, indexCash = 40000000, },
    { name = "Yeti", rarity = "Secret", income = 5000000, modelWeight = 1500, eggWeight = 4, growSeconds = 6300, chance = 0.371904, indexSpeed = 25600, indexCash = 500000000, },
    { name = "Ice Dragon", rarity = "Eternal", income = 65000000, modelWeight = 8500, eggWeight = 4, growSeconds = 14400, chance = 0.222224, indexSpeed = 32000, indexCash = 6500000000, },
  },
  ["Volcano"] = {
    { name = "Lava Gecko", rarity = "Rare", income = 180, modelWeight = 14, eggWeight = 5, growSeconds = 60, chance = 26.848869, indexSpeed = 24000, indexCash = 18000, },
    { name = "Lava Frog", rarity = "Epic", income = 850, modelWeight = 4, eggWeight = 5, growSeconds = 90, chance = 22.040116, indexSpeed = 27000, indexCash = 85000, },
    { name = "Flaming Bull", rarity = "Legendary", income = 9500, modelWeight = 450, eggWeight = 5, growSeconds = 180, chance = 18.032822, indexSpeed = 30000, indexCash = 950000, },
    { name = "Lava Iguana", rarity = "Legendary", income = 11000, modelWeight = 400, eggWeight = 5, growSeconds = 240, chance = 15.027352, indexSpeed = 36000, indexCash = 1100000, },
    { name = "Chillin Chilli", rarity = "Mythic", income = 55000, modelWeight = 30, eggWeight = 5, growSeconds = 420, chance = 17.030999, indexSpeed = 33000, indexCash = 5500000, },
    { name = "Cerberus", rarity = "Secret", income = 8000000, modelWeight = 9000, eggWeight = 5, growSeconds = 7200, chance = 0.61984, indexSpeed = 42000, indexCash = 800000000, },
    { name = "Phoenix", rarity = "Eternal", income = 85000000, modelWeight = 2500, eggWeight = 5, growSeconds = 16200, chance = 0.222224, indexSpeed = 48000, indexCash = 8500000000, },
    { name = "Lava Dragon", rarity = "Eternal", income = 100000000, modelWeight = 14000, eggWeight = 5, growSeconds = 18000, chance = 0.177779, indexSpeed = 60000, indexCash = 10000000000, },
  },
  ["Abyss Ocean"] = {
    { name = "Parrotfish", rarity = "Rare", income = 220, modelWeight = 5, eggWeight = 6, growSeconds = 75, chance = 34.755713, indexSpeed = 72000, indexCash = 22000, },
    { name = "Swordfish", rarity = "Epic", income = 1100, modelWeight = 250, eggWeight = 6, growSeconds = 120, chance = 24.665345, indexSpeed = 81000, indexCash = 110000, },
    { name = "Shark", rarity = "Legendary", income = 15000, modelWeight = 450, eggWeight = 6, growSeconds = 240, chance = 19.059585, indexSpeed = 90000, indexCash = 1500000, },
    { name = "Orca", rarity = "Mythic", income = 80000, modelWeight = 1800, eggWeight = 6, growSeconds = 360, chance = 14.574977, indexSpeed = 99000, indexCash = 8000000, },
    { name = "Whale Shark", rarity = "Cosmic", income = 700000, modelWeight = 2000, eggWeight = 6, growSeconds = 600, chance = 3.412663, indexSpeed = 108000, indexCash = 70000000, },
    { name = "Beluga Whale", rarity = "Cosmic", income = 850000, modelWeight = 5000, eggWeight = 6, growSeconds = 720, chance = 2.616375, indexSpeed = 126000, indexCash = 85000000, },
    { name = "Kraken", rarity = "Secret", income = 15000000, modelWeight = 18000, eggWeight = 6, growSeconds = 8100, chance = 0.826453, indexSpeed = 144000, indexCash = 1500000000, },
    { name = "El Maja", rarity = "Eternal", income = 130000000, modelWeight = 90000, eggWeight = 6, growSeconds = 19800, chance = 0.08889, indexSpeed = 180000, indexCash = 13000000000, },
  },
  ["Prehistoric"] = {
    { name = "Dodo", rarity = "Rare", income = 280, modelWeight = 20, eggWeight = 7, growSeconds = 90, chance = 39.066058, indexSpeed = 240000, indexCash = 28000, },
    { name = "Pterodactyl", rarity = "Legendary", income = 22000, modelWeight = 180, eggWeight = 3, growSeconds = 180, chance = 26.044039, indexSpeed = 270000, indexCash = 2200000, },
    { name = "Ankylosaurus", rarity = "Mythic", income = 120000, modelWeight = 2500, eggWeight = 2, growSeconds = 300, chance = 20.835231, indexSpeed = 330000, indexCash = 12000000, },
    { name = "Triceratops", rarity = "Cosmic", income = 1200000, modelWeight = 3500, eggWeight = 3, growSeconds = 480, chance = 4.929402, indexSpeed = 360000, indexCash = 120000000, },
    { name = "Bronto", rarity = "Cosmic", income = 1500000, modelWeight = 35000, eggWeight = 4, growSeconds = 660, chance = 6.995959, indexSpeed = 300000, indexCash = 150000000, },
    { name = "Tralaledon", rarity = "Secret", income = 32000000, modelWeight = 1000, eggWeight = 4, growSeconds = 10800, chance = 0.826453, indexSpeed = 480000, indexCash = 3200000000, },
    { name = "T-Rex", rarity = "Secret", income = 25000000, modelWeight = 7500, eggWeight = 5, growSeconds = 9000, chance = 0.991743, indexSpeed = 420000, indexCash = 2500000000, },
    { name = "Mosasaurus", rarity = "Eternal", income = 180000000, modelWeight = 30000, eggWeight = 6, growSeconds = 21600, chance = 0.311113, indexSpeed = 600000, indexCash = 18000000000, },
  },
  ["Cosmic"] = {
    { name = "Centapede", rarity = "Epic", income = 1500, modelWeight = 6, eggWeight = 7, growSeconds = 120, chance = 39.869773, indexSpeed = 960000, indexCash = 150000, },
    { name = "Cosmic Gecko", rarity = "Legendary", income = 30000, modelWeight = 18, eggWeight = 8, growSeconds = 240, chance = 34.387407, indexSpeed = 1080000, indexCash = 3000000, },
    { name = "Cosmic Gorilla", rarity = "Mythic", income = 180000, modelWeight = 450, eggWeight = 8, growSeconds = 420, chance = 19.618806, indexSpeed = 1200000, indexCash = 18000000, },
    { name = "La Vacca Saturno Saturnita", rarity = "Cosmic", income = 2200000, modelWeight = 740, eggWeight = 8, growSeconds = 780, chance = 4.550072, indexSpeed = 1320000, indexCash = 220000000, },
    { name = "Cosmic Dragon", rarity = "Secret", income = 60000000, modelWeight = 15000, eggWeight = 8, growSeconds = 10800, chance = 0.743784, indexSpeed = 1440000, indexCash = 6000000000, },
    { name = "Cosmic Skeleton Boss", rarity = "Secret", income = 45000000, modelWeight = 1000, eggWeight = 8, growSeconds = 9000, chance = 0.495856, indexSpeed = 1680000, indexCash = 4500000000, },
    { name = "Eternal Lunar Dragon", rarity = "Eternal", income = 250000000, modelWeight = 60000, eggWeight = 9, growSeconds = 25200, chance = 0.311104, indexSpeed = 1920000, indexCash = 25000000000, },
    { name = "Unicorn", rarity = "Divine", income = 1000000000, modelWeight = 1200, eggWeight = 10, growSeconds = 43200, chance = 0.023199, indexSpeed = 2400000, indexCash = 100000000000, },
  },
  ["Cherry Blossom"] = {
    { name = "Crane", rarity = "Epic", income = 4000, modelWeight = 22, eggWeight = 2, growSeconds = 180, chance = 37.51, indexSpeed = 2748096, indexCash = 400000, },
    { name = "Salamander", rarity = "Legendary", income = 74000, modelWeight = 30, eggWeight = 2, growSeconds = 300, chance = 26.27, indexSpeed = 3091608, indexCash = 7400000, },
    { name = "Red Panda", rarity = "Mythic", income = 450000, modelWeight = 25, eggWeight = 2, growSeconds = 480, chance = 16.83, indexSpeed = 3435120, indexCash = 45000000, },
    { name = "Koi", rarity = "Cosmic", income = 12000000, modelWeight = 120, eggWeight = 3, growSeconds = 1500, chance = 4.36, indexSpeed = 4122144, indexCash = 1200000000, },
    { name = "Snowy Owl", rarity = "Cosmic", income = 7500000, modelWeight = 20, eggWeight = 2, growSeconds = 900, chance = 13.96, indexSpeed = 3778632, indexCash = 750000000, },
    { name = "Stag", rarity = "Secret", income = 145000000, modelWeight = 180, eggWeight = 3, growSeconds = 10800, chance = 0.74, indexSpeed = 4809168, indexCash = 14500000000, },
    { name = "Oni Tiger", rarity = "Eternal", income = 600000000, modelWeight = 300, eggWeight = 4, growSeconds = 28800, chance = 0.31, indexSpeed = 5496192, indexCash = 60000000000, },
    { name = "Kitsune", rarity = "Divine", income = 1800000000, modelWeight = 260, eggWeight = 4, growSeconds = 50400, chance = 0.02, indexSpeed = 6870240, indexCash = 180000000000, },
  },
  ["Titan Temple"] = {
    { name = "Crustacia", rarity = "Legendary", income = 130000, modelWeight = 1000, eggWeight = 2, growSeconds = 360, chance = 26.27, indexSpeed = 2748096, indexCash = 13000000, },
    { name = "Spideron", rarity = "Legendary", income = 95000, modelWeight = 600, eggWeight = 2, growSeconds = 240, chance = 37.51, indexSpeed = 3778632, indexCash = 9500000, },
    { name = "Bladehide", rarity = "Mythic", income = 750000, modelWeight = 1700, eggWeight = 3, growSeconds = 540, chance = 16.83, indexSpeed = 4809168, indexCash = 75000000, },
    { name = "Mantaris", rarity = "Cosmic", income = 11000000, modelWeight = 1500, eggWeight = 2, growSeconds = 1020, chance = 13.96, indexSpeed = 3435120, indexCash = 1100000000, },
    { name = "Rhinotaur", rarity = "Cosmic", income = 17500000, modelWeight = 35000, eggWeight = 2, growSeconds = 1740, chance = 4.36, indexSpeed = 3091608, indexCash = 1750000000, },
    { name = "Mutant Shark", rarity = "Secret", income = 215000000, modelWeight = 60000, eggWeight = 3, growSeconds = 10800, chance = 0.74, indexSpeed = 4122144, indexCash = 21500000000, },
    { name = "Gorilla King", rarity = "Eternal", income = 880000000, modelWeight = 100000, eggWeight = 4, growSeconds = 32400, chance = 0.31, indexSpeed = 5496192, indexCash = 88000000000, },
    { name = "Nightflame", rarity = "Divine", income = 3000000000, modelWeight = 160000, eggWeight = 4, growSeconds = 57600, chance = 0.02, indexSpeed = 6870240, indexCash = 300000000000, },
  },
  ["Angels & Demons"] = {
    { name = "Light Dove", rarity = "Legendary", income = 225000, modelWeight = 45000, eggWeight = 4, growSeconds = 300, chance = 37.51, indexSpeed = 3000000, indexCash = 22500000, side = "Light", },
    { name = "Flame Sprite", rarity = "Legendary", income = 225000, modelWeight = 45000, eggWeight = 4, growSeconds = 300, chance = 37.51, indexSpeed = 3000000, indexCash = 22500000, side = "Dark", },
    { name = "Winged Lamb", rarity = "Mythic", income = 1250000, modelWeight = 72000, eggWeight = 5, growSeconds = 480, chance = 26.27, indexSpeed = 4000000, indexCash = 125000000, side = "Light", },
    { name = "Toro", rarity = "Mythic", income = 1250000, modelWeight = 72000, eggWeight = 5, growSeconds = 480, chance = 26.27, indexSpeed = 4000000, indexCash = 125000000, side = "Dark", },
    { name = "Sacred Moth", rarity = "Cosmic", income = 16000000, modelWeight = 9000, eggWeight = 6, growSeconds = 900, chance = 16.83, indexSpeed = 8000000, indexCash = 1600000000, side = "Light", },
    { name = "Imp", rarity = "Cosmic", income = 16000000, modelWeight = 9000, eggWeight = 6, growSeconds = 900, chance = 16.83, indexSpeed = 8000000, indexCash = 1600000000, side = "Dark", },
    { name = "Holy Peacock", rarity = "Cosmic", income = 25000000, modelWeight = 9000, eggWeight = 6, growSeconds = 1200, chance = 13.96, indexSpeed = 20000000, indexCash = 2500000000, side = "Light", },
    { name = "Demon Hound", rarity = "Cosmic", income = 25000000, modelWeight = 9000, eggWeight = 6, growSeconds = 1200, chance = 13.96, indexSpeed = 20000000, indexCash = 2500000000, side = "Dark", },
    { name = "Pure Jellyfish", rarity = "Secret", income = 225000000, modelWeight = 10000, eggWeight = 7, growSeconds = 10800, chance = 4.36, indexSpeed = 30000000, indexCash = 22500000000, side = "Light", },
    { name = "Gargoyle", rarity = "Secret", income = 225000000, modelWeight = 10000, eggWeight = 7, growSeconds = 10800, chance = 4.36, indexSpeed = 30000000, indexCash = 22500000000, side = "Dark", },
    { name = "Centaur", rarity = "Secret", income = 350000000, modelWeight = 12000, eggWeight = 7, growSeconds = 11700, chance = 0.74, indexSpeed = 90000000, indexCash = 35000000000, side = "Light", },
    { name = "RazorFang", rarity = "Secret", income = 350000000, modelWeight = 12000, eggWeight = 7, growSeconds = 11700, chance = 0.74, indexSpeed = 90000000, indexCash = 35000000000, side = "Dark", },
    { name = "Pegasus", rarity = "Eternal", income = 1300000000, modelWeight = 65000, eggWeight = 8, growSeconds = 18000, chance = 0.31, indexSpeed = 200000000, indexCash = 130000000000, side = "Light", },
    { name = "Skeleton Horse", rarity = "Eternal", income = 1300000000, modelWeight = 65000, eggWeight = 8, growSeconds = 18000, chance = 0.31, indexSpeed = 200000000, indexCash = 130000000000, side = "Dark", },
    { name = "Equinox", rarity = "Eternal", income = 1800000000, modelWeight = 65000, eggWeight = 8, growSeconds = 36000, chance = 0, indexSpeed = 200000000, indexCash = 180000000000, fusionOnly = true, },
    { name = "ArchAngel", rarity = "Divine", income = 5000000000, modelWeight = 120000, eggWeight = 10, growSeconds = 64800, chance = 0.02, indexSpeed = 600000000, indexCash = 500000000000, side = "Light", },
    { name = "World Burner", rarity = "Divine", income = 5000000000, modelWeight = 120000, eggWeight = 10, growSeconds = 64800, chance = 0.02, indexSpeed = 600000000, indexCash = 500000000000, side = "Dark", },
    { name = "Aetheron", rarity = "Divine", income = 6900000000, modelWeight = 12000, eggWeight = 10, growSeconds = 64800, chance = 0, indexSpeed = 600000000, indexCash = 690000000000, fusionOnly = true, },
  },
}
```

### Appendix A2 — `PetVisuals.luau` (ModelFactory look per species) [VERIFIED where marked; otherwise DESIGN from pet names/wiki renders]
Where these colors disagree with the pet renders in `reference/youtube_storyboards/XbCRqdF6h5I_*`, prefer the renders.
```lua
-- Per-pet voxel look for ModelFactory: { archetype, primary, secondary, accent, notes }
-- Colors are hex strings; convert with Color3.fromHex. Archetypes are defined in §20.2.
-- Where they disagree, prefer the pet renders in reference/youtube_storyboards/XbCRqdF6h5I_* over these hexes.
return {
  -- FOREST
  ["Chicken"]            = {"Bird",      "#FFFFFF", "#E8E8E8", "#FF2E2E", "white hen, red comb + wattle, yellow beak/legs"},
  ["Dog"]                = {"Quadruped", "#E8577A", "#F7A6BC", "#3A2A2A", "pink-red blocky pup, darker ears, white muzzle spots"},
  ["Bird"]               = {"Bird",      "#8A8070", "#B5AC9C", "#FFC107", "small grey-brown bird, yellow beak"},
  ["Burrowing Owl"]      = {"Bird",      "#8D6E63", "#D7CCC8", "#FFEB3B", "brown owl, white brows, big yellow eyes"},
  ["Raccoon"]            = {"Quadruped", "#757575", "#212121", "#EEEEEE", "grey body, black eye-mask, striped tail"},
  ["Fox"]                = {"Quadruped", "#F4511E", "#FFFFFF", "#212121", "orange fox, white chest/tail tip, black feet (VERIFIED look)"},
  ["Bear"]               = {"Quadruped", "#6D4C41", "#8D6E63", "#3E2723", "big brown bear, lighter snout"},
  ["Brr Brr Patapim"]    = {"Humanoid",  "#2E7D32", "#F5F5F5", "#FFEB3B", "brainrot tree-man: white bearded face, green leafy hood, long legs (see wiki pet image)"},
  -- LAKE
  ["Frog"]               = {"Blob",      "#43A047", "#C5E1A5", "#212121", "green frog, pale belly"},
  ["Duckling"]           = {"Bird",      "#7C8B6A", "#A3B08C", "#FFA726", "grey-green duckling, yellow-orange beak"},
  ["Catfish"]            = {"Fish",      "#3FA9F5", "#FF8FC8", "#212121", "cyan-blue catfish with pink fins and long whiskers"},
  ["Turtle"]             = {"Quadruped", "#558B2F", "#8D6E63", "#AED581", "green turtle, brown hex shell"},
  ["Trulimero Trulicina"]= {"Fish",      "#90A4AE", "#FFB74D", "#212121", "brainrot fish body with cat head and 4 human legs"},
  ["Swan"]               = {"Bird",      "#FFFFFF", "#F5F5F5", "#FF6F00", "white swan, long S neck, orange beak"},
  ["Axolotl"]            = {"Lizard",    "#F8BBD0", "#F06292", "#E91E63", "pink axolotl with frilly gills"},
  ["Leviathan"]          = {"SeaMonster","#1565C0", "#4FC3F7", "#E1F5FE", "long blue sea serpent, fins along spine"},
  -- DESERT
  ["Jerboa"]             = {"Quadruped", "#FFFFFF", "#F8BBD0", "#212121", "tiny white/pink hopping rodent, huge pink ears, long tufted tail"},
  ["Fennec"]             = {"Quadruped", "#FFFFFF", "#FCE4EC", "#212121", "white fox with pale-pink giant ears"},
  ["Camel"]              = {"Quadruped", "#C8A165", "#A1887F", "#5D4037", "one-hump camel"},
  ["Tob Tobi Tob Tob"]   = {"Humanoid",  "#A1887F", "#FFCC80", "#212121", "brainrot: walking drum-like character"},
  ["Snake"]              = {"Snake",     "#D4A017", "#7B5B2E", "#FF1744", "rattlesnake, tan with brown bands (official thumbnail)"},
  ["Sand Spider"]        = {"Arachnid",  "#C9A66B", "#8D6E63", "#FF5722", "sandy tarantula"},
  ["Scorpion"]           = {"Arachnid",  "#D2B48C", "#A0826D", "#3E2723", "tan scorpion, big claws, raised stinger"},
  ["Royal Sphinx"]       = {"Quadruped", "#E0B84F", "#1E3A8A", "#FFD700", "lion body with pharaoh headdress (gold + blue stripes)"},
  -- JUNGLE
  ["Chimpanzee"]         = {"Ape",       "#4E342E", "#BCAAA4", "#212121", "chimp, light face"},
  ["Toucan"]             = {"Bird",      "#212121", "#FFFFFF", "#FF9800", "black toucan, huge orange/yellow bill"},
  ["Crocodile"]          = {"Lizard",    "#33691E", "#9E9D24", "#FFFFFF", "long green croc, teeth"},
  ["Gorilla"]            = {"Ape",       "#263238", "#546E7A", "#212121", "black silverback"},
  ["Orangutini Ananassini"]={"Ape",      "#E65100", "#FDD835", "#2E7D32", "brainrot orangutan fused with a pineapple (pineapple head/leaves)"},
  ["Spider"]             = {"Arachnid",  "#212121", "#D32F2F", "#FF5252", "black jungle spider with red marks"},
  ["Tiger"]              = {"Quadruped", "#FB8C00", "#212121", "#FFFFFF", "orange tiger, black stripes"},
  ["King Snake"]         = {"Snake",     "#1B5E20", "#C6FF00", "#FFD600", "huge green king snake with lime bands and a gold crown"},
  -- SNOW
  ["Penguin"]            = {"Bird",      "#212121", "#FFFFFF", "#FF9800", "penguin"},
  ["Walrus"]             = {"Quadruped", "#8D6E63", "#D7CCC8", "#FFFFFF", "walrus with white tusks"},
  ["Polar Bear"]         = {"Quadruped", "#F5F5F5", "#E0E0E0", "#212121", "white bear"},
  ["Sabertooth Tiger"]   = {"Quadruped", "#8E8E8E", "#424242", "#FFFFFF", "grey sabertooth with dark stripes, long white fangs"},
  ["Mammoth"]            = {"Quadruped", "#6D4C41", "#4E342E", "#FFF8E1", "shaggy mammoth, curved tusks"},
  ["King Mammoth"]       = {"Quadruped", "#4E342E", "#81D4FA", "#FFD700", "giant mammoth with ice armor and a crown"},
  ["Yeti"]               = {"Ape",       "#FFFFFF", "#212121", "#4FC3F7", "white yeti, black curled horns, blue eyes, ice spikes on back (official thumbnail)"},
  ["Ice Dragon"]         = {"Dragon",    "#81D4FA", "#E1F5FE", "#0277BD", "icy blue dragon, crystal spikes"},
  -- VOLCANO
  ["Lava Gecko"]         = {"Lizard",    "#BF360C", "#FF9800", "#212121", "red gecko with glowing orange spots"},
  ["Lava Frog"]          = {"Blob",      "#D84315", "#FFB74D", "#212121", "red frog with lava cracks"},
  ["Flaming Bull"]       = {"Quadruped", "#3E2723", "#FF6D00", "#FFD180", "black bull, flaming horns"},
  ["Lava Iguana"]        = {"Lizard",    "#4E342E", "#FF3D00", "#FFAB40", "dark iguana with lava spines"},
  ["Chillin Chilli"]     = {"Blob",      "#D50000", "#2E7D32", "#212121", "brainrot red chilli pepper with sunglasses"},
  ["Cerberus"]           = {"Quadruped", "#212121", "#FF6D00", "#FFD600", "three-headed black hellhound, flaming heads (VERIFIED in pen)"},
  ["Phoenix"]            = {"Bird",      "#FF6F00", "#FFD600", "#D50000", "fire bird, flame particles"},
  ["Lava Dragon"]        = {"Dragon",    "#8B1A1A", "#FF6D00", "#212121", "reddish-maroon dragon with wings (same egg as Ice Dragon, red)"},
  -- ABYSS OCEAN
  ["Parrotfish"]         = {"Fish",      "#26C6DA", "#AB47BC", "#FFEB3B", "rainbowy parrotfish"},
  ["Swordfish"]          = {"Fish",      "#1E88E5", "#B0BEC5", "#0D47A1", "swordfish with long bill"},
  ["Shark"]              = {"Fish",      "#78909C", "#ECEFF1", "#212121", "grey shark (VERIFIED grey blocky shark in pen)"},
  ["Orca"]               = {"Fish",      "#212121", "#FFFFFF", "#212121", "black/white orca"},
  ["Whale Shark"]        = {"Fish",      "#37474F", "#FFFFFF", "#90A4AE", "huge spotted whale shark"},
  ["Beluga Whale"]       = {"Fish",      "#FFFFFF", "#E0E0E0", "#212121", "white beluga"},
  ["Kraken"]             = {"SeaMonster","#C62828", "#FF8A80", "#FFEB3B", "red kraken, 8 tentacles"},
  ["El Maja"]            = {"SeaMonster","#0D47A1", "#FFD600", "#FFFFFF", "giant armored deep-sea leviathan"},
  -- PREHISTORIC
  ["Dodo"]               = {"Bird",      "#7E57C2", "#B39DDB", "#FFB300", "chunky grey-purple dodo"},
  ["Pterodactyl"]        = {"Bird",      "#8D6E63", "#FF7043", "#212121", "pterodactyl, crest, big wings"},
  ["Ankylosaurus"]       = {"Dino",      "#9E9E9E", "#FFFFFF", "#212121", "grey armored anky with white spikes and a tail club"},
  ["Triceratops"]        = {"Dino",      "#6D4C41", "#FFF8E1", "#212121", "triceratops, 3 horns, frill"},
  ["Bronto"]             = {"Dino",      "#8D6E63", "#A1887F", "#212121", "long-neck brontosaurus"},
  ["T-Rex"]              = {"Dino",      "#2E7D32", "#81C784", "#FFFFFF", "green T-Rex (guardian look)"},
  ["Tralaledon"]         = {"Fish",      "#1E88E5", "#FFFFFF", "#212121", "brainrot shark with 3 sneaker legs"},
  ["Mosasaurus"]         = {"Dino",      "#1565C0", "#90CAF9", "#FFFFFF", "marine reptile, flippers"},
  -- COSMIC
  ["Centapede"]          = {"Insect",    "#4A148C", "#00E5FF", "#FFFFFF", "long segmented cosmic centipede"},
  ["Cosmic Gecko"]       = {"Lizard",    "#311B92", "#00E676", "#FFFFFF", "galaxy gecko with star spots"},
  ["Cosmic Gorilla"]     = {"Ape",       "#1A237E", "#7C4DFF", "#FFFFFF", "space gorilla with nebula fur"},
  ["La Vacca Saturno Saturnita"]={"Quadruped","#FFFFFF","#212121","#FFB300","brainrot cow with Saturn ring around its head, human feet"},
  ["Cosmic Skeleton Boss"]={"Humanoid",  "#212121", "#FFFFFF", "#FFD600", "black skull-faced knight, white glowing fur chest, crown"},
  ["Cosmic Dragon"]      = {"Dragon",    "#12005E", "#D500F9", "#00E5FF", "galaxy dragon"},
  ["Eternal Lunar Dragon"]={"Dragon",    "#ECEFF1", "#B388FF", "#FFD600", "moon-white dragon with crescent motifs"},
  ["Unicorn"]            = {"Horse",     "#FFFFFF", "#F8BBD0", "#FFD600", "white unicorn, pastel rainbow mane, gold horn"},
  -- CHERRY BLOSSOM
  ["Crane"]              = {"Bird",      "#FFFFFF", "#212121", "#E53935", "red-crowned crane"},
  ["Salamander"]         = {"Lizard",    "#212121", "#FFD600", "#FFFFFF", "black salamander with yellow spots"},
  ["Red Panda"]          = {"Quadruped", "#D84315", "#FFFFFF", "#3E2723", "red panda, ringed tail"},
  ["Snowy Owl"]          = {"Bird",      "#FFFFFF", "#CFD8DC", "#FFD600", "white owl"},
  ["Koi"]                = {"Fish",      "#FFFFFF", "#FF5722", "#212121", "koi with orange patches"},
  ["Stag"]               = {"Quadruped", "#8D6E63", "#F8BBD0", "#FFFFFF", "stag with sakura-blossom antlers"},
  ["Oni Tiger"]          = {"Quadruped", "#FFFFFF", "#D50000", "#FF4081", "white/red horned tiger, pink flames"},
  ["Kitsune"]            = {"Quadruped", "#FFFFFF", "#FF4081", "#FFD600", "white nine-tailed fox, pink swirl markings, glowing tails"},
  -- TITAN TEMPLE
  ["Spideron"]           = {"Arachnid",  "#37474F", "#FF6F00", "#FFD600", "stone temple spider with glowing core"},
  ["Crustacia"]          = {"Arachnid",  "#BF360C", "#FFAB91", "#212121", "giant armored crab-crustacean"},
  ["Bladehide"]          = {"Quadruped", "#455A64", "#B0BEC5", "#FF6F00", "beast covered in blade plates"},
  ["Mantaris"]           = {"Insect",    "#2E7D32", "#C6FF00", "#FF6F00", "giant mantis"},
  ["Rhinotaur"]          = {"Quadruped", "#5D4037", "#9E9D24", "#FF6F00", "mossy rhino-minotaur"},
  ["Mutant Shark"]       = {"Fish",      "#6A1B9A", "#76FF03", "#212121", "mutated shark with legs and glowing green veins"},
  ["Gorilla King"]       = {"Ape",       "#212121", "#424242", "#FFD600", "giant black gorilla with gold crown (guardian look)"},
  ["Nightflame"]         = {"Dino",      "#1A1A1A", "#FF6D00", "#7C4DFF", "godzilla-like black kaiju with flaming dorsal plates (config id Godzilla; VERIFIED black/orange lava beast in pen)"},
  -- ANGELS & DEMONS (Light / Dark mirrors)
  ["Light Dove"]         = {"Bird",      "#FFFFFF", "#FFF59D", "#FFD600", "glowing white dove with halo"},
  ["Flame Sprite"]       = {"Blob",      "#FF6D00", "#FFD180", "#D50000", "floating flame spirit"},
  ["Winged Lamb"]        = {"Quadruped", "#FFFFFF", "#FFF9C4", "#FFD600", "fluffy lamb with feather wings + halo"},
  ["Toro"]               = {"Quadruped", "#3E2723", "#D50000", "#FF6D00", "demonic bull"},
  ["Sacred Moth"]        = {"Insect",    "#FFF8E1", "#FFD54F", "#FFFFFF", "golden-white moth (VERIFIED wiki render)"},
  ["Imp"]                = {"Humanoid",  "#B71C1C", "#212121", "#FFD600", "small red imp, horns, bat wings"},
  ["Holy Peacock"]       = {"Bird",      "#FFFFFF", "#FFD600", "#4FC3F7", "white peacock, golden fan tail"},
  ["Demon Hound"]        = {"Quadruped", "#212121", "#D50000", "#FF6D00", "black hound with red cracks"},
  ["Pure Jellyfish"]     = {"Blob",      "#E1F5FE", "#FFFFFF", "#FFD600", "translucent white jellyfish, glowing"},
  ["Gargoyle"]           = {"Humanoid",  "#616161", "#9E9E9E", "#D50000", "stone gargoyle with wings"},
  ["Centaur"]            = {"Horse",     "#FFFFFF", "#FFD600", "#4FC3F7", "golden-armored centaur with bow"},
  ["RazorFang"]          = {"Quadruped", "#212121", "#B71C1C", "#FFFFFF", "demon wolf with razor fangs"},
  ["Pegasus"]            = {"Horse",     "#FFFFFF", "#E3F2FD", "#FFD600", "winged white horse"},
  ["Skeleton Horse"]     = {"Horse",     "#EEEEEE", "#212121", "#D50000", "bone horse with red eyes"},
  ["Equinox"]            = {"Horse",     "#FFFFFF", "#212121", "#FFD600", "half white/half black winged horse (fusion)"},
  ["ArchAngel"]          = {"Humanoid",  "#FFFFFF", "#FFD600", "#4FC3F7", "golden-armored angel knight, 4 wings, spear"},
  ["World Burner"]       = {"Dragon",    "#212121", "#D50000", "#FF6D00", "hellfire demon dragon"},
  ["Aetheron"]           = {"Dragon",    "#FFFFFF", "#212121", "#FFD600", "half-angel half-demon dragon, split colors (fusion)"},
}

```

### Appendix B — `LimitedEggs.luau` (Robux / event eggs for the Shop FEATURED card and the Index "Limited" tab)
- All limited eggs share the bundle prices **1 = R$99, 3 = R$249, 10 = R$799, 50 = R$3499 (struck-through R$5,959)** [VERIFIED + API].
- Pool: 6 base pets weighted **39 / 24 / 18 / 11 / 6.5 / 0.5** (sum 99) plus a **1% "reroll"** = 100 [VERIFIED card for Extinction; SOURCE config for Monster]. The reroll draws the variant of the pet that would have hatched: roll a base pet with the base weights, then hatch `rerolls[i]`, the variant of `pets[i]`. Brainrot has no reroll; its six weights 39 / 25 / 20 / 10 / 5 / 1 sum to 100.
- Every entry carries the same fields as Appendix A: `income`, `modelWeight` (kg at Scale 1), `growSeconds`, `eggWeight` (6, WIKI "egg ref wt 6"), `indexCash` = 100 × income, and `indexSpeed`.
- Monster / Mecha / Luminous / Extinction / Skeletal pets hatch in 10 s; Brainrot pets use their own growSeconds (15 s … 4 h, WIKI). Monster and Mecha index Speed = 0 (WIKI); Brainrot index Speed per pet (WIKI); Luminous, Extinction and Skeletal index Speed 0 [DESIGN].
- Limited eggs roll Scale with the normal §4.2 roll, `zoneScaleFactor = 1`. Weight = `modelWeight * s^3` as usual. Limited-egg pets sell normally (§12).
- The featured countdown is `endsAtUnix - os.time()`, so every server shows the same time.
```lua
return {
  Extinction = { featured = true, title = "EXTINCTION EGG", endsAtUnix = 1791633600, -- 2026-10-10 12:00 UTC [DESIGN, ≈ the VERIFIED "10d 12h 04m" countdown seen on 2026-09-29]
    rerollName = "SKELETAL", rerollChance = 1, -- modelWeight 1000 / growSeconds 10 / indexSpeed 0 are [DESIGN] (no data)
    pets = {
      {name="Glyptodon", rarity="Legendary", income=22.5e3, chance=39, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=2.25e6, indexSpeed=0},
      {name="Terrorbird", rarity="Mythic", income=110e3, chance=24, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=11e6, indexSpeed=0},
      {name="Giant Sloth", rarity="Cosmic", income=4e6, chance=18, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=400e6, indexSpeed=0},
      {name="Dunkleosteus", rarity="Secret", income=300e6, chance=11, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=30e9, indexSpeed=0},
      {name="Gigantus", rarity="Eternal", income=1e9, chance=6.5, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=100e9, indexSpeed=0},
      {name="Sabertooth", rarity="Divine", income=5e9, chance=0.5, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=500e9, indexSpeed=0},
    },
    rerolls = { -- rerolls[i] is the variant of pets[i]
      {name="Skeletal Glyptodon", rarity="Secret", income=550e6, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=55e9, indexSpeed=0},
      {name="Skeletal Terrorbird", rarity="Secret", income=750e6, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=75e9, indexSpeed=0},
      {name="Skeletal Giant Sloth", rarity="Secret", income=900e6, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=90e9, indexSpeed=0},
      {name="Skeletal Dunkleosteus", rarity="Eternal", income=2.5e9, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=250e9, indexSpeed=0},
      {name="Skeletal Gigantus", rarity="Eternal", income=4e9, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=400e9, indexSpeed=0},
      {name="Skeletal Sabertooth", rarity="Divine", income=9e9, modelWeight=1000, growSeconds=10, eggWeight=6, indexCash=900e9, indexSpeed=0},
    },
  },
  Luminous = { title = "LUMINOUS EGG", rerollName = "LUMINOUS", rerollChance = 1, -- modelWeight: Fandom IncomeCalc; growSeconds 10: WIKI; indexSpeed 0 [DESIGN]
    pets = {
      {name="Spike", rarity="Legendary", income=15e3, chance=39, modelWeight=250, growSeconds=10, eggWeight=6, indexCash=1.5e6, indexSpeed=0},
      {name="Spirit Manta", rarity="Mythic", income=75e3, chance=24, modelWeight=450, growSeconds=10, eggWeight=6, indexCash=7.5e6, indexSpeed=0},
      {name="Abyss Shark", rarity="Cosmic", income=2.5e6, chance=18, modelWeight=60000, growSeconds=10, eggWeight=6, indexCash=250e6, indexSpeed=0},
      {name="Electric Eel", rarity="Secret", income=200e6, chance=11, modelWeight=45, growSeconds=10, eggWeight=6, indexCash=20e9, indexSpeed=0},
      {name="Terra Snapper", rarity="Eternal", income=750e6, chance=6.5, modelWeight=60000, growSeconds=10, eggWeight=6, indexCash=75e9, indexSpeed=0},
      {name="Cthulhu", rarity="Divine", income=3e9, chance=0.5, modelWeight=13000, growSeconds=10, eggWeight=6, indexCash=300e9, indexSpeed=0},
    },
    rerolls = { -- rerolls[i] is the variant of pets[i]
      {name="Luminous Spike", rarity="Secret", income=350e6, modelWeight=250, growSeconds=10, eggWeight=6, indexCash=35e9, indexSpeed=0},
      {name="Luminous Spirit Manta", rarity="Secret", income=500e6, modelWeight=450, growSeconds=10, eggWeight=6, indexCash=50e9, indexSpeed=0},
      {name="Luminous Abyss Shark", rarity="Secret", income=600e6, modelWeight=60000, growSeconds=10, eggWeight=6, indexCash=60e9, indexSpeed=0},
      {name="Luminous Electric Eel", rarity="Eternal", income=1.75e9, modelWeight=45, growSeconds=10, eggWeight=6, indexCash=175e9, indexSpeed=0},
      {name="Luminous Terra Snapper", rarity="Eternal", income=2.5e9, modelWeight=60000, growSeconds=10, eggWeight=6, indexCash=250e9, indexSpeed=0},
      {name="Luminous Cthulhu", rarity="Divine", income=6.5e9, modelWeight=13000, growSeconds=10, eggWeight=6, indexCash=650e9, indexSpeed=0},
    },
  },
  Monster = { title = "MONSTER EGG", rerollName = "MECHA", rerollChance = 1, -- modelWeight 35, growSeconds 10, indexSpeed 0: WIKI
    pets = {
      {name="Scorpio", rarity="Legendary", income=10e3, chance=39, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=1e6, indexSpeed=0},
      {name="Froggo", rarity="Mythic", income=50e3, chance=24, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=5e6, indexSpeed=0},
      {name="Crawler", rarity="Cosmic", income=1.5e6, chance=18, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=150e6, indexSpeed=0},
      {name="Crocodon", rarity="Secret", income=30e6, chance=11, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=3e9, indexSpeed=0},
      {name="Krakenoid", rarity="Eternal", income=500e6, chance=6.5, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=50e9, indexSpeed=0},
      {name="Dreadscale", rarity="Divine", income=2e9, chance=0.5, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=200e9, indexSpeed=0},
    },
    rerolls = { -- rerolls[i] is the variant of pets[i]
      {name="Mecha Scorpio", rarity="Secret", income=45e6, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=4.5e9, indexSpeed=0},
      {name="Mecha Froggo", rarity="Secret", income=155e6, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=15.5e9, indexSpeed=0},
      {name="Mecha Crawler", rarity="Secret", income=320e6, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=32e9, indexSpeed=0},
      {name="Mecha Crocodon", rarity="Eternal", income=680e6, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=68e9, indexSpeed=0},
      {name="Mecha Krakenoid", rarity="Eternal", income=1e9, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=100e9, indexSpeed=0},
      {name="Mecha Dreadscale", rarity="Divine", income=4e9, modelWeight=35, growSeconds=10, eggWeight=6, indexCash=400e9, indexSpeed=0},
    },
  },
  Brainrot = { title = "BRAINROT EGG", -- launch egg, golden "?" lucky-block look; no reroll. modelWeight / growSeconds / indexSpeed: WIKI
    pets = {
      {name="Tung Tung Sahur", rarity="Rare", income=100, chance=39, modelWeight=35, growSeconds=15, eggWeight=6, indexCash=10e3, indexSpeed=640},
      {name="Bananita Dolphinita", rarity="Epic", income=400, chance=25, modelWeight=300, growSeconds=35, eggWeight=6, indexCash=40e3, indexSpeed=710},
      {name="Belula Beluga", rarity="Mythic", income=40e3, chance=20, modelWeight=800, growSeconds=120, eggWeight=6, indexCash=4e6, indexSpeed=2580},
      {name="Mangolini Parrochini", rarity="Cosmic", income=800e3, chance=10, modelWeight=1500, growSeconds=600, eggWeight=6, indexCash=80e6, indexSpeed=267000},
      {name="Bombo Croco", rarity="Secret", income=20e6, chance=5, modelWeight=7000, growSeconds=5400, eggWeight=6, indexCash=2e9, indexSpeed=860000},
      {name="Strawberry Elephant", rarity="Eternal", income=110e6, chance=1, modelWeight=35000, growSeconds=14400, eggWeight=6, indexCash=11e9, indexSpeed=143000},
    },
  },
}
```
- Extinction's middle four incomes are derived from IGN index cash ÷ 100. Glyptodon, Sabertooth and all Skeletal values are confirmed.
- Only one egg is "featured" at a time. Default: **Extinction** (current on 2026-09-29) [VERIFIED].

### Appendix C — `Rarities.luau` [SOURCE: official product names + Fandom rarity colors + VERIFIED index tile colors]
Order: **Common < Uncommon < Rare < Epic < Legendary < Mythic < Cosmic < Secret < Eternal < Divine**.

| Rarity | Text color | Tile gradient top → bottom | Border | Egg glow / announce |
|---|---|---|---|---|
| Common | #D8D8D8 | #B8B8B8 → #606060 | #979797 | none |
| Uncommon | #00FF00 | #66FF66 → #009900 | #00FF00 | none |
| Rare | #88CCFF | #55AAFF → #0055CC | #1990FF | none |
| Epic | #E088FF | #D455FF → #7700AA | #C402FF | faint purple sparkle |
| Legendary | #FFCC88 | #FFB066 → #CC5500 | #FF8522 | orange sparkle |
| Mythic | #FF99AA | #FF6688 → #BB0033 | #FF2B64 | red sparkle |
| Cosmic | #9966FF | #6633CC → #1A0066 | #4100AA | indigo sparkle |
| Secret | #1E1E1E with a white stroke | #FFFFFF → #BDBDBD | #E0E0E0 | **rainbow glow**, announced |
| Eternal | #FF99FF (billboards show Eternal as pink/lilac) | #E6FBFF → #7FD6F5 | #5CC8F0 | **sun-gold glow**, announced |
| Divine | #FFFF88 | #FFFF66 → #CCCC00 | #FBFF00 | **white-gold sky beam**, announced + fanfare |

Rarity words on billboards use a 2-stop `UIGradient` (text color → border color). The real game's Index tiles are Common grey, Uncommon lime green, Rare blue, Epic magenta/purple, Legendary yellow-orange, Mythic red, Cosmic dark indigo [VERIFIED], Secret white/light grey (King Snake, Yeti, Cerberus, Kraken, T-Rex, Tralaledon) and Eternal light blue → white (Ice Dragon, Phoenix, Lava Dragon, El Maja, Mosasaurus) [VERIFIED storyboards `1Uta3el6hZY_index_pages_01/02/03.jpg`]. The Divine tile colors are unverified.

### Appendix D — `Mutations.luau` [SOURCE: config; community multipliers conflicted, so config wins]
```lua
return {
  Silver      = { mult = 1.20, rollWeight = 6, color = "#C8CDD7", material = "Metal", fx = "glints" },
  Golden      = { mult = 2.50, rollWeight = 4, color = "#FFC428", material = "Metal", fx = "coin sparkles" },
  Rainbow     = { mult = 3.50, rollWeight = 1, color = "hue-cycle", fx = "rainbow cycle" },
  Bloom       = { mult = 1.25, rollWeight = 0, color = "#FF9ECF", fx = "sakura petals" },         -- Sakura Incubator
  SpiritBloom = { mult = 2.50, rollWeight = 0, color = "#9EFFE0", fx = "spirit wisps", displayName = "Spirit Bloom" }, -- Sakura Incubator
  Parasite    = { mult = 3.00, rollWeight = 0, color = "#7B2FBE", fx = "purple parasite" },       -- Hungry Frog / Parasite Egg
  Fractured   = { mult = 2.75, rollWeight = 0, color = "#5E2B97", fx = "purple crystal shards" }, -- Boss Shop consumable, 10%
  Scrambled   = { mult = 2.75, rollWeight = 0, color = "#39FF14", fx = "green toxic bubbles" },   -- Experiment Shop consumable, 10%
}
-- None weight = 89. After a non-None roll: 50% chance of a second roll. Stacking: 1 + Σ(mult-1).
```

### Appendix E — `Treadmills.luau` [SOURCE: config + VERIFIED shop card "$75B / R$299" for Lucky Block]
| Lvl | Name | Factor (per step) | Cash price | Robux |
|---|---|---|---|---|
| 1 | Treadmill (Basic) | ×2 | $1K (= Base Level 1 unlock) | — |
| 2 | Sci-Fi Treadmill | ×5 | $15K | 19 |
| 3 | Flame Treadmill | ×12 | $250K | 39 |
| 4 | Celebrity Treadmill | ×30 | $5M | 69 |
| 5 | Golden Treadmill | ×80 | $120M | 119 |
| 6 | The Freeze Treadmill | ×100 | $3B | 199 |
| 7 | Lucky Block Treadmill | ×200 | **$75B** | **299** |
| 8 | Hacker Treadmill | ×500 | $2T | 499 |
| 9 | Demonic Treadmill | ×1,000 | $50T | 799 |
| 10 | Angelic Treadmill (badge) | ×2,000 | $1Qa | 1,299 |
| 11 | Astral Treadmill | ×3,000 | $15Qa | 1,560 |

Tiers are bought in order, with no trade-in discount.

### Appendix F — `Trails.luau` [SOURCE: config + API prices]
| Trail | Rarity | Multiplier | Cash | Robux | Ribbon look |
|---|---|---|---|---|---|
| Grey Trail | Common | ×1.5 | $100 | — | grey |
| Green Trail | Uncommon | ×2 | $5K | 19 | green |
| Blue Trail | Rare | ×2.5 | $75K | 29 | blue |
| Purple Trail | Epic | ×3 | $1.5M | 49 | purple |
| Golden Trail | Legendary | ×3.5 | $30M | 79 | gold |
| Red Trail | Mythic | ×4 | $750M | 119 | red |
| Galaxy Trail | Cosmic | ×5 | $20B | 199 | purple/blue nebula |
| Secret Trail | Secret | ×7 | $500B | 349 | black/white stripes |
| Eternal Trail | Eternal | ×10 | $12.5T | 599 | pink |
| Divine Trail (badge) | Divine | ×14 | $300T | 999 | rainbow |
| Moonbloom Trail | Divine | ×20 | $5Qa | 1,199 | aqua with petals |

One trail is equipped at a time (best auto-equipped). Trails only affect treadmill gain.

### Appendix G — `SpeedMultipliers.luau` (Robux developer products, sequential) [VERIFIED first tier "x1 ▶ x2 R$3"; API prices]
| Tier | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | x2 | x4 | x8 | x16 | x32 | x64 | x128 | x256 | x512 | x1K | x2K | x4K |
| Robux | 3 | 9 | 24 | 39 | 79 | 129 | 199 | 299 | 499 | 649 | 949 | 1375 |

### Appendix H — `PenLevels.luau` (see §8.2; the "+1 EQUIP" button buys the next entry of this same list)
```lua
return { [0] = {slots = 7},
  {price=1e3,slots=7,unlocksTreadmill=true}, {price=1e6,slots=9}, {price=75e6,slots=10}, {price=500e6,slots=11},
  {price=1e9,slots=12}, {price=50e9,slots=13}, {price=500e9,slots=14}, {price=1e12,slots=15},
  {price=25e12,slots=16}, {price=100e12,slots=17}, {price=500e12,slots=18}, {price=5e15,slots=19} }
```

### Appendix I — `Products.luau` (Robux; use placeholder ids) [VERIFIED shop screenshots + official API]
| Key | Type | Robux | Grant |
|---|---|---|---|
| X2_MONEY | GamePass | 399 | ×2 pet income |
| X2_GROWTH | GamePass | 467 | ×2 egg growth |
| SPEED_150K / 1M / 10M / 50M / 500M / 1B | DevProduct | 79 / 249 / 699 / 1499 / 1999 / 2999 | +Speed |
| CASH_24K / 200K / 800K / 4M / 8M | DevProduct | 49 / 99 / 249 / 499 / 799 | +money (fixed amounts) |
| SPEED_MULT_T1..T12 | DevProduct | Appendix G | next multiplier tier |
| TREADMILL_2..11 | DevProduct | Appendix E | next treadmill |
| TRAIL_* | DevProduct | Appendix F | trail |
| EGG_{featured}_1/3/10/50 | DevProduct | 99 / 249 / 799 / 3499 | limited eggs to the egg inventory |
| INSTANT_HATCH_1..10 | DevProduct | 9/19/29/49/79/99/149/199/249/299 | hatch one egg with ≤15m/30m/1h/2h/3h/4h/6h/8h/10h/12h+ remaining (egg chosen via `RequestPurchaseIntent`, §14) |
| INSTANT_GROW_ALL | DevProduct | 199 | finish all placed eggs |
| TIMED_SPEED_5M / 30M / 1H / 4H | DevProduct | 90 / 120 / 250 / 499 | timed Speed boost for that duration: `tempSpeedBoost = 2`, i.e. +1 to the §4.6 bonus sum (`boosts.timedSpeed`) |
| X2_EARNINGS | DevProduct | 99 | ×2 income for 15 min (stacks duration; `boosts.cash2x`) [SOURCE: WIKI calculator "temporary x2 earnings effect lasts 15 minutes"] |
| LUCK_BOOST_1/2/3 | DevProduct | 49 / 99 / 199 | Sakura Incubator "Great Bloom odds" ×2 / ×4 / ×8 for the egg in the incubator (Spirit Bloom 5% at 150% charge → 10/20/40%). Phase 2 only (§15.3) |
| GIFT_X2_MONEY / GIFT_X2_GROWTH | DevProduct | 399 / 467 | give the pass to a target player (target chosen via `RequestPurchaseIntent`; stored in the target's `giftedPasses`) |

---

## 22. REFERENCE MEDIA INDEX (`reference/` folder shipped with this prompt)

Study these before building. **LIVE** = captured by us from the real game on 2026-09-29. **OFFICIAL** = Roblox store/API art. Others are community wiki, guide-site and YouTube storyboard captures of the real game.


### 22.1 Most important files

| File | What it shows |
|---|---|
| `reference/ingame/ingame_001_spawn_base_overview.jpg` | LIVE (2026-09-29): full HUD. Left: Shop/Index/Slow Mode. Right: egg/paw/flask buttons. Bottom-left: speed + money. Bottom-right: flask + moon timers. Top-right: Roblox's built-in player list (leaderstats). Also the Upgrade Pen board "Level 5 > Level 6 $50B" and pets in the pen with +$ popups. |
| `reference/ingame/ingame_002_shop_featured_extinction_egg.jpg` | LIVE: Shop → FEATURED Extinction Egg card (odds 39/24/18/11/6.5/0.5 + SKELETAL 1%, R$99/249/799/3499, countdown). |
| `reference/ingame/ingame_003_shop_passes_growth_money.jpg` | LIVE: Shop → PASSES (x2 Growth R$467, x2 Money R$399) with gift buttons. |
| `reference/ingame/ingame_004_shop_speed_double.jpg` | LIVE: Shop → SPEED "DOUBLE Your SPEED x1 ▶ x2 R$3". |
| `reference/ingame/ingame_005_shop_upgrade_treadmill.jpg` | LIVE: Shop → "UPGRADE TREADMILL!" card R$299 / $75B (Freeze → Lucky Block). |
| `reference/ingame/ingame_006_shop_speed_packs.jpg` | LIVE: speed packs +150K R$79, +1M R$249, +10M R$699. |
| `reference/ingame/ingame_007_shop_speed_packs_2.jpg` | LIVE: speed packs +50M R$1499, +500M R$1999, +1B R$2999. |
| `reference/ingame/ingame_008_shop_money_packs.jpg` | LIVE: MONEY section $24K R$49, $200K R$99, $800K R$249. |
| `reference/ingame/ingame_009_shop_money_packs_2.jpg` | LIVE: $4M R$499, $8M R$799 (end of the shop). |
| `reference/ingame/ingame_010_index_forest_chicken.jpg` | LIVE: Pet Index, Forest section: 8 tiles, 3/8 progress with bat icon, Chicken detail with $100 / +420 rewards, CLAIM ALL (5)!, World/Limited tabs. |
| `reference/ingame/ingame_frame_ALL_EGG_RESET_banner_day_start.jpg` | LIVE: "ALL EGG RESET!" top-center banner at the day start; moon timer "in 4m 47s". |
| `reference/ingame/ingame_frame_night_sun_timer_x30_growth.jpg` | LIVE: during night: sun icon "in 1s", with the moon "x30" growth badge near the egg button. |
| `reference/ingame/ingame_frame_admin_and_drscramble_chat_banners.jpg` | LIVE: top-center chat banners "Admin ✅ started DR. SCRAMBLE'S MECH!…" and "Dr. Scramble ✅: My MECH is complete!…". |
| `reference/ingame/ingame_frame_secret_egg_spawn_announcement.jpg` | LIVE: "A Secret Pure Jellyfish Egg spawned in Angels 😇!" announcement. |
| `reference/ingame/ingame_frame_pets_in_pen_income_popups.jpg` | LIVE: pets roaming in the wooden pen with billboards and +$ popups. |
| `reference/ingame/ingame_frame_pen_pets_close.jpg` | LIVE: close view of pen pets (Cerberus, Orca, Fox, etc.). |
| `reference/ingame/ingame_hud_hotbar_bat_traps_x3.png` | LIVE crop: hotbar slot 1 = bat, slot 2 = bear trap "x3". |
| `reference/ingame/ingame_hud_leaderboard_people_money_speed.png` | LIVE crop: Roblox's built-in player list showing `leaderstats`, header "People \| Money/s \| Speed", e.g. "FatFrogIII 10.9B 101B", "manager 6M 410,699" (§17.6). |
| `reference/ingame/ingame_hud_bottomleft_speed_money.png` | LIVE crop: winged-sneaker "+" icon with pink speed "410.6K"; cash stack with green "$26B". |
| `reference/ingame/ingame_hud_bottomright_event_night_timers.png` | LIVE crop: flask "in 5m 30s" and moon "in 20s" (turns red in the last seconds) on dark translucent strips. |
| `reference/ingame_clips/clip1_base_pen_income_night_to_day_reset.mp4` | LIVE video (62 s): standing in the pen, income popups, camera orbit, the night→day transition and the "ALL EGG RESET!" banner. |
| `reference/ingame_clips/clip2_shop_full_tour.mp4` | LIVE video (140 s): scrolling the entire Shop window top to bottom. |
| `reference/ingame_clips/clip3_pet_index.mp4` | LIVE video (90 s): Pet Index interactions (tile select, rewards, zone scroll). |
| `reference/ingame_clips/clip4_announcements_admin_secret_spawn.mp4` | LIVE video (35 s): admin/Dr. Scramble chat banners and a Secret egg spawn announcement. |
| `reference/official/thumbnail_1_119722099122044_768x432.png` | OFFICIAL marketing art: T-Rex guardian + spiky T-Rex egg held over the head, "$89,121Sp/s" style text. |
| `reference/official/thumbnail_2_110759685501997_768x432.png` | OFFICIAL art: snake chasing the player carrying a striped egg. |
| `reference/official/thumbnail_3_77977678889221_768x432.png` | OFFICIAL art: Yeti guardian, snow nest with blue snowflake eggs, rainbow Yeti egg. |
| `reference/official/thumbnail_4_132866968789973_768x432.png` | OFFICIAL art: sleeping cosmic dragon (Zzz) on a purple studded floor, galaxy egg. |
| `reference/official/game_icon_512.png` | OFFICIAL icon: biohazard egg held overhead + mantis pet. |
| `reference/official/event_enchanted_forest_80433744050590.png` | OFFICIAL next-update teaser banner (Enchanted Forest). |
| `reference/guides/map_biome_map_eldorado.webp` | The long straight lane corridor: orange checker walls with green top, grass floor, hedges. |
| `reference/guides/pvp_safe_zone_gameboost.webp` | The painted SAFE ZONE marker (black italic letters with a white outline on the grass), SELL booth, Fuse Machine, and the night-wall countdown digit under "ALL EGG RESET!". |
| `reference/guides/ui_growing_eggs_panel_grow_all_allthings.webp` | Growing Eggs side panel (Open buttons, Grow All, 2h 54m + skip) and Friend Boost +35% HUD. |
| `reference/guides/ui_slow_mode_allthings.webp` | Slow Mode toggle + HUD in a lane. |
| `reference/guides/fuse_machine_ign.webp` | Fuse Machine model + SELL booth in the hub. |
| `reference/guides/fuse_machine_screen_ign.webp` | Fuse Machine UI ("Bring 3 same Pets to Fuse"). |
| `reference/guides/treadmill_base_eldorado.webp` | Basic treadmill voxel model with the black screen frame. |
| `reference/youtube_storyboards/NqQ3999exGQ_fresh_account_hud_00.jpg` | Fresh-account tutorial: "Steal an Egg!", sleeping chicken "ZZ", "Unlock $1K" board with red floor arrows, "Use your treadmill!", TRAILS SHOP + FREE chest, "+5/step", world leaderboard board. |
| `reference/youtube_storyboards/B7URwCQ1sFw_area_signs_guardians_02.jpg` | Carrying: "RUN!!" pill + red "Drop" button, egg over the head, lanes of several biomes (Titan torii, Prehistoric bones, Snow). |

### 22.2 Everything else, by folder

- **`reference/wiki/`** (109 files): `egg__Biohazard_Egg.png`, `egg__Brainrot_Egg.png`, `egg__Brr_Brr_Patapim_Egg.png`, `egg__Chicken_Egg.png`, `egg__Extinction_Egg.png`, `egg__King_Snake_Egg.png`, `egg__Luminous_Egg.png`, `egg__Monster_Egg.png`, `egg__Riftborn_Egg.png`, `egg__Unicorn_Egg.png`, `event__Cash_Booster.png`, `event__DrScrambleEvent.png`, `event__RiftEvent.png`, `event__ScrapDrone.png`, `event__StolenExperimentVault.png`, `guardian__AbyssOceanGuardian.png`, `guardian__AngelGuardian.png`, `guardian__CherryBlossomGuardian.png`, `guardian__CosmicGuardian.png`, `guardian__DemonGuardian.png`, `guardian__DesertGuardian.png`, `guardian__ForestGuardian.png`, `guardian__JungleGuardian.png`, `guardian__LakeGuardian.png`, `guardian__PrehistoricGuardian.png`, `guardian__SnowGuardian.png`, `guardian__TitanTempleGuardian.png`, `guardian__VolcanoGuardian.png`, `mutation__Fractured.png`, `mutation__Golden.png`, `mutation__Great_Bloom.png`, `mutation__Parasite.png`, `mutation__Rainbow.png`, `mutation__Sakura.png`, `mutation__Scrambled.png`, `mutation__Silver.png`, `pet__Bear.png`, `pet__Brr_Brr_Patapim.png`, `pet__Chicken.png`, `pet__Ice_Dragon.png`, `pet__King_Snake.png`, `pet__Raccoon.png`, `trail__Blue_Trail.png`, `trail__Divine_Trail.png`, `trail__Eternal_Trail.png`, `trail__Galaxy_Trail.png`, `trail__Golden_Trail.png`, `trail__Green_Trail.png`, `trail__Grey_Trail.png`, `trail__Moonbloom_Trail.png`, `trail__Purple_Trail.png`, `trail__Red_Trail.png`, `trail__Secret_Trail.png`, `treadmill__Angelic_Treadmill.png`, `treadmill__Astral_Treadmill.png`, `treadmill__Celebrity_Treadmill.png`, `treadmill__Demonic_Treadmill.png`, `treadmill__Flame_Treadmill.png`, `treadmill__Golden_Treadmill.png`, `treadmill__Hacker_Treadmill.png`, `treadmill__Lucky_Block_Treadmill.png`, `treadmill__Sci-Fi_Treadmill.png`, `treadmill__The_Freeze_Treadmill.png`, `treadmill__Treadmill_Base.png`, `ui__1-2_Screenshot_for_Speed_cost.png`, `ui__2_Screenshot_for_speed_shop.png`, `ui__2x_growth_speed_gamepass.png`, `ui__Egg.png`, `ui__Full_speed_shop_screenshot.png`, `ui__Gamepasses.png`, `ui__Icon_for_2x_money_gamepass.png`, `ui__Image.png`, `ui__Image.png.png`, `ui__Image_egg_.png`, `ui__Money_Screen_shot.png`, `ui__Mutation.png`, `ui__New_treadmill.png`, `ui__Pen_the_enclosur_idk.png`, `ui__Pet.png`, `ui__Player_hold_trap.png`, `ui__Regular_Shop_Screenshot.png`, `ui__SAENewBiome.png`, `ui__SM.png`, `ui__Screenshot_2026-09-01_200118.png`, `ui__Screenshot_2026-09-04_021612.png`, `ui__Screenshot_2026-09-13_173016.png`, `ui__Shoes_speed.png`, `ui__Shop_icon.png`, `ui__Speed_Multiplier_Screenshot.png`, `ui__The_Monster_Egg.png`, `ui__The_egg_i_got_rhinotaur_from.png`, `ui__Welcome_steal_a_egg.png`, `ui__ZONE_1.png`, `ui__Zone_all.png`, `ui__Zrzut_ekranu_2026-09-16_211650.png`, `zone__Abyss_Ocean.png`, `zone__Abyss_Ocean_air_bubble_interior(S.png).png`, `zone__AngelsDemons.png`, `zone__Cherry_Blossom.png`, `zone__Cosmic.png`, `zone__Desert.png`, `zone__Forest.png`, `zone__Jungle.png`, `zone__Lake.png`, `zone__Prehistoric.png`, `zone__Snow.png`, `zone__Titan_Temple.png`, `zone__Titan_Temple_Biome.png`, `zone__Volcano.png`
- **`reference/guides/`** (63 files): `biome_angels_demons_mixed_eldorado.webp`, `biome_angels_eldorado.webp`, `biome_cherry_blossom_eldorado.webp`, `biome_demons_eldorado.webp`, `biome_titan_temple_eldorado.webp`, `crane_egg_ign.webp`, `dr_scramble_lab_cave_abyss_gameboost.avif`, `dr_scramble_lab_portal_eldorado.webp`, `dr_scramble_mech_overheat_eldorado.webp`, `egg_brainrot_limited_eldorado.webp`, `egg_cherry_kitsune_eldorado.webp`, `egg_extinction_shop_eldorado.webp`, `egg_luminous_shop_eldorado.webp`, `egg_monster_shop_eldorado.webp`, `egg_titan_nightflame_eldorado.webp`, `eggs_all_overview_eldorado.webp`, `fuse_machine_ign.webp`, `fuse_machine_screen_ign.webp`, `guardian_01_forest_chicken_ign.webp`, `guardian_02_lake_swan_ign.webp`, `guardian_03_desert_scorpion_ign.webp`, `guardian_04_jungle_tiger_ign.webp`, `guardian_05_snow_yeti_ign.webp`, `guardian_06_volcano_hellhound_ign.webp`, `guardian_07_abyss_ocean_moby_ign.webp`, `guardian_08_prehistoric_trex_ign.webp`, `guardian_09_cosmic_dragon_ign.webp`, `guardian_10_cherry_blossom_ign.webp`, `guardian_11_titan_temple_gorilla_king_ign.webp`, `guardian_12_angels_demons_hybrid_ign.webp`, `guardian_12_angels_ign.webp`, `guardian_12_demons_ign.webp`, `hungry_frog_monster_ign.webp`, `infected_egg_ign.webp`, `map_biome_map_eldorado.webp`, `monster_chest_all_rewards_ign.webp`, `monster_chest_reward_wheel_ign.webp`, `mutation_fractured_eldorado.webp`, `mutation_rainbow_egg_eldorado.webp`, `mutation_scrambled_eldorado.webp`, `mutations_overview_eldorado.webp`, `pvp_bat_ragdoll_gameboost.webp`, `pvp_safe_zone_gameboost.webp`, `rift_boss_mastery_eldorado.webp`, `rift_boss_shop_eldorado.webp`, `rift_machine_eldorado.webp`, `rift_portal_eldorado.webp`, `sakura_crystals_great_bloom_beebom.webp`, `sakura_incubator_unlock_crane_beebom.webp`, `sakura_incubator_use_beebom.webp`, `secret_shrine_entrance_waterfall_eldorado.webp`, `secret_shrine_pedestals_ign.webp`, `trail_divine_eldorado.webp`, `trail_moonbloom_eldorado.webp`, `treadmill_angelic_eldorado.webp`, `treadmill_astral_eldorado.webp`, `treadmill_base_eldorado.webp`, `treadmills_ranked_gameboost.webp`, `ui_growing_eggs_panel_grow_all_allthings.webp`, `ui_luminous_egg_prices_gameboost.webp`, `ui_shop_eldorado.webp`, `ui_slow_mode_allthings.webp`, `ui_speed_shop_robux_beebom.webp`
- **`reference/youtube_storyboards/`** (29 files): `1Uta3el6hZY_index_pages_00.jpg`, `1Uta3el6hZY_index_pages_01.jpg`, `1Uta3el6hZY_index_pages_02.jpg`, `1Uta3el6hZY_index_pages_03.jpg`, `1Uta3el6hZY_index_pages_04.jpg`, `B7URwCQ1sFw_area_signs_guardians_00.jpg`, `B7URwCQ1sFw_area_signs_guardians_01.jpg`, `B7URwCQ1sFw_area_signs_guardians_02.jpg`, `B7URwCQ1sFw_area_signs_guardians_03.jpg`, `B7URwCQ1sFw_area_signs_guardians_04.jpg`, `B7URwCQ1sFw_area_signs_guardians_05.jpg`, `B7URwCQ1sFw_area_signs_guardians_06.jpg`, `B7URwCQ1sFw_area_signs_guardians_07.jpg`, `B7URwCQ1sFw_area_signs_guardians_08.jpg`, `B7URwCQ1sFw_area_signs_guardians_09.jpg`, `B7URwCQ1sFw_area_signs_guardians_10.jpg`, `NqQ3999exGQ_fresh_account_hud_00.jpg`, `NqQ3999exGQ_fresh_account_hud_01.jpg`, `NqQ3999exGQ_fresh_account_hud_02.jpg`, `QSA8L3lm9MI_shop_tutorial_00.jpg`, `QSA8L3lm9MI_shop_tutorial_01.jpg`, `XbCRqdF6h5I_pet_income_ranking_00.jpg`, `XbCRqdF6h5I_pet_income_ranking_01.jpg`, `XbCRqdF6h5I_pet_income_ranking_02.jpg`, `XbCRqdF6h5I_pet_income_ranking_03.jpg`, `XbCRqdF6h5I_pet_income_ranking_04.jpg`, `XbCRqdF6h5I_pet_income_ranking_05.jpg`, `XbCRqdF6h5I_pet_income_ranking_06.jpg`, `XbCRqdF6h5I_pet_income_ranking_07.jpg`
- **`reference/youtube_thumbs/`** (16 files): `4qA_C7rec-o.jpg`, `B7URwCQ1sFw.jpg`, `BZIVE-9uc-w.jpg`, `CkfoXn-81SY.jpg`, `GSrXI-biGuA.jpg`, `GVTeMVqFJzI.jpg`, `HvM9BvM_iNE.jpg`, `LpIOgld1e7Y.jpg`, `PKk4R53Ma60.jpg`, `QSA8L3lm9MI.jpg`, `QvJDRoOPJkg.jpg`, `VkxA2Vm251o.jpg`, `XbCRqdF6h5I.jpg`, `gCQt9UfQaeA.jpg`, `i9pHwD6UjMg.jpg`, `lmLBNksvoYA.jpg`
- **`reference/official/badges/`** (6 files): `Angelic_Treadmill_2940582970403757.png`, `Divine_Trail_1701163841407856.png`, `Hatched_Divine_1521646775064072.png`, `Hatched_Eternal_4448343437950888.png`, `Hatched_Secret_383815774941459.png`, `WELCOME_2590480615884365.png`
- **`reference/official/passes/`** (2 files): `X2_GROWTH_SPEED_1931468161.png`, `X2_MONEY_1935039424.png`

Wiki file prefixes: `zone__` biome screenshots, `guardian__` guardian renders, `treadmill__` the 11 treadmill models, `trail__` trail icons, `egg__` egg models, `mutation__` icons, `pet__` pet renders, `ui__` in-game UI screenshots. Storyboard prefixes are YouTube video ids: `NqQ3999exGQ` = CoralBlox fresh account; `B7URwCQ1sFw` = BlurryBacon speeds (zone signs, guardians, minimum speeds); `1Uta3el6hZY` = 1Chance Pet Index pages; `XbCRqdF6h5I` = Noobinini pet renders / income ranking; `QSA8L3lm9MI` = OrangeIsShort tutorial and shop.

---

## 23. CONFLICTS YOU MUST RESOLVE THE WAY THIS DOCUMENT SAYS
The research found contradictions. These rulings are final:
1. **Mutation multipliers:** use the config values (Silver 1.2, Golden 2.5, Rainbow 3.5, Bloom 1.25, Spirit Bloom 2.5, Parasite 3, Fractured 2.75, Scrambled 2.75), not the community 1.25/2/2.5/1.5/3. Stack additively.
2. **Treadmill math:** trail, speed multiplier and temporary boosts **add**; the treadmill factor multiplies. This reproduces the "8.2M/step max".
3. **Guardian names:** Volcano = Cerberus (a three-headed hellhound), Abyss = Moby (white whale), Cosmic = Cosmic Skeleton Boss, Cherry Blossom = Oni Tiger (build it as the white fox-like beast with red swirl markings, a pink-tipped tail and a pink flame aura from `reference/guides/guardian_10_cherry_blossom_ign.webp`), Titan = Gorilla King, A&D = Angel / Demon guardian. Guardian sizes come from `guardianHeight` (§3.1).
4. **Pet slots:** the §8.2 table (7 → 19). The treadmill unlock is Base Level 1. "+1 EQUIP" is only a shortcut that buys the next base level; there is no separate slot ladder.
5. **No base raiding:** pets and placed eggs in bases can never be stolen. PvP only happens in the field.
6. **No rebirth, no trading, no codes.** Gifting is optional behind a flag.
7. **Eggs are per-player instanced** in nests; carried and dropped eggs are shared.
8. **Trap stun 3 s.** Bat stats from the weapon table. Knockback is applied on the victim's client via the `Knockback` remote (§10.3).
9. **Prehistoric requirement 18M**, Cosmic 700M (never the old "450B" sign typo).
10. **Kitsune grow time 14 h** (config); Unicorn 12 h.
11. Do **not** implement the removed TikTok-style "Reels" video feed on the treadmill.

## 24. KNOWN UNKNOWNS (implement the DESIGN value, keep it in Config)
- Guardian speed curve (§4.5) and the Forest `minSpeedSmallEgg`.
- Speed → WalkSpeed curve (§4.4).
- Scale roll distribution (§4.2).
- Carry slowdown (§4.4).
- Offline income rate (10%).
- Friend boost rule.
- Sell value multiplier.
- Guardian heights (`guardianHeight`).
- Angels & Demons nest odds and form odds.
- Extinction / Skeletal model weights.
- Extinction mid-tier incomes.
- Exact pen sizes.
- Every studs dimension.

## 25. FINAL CHECKLIST — the build is DONE when all of these are true
- [ ] `map_concepts/` has the Codex blueprint, hub, pen and 12+ zone concept images, plus a README of prompts and refs.
- [ ] `verification/map_report.md` shows every area (hub, 12 zones incl. 3 A&D forms, whole world) **passed** a fresh-context verifier (≥85, no blocking issues), with round-by-round fixes.
- [ ] `ui_assets/` art pack generated, uploaded, and mapped in `Assets.luau` (with fallbacks).
- [ ] The place runs with zero errors and warnings in the output.
- [ ] 7 plots; each new player gets one.
- [ ] 12 lanes with signs, 5 straw nests each around a sleeping guardian of the right `guardianHeight`, and props.
- [ ] Painted SAFE ZONE marker (black "SAFE ZONE" letters with a white outline, blue/white pill caps); hub with SELL, Fuse, TRAILS SHOP, FREE chest, world leaderboard boards.
- [ ] A 300 s UTC cycle with a 10 s night, white wall, teleport home, ×30 growth, "ALL EGG RESET!", 5 eggs per zone, rare announcements, and the top-left rare list.
- [ ] Hold-E steal (client prompt → `RequestSteal`, validated on the server) → guardian wakes → chases its first grabber with the relative speed model (a Speed-10 player escapes the Forest chicken) → catch = client-side `Knockback` ragdoll fling + egg drop → guardian returns the egg → sleep.
- [ ] Safe-zone crossing completes the steal ("You stole an EGG!").
- [ ] Bat hits and traps drop eggs. Items are disabled in the safe zone.
- [ ] Place eggs in the pen (30 max, spacing rule), timers, Skip Growth, Hatch with the full VFX + "Mama!"; gender, weight, mutations.
- [ ] Pets roam, show billboards, earn per second with popups; offline cash pile.
- [ ] Base levels 0–12 (+1 Equip = next level), Equip Best / Unequip All.
- [ ] Treadmill unlock, 11 tiers, per-step gain, trails, 12 multiplier tiers, boosts, Slow Mode.
- [ ] Pet Index with every zone, silhouettes, per-pet and Claim All rewards, bat unlocks, Limited tab.
- [ ] Shop with all four sections and exact prices; `ProcessReceipt` idempotent with purchase intents; test mode works in Studio only.
- [ ] Sell, Fuse, Growing Eggs panel, Pets panel, `leaderstats` player list (Money/s, Speed), 10-slot hotbar.
- [ ] DataStore persistence with session locking; everything survives a rejoin.
- [ ] Mobile and console controls work.
- [ ] Phase-2 events exist behind flags (at minimum: the Admin Abuse panel with boosts, and the Capture the Egg framework).

Build it now, in full, following this document top to bottom. Output every file completely — no placeholders like "-- rest of code here".
