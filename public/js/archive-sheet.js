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
})();
