# v1.3 GitHub / Vercel 部署

請保持以下相對結構：

```
/
├── emotion_island.html
├── emotion_my_world.html
├── emotion_score.html
└── assets/
    ├── assetbank.js
    └── models/
        └── *.glb
```

v1.3 新增的 Bloom 相關 Three.js post-processing 仍由 jsDelivr CDN 載入；如果 CDN 載入失敗，頁面會自動使用基本 renderer，不會阻止遊戲本體啟動。

正式活動建議：
- 主辦方投影：`emotion_island.html?room=0905`
- 第一組 QR：`emotion_my_world.html?room=090501`
- ...
- 第八組 QR：`emotion_my_world.html?room=090508`

Firebase 的共同資料房仍是 `0905`，尾碼 `01`~`08` 只負責鎖定組別。
