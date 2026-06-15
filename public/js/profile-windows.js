(function () {
  'use strict';

  var layer = document.querySelector('[data-mac-layer]');
  if (!layer) return;

  var zTop = 10;          // running z-index counter
  var openCount = 0;      // for cascade offset

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
      // cascade new windows so they don't fully overlap
      var offset = (openCount % 6) * 28;
      win.style.top = 'calc(12% + ' + offset + 'px)';
      win.style.left = 'calc(12% + ' + offset + 'px)';
      win.dataset.placed = '1';
      openCount += 1;
    }
    bringToFront(win);
  }

  function closeWindow(id) {
    var win = document.getElementById(id);
    if (win) win.hidden = true;
  }

  // --- open (menu buttons) ---
  document.querySelectorAll('[data-mac-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openWindow(btn.getAttribute('data-mac-open'));
    });
  });

  // --- close (red light) + focus (click anywhere on window) ---
  layer.addEventListener('pointerdown', function (e) {
    var closer = e.target.closest('[data-mac-close]');
    if (closer) {
      e.stopPropagation();
      closeWindow(closer.getAttribute('data-mac-close'));
      return;
    }
    var win = e.target.closest('.mac-window');
    if (win) bringToFront(win);
  });

  // --- drag (title bar) ---
  var drag = null;
  layer.addEventListener('pointerdown', function (e) {
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
})();
