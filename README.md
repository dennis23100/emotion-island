# 情緒不孤島 v2.6.4 OFFICIAL

Three.js 打造的即時互動加分系統。八個小組各自擁有一座島，累積分數換取商店道具並佈置自己的世界，資料即時同步到 Firebase Realtime Database。

## 頁面

| 檔案 | 說明 |
| --- | --- |
| `emotion_links.html` | **連結產生器** — 輸入房號，一次產生主畫面與八組專屬連結 |
| `emotion_island.html` | 八島大世界 — 投影用主畫面，八島全景與即時排名 |
| `emotion_my_world.html` | 我的小世界 — 單組自由佈置、商店、預覽、購買、加分 |
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

## v2.6.4 OFFICIAL 說明

正式活動版，只做正式化封裝，不重寫小世界核心功能。

- 移除右上角「切換組別」按鈕與八組切換視窗，各組連結進去就只有自己那一組
- 沒有 `room` 參數時不再顯示八組選單，改為引導前往 `emotion_links.html`
- 面板狀態改為「正式模式 / 本組專屬房號」

Firebase 與 room 解析、202601～202608 房號資料、分數與商店、自由佈置與保存格式、NPC 與遊樂設施、localStorage 與 Firebase 資料 key 皆未更動，升級不會重置既有分數或小世界資料。

### 這一輪的前置版本

- **v2.6.2 FREE PLACEMENT** — 手動佈置從 118 個固定格改為自由座標。位置改存 `x/z`，舊資料沒有 `x/z` 時仍以原格位顯示，向後相容。操作改為：拿起 → 預覽跟隨游標（藍格可放、紅格碰撞）→ 點地面選位置 → 確認放下 → 儲存小世界。
- **v2.6.3 RUNTIME RESTORE** — 修復 v2.6.2 的 patch 誤刪的一整段 runtime 函式（`renderPeople`、`updateSpirits`、`updateWind`、`updateRides`、`renderCurrent` 等），自由佈置邏輯原樣保留。

完整版本紀錄見 `docs/`，驗證報告見 `verify/`。

## 部署

純靜態網站，three.js 由 CDN 載入，無建置流程。把根目錄指向任何靜態主機（Vercel／Netlify／GitHub Pages）即可。
