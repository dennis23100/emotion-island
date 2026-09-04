/* 情緒不孤島 — 共用背景音樂
 *
 * 用法：放在 <head> 裡，越早越好（音訊會在 3D 場景初始化前就開始載入，
 *       這樣換頁時的空檔最短）：
 *   <script src="assets/bgm.js"></script>
 *
 * 按鈕位置會自動避開既有控制項；也可以用 data-pos 指定固定角落
 * （bl / br / tl / tr）：
 *   <script src="assets/bgm.js" data-pos="tr"></script>
 *
 * 新增歌曲：把 .mp3 放進 music/，再把檔名加進下面的 TRACKS。
 * 靜態網站無法列出目錄內容，所以清單需要手動維護。
 *
 * 換頁時音訊必然中斷（瀏覽器會銷毀整個頁面），這裡用 sessionStorage
 * 記住歌曲與秒數，新頁面接續播放，把空檔壓到最短。
 * 同一頁內切換場景（例如群島參觀切換八組）不會中斷。
 */
(function () {
  'use strict';

  var TRACKS = [
    'Floating Island Friends.mp3',
    'Magical Breeze.mp3',
    'Wonderland Discovery.mp3',
    'Wonderland Discovery1.mp3'
  ];

  var DIR = 'music/';
  var VOLUME = 0.32;
  var FADE_MS = 450;
  var KEY_ON = 'emotionIslandBGM:enabled';     // 跨分頁記住開關
  var KEY_POS = 'emotionIslandBGM:position';   // 同分頁記住播到哪

  if (!TRACKS.length) return;

  var audio = null;
  var queue = [];
  var cursor = 0;
  var enabled = loadEnabled();
  var pending = false;   // 想播但被瀏覽器擋住，等使用者互動
  var btn, icon, forcedPos = null;

  /* ---------- 儲存 ---------- */

  function loadEnabled() {
    try {
      var v = localStorage.getItem(KEY_ON);
      return v === null ? true : v === '1';   // 預設開啟
    } catch (e) { return true; }
  }
  function saveEnabled(v) {
    try { localStorage.setItem(KEY_ON, v ? '1' : '0'); } catch (e) {}
  }
  function savePosition() {
    if (!audio || !queue.length) return;
    try {
      sessionStorage.setItem(KEY_POS, JSON.stringify({
        track: queue[cursor],
        time: audio.currentTime || 0
      }));
    } catch (e) {}
  }
  function loadPosition() {
    try { return JSON.parse(sessionStorage.getItem(KEY_POS) || 'null'); }
    catch (e) { return null; }
  }

  /* ---------- 播放清單 ---------- */

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildQueue() {
    queue = shuffle(TRACKS);
    cursor = 0;
    var pos = loadPosition();
    if (pos && pos.track) {
      var at = queue.indexOf(pos.track);
      if (at >= 0) {
        cursor = at;
        return pos.time > 1 ? pos.time : 0;
      }
    }
    return 0;
  }

  function src(name) { return DIR + encodeURIComponent(name); }

  function nextTrack() {
    cursor++;
    if (cursor >= queue.length) { queue = shuffle(TRACKS); cursor = 0; }
    play(0);
  }

  /* ---------- 播放 ---------- */

  function fadeIn() {
    if (!audio) return;
    var steps = 18, i = 0;
    audio.volume = 0;
    var timer = setInterval(function () {
      i++;
      if (!audio || audio.paused) { clearInterval(timer); return; }
      audio.volume = Math.min(VOLUME, VOLUME * (i / steps));
      if (i >= steps) clearInterval(timer);
    }, FADE_MS / 18);
  }

  function play(startAt) {
    if (!enabled || !queue.length) return;
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('ended', nextTrack);
      audio.addEventListener('error', nextTrack);
      audio.addEventListener('timeupdate', throttle(savePosition, 2000));
    }
    audio.volume = 0;
    if (startAt > 0) {
      // 指定 src 會把 readyState 打回 0，所以監聽器要先掛上才能 seek。
      audio.addEventListener('loadedmetadata', function once() {
        audio.removeEventListener('loadedmetadata', once);
        try { audio.currentTime = startAt; } catch (e) {}
      });
    }
    audio.src = src(queue[cursor]);
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () { pending = false; fadeIn(); sync(); })
       .catch(function () { pending = true; sync(); armUnlock(); });
    } else {
      fadeIn();
    }
  }

  function stop() {
    if (!audio) return;
    savePosition();
    audio.pause();
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn(); }
    };
  }

  /* ---------- 瀏覽器自動播放限制 ---------- */
  // 幾乎所有瀏覽器都禁止「使用者互動前」自動播放有聲音的內容。
  // 先嘗試播放，被擋下就等第一次點擊／觸控／按鍵再開始。

  var unlockArmed = false;
  function armUnlock() {
    if (unlockArmed) return;
    unlockArmed = true;
    var events = ['pointerdown', 'touchstart', 'keydown'];
    function unlock() {
      events.forEach(function (e) {
        document.removeEventListener(e, unlock, true);
      });
      unlockArmed = false;
      if (enabled && pending) play(0);
    }
    events.forEach(function (e) {
      document.addEventListener(e, unlock, true);
    });
  }

  /* ---------- 自動選位置 ---------- */
  // 四個角落逐一試，挑一個底下沒有既有控制項的。
  // 3D 頁面整面都是 canvas，所以空的角落會回傳 canvas 或 body。

  // 四個角 + 左右邊中央。3D 頁面側邊中央通常是空的畫面。
  var CORNERS = ['br', 'bl', 'tr', 'mr', 'ml', 'tl'];

  function cornerPoint(pos, size, gap) {
    // 用 clientWidth/Height：position:fixed 的定位基準不含捲軸，
    // 用 innerWidth 會讓探測點落到捲軸上，elementFromPoint 回傳 null。
    var d = document.documentElement;
    var w = d.clientWidth, h = d.clientHeight;
    var left = (pos === 'bl' || pos === 'tl' || pos === 'ml');
    var x = left ? gap + size / 2 : w - gap - size / 2;
    var y;
    if (pos === 'ml' || pos === 'mr') y = h / 2;
    else if (pos === 'tl' || pos === 'tr') y = gap + size / 2;
    else y = h - gap - size / 2;
    return [x, y];
  }

  // 0 = 完全乾淨、1 = 有東西但不能點、2 = 壓到可互動元素
  function pointScore(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return 0;
    // 呼叫端已把按鈕設成 pointer-events:none，理論上不會抓到自己
    if (el === btn || btn.contains(el)) return 0;
    var t = el.tagName;
    if (t === 'CANVAS' || t === 'BODY' || t === 'HTML') return 0;

    var covered = false, n = el, depth = 0;
    while (n && n !== document.body && depth++ < 8) {
      var tag = n.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' ||
          tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'LABEL') return 2;
      var cs = getComputedStyle(n);
      if (cs.pointerEvents !== 'none' && cs.backgroundColor &&
          cs.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          cs.backgroundColor !== 'transparent') covered = true;
      n = n.parentElement;
    }
    return covered ? 1 : 0;
  }

  // 取按鈕範圍內五個點的最差結果，避免只是「邊緣壓到」卻沒偵測出來
  function occupancy(pos, size, gap) {
    var c = cornerPoint(pos, size, gap);
    var h = size / 2 - 2;
    var pts = [
      [c[0], c[1]],
      [c[0] - h, c[1] - h], [c[0] + h, c[1] - h],
      [c[0] - h, c[1] + h], [c[0] + h, c[1] + h]
    ];
    var worst = 0;
    for (var i = 0; i < pts.length; i++) {
      var s = pointScore(pts[i][0], pts[i][1]);
      if (s > worst) worst = s;
      if (worst === 2) break;
    }
    return worst;
  }

  function placeButton() {
    if (!btn) return;
    var size = btn.offsetWidth || 46;
    var gap = document.documentElement.clientWidth <= 520 ? 12 : 16;
    var order = forcedPos ? [forcedPos] : CORNERS;

    // pointer-events:none 會連子元素一起排除在命中測試外；
    // visibility:hidden 在這裡不可靠（同一個 tick 內不一定生效）。
    btn.style.pointerEvents = 'none';
    var best = null, bestScore = 3;
    for (var i = 0; i < order.length; i++) {
      var s = occupancy(order[i], size, gap);
      if (s < bestScore) { bestScore = s; best = order[i]; }
      if (s === 0) break;
    }
    btn.style.pointerEvents = '';

    // 四個角都壓到按鈕時就別亂跳，維持現狀
    if (!best || bestScore === 2) return;
    CORNERS.forEach(function (c) { btn.classList.remove('bgm-' + c); });
    btn.classList.add('bgm-' + best);
  }

  /* ---------- 按鈕 ---------- */

  function sync() {
    if (!btn) return;
    btn.classList.toggle('bgm-off', !enabled);
    btn.classList.toggle('bgm-pending', enabled && pending);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.title = !enabled ? '背景音樂：關閉（點擊開啟）'
              : pending ? '背景音樂：點一下開始播放'
              : '背景音樂：播放中（點擊關閉）';
  }

  function toggle() {
    enabled = !enabled;
    saveEnabled(enabled);
    if (enabled) { pending = false; play(0); }
    else { stop(); pending = false; }
    sync();
  }

  function buildButton() {
    var css = document.createElement('style');
    css.textContent =
      '.bgm-btn{position:fixed;z-index:2147483000;width:46px;height:46px;' +
      'border-radius:16px;display:grid;place-items:center;cursor:pointer;' +
      'border:1px solid rgba(255,255,255,.18);background:rgba(14,20,46,.62);' +
      'backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);' +
      'box-shadow:0 10px 30px rgba(2,5,28,.34);color:#cfeaff;font-size:19px;' +
      'line-height:1;padding:0;font-family:inherit;transition:.18s;' +
      '-webkit-tap-highlight-color:transparent}' +
      '.bgm-btn:hover{border-color:rgba(156,236,255,.55);color:#fff;' +
      'background:rgba(24,34,72,.76)}' +
      '.bgm-btn.bgm-off{color:rgba(230,238,255,.38)}' +
      '.bgm-btn.bgm-off .bgm-slash{opacity:1}' +
      '.bgm-slash{position:absolute;width:26px;height:2px;border-radius:2px;' +
      'background:currentColor;transform:rotate(-45deg);opacity:0;' +
      'transition:opacity .18s}' +
      '.bgm-btn.bgm-pending{animation:bgmPulse 1.7s ease-in-out infinite}' +
      '@keyframes bgmPulse{0%,100%{opacity:.55}50%{opacity:1}}' +
      '.bgm-bl{left:16px;bottom:16px}.bgm-br{right:16px;bottom:16px}' +
      '.bgm-tl{left:16px;top:16px}.bgm-tr{right:16px;top:16px}' +
      '.bgm-ml{left:16px;top:50%;transform:translateY(-50%)}' +
      '.bgm-mr{right:16px;top:50%;transform:translateY(-50%)}' +
      '@media(max-width:520px){.bgm-btn{width:42px;height:42px;font-size:17px}' +
      '.bgm-bl,.bgm-br{bottom:12px}.bgm-bl,.bgm-tl,.bgm-ml{left:12px}' +
      '.bgm-br,.bgm-tr,.bgm-mr{right:12px}}';
    document.head.appendChild(css);

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bgm-btn bgm-br';
    btn.setAttribute('aria-label', '背景音樂開關');
    icon = document.createElement('span');
    icon.textContent = '♪';
    var slash = document.createElement('span');
    slash.className = 'bgm-slash';
    btn.appendChild(icon);
    btn.appendChild(slash);
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); toggle();
    });
    document.body.appendChild(btn);

    placeButton();
    // 3D 場景與 HUD 可能要十幾秒才完全就緒，分幾個時間點重新確認
    [400, 1200, 3000, 6000, 12000].forEach(function (ms) {
      setTimeout(placeButton, ms);
    });
    var reflow = throttle(placeButton, 400);
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, { passive: true });
  }

  /* ---------- 啟動 ---------- */

  // 音訊不需要等 DOM，越早開始載入，換頁的空檔越短。
  var self = document.currentScript ||
    document.querySelector('script[src*="bgm.js"]');
  var want = self && self.getAttribute('data-pos');
  if (want && CORNERS.indexOf(want) >= 0) forcedPos = want;

  var startAt = buildQueue();
  if (enabled) play(startAt);

  function boot() {
    buildButton();
    sync();
    window.addEventListener('pagehide', savePosition);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) savePosition();
    });

    // 診斷用：在 console 執行 __emotionBGM() 可看目前狀態
    window.__emotionBGM = function () {
      return {
        enabled: enabled,
        pending: pending,
        track: queue[cursor] || null,
        time: audio ? Math.round((audio.currentTime || 0) * 10) / 10 : null,
        playing: audio ? !audio.paused : false,
        volume: audio ? Math.round(audio.volume * 100) / 100 : null,
        corner: btn ? (btn.className.match(/bgm-(bl|br|tl|tr)/) || [])[1] : null,
        queue: queue.slice()
      };
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
