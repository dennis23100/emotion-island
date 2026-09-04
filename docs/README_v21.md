# 情緒不孤島 v2.1 — Art Production Pass I

這一版不是「八項都宣稱做完」，而是先把最值得的三層真正做深：

1. **八組不同地形剪影 / Hero Composition**
2. **正式可替換的 Hero GLB 資產層**
3. **小精靈真正跟著遊樂設施座位移動**

核心資料層保持凍結：分數、Firebase room、商店資料、佈置儲存、人物資料格式都不重寫。

## 1. 八組不再只是同一張地圖換顏色

v2.1 在原本穩定的可佈置主島之外，額外增加「外圍地貌剪影」，這些地貌不改既有 placement slot，因此不會破壞存檔。

- 第一組 星辰山水：雙觀測岬角、觀星台、晶體星群
- 第二組 櫻霞庭園：櫻花庭園半島、水池、茶亭
- 第三組 翡翠森境：四個森林岬角、世界樹聖域
- 第四組 晨曦山谷：高低雙山脊、風之神殿
- 第五組 月汐夜海：月灣、潮池、月之神殿、觀星高台
- 第六組 花風原野：雙花野翼、花園亭、花海
- 第七組 晶湖秘境：左右晶體峽谷、中央晶湖／晶殿
- 第八組 希望極光：雙聖域、中央祭壇、雙橋與巨木

## 2. 新增 8 個本地 Hero GLB

`assets/models/` 新增：

- `hero_observatory.glb`
- `hero_tea_pavilion.glb`
- `hero_world_tree.glb`
- `hero_wind_shrine.glb`
- `hero_moon_shrine.glb`
- `hero_flower_pavilion.glb`
- `hero_crystal_cathedral.glb`
- `hero_aurora_altar.glb`

這些是 v2.1 本地自製的輕量 Web GLB，不依賴外部下載。GLB 載入失敗時仍會退回舊的程序模型，不會整頁壞掉。

`assets/assetbank.js` 已加入八個 Hero asset。

## 3. 遊樂設施：NPC 不只「走到旁邊」

v2.1 對摩天輪、旋轉木馬、咖啡杯、小火車、天空飛椅、熱氣球、雲端軌道加入真正的 seat anchors。

小精靈進入活動狀態時：

- 會跟隨正在旋轉／移動的座位
- 摩天輪座位跟著 wheel 旋轉
- 旋轉木馬與咖啡杯跟著平台旋轉
- 小火車跟著移動組件
- 飛椅跟著旋轉組件
- 熱氣球跟著 bobbing basket
- 雲端軌道跟著 cart

`animate()` 順序也改成 **先更新設施，再更新 NPC**，確保 NPC 取得的是這一幀最新的座位座標。

## Core Freeze

`VERIFY_v21.txt` 會檢查這些核心函式是否與 v2.0 完全一致：

- `addScore`
- `buyItem`
- `saveLayout`
- `placeItem`
- `setWorldName`
- `saveMember`

目前檢查結果皆為 `UNCHANGED`。

另外保留：

- `090501 → 活動 0905 / 第一組`
- `090508 → 活動 0905 / 第八組`
- 累積加分
- 41 個商店物件
- 自由佈置／碰撞／存檔
- 切換組別
- 主辦方唯讀 Viewer

## 建議測試順序

1. 不帶 `room` 打開 `emotion_my_world.html`。
2. 切換 1 → 8 組，看外圍 silhouette 是否已經明顯不同。
3. 特別看：1 的觀測台、3 的世界樹、5 的月之神殿、7 的晶殿、8 的極光祭壇。
4. 商店買摩天輪／旋轉木馬／小火車／熱氣球並擺下。
5. 放著 20–40 秒，看小精靈是否進入設施並跟著座位移動。
6. 測 `090501` 和 `090508` 房間網址。

## 下一階段

下一版再繼續往：

- 真正大批 CC0 Nature GLB 資產替換
- 樹葉／草地風動
- 岸邊泡沫與河流
- 更完整的 NPC Idle / Walk / Sit / Ride 動畫
- 八組完全不同的路徑與地貌材質

走，不再加新的核心資料格式。
