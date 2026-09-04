# v1.7 美術方向研究摘要

本版的策略不是再單純加 Bloom，而是將視覺品質拆成：
1. 正確色彩與明度
2. 明確 focal point
3. 主光 + 填充光形成層次
4. 世界內有故事的小型 props
5. 不同 biome 的 palette / silhouette / props 一起變化

參考方向：
- Three.js Color Management：保持 linear lighting / sRGB output 的正確流程。
- Three.js 社群 Bloom 討論：不要用全畫面 Bloom 拉亮；以 luminance / emissive 控制真正需要發光的物件。
- 80 Level stylized diorama breakdown：先決定構圖與 focal point，再安排燈光與資產細節；亮但不能 blown-out，要保留陰影區域。
- 80 Level Ghibli-inspired island：主光之外用 cold / warm fill 支撐陰影與 focal points。
- Polycount stylized environment feedback：色彩與 value hierarchy 要服務 focal point，過於 harsh 或 saturation 無秩序會讓場景難以整合。
