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

  // 스크롤 등장 materialize(A3): 각 행이 뷰포트에 들어오면 blur가 걷히며 떠오른다.
  // archive는 데스크톱에서도 스크롤하므로 전 폭 적용. 초기 숨김 CSS는
  // .archive-sheet[data-arch-anim]로 게이트 → 이 함수가 돌 때만 숨겼다 드러낸다.
  (function initScrollMaterialize() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      return;
    }
    var sheet = document.querySelector('.archive-sheet');
    var rows = document.querySelectorAll('.archive-sheet__row');
    if (!sheet || !rows.length) {
      return;
    }
    sheet.setAttribute('data-arch-anim', '');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-materialized');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(rows, function (row) {
      io.observe(row);
    });
  })();

  // 탭 press를 spring으로 구동(A2): 누르면 축소, 떼면 velocity를 이어받아 살짝
  // overshoot 후 정착. 터치·마우스 모두에 적용한다(데스크톱에서도 press 스프링).
  // JS가 transform을 소유하므로 A1의 CSS :active(scale)는 JS 미로드 시 폴백 역할.
  // 행은 탭 시 즉시 포스트로 이동해 release 스프링이 안 보이고 넓은 셀이라 scale이
  // 어색하므로, 행은 A1의 iOS 셀 하이라이트만 쓰고 여기선 다루지 않는다.
  (function initTabPressSpring() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !window.LabSpring || !('PointerEvent' in window) || !tabs.length) {
      return;
    }
    var PRESS_RESPONSE = 0.32;
    var PRESS_DAMPING = 0.5;
    var PRESS_SCALE = 0.90;
    // 넓은 탭("...and Linguistics"처럼 긴 이름)은 균일 scale이 중앙 텍스트 기준
    // 잘 안 보인다 → 눌린 정도(1-scale)에 비례해 살짝 아래로 내려 세로 이동을 준다.
    // 세로 이동은 탭 폭과 무관하게 균일하게 보인다. (누른 만큼 px)
    var PRESS_LIFT = 42;

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
        // 누른 정도(1-value)에 비례한 세로 눌림 + scale. release overshoot(value>1)
        // 때는 살짝 위로 튀어 자연스럽게 되돌아온다.
        var ty = (1 - spring.value) * PRESS_LIFT;
        el.style.transform = 'translateY(' + ty.toFixed(2) + 'px) scale(' + spring.value.toFixed(4) + ')';
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

      el.addEventListener('pointerdown', function () {
        el.style.transition = 'none';  // JS가 transform 소유(이중 스무딩 방지)
        spring.target = PRESS_SCALE;
        start();
      });

      function release() {
        spring.target = 1;
        start();
      }

      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
    });
  })();
})();
