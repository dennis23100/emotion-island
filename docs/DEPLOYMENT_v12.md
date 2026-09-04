# v1.2 部署到 GitHub + Vercel / GitHub Pages

## Repository 建議結構

```text
temple184179/
├─ emotion_island.html
├─ emotion_my_world.html
├─ emotion_score.html
└─ assets/
   ├─ assetbank.js
   ├─ ASSET_NOTES.md
   └─ models/
      ├─ tree_oak.glb
      ├─ tree_sakura.glb
      ├─ tree_pine.glb
      ├─ rock_cluster.glb
      ├─ cottage.glb
      ├─ gazebo.glb
      ├─ bridge.glb
      ├─ bench.glb
      ├─ lantern.glb
      ├─ crystal_cluster.glb
      ├─ telescope.glb
      ├─ shrine_gate.glb
      └─ campfire.glb
```

## Vercel

如果 repository 已經連到 Vercel，只要 commit / push 這些檔案即可。Vercel 會把 GLB 當靜態資產一起發布。

## GitHub Pages

同樣可以直接發布。所有模型使用相對路徑 `assets/models/...`，所以在 repo Pages 子路徑也能正常工作。

## 正式活動示例

```text
主世界      /emotion_island.html?room=0905
第一組      /emotion_my_world.html?room=090501
第八組      /emotion_my_world.html?room=090508
第一組參觀  /emotion_my_world.html?room=090501&view=1&from=main
```

## 注意

- 不要只複製 HTML 而漏掉 `assets/`。
- Firebase config 仍在前端；正式活動前應再把寫入權限鎖進 Firebase Auth / Security Rules。
- `184179` 目前仍屬前端管理密碼，只適合防誤觸，不是最終資安邊界。
