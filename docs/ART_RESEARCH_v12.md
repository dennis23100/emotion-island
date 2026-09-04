# v1.2 美術研究方向

這版的 Art Pass 參考了 Web / Three.js 社群常見的幾個成熟方向：

- Stylized environment 不靠高面數，而靠輪廓、材質、植被變化、光影層次與配色。
- 自然資產最好走可重用 GLB asset bank，而不是每個物件都在 HTML 裡重新拼 primitive。
- 水面是場景質感最敏感的一層；深淺色、波動、岸邊亮帶/泡沫比單純藍色平面有效很多。
- 後續若再加 Bloom / Outline，應該是 selective，而不是整個畫面一起發光。

v1.2 先把架構改成「本地 GLB + shader + fallback」，之後就能逐步換成更完整的正式資產，不需要再大改資料層。
