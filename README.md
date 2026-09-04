# 情緒不孤島 v2.6.1

Three.js 打造的即時互動加分系統。八個小組各自擁有一座島，累積分數換取商店道具並佈置自己的世界，資料即時同步到 Firebase Realtime Database。

## 頁面

| 檔案 | 說明 |
| --- | --- |
| `emotion_links.html` | **連結產生器** — 輸入房號，一次產生主畫面與八組專屬連結 |
| `emotion_island.html` | 八島大世界 — 投影用主畫面，八島全景與即時排名 |
| `emotion_my_world.html` | 我的小世界 — 單組佈置、商店、預覽、購買、加分 |
| `emotion_score.html` | 填寫分數 |

## 網址參數

| 用途 | 網址 | 解析結果 |
| --- | --- | --- |
| 主畫面 | `emotion_island.html?room=2026` | 房間 2026 |
| 第一組 | `emotion_my_world.html?room=202601` | 房間 2026、第 1 組 |
| 第八組 | `emotion_my_world.html?room=202608` | 房間 2026、第 8 組 |
| 唯讀參觀 | 上述網址加 `&view=1` | 隱藏編輯面板 |

各組連結使用**組別房號**（4 碼房間 + 2 碼組別），組別包在房號裡，資料仍寫回同一個房間，所以九個連結完全連動。也可以改用明確參數 `?room=2026&group=1`，兩種寫法皆可。

直接開啟 `emotion_links.html` 就能產生全部連結，不需要手動組網址。

## 資料結構

- Firebase Realtime Database：`rooms/{room}/emotionV3/groups/{group}`
- 未帶 `room` 參數時為本機示範模式，資料存於 localStorage（前綴 `emotionIslandV24:`）

## 目錄

| 資料夾 | 內容 |
| --- | --- |
| `assets/` | `assetbank.js` 模型清單、`models/` 21 個 `.glb` 場景模型 |
| `docs/` | 各版說明、藝術方向研究、部署與升級筆記 |
| `verify/` | 各版驗證與靜態檢查報告 |
| `tools/` | 歷次版本的 patch / verify / regression 腳本 |
| `backups/` | v2.0、v2.2.2 的主程式備份 |

`tools/` 內的腳本使用產生當時環境的絕對路徑，保留作為改版紀錄，無法直接執行。

## 模型

`assets/models/` 收錄 21 個 `.glb`：樹木（橡木／松木／櫻花）、涼亭、燈籠、水晶、長椅、橋、營火、小屋、鳥居、望遠鏡、岩石群，以及 8 個 hero 建築（世界樹、水晶教堂、月神殿、觀星台、茶亭、風神殿、花亭、極光祭壇）。

## v2.6.1 說明

這版只修復「拿起物件後無法佈置／看不到預覽」的回歸問題，不重做場景，也不動分數、商店、Firebase、房間與既有存檔格式。

- 佈置碰撞改為三層安全判定：標準安全位 → 彈性安全位 → 最後保底位
- 大型湖泊、平台與固定景物維持硬碰撞，不會為了能放而穿進地形
- 小型自動景物改為 soft blocker，避免 v2.6 增加景物後把 118 個佈置格幾乎封死
- 點「拿起來佈置」後物件立即出現在第一個可用位置，不必先移動滑鼠
- 佈置時顯示安全格提示與目前可用位置數量
- 新增 `window.__emotionPlacementDiagnostics(itemId)` 診斷函式

資料層函式（`setScore`、`addScore`、`setWorldName`、`setMaxMembers`、`saveMember`、`buyItem`、`placeItem`、`removePlacement`、`saveLayout`）與 v2.6 完全一致。

完整版本紀錄見 `docs/`，驗證報告見 `verify/`。

## 部署

純靜態網站，three.js 由 CDN 載入，無建置流程。把根目錄指向任何靜態主機（Vercel／Netlify／GitHub Pages）即可。
