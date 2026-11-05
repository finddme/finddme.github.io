// Give wide tables and code blocks independent, keyboard-accessible scrolling.
(function () {
  var article = document.querySelector('.post-content article');
  if (!article) return;
  article.querySelectorAll('table').forEach(function (table) {
    // Syntax-highlighted code may contain its own line-number table.
    if (table.closest('pre, .highlight, .post-table-scroll')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'post-table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', '표 — 가로 스크롤 가능');
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  article.querySelectorAll('pre').forEach(function (pre) {
    if (!pre.hasAttribute('tabindex')) pre.tabIndex = 0;
  });
  var scrollers = article.querySelectorAll('.post-table-scroll, pre');
  scrollers.forEach(function (scroller) {
    var frame = document.createElement('div');
    frame.className = 'post-scroll-frame';
    scroller.parentNode.insertBefore(frame, scroller);
    frame.appendChild(scroller);
    function updateEdges() {
      var remaining = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
      frame.classList.toggle('has-left-overflow', scroller.scrollLeft > 1);
      frame.classList.toggle('has-right-overflow', remaining > 1);
    }
    scroller.addEventListener('scroll', updateEdges, {passive:true});
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(updateEdges);
      observer.observe(scroller);
      if(scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    }
    window.addEventListener('resize', updateEdges);
    window.addEventListener('load', updateEdges);
    if(document.fonts) document.fonts.ready.then(updateEdges);
    updateEdges();
  });
})();
