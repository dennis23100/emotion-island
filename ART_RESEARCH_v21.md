# v2.1 Art Research Notes

## 方向

### Stylized Nature Asset Pipeline
Quaternius Stylized Nature MegaKit 提供 116 個 stylized nature models（40 trees、35 plants/flowers、27 rocks），支援 glTF 且 CC0。這確認了後續正式量產應繼續走「GLB asset bank + web optimized asset」而不是無限制用 Sphere / Cylinder 拼所有美術。

### Water
WaterThreeJS 的做法顯示 stylized shoreline 主要要處理：淺水深度色、animated foam band、contact foam、白頭浪，而不是只把平面改成透明藍。v2.1 先不動目前穩定 water shader，留到下一個獨立 pass，避免跟地形和 NPC 同時改太多。

### NPC Animation
Three.js AnimationMixer 是正式 glTF animation playback 的標準路徑。v2.1 先把 ride seat / world-position 行為架構做好，之後角色換成帶 Idle/Walk/Sit/Ride clips 的 GLB 時，可沿用這套 activity state，而不需要重寫分數／商店／佈置系統。
