# 情緒不孤島 v2.2.2

Three.js 打造的即時互動加分系統。八個小組各自擁有一座島，累積分數換取商店道具並佈置自己的世界，資料即時同步到 Firebase Realtime Database。

## 頁面

| 檔案 | 說明 | 網址參數 |
| --- | --- | --- |
| `emotion_island.html` | 八島大世界 v2.2.2 — 主場景，總覽八組島嶼 | `?room=<房號>&group=<組別>` |
| `emotion_my_world.html` | 我的小世界 v1.9 — 單組佈置、商店、預覽、購買 | `?room=<房號>&group=<組別>`，加 `&view=1` 進入唯讀 Viewer 模式 |
| `emotion_score.html` | 填寫分數 v1.6 | `?room=<房號>&group=<組別>` |

## 資料結構

Firebase Realtime Database，路徑為 `rooms/{room}/emotionV3/groups/{group}`，各組存放 `worldName`、`maxMembers`、`updatedAt` 與佈置資料。

## 資源

`assets/assetbank.js` 定義模型清單，`assets/models/` 收錄 21 個 `.glb`：樹木（橡木／松木／櫻花）、涼亭、燈籠、水晶、長椅、橋、營火、小屋、鳥居、望遠鏡、岩石群，以及 8 個 hero 建築（世界樹、水晶教堂、月神殿、觀星台、茶亭、風神殿、花亭、極光祭壇）。

所有資源皆為相對路徑，three.js 由 CDN 載入，可直接靜態部署。

## v2.2.2 說明

這版不是新的 Art Pass，而是對 v2.2 的回歸修正。v2.2 為了追求拖曳流暢度同時改動太多渲染層（降低 Bloom 解析度、拖曳時關閉電影 Bloom、只 render Bloom layer、遠距離 LOD、降低陰影更新頻率），造成拖動前後光效跳變與細節消失。

v2.2.2 以 v2.1 Art Production 畫面為基準恢復：不降 Bloom 畫質、拖曳時不關電影光效、移除距離 LOD，只保留 frame-rate independent 的相機 target damping，並修正 `soundEnabled` 的 TDZ 啟動錯誤。核心資料與遊戲功能未更動。

## 版本紀錄

各版說明見 `README_v12.md` ~ `README_v222.md`，升級腳本見 `patch_v*.py`，藝術方向見 `ART_RESEARCH_v*.md`，驗證報告見 `VERIFY_v21.txt`、`VERIFY_v222.txt`、`STATIC_CHECK_v20.txt`。

`*.v20.backup.html` 為 v2.0 的備份檔。

## 部署

純靜態網站，把根目錄指向任何靜態主機（Vercel／Netlify／GitHub Pages）即可，無需建置流程。
