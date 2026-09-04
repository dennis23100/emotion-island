# v3.2 水面 / 世界甦醒研究摘要

本輪只用研究結果決定技術方向，沒有把外部專案原碼直接搬進來。

## 方向 1：Stylized water 不需要昂貴的全場景即時反射
Three.js 社群針對卡通水面建議使用較便宜的自訂 toon / shader 實作，而官方 Water / Water2 會為反射、折射增加額外成本。專案因此保留自訂 ShaderMaterial，改進 GPU vertex wave、fragment ripple / glint / caustic-like bands，而不是加入全場景 reflection pass。

參考：
- https://discourse.threejs.org/t/use-water-with-texture/7596
- https://discourse.threejs.org/t/fps-dropping-when-near-water-shader/57125
- https://discourse.threejs.org/t/unlit-water-shader-with-foam/11641

## 方向 2：GPU wave displacement + 波峰高光
公開 Three.js water shader 專案普遍使用 vertex displacement、程序波浪、動態水色與波峰/泡沫高光。v3.2 採取相同的大方向，但保持較簡單、無外部 texture 的動畫風格。

參考：
- https://github.com/davidllona/Threejs-water-shader
- https://github.com/achrefelouafi/WaterThreeJS
- https://discourse.threejs.org/t/animated-ocean-waves/43814

## 方向 3：世界的「連結」用地形 reveal，而不是一開始就畫線
本專案的主題是「其實彼此一直相連」。因此 v3.2 不把 connection 當 UI 線條，而是把它視為埋在海中的地脈：分數增加後，從小島端與中央聖山端逐段升出海面，最後在中段閉合。發光水脈只作第二層效果。
