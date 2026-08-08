(function () {
  'use strict';

  // iOS Safari only applies :active styles while a touchstart listener exists,
  // so button/link press effects don't show on iPhone without this (Android is fine).
  document.addEventListener('touchstart', function () {}, { passive: true });

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
  }

  function closeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    if (!canAnimateWindow()) {
      win.hidden = true;
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
      closeWindow(closer.getAttribute('data-mac-close'));
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
    if (drag) drag.win.classList.remove('mac-window--dragging');   // PR2: 놓으면 lift 해제
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
  function endResize() { rez = null; }
  layer.addEventListener('pointerup', endResize);
  layer.addEventListener('pointercancel', endResize);

  // 터치(hover 없는) 기기: 프로필 프로젝트 행을 탭하면 설명(preview) 펼침/접힘.
  // title/thumb 링크 탭은 그대로 해당 프로젝트로 이동. hover 기기(마우스)는 CSS
  // hover가 처리하므로 여기선 제외 → sticky hover 의존을 없앤 안정적 탭 토글.
  (function initProjectPreviewToggle() {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var rows = document.querySelectorAll(
      '.mac-projects--profile-project .archive-sheet__row.mac-projects__row--has-summary'
    );
    Array.prototype.forEach.call(rows, function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;   // 링크는 이동
        row.classList.toggle('mac-projects__row--open');
      });
    });
  })();
})();
