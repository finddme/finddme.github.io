(function () {
  'use strict';

  var layer = document.querySelector('[data-mac-layer]');
  if (!layer) return;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
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
  }

  function openWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    var firstOpen = win.hidden;
    win.hidden = false;
    if (firstOpen && !win.dataset.placed) {
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
  }

  function closeWindow(id) {
    var win = document.getElementById(id);
    if (win) win.hidden = true;
  }

  if (desktop && artToggle) {
    artToggle.addEventListener('click', function () {
      var isDark = desktop.classList.toggle('desktop--dark');
      var img = artToggle.querySelector('img');
      artToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      if (img) {
        img.src = isDark ? artToggle.dataset.darkSrc : artToggle.dataset.lightSrc;
        img.alt = isDark ? 'TTORI' : 'YEIN';
      }
    });
  }

  // --- open (menu buttons) ---
  document.querySelectorAll('[data-mac-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openWindow(btn.getAttribute('data-mac-open'));
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
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  layer.addEventListener('pointermove', function (e) {
    if (!drag) return;
    drag.win.style.left = (e.clientX - drag.dx) + 'px';
    drag.win.style.top = (e.clientY - drag.dy) + 'px';
  });
  function endDrag() { drag = null; }
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
})();
