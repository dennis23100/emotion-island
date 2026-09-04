/* 情緒不孤島 — 連線狀態守門員
 *
 * Firebase 免費方案（Spark）上限是 100 個同時連線，且無法調高；
 * 超過之後「新的連線嘗試」會被伺服器拒絕，已連上的人不受影響，
 * 只要有人離開釋放名額，等待中的連線就會自動接上。
 *
 * 依頁面型態顯示不同提示：
 *
 *   唯讀／群島參觀（走 REST，不佔連線）
 *     - 一進入就說明目前是唯讀模式、重新整理可看到最新進度，12 秒後自動收起
 *
 *   即時連線頁（大世界、可編輯小世界、快速填分）
 *     - 連不上資料庫超過 15 秒 -> 明確告知，而不是讓使用者看到空島
 *     - 統計佔用連線的裝置數，達 WARN_AT 時提前警告
 */
(function () {
  'use strict';

  var WARN_AT = 90;          // 幾個裝置開始警告
  var LIMIT = 100;           // 免費方案硬上限
  var OFFLINE_AFTER = 15000; // 連不上多久才提示（毫秒）
  var SDK_WAIT = 25000;      // 等頁面初始化 Firebase 的上限
  var PRESENCE_REFRESH = 240000; // 每 4 分鐘更新一次自己的時間戳
  var PRESENCE_TTL = 600000;     // 超過 10 分鐘沒更新就視為過期

  var room = (function () {
    var raw = new URLSearchParams(location.search).get('room') || '';
    var m = raw.match(/^(\d{4})(0[1-8])$/);   // 六碼組別房號 -> 取活動房號
    return m ? m[1] : raw;
  })();
  if (!room) return;

  var banner, bannerText, dismissed = false;
  var offlineSince = 0, offlineShown = false, crowdShown = false;

  function ui() {
    if (banner) return;
    var css = document.createElement('style');
    css.textContent =
      '.ng-bar{position:fixed;left:50%;top:14px;transform:translateX(-50%);' +
      'z-index:2147482000;max-width:min(520px,calc(100vw - 28px));' +
      'padding:11px 14px;border-radius:16px;font-size:12.5px;line-height:1.65;' +
      'font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;' +
      'font-weight:700;color:#fff;background:rgba(120,60,30,.88);' +
      'border:1px solid rgba(255,196,120,.5);box-shadow:0 12px 34px rgba(0,0,0,.4);' +
      'backdrop-filter:blur(10px);display:flex;gap:10px;align-items:flex-start}' +
      '.ng-bar.warn{background:rgba(96,74,20,.90);border-color:rgba(255,229,156,.55)}' +
      '.ng-bar.info{background:rgba(20,38,78,.90);border-color:rgba(156,236,255,.45)}' +
      '.ng-bar b{color:#ffe59c}.ng-bar.info b{color:#9cecff}' +
      '.ng-x{margin-left:auto;flex:none;cursor:pointer;border:0;background:transparent;' +
      'color:rgba(255,255,255,.75);font-size:15px;line-height:1;padding:2px 4px}' +
      '.ng-x:hover{color:#fff}' +
      '@media(max-width:520px){.ng-bar{font-size:11px;top:10px;padding:9px 11px}}';
    document.head.appendChild(css);

    banner = document.createElement('div');
    banner.className = 'ng-bar';
    banner.style.display = 'none';
    bannerText = document.createElement('div');
    var x = document.createElement('button');
    x.className = 'ng-x';
    x.type = 'button';
    x.textContent = '✕';
    x.setAttribute('aria-label', '關閉提示');
    x.onclick = function () { dismissed = true; banner.style.display = 'none'; };
    banner.appendChild(bannerText);
    banner.appendChild(x);
    document.body.appendChild(banner);
  }

  function show(html, kind) {
    if (dismissed) return;
    ui();
    bannerText.innerHTML = html;
    banner.classList.toggle('warn', kind === 'warn');
    banner.classList.toggle('info', kind === 'info');
    banner.style.display = 'flex';
  }
  function hide() {
    if (banner) banner.style.display = 'none';
  }

  /* 唯讀／群島參觀：頁面會先確認連線是否還有名額。
       有名額 -> 升級成即時同步，跟一般頁面一樣不用提示
       已額滿 -> 留在 REST 輪詢，這時才說明並提醒重新整理 */
  var q = new URLSearchParams(location.search);
  var readOnly = q.get('view') === '1' || q.get('mode') === 'gallery';
  if (readOnly) {
    var t0 = Date.now();
    var decide = setInterval(function () {
      if (window.__emotionLiveMode === true) {
        clearInterval(decide);
        waitForSdk();                    // 已升級成即時，照常監看連線與人數
      } else if (window.__emotionLiveMode === false) {
        clearInterval(decide);
        show('<div>由於人數過多，所以現在是唯讀模式。' +
             '如果組內有最新的進度，可以重新整理網頁，就可以看到最新的進度喔～</div>', 'info');
        setTimeout(function () { if (!dismissed) hide(); }, 14000);
      } else if (Date.now() - t0 > SDK_WAIT) {
        clearInterval(decide);
      }
    }, 300);
    return;
  }

  waitForSdk();

  /* 等頁面自己初始化 Firebase */
  function waitForSdk() {
    var waited = 0;
    var poll = setInterval(function () {
      waited += 400;
      var ready = window.firebase && firebase.apps && firebase.apps.length > 0;
      if (ready) { clearInterval(poll); start(); }
      else if (waited >= SDK_WAIT) { clearInterval(poll); }
    }, 400);
  }

  function start() {
    var db;
    try { db = firebase.database(); } catch (e) { return; }

    /* --- 1. 連線狀態 --- */
    var connRef = db.ref('.info/connected');
    connRef.on('value', function (snap) {
      if (snap.val() === true) {
        offlineSince = 0;
        if (offlineShown) { offlineShown = false; hide(); }
      } else if (!offlineSince) {
        offlineSince = Date.now();
      }
    });
    setInterval(function () {
      if (offlineSince && !offlineShown && Date.now() - offlineSince > OFFLINE_AFTER) {
        offlineShown = true;
        show('<div><b>目前連不上資料庫。</b>可能是網路不穩，或同時上線的裝置已達 ' +
             LIMIT + ' 台上限。分數與佈置暫時不會更新；等其他人關閉頁面後會自動恢復，不需要重新整理。</div>');
      }
    }, 3000);

    /* --- 2. 佔用連線的裝置數 --- */
    // 每台裝置在 presence 底下登記一筆，斷線時由伺服器自動移除。
    // 走 REST 的唯讀裝置不會登記，因為它們本來就不佔連線。
    var id = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    var meRef = db.ref('rooms/' + room + '/presence/' + id);
    function stamp() {
      try { meRef.set({ t: firebase.database.ServerValue.TIMESTAMP }); } catch (e) {}
    }
    try { meRef.onDisconnect().remove(); } catch (e) {}
    stamp();
    // 分頁被強制關閉時 onDisconnect 偶爾來不及生效，
    // 因此定期更新時間戳，讓過期的紀錄可以被忽略與清除。
    setInterval(stamp, PRESENCE_REFRESH);
    window.addEventListener('pagehide', function () { try { meRef.remove(); } catch (e) {} });

    db.ref('rooms/' + room + '/presence').on('value', function (snap) {
      var v = snap.val() || {};
      var now = Date.now(), n = 0;
      Object.keys(v).forEach(function (k) {
        var t = v[k] && v[k].t;
        if (typeof t !== 'number' || now - t > PRESENCE_TTL) {
          if (k !== id) { try { db.ref('rooms/' + room + '/presence/' + k).remove(); } catch (e) {} }
          return;                                   // 過期紀錄不計入，並順手清掉
        }
        n++;
      });
      window.__emotionConnections = n;
      if (offlineShown) return;              // 連線問題的提示優先
      if (n >= WARN_AT && !crowdShown) {
        crowdShown = true;
        show('<div><b>目前有 ' + n + ' 台裝置連線中</b>（免費方案上限 ' + LIMIT +
             ' 台）。再增加可能會有人連不上。建議每組只用一台裝置編輯，其他人改看投影或群島參觀（唯讀不佔名額）。</div>', 'warn');
      } else if (n < WARN_AT - 5 && crowdShown) {
        crowdShown = false;
        hide();
      }
    });

    // 診斷用：console 執行 __emotionNet() 看目前狀態
    window.__emotionNet = function () {
      return { room: room, connections: window.__emotionConnections,
               warnAt: WARN_AT, limit: LIMIT, offline: !!offlineSince };
    };
  }
})();
