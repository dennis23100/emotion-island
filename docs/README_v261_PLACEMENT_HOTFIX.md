# v2.6.1 Placement Hotfix

這版只修復「拿起物件後無法佈置／看不到預覽」的回歸問題，不重做場景、不改分數、商店、Firebase、房間或既有存檔格式。

## 修正
- 佈置碰撞改成三層安全判定：標準安全位 → 彈性安全位 → 最後保底位。
- 大型湖泊、平台與固定關鍵景物仍視為硬碰撞，不會為了能放而直接穿進大型地形。
- 小型自動景物改成 soft blocker，避免 v2.6 場景增加後把 118 個佈置格幾乎全部封死。
- 點「拿起來佈置」後，物件會立刻出現在第一個可用位置，不再一定要先把滑鼠移到畫布才看到 ghost。
- 佈置時會顯示安全格提示，底部文字會直接告訴你目前有多少可用位置。
- 滑鼠移動仍會自動吸附最近位置；提交時使用同一個安全模式重新驗證，避免顯示可放、點下去卻被拒絕。
- 加入 `window.__emotionPlacementDiagnostics(itemId)`，之後若再有某個大型物件不能擺，可以直接查該組還有多少 strict / relaxed / fallback 位置。

## Core Freeze
以下資料層函式與 v2.6 完全一致：
`setScore`, `addScore`, `setWorldName`, `setMaxMembers`, `saveMember`, `buyItem`, `placeItem`, `removePlacement`, `saveLayout`。

因此這次沒有為修佈置去碰分數、購買、Firebase 與儲存格式。
