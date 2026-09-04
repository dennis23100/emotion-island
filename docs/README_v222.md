# 情緒不孤島 v2.2.2 — Stability / Visual Restore

這版不是新的 Art Pass。它是對 v2.2 的回歸修正。

## 為什麼 v2.2 看起來反而比 v2.1 差

v2.2 為了追求拖曳流暢度，同時改了太多渲染層：降低 Bloom 解析度、拖曳時直接關閉電影 Bloom、改成只 render Bloom layer、加入遠距離細節 LOD、降低陰影更新頻率。這些確實能省 GPU，但也會讓畫面在拖動前後有光效跳變、細節消失，且 layer-only Bloom 失去部分非發光物件的遮擋關係。

## v2.2.2 的原則

- 以 v2.1 Art Production 畫面為基準恢復。
- 不降低 Bloom 畫質。
- 拖曳時不關閉電影光效。
- 不使用 v2.2 的距離 LOD。
- 不改核心資料與遊戲功能。
- 只保留 frame-rate independent 的相機 target damping，改善旋轉／平移手感。
- 修正 `soundEnabled` TDZ 啟動錯誤。

## 核心功能

累積加分、Room Code、切換組別、商店、預覽、購買、佈置、儲存、NPC、遊樂設施、Viewer mode 均沿用 v2.1。

詳細檢查請看 `VERIFY_v222.txt`。
