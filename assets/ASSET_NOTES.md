# v1.2 Local Game Art Assets

These GLB files are bundled with the project so GitHub Pages/Vercel can load them from the same origin.
They were generated specifically for this project as lightweight stylized web assets, with the art direction informed by CC0 stylized-environment references such as Quaternius Stylized Nature MegaKit and Kenney Nature Kit.

The runtime is resilient: if GLTFLoader or a GLB file cannot be loaded (for example in a restricted single-file preview), the app automatically falls back to its procedural geometry.

## v1.3
GLB asset bank remains the art base. Cinematic bloom, atmospheric FX, and contact shadows are applied at runtime, so no additional binary art assets are required for this pass.

## v2.1 Local Hero Assets
These eight lightweight GLB files were generated locally for this project and are bundled with the repository:
- hero_observatory.glb
- hero_tea_pavilion.glb
- hero_world_tree.glb
- hero_wind_shrine.glb
- hero_moon_shrine.glb
- hero_flower_pavilion.glb
- hero_crystal_cathedral.glb
- hero_aurora_altar.glb
They are used as biome-specific hero landmarks with procedural fallbacks.
