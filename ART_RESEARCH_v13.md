# v1.3 美術技術方向

## 已實作
- GLB asset bank
- Stylized shader water
- Theme-specific biome palettes
- Theme-specific centerpiece
- Optional selective bloom
- Contact/blob shadow
- Theme particles / meteor / aurora
- NPC furniture attraction / contextual motion

## 為什麼這次加 Bloom
Three.js 的 UnrealBloomPass 使用多層 mip blur，適合做水晶、魔法燈、星環與瀑布的柔光。v1.3 使用「指定 Bloom Layer」避免整個世界一起過曝。

## 下一個最有價值的 Art Pass
1. 更完整的 shoreline foam / depth water
2. Stylized outline（只給角色與重要建築）
3. 更正式的 GLB 樹、懸崖、房屋資產
4. 小精靈真正的坐下 / 觀星 / 鞦韆骨架動畫
5. Theme-specific skybox / cloud layers
6. 低成本 AO / 更好的 contact shadow

## 參考
- Three.js UnrealBloomPass
- Three.js post-processing manual
- Quaternius Stylized Nature MegaKit (CC0)
- Kenney Nature Kit (CC0)
