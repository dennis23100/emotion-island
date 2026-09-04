# 情緒不孤島 v1.2 — Game Art Pass I

這版不是只加功能，而是把小世界的「遊戲美術層」開始抽離成正式資產管線。

## 這版的大升級

- 小世界主島從規則大圓盤改成 **不規則海岸輪廓**，岩壁、草地邊界不再完全同心圓。
- 水面改成 **GPU Shader 動畫水**：深淺色流動、波峰、亮點、兩層岸邊光帶；不再每幀用 CPU 重算整張水面。
- 加入本地 `assets/models/*.glb` 輕量遊戲資產：
  - 橡樹 / 櫻花樹 / 松樹
  - 岩石群
  - 小屋
  - 涼亭
  - 木橋
  - 長椅
  - 星燈
  - 水晶群
  - 觀星台
  - 神社門 / 拱門
  - 篝火
- HTML 會優先使用本地 GLB；如果預覽環境無法載入 GLB，會自動退回原本程序模型，不會整頁死掉。
- 八組現在除了中央核心、天空色盤不同，**樹種與水面色彩也各自不同**。
- 主島周圍加入本地岩石資產與較自然的邊緣破碎感。
- 商店 3D 預覽也會自動使用新版 GLB 資產。
- 小精靈 NPC 增加「家具吸引點」行為：會走向長椅、篝火、噴泉、觀星台、小屋、涼亭等，而不是只隨機走動與聊天。
- 主世界的八座縮圖島也拉開配色與標誌景物，不再像八個完全相同的複製島。
- 本機 demo storage key 更新到 v1.2，避免舊版資料讓新版畫面判斷失真。

## 正式網址規則

主世界：

`emotion_island.html?room=0905`

第一組：

`emotion_my_world.html?room=090501`

第二組：

`emotion_my_world.html?room=090502`

...

第八組：

`emotion_my_world.html?room=090508`

主辦方從主世界進第一組時，正式部署會開：

`emotion_my_world.html?room=090501&view=1&from=main`

因此主辦方參觀與第一組自己看到的是 **同一套小世界 renderer / 同一份 Firebase 資料**，只是參觀模式不能編輯。

## 重要：GitHub/Vercel 上傳時要保留資料夾

不能只上傳三個 HTML。v1.2 開始有本地遊戲資產，所以必須保留：

```text
emotion_island.html
emotion_my_world.html
emotion_score.html
assets/
  assetbank.js
  models/
    tree_oak.glb
    tree_sakura.glb
    tree_pine.glb
    ...
```

如果漏掉 `assets/`，系統仍會 fallback 到舊程序模型，但就看不到這次 Asset Pass 的主要提升。

## 美術管線策略

v1.2 開始採用：

**程序邏輯控制世界成長 + 本地 GLB 負責主要視覺資產 + Shader 負責水 / 光 / 氣氛。**

這比把所有東西都硬寫成 `SphereGeometry / CylinderGeometry` 更適合繼續往正式遊戲質感推。

## 已做靜態檢查

- 三個 HTML inline JavaScript：syntax OK
- `assets/assetbank.js`：syntax OK
- HTML duplicate id：0
- 所有 GLB：可被 `trimesh` 重新載入驗證
- 090501 → event room 0905 / group 1 的既有規則保留

## 下一個最值得的 Art Pass

1. Selective Bloom（只讓水晶、燈、瀑布、核心發光）
2. Toon / NPR 水邊泡沫與瀑布材質
3. 接觸陰影、柔和輪廓線
4. 更完整的房屋 / 橋 / 花草資產庫
5. NPC 真正坐長椅、圍篝火、看望遠鏡、玩鞦韆等家具動畫
6. 主世界也共用小世界資產縮圖，進一步統一視覺
