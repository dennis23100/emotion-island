# v2.6.3 RUNTIME RESTORE

這是一個純修復版本，不新增玩法、不改美術、不改資料格式。

## 修復內容

v2.6.2 自由佈置 patch 意外刪除了小世界原本的一整段 runtime 函式，而不只是 `renderCurrent()`。
本版從最後能正常工作的 v2.6.1 恢復以下函式／常數：

- `spiritHomes`
- `chatSpots`
- `renderPeople()`
- `setSpiritTarget()`
- `updateSpirits()`
- `refreshWindObjects()`
- `updateWind()`
- `updateRides()`
- `renderCurrent()`
- `renderEditor()`
- `renderMembers()`

## 保留且未重寫

v2.6.2 的自由佈置邏輯原樣保留：

- `freePlacementSafe()`
- `startPlace()`
- `updateGhostFromEvent()`
- `chooseGhostPlacement()`
- `commitGhostPlacement()`
- `saveLayoutDraft()`
- `selectGroup()`

資料層的分數、購買、庫存、Firebase / room code、自由座標保存格式沒有因這次修復而重寫。

## 為什麼上一版 syntax check 沒抓到

`renderCurrent()` 是合法的函式呼叫語法，即使函式不存在，JavaScript 仍可通過語法解析；錯誤只會在瀏覽器真正執行到該行時發生。因此這次新增了「關鍵 runtime function 必須實際存在且只能宣告一次」的檢查。
