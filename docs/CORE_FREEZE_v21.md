# v2.1 Core Freeze

這一版的目標是 **加深美術與互動，不重寫已經穩定的產品核心**。

## 與 v2.0 比對後保持不變的核心函式
- `addScore`
- `buyItem`
- `saveLayout`
- `placeItem`
- `setWorldName`
- `saveMember`

## 房間規則保留
- `090501` → 活動 `0905` / 第一組
- `090508` → 活動 `0905` / 第八組

## 保留的資料格式
- group score / progressScore / spendablePoints
- members
- inventory
- placements
- worldName
- maxMembers

## v2.1 只新增到 rendering / art / NPC presentation layer
- biome macro silhouettes
- 8 hero GLB assets
- ride seat anchors
- tree wind sway
- camera presets

詳細驗證結果：`VERIFY_v21.txt`
