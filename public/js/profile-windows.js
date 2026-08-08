(function () {
  'use strict';

  // iOS Safari only applies :active styles while a touchstart listener exists,
  // so button/link press effects don't show on iPhone without this (Android is fine).
  // Also mark the document as touch-used so sticky :hover (which lingers after a tap
  // on touch, esp. S-Pen devices misreporting hover) can be disabled via html.has-touch.
  document.addEventListener('touchstart', function () {
    document.documentElement.classList.add('has-touch');
  }, { passive: true });

  var layer = document.querySelector('[data-mac-layer]');
  if (!layer) return;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 데스크톱에서만 scale+페이드 열기/닫기. 모바일은 풀스크린 시트(CSS macSheetUp)를,
  // reduced-motion은 즉시 표시/숨김을 쓴다.
  function canAnimateWindow() {
    return !reduceMotion && !isMobile();
  }

  // Pull a window fully into the viewport so wide default positions aren't clipped
  // on narrower screens. Desktop only (mobile windows are full-screen sheets).
  function clampIntoView(win) {
    if (isMobile()) return;
    var rect = win.getBoundingClientRect();
    if (!rect.width) return; // hidden / not laid out
    var margin = 8;
    var maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
    var maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
    var left = Math.min(Math.max(rect.left, margin), maxLeft);
    var top = Math.min(Math.max(rect.top, margin), maxTop);
    if (Math.round(left) !== Math.round(rect.left)) win.style.left = left + 'px';
    if (Math.round(top) !== Math.round(rect.top)) win.style.top = top + 'px';
  }
  function clampVisibleWindows() {
    document.querySelectorAll('.mac-window:not([hidden])').forEach(clampIntoView);
  }

  var desktop = document.querySelector('[data-desktop]');
  var artToggle = document.querySelector('[data-profile-art-toggle]');

  var zTop = 10;          // running z-index counter
  var openCount = 0;      // for cascade offset

  document.querySelectorAll('.mac-window').forEach(function (win) {
    var z = parseInt(window.getComputedStyle(win).zIndex, 10);
    if (!isNaN(z)) zTop = Math.max(zTop, z);
  });

  // On mobile, image windows never auto-open — a full-screen sheet would cover the
  // home screen on load. Only the small pinned Blog window stays open by default.
  if (isMobile()) {
    document.querySelectorAll('.mac-window--image').forEach(function (w) { w.hidden = true; });
  }

  // 로드 시점에 열려 있는(기본 고정) 창 id 기록. 배경 클릭으로는 닫지 않고,
  // 각자의 닫기 버튼(빨간 신호등)으로만 닫는다.
  var pinnedIds = [];
  document.querySelectorAll('.mac-window:not([hidden])').forEach(function (w) {
    if (w.id) pinnedIds.push(w.id);
  });

  // Keep default-open windows on-screen now and whenever the viewport changes.
  clampVisibleWindows();
  window.addEventListener('resize', clampVisibleWindows);

  function bringToFront(win) {
    zTop += 1;
    win.style.zIndex = String(zTop);
    // 포커스 위계(PR2): 앞으로 온 창만 focused, 나머지는 해제 → 그림자로 위계 표시.
    document.querySelectorAll('.mac-window--focused').forEach(function (w) {
      if (w !== win) w.classList.remove('mac-window--focused');
    });
    win.classList.add('mac-window--focused');
    saveState();
  }

  // 초기: 화면에 떠 있는 창 중 z가 가장 높은 것을 포커스로.
  (function focusInitial() {
    var top = null, topZ = -1;
    document.querySelectorAll('.mac-window:not([hidden])').forEach(function (w) {
      var z = parseInt(window.getComputedStyle(w).zIndex, 10) || 0;
      if (z >= topZ) { topZ = z; top = w; }
    });
    if (top) top.classList.add('mac-window--focused');
  })();

  // ── 창 상태 저장/복원 (뒤로가기 시 열어둔 창을 유지) ──────────────────
  // 프로젝트를 눌러 다른 페이지로 갔다가 뒤로 오면 열어둔 창이 초기화되던 문제를
  // 해결한다. bfcache에 의존하지 않고 sessionStorage에 상태를 저장, "뒤로/앞으로"
  // 내비게이션일 때만 복원한다(직접 로드/새로고침은 기본 상태 유지). 데스크톱 전용.
  var STATE_KEY = 'profileDesktopState_v1';

  function saveState() {
    if (!desktop) return;
    try {
      var st = { dark: desktop.classList.contains('desktop--dark'), win: {} };
      document.querySelectorAll('.mac-window').forEach(function (w) {
        if (!w.id) return;
        st.win[w.id] = {
          o: !w.hidden,
          l: w.style.left || '', t: w.style.top || '',
          w: w.style.width || '', h: w.style.height || '',
          z: w.style.zIndex || ''
        };
      });
      sessionStorage.setItem(STATE_KEY, JSON.stringify(st));
    } catch (e) {}
  }

  function isBackForward() {
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav) return nav.type === 'back_forward';
      return !!(performance.navigation && performance.navigation.type === 2);
    } catch (e) { return false; }
  }

  function applyDark(on) {
    desktop.classList.toggle('desktop--dark', on);
    if (artToggle) {
      artToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      var img = artToggle.querySelector('img');
      if (img) {
        img.src = on ? artToggle.dataset.darkSrc : artToggle.dataset.lightSrc;
        img.alt = on ? 'TTORI' : 'YEIN';
      }
    }
  }

  // 모바일: 창을 히스토리와 연동(뒤로가기=창 닫기)하기 위한 열린 창 스택.
  var mobileWinStack = [];

  (function restoreState() {
    if (!isBackForward()) return;
    var raw;
    try { raw = sessionStorage.getItem(STATE_KEY); } catch (e) { return; }
    if (!raw) return;
    var st;
    try { st = JSON.parse(raw); } catch (e) { return; }
    if (!st || !st.win) return;
    if (st.dark) applyDark(true);
    var topZ = zTop, topWin = null;
    Object.keys(st.win).forEach(function (id) {
      var w = document.getElementById(id);
      if (!w) return;
      var s = st.win[id];
      if (s.l) w.style.left = s.l;
      if (s.t) w.style.top = s.t;
      if (s.w) w.style.width = s.w;
      if (s.h) w.style.height = s.h;
      if (s.z) w.style.zIndex = s.z;
      if (s.o) {
        w.hidden = false;
        w.dataset.placed = '1';
        var z = parseInt(s.z, 10) || 0;
        if (z >= topZ) { topZ = z; topWin = w; }
      } else {
        w.hidden = true;   // 저장상태가 닫힘이면 닫는다(기본 열림 창도 포함)
      }
    });
    zTop = Math.max(zTop, topZ);
    if (topWin) {
      document.querySelectorAll('.mac-window--focused').forEach(function (x) {
        x.classList.remove('mac-window--focused');
      });
      topWin.classList.add('mac-window--focused');
    }
    clampVisibleWindows();
    // 모바일: 복원된 열린 창(win-blog 제외)을 z 오름차순으로 스택 재구성
    // (뒤로가기 히스토리 항목 순서와 맞춘다).
    if (isMobile()) {
      Array.prototype.slice.call(document.querySelectorAll('.mac-window:not([hidden])'))
        .filter(function (w) { return w.id && w.id !== 'win-blog'; })
        .sort(function (a, b) {
          return (parseInt(a.style.zIndex, 10) || 0) - (parseInt(b.style.zIndex, 10) || 0);
        })
        .forEach(function (w) { mobileWinStack.push(w.id); });
    }
  })();

  // ── 모바일: 창 열기=히스토리 push, 뒤로가기=맨 위 창 닫기 ──────────────
  // 창을 열면 히스토리 항목을 하나 쌓는다. 그러면 뒤로가기가 "이전 페이지로 이동"이
  // 아니라 "그 창 닫기"가 된다(2.2). 닫기 버튼도 history.back()으로 같은 경로를 탄다.
  function pushMobileWinHistory(id) {
    mobileWinStack.push(id);
    try { history.pushState({ macWin: id }, ''); } catch (e) {}
  }
  function closeTopMobileWindow() {
    while (mobileWinStack.length) {
      var id = mobileWinStack.pop();
      var w = document.getElementById(id);
      if (w && !w.hidden) { closeWindow(id); return; }
    }
  }
  window.addEventListener('popstate', function () {
    if (isMobile()) closeTopMobileWindow();
  });

  // 이미지 창(win-img-*)은 중앙 축소(collapsed), 나머지 메뉴 창은 버튼에서
  // 자라나는(grow) 효과를 쓴다.
  var GROW_SCALE = 0.5; // .mac-window--grow의 scale과 반드시 일치
  function collapseClassFor(win) {
    return win.id.indexOf('win-img-') === 0 ? 'mac-window--collapsed' : 'mac-window--grow';
  }
  // 그로우 창을 클릭한 버튼에서 자라나 보이게 transform-origin을 버튼 중심으로.
  // 창은 지금 center-origin으로 GROW_SCALE 축소된 상태(opacity 0)라, 그 rect에서
  // 원래(미축소) 박스를 복원해 버튼 중심의 상대 좌표를 구한다. origin 변경 때
  // 위치가 튀지만 opacity 0이라 안 보인다.
  function setGrowOrigin(win, btn) {
    if (!btn) return;
    var r = win.getBoundingClientRect();
    if (!r.width) return;
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var uw = r.width / GROW_SCALE;
    var uh = r.height / GROW_SCALE;
    var uLeft = cx - uw / 2;
    var uTop = cy - uh / 2;
    var b = btn.getBoundingClientRect();
    var ox = (b.left + b.width / 2) - uLeft;
    var oy = (b.top + b.height / 2) - uTop;
    win.style.transformOrigin = ox.toFixed(1) + 'px ' + oy.toFixed(1) + 'px';
  }

  function openWindow(id, btn) {
    var win = document.getElementById(id);
    if (!win) return;
    var wasHidden = win.hidden;
    // 닫히는 중이었다면 취소하고 다시 연다.
    win.classList.remove('mac-window--collapsed', 'mac-window--grow');
    var cls = collapseClassFor(win);
    var animate = wasHidden && canAnimateWindow();
    // 축소 상태에서 시작 → 표시 → 리플로우 → 해제하면 scale/opacity가 도착하며 재생.
    if (animate) win.classList.add(cls);
    win.hidden = false;
    if (wasHidden && !win.dataset.placed) {
      if (!isMobile()) {
        if (win.dataset.defaultTop || win.dataset.defaultLeft) {
          if (win.dataset.defaultTop) win.style.top = win.dataset.defaultTop;
          if (win.dataset.defaultLeft) win.style.left = win.dataset.defaultLeft;
        } else {
          // cascade new windows so they don't fully overlap
          var offset = (openCount % 6) * 28;
          win.style.top = 'calc(5% + ' + offset + 'px)';
          win.style.left = 'calc(12% + ' + offset + 'px)';
          openCount += 1;
        }
      }
      win.dataset.placed = '1';
    }
    bringToFront(win);
    clampIntoView(win);
    if (animate) {
      // 그로우 창은 버튼 위치로 origin을 잡는다(위치 조정은 opacity 0라 안 보임).
      if (cls === 'mac-window--grow') setGrowOrigin(win, btn);
      void win.offsetWidth;                       // 리플로우로 시작 상태를 확정
      win.classList.remove(cls);                  // → scale 1 / opacity 1로 전환
    }
    // 모바일: 풀스크린 창(win-blog 제외)을 열면 히스토리 항목을 쌓아 뒤로가기로 닫히게.
    if (wasHidden && isMobile() && id !== 'win-blog') {
      pushMobileWinHistory(id);
    }
  }

  function closeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    if (!canAnimateWindow()) {
      win.hidden = true;
      saveState();
      return;
    }
    // 축소·페이드로 닫힌 뒤 실제로 숨긴다. 그로우 창은 저장된 transform-origin을
    // 그대로 써 열렸던 버튼 쪽으로 되빨려든다. transitionend(폴백 타이머) 후 hidden.
    var cls = collapseClassFor(win);
    win.classList.add(cls);
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      win.hidden = true;
      win.classList.remove('mac-window--collapsed', 'mac-window--grow');
      win.removeEventListener('transitionend', onEnd);
      saveState();
    }
    function onEnd(e) {
      if (e.target === win && (e.propertyName === 'transform' || e.propertyName === 'opacity')) {
        finish();
      }
    }
    win.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, 400);
  }

  // 창이 "열려 있음"(표시 중 + 닫히는 중 아님) 판정.
  function isWindowOpen(win) {
    return !!win && !win.hidden &&
      !win.classList.contains('mac-window--collapsed') &&
      !win.classList.contains('mac-window--grow');
  }
  // 같은 버튼을 다시 누르면 토글: 열려 있으면 닫고, 아니면 연다.
  function toggleWindow(id, btn) {
    var win = document.getElementById(id);
    if (!win) return;
    if (isWindowOpen(win)) {
      closeWindow(id);
    } else {
      openWindow(id, btn);
    }
  }

  if (desktop && artToggle) {
    artToggle.addEventListener('click', function () {
      var willBeDark = !desktop.classList.contains('desktop--dark');
      artToggle.setAttribute('aria-pressed', willBeDark ? 'true' : 'false');
      var img = artToggle.querySelector('img');
      var src = willBeDark ? artToggle.dataset.darkSrc : artToggle.dataset.lightSrc;
      var alt = willBeDark ? 'TTORI' : 'YEIN';
      if (!img || reduceMotion) {
        desktop.classList.toggle('desktop--dark', willBeDark);
        if (img) { img.src = src; img.alt = alt; }
        saveState();
        return;
      }
      // 아트는 모드별 크기·위치(다크는 translateX(13%) + 다른 width)가 달라, 즉시
      // 토글하면 페이드 중에 옆으로 툭 튄다. 그래서 페이드아웃으로 완전히 감춘 뒤에야
      // 다크 토글 + src 교체(=크기/위치 변화)를 하고 다시 페이드인한다.
      var pre = new Image();
      pre.src = src;                                   // 미리 로드해 플래시 방지
      img.style.transition = 'opacity 240ms var(--mac-ease)';
      var applied = false;
      function apply() {
        if (applied) return;
        applied = true;
        img.removeEventListener('transitionend', onEnd);
        desktop.classList.toggle('desktop--dark', willBeDark); // 배경+아트 크기 변화(안 보임)
        img.src = src;
        img.alt = alt;
        saveState();
        window.requestAnimationFrame(function () { img.style.opacity = '1'; }); // 페이드인
      }
      function onEnd(e) { if (e.propertyName === 'opacity') apply(); }
      img.addEventListener('transitionend', onEnd);
      window.requestAnimationFrame(function () { img.style.opacity = '0'; });   // 페이드아웃 시작
      window.setTimeout(apply, 360);
    });
  }

  // --- open (menu buttons) ---
  document.querySelectorAll('[data-mac-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleWindow(btn.getAttribute('data-mac-open'), btn);
    });
  });

  // --- focus (press anywhere on a window) ---
  layer.addEventListener('pointerdown', function (e) {
    // don't focus/drag when pressing the close button
    if (e.target.closest('[data-mac-close]')) {
      e.stopPropagation();
      return;
    }
    var win = e.target.closest('.mac-window');
    if (win) bringToFront(win);
  });

  // --- close (red light) ---
  // Handle on `click`, not `pointerdown`: hiding the window on pointerdown lets
  // the subsequent click fall through to whatever is underneath (on a mobile
  // full-screen sheet that's the dark-mode toggle), which wrongly flips dark mode.
  layer.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-mac-close]');
    if (closer) {
      e.stopPropagation();
      var cid = closer.getAttribute('data-mac-close');
      // 모바일에서 히스토리로 관리되는 창이면 back()으로 닫아 히스토리를 동기화.
      if (isMobile() && mobileWinStack.indexOf(cid) !== -1) {
        history.back();   // → popstate → closeTopMobileWindow
      } else {
        closeWindow(cid);
      }
    }
  });

  // --- drag (title bar) ---
  var drag = null;
  layer.addEventListener('pointerdown', function (e) {
    if (isMobile()) return;
    var handle = e.target.closest('[data-mac-drag-handle]');
    if (!handle || e.target.closest('[data-mac-close]')) return;
    var win = handle.closest('.mac-window');
    if (!win) return;
    var rect = win.getBoundingClientRect();
    drag = { win: win, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    win.style.top = rect.top + 'px';
    win.style.left = rect.left + 'px';
    win.classList.add('mac-window--dragging');   // PR2: 드래그 중 lift(깊은 그림자)
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  layer.addEventListener('pointermove', function (e) {
    if (!drag) return;
    drag.win.style.left = (e.clientX - drag.dx) + 'px';
    drag.win.style.top = (e.clientY - drag.dy) + 'px';
  });
  function endDrag() {
    if (drag) { drag.win.classList.remove('mac-window--dragging'); saveState(); }   // PR2: 놓으면 lift 해제 + 위치 저장
    drag = null;
  }
  layer.addEventListener('pointerup', endDrag);
  layer.addEventListener('pointercancel', endDrag);

  // --- resize (edge + corner handles) ---
  var DIRS = {
    n:  { n: 1 }, s:  { s: 1 }, e:  { e: 1 }, w:  { w: 1 },
    ne: { n: 1, e: 1 }, nw: { n: 1, w: 1 }, se: { s: 1, e: 1 }, sw: { s: 1, w: 1 }
  };
  var MIN_W = 240, MIN_H = 140;

  function addResizeHandles(win) {
    Object.keys(DIRS).forEach(function (dir) {
      var h = document.createElement('span');
      h.className = 'mac-window__resize mac-window__resize--' + dir;
      h.setAttribute('data-mac-resize', dir);
      win.appendChild(h);
    });
  }
  document.querySelectorAll('.mac-window').forEach(addResizeHandles);

  var rez = null;
  layer.addEventListener('pointerdown', function (e) {
    if (isMobile()) return;
    var handle = e.target.closest('[data-mac-resize]');
    if (!handle) return;
    var win = handle.closest('.mac-window');
    if (!win) return;
    var rect = win.getBoundingClientRect();
    rez = {
      win: win,
      dir: DIRS[handle.getAttribute('data-mac-resize')],
      x0: e.clientX, y0: e.clientY,
      left: rect.left, top: rect.top, w: rect.width, h: rect.height
    };
    // freeze to absolute px so resizing is predictable (overrides %/min()/max-height)
    win.style.left = rect.left + 'px';
    win.style.top = rect.top + 'px';
    win.style.width = rect.width + 'px';
    win.style.height = rect.height + 'px';
    win.style.maxHeight = 'none';
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  layer.addEventListener('pointermove', function (e) {
    if (!rez) return;
    var dx = e.clientX - rez.x0;
    var dy = e.clientY - rez.y0;
    var d = rez.dir;
    if (d.e) {
      rez.win.style.width = Math.max(MIN_W, rez.w + dx) + 'px';
    }
    if (d.w) {
      var newW = Math.max(MIN_W, rez.w - dx);
      rez.win.style.width = newW + 'px';
      rez.win.style.left = (rez.left + (rez.w - newW)) + 'px';
    }
    if (d.s) {
      rez.win.style.height = Math.max(MIN_H, rez.h + dy) + 'px';
    }
    if (d.n) {
      var newH = Math.max(MIN_H, rez.h - dy);
      rez.win.style.height = newH + 'px';
      rez.win.style.top = (rez.top + (rez.h - newH)) + 'px';
    }
  });
  function endResize() { if (rez) saveState(); rez = null; }
  layer.addEventListener('pointerup', endResize);
  layer.addEventListener('pointercancel', endResize);

  // 빈 배경(창·메뉴/파일 버튼·아트 토글이 아닌 곳)을 클릭하면 열린 창을 모두 닫는다.
  // 창 레이어는 pointer-events:none이라 빈 곳 클릭은 desktop으로 떨어진다.
  function closeAllWindows() {
    document.querySelectorAll('.mac-window').forEach(function (win) {
      if (pinnedIds.indexOf(win.id) !== -1) return;   // 기본 고정 창은 제외
      if (isWindowOpen(win)) closeWindow(win.id);
    });
  }
  if (desktop) {
    desktop.addEventListener('click', function (e) {
      if (e.target.closest('.mac-window, [data-mac-open], [data-profile-art-toggle]')) {
        return;
      }
      closeAllWindows();
    });
  }

  // 터치(hover 없는) 기기: 프로필 프로젝트 행을 탭하면 설명(preview) 펼침/접힘.
  // title/thumb 링크 탭은 그대로 해당 프로젝트로 이동. hover 기기(마우스)는 CSS
  // hover가 처리하므로 여기선 제외 → sticky hover 의존을 없앤 안정적 탭 토글.
  (function initProjectPreviewToggle() {
    var rows = document.querySelectorAll(
      '.mac-projects--profile-project .archive-sheet__row.mac-projects__row--has-summary'
    );
    if (!rows.length) return;

    // 직전 포인터 종류를 추적(마우스/펜/터치 구분). matchMedia는 S펜 기기에서
    // 오탐하므로 실제 이벤트로 판단한다.
    var lastPointerType = 'mouse';
    document.addEventListener('pointerdown', function (e) {
      lastPointerType = e.pointerType || 'mouse';
    }, true);

    Array.prototype.forEach.call(rows, function (row) {
      // 마우스/펜 hover: 들어오면 펼치고 나가면 접는다. pointerleave가 항상 발생하므로
      // sticky hover가 생기지 않는다(오탐 기기여도).
      row.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        row.classList.add('mac-projects__row--hover');   // 데스크톱/펜: 회색+설명
      });
      row.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch') return;
        row.classList.remove('mac-projects__row--hover');
      });
      // 터치 탭: 토글(다시 탭하면 접힘). 링크 탭은 이동. 마우스/펜은 hover가 처리.
      row.addEventListener('click', function (e) {
        if (lastPointerType !== 'touch') return;
        if (e.target.closest('a')) return;
        row.classList.toggle('mac-projects__row--open');
      });
    });
  })();
})();
