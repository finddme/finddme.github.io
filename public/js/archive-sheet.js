(function () {
  var tabs = document.querySelectorAll('.archive-sheet__tabs a');

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
