(function () {
  var tabs = document.querySelectorAll('.archive-sheet__tabs a');

  // iOS Safari는 touch 리스너가 없는 요소엔 :active를 적용하지 않는다. 빈 touchstart를
  // 달아 탭 시 우리 press 하이라이트(:active)가 실제로 나오게 한다(홈 패턴과 동일).
  var pressTargets = document.querySelectorAll('.archive-sheet__row, .archive-sheet__tabs a');
  Array.prototype.forEach.call(pressTargets, function (el) {
    el.addEventListener('touchstart', function () {}, { passive: true });
  });

  function markLastTabRow() {
    if (!tabs.length) return;

    var lastTop = 0;
    tabs.forEach(function (tab) {
      tab.classList.remove('archive-sheet__tab--last-row');
      if (tab.offsetTop > lastTop) lastTop = tab.offsetTop;
    });

    tabs.forEach(function (tab) {
      if (Math.abs(tab.offsetTop - lastTop) < 2) {
        tab.classList.add('archive-sheet__tab--last-row');
      }
    });
  }

  markLastTabRow();
  window.addEventListener('resize', markLastTabRow);

  // 탭 터치 press를 spring으로 구동(A2): 누르면 축소, 떼면 velocity를 이어받아
  // 살짝 overshoot 후 정착. 터치일 때만 개입하고 마우스는 A1의 CSS를 그대로 쓴다.
  // 행은 탭 시 즉시 포스트로 이동해 release 스프링이 안 보이고 넓은 셀이라 scale이
  // 어색하므로, 행은 A1의 iOS 셀 하이라이트만 쓰고 여기선 다루지 않는다.
  (function initTabPressSpring() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !window.LabSpring || !('PointerEvent' in window) || !tabs.length) {
      return;
    }
    var PRESS_RESPONSE = 0.32;
    var PRESS_DAMPING = 0.55;
    var PRESS_SCALE = 0.94;

    Array.prototype.forEach.call(tabs, function (el) {
      var spring = new window.LabSpring({
        response: PRESS_RESPONSE,
        dampingRatio: PRESS_DAMPING,
        value: 1,
        target: 1
      });
      var raf = null;
      var last = 0;

      function tick(now) {
        var t = typeof now === 'number' ? now : performance.now();
        var dt = last ? (t - last) / 1000 : 1 / 60;
        last = t;
        spring.step(dt);
        el.style.transform = 'scale(' + spring.value.toFixed(4) + ')';
        if (!spring.isResting()) {
          raf = window.requestAnimationFrame(tick);
          return;
        }
        raf = null;
        last = 0;
        if (spring.target === 1) {
          el.style.transform = '';
          el.style.transition = '';
        }
      }

      function start() {
        if (raf === null) {
          last = 0;
          raf = window.requestAnimationFrame(tick);
        }
      }

      el.addEventListener('pointerdown', function (event) {
        if (event.pointerType !== 'touch') {
          return;
        }
        el.style.transition = 'none';  // JS가 transform 소유(이중 스무딩 방지)
        spring.target = PRESS_SCALE;
        start();
      });

      function release(event) {
        if (event && event.pointerType && event.pointerType !== 'touch') {
          return;
        }
        spring.target = 1;
        start();
      }

      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
    });
  })();
})();
