/*
 * Post body tabs.
 * Turns body headings written with the "# [Label]" rule into a tabbed UI.
 * - Each top-level heading whose text is wrapped in square brackets ("[ ... ]")
 *   becomes a tab; its content (until the next such heading) becomes the panel.
 * - Non-bracketed headings (#, ##, ...) stay as normal content inside the panel.
 * - Any content BEFORE the first bracketed heading is left in place, above the tabs.
 * - Activates only when at least one bracketed heading exists (opt-in by the rule).
 */
(function () {
  var article = document.querySelector('.post-content article');
  if (!article) return;

  function isTabHeading(node) {
    return (
      node.nodeType === 1 &&
      node.tagName === 'H1' &&
      /^\[.*\]$/.test((node.textContent || '').trim())
    );
  }

  var children = Array.prototype.slice.call(article.childNodes);
  var markers = children.filter(isTabHeading);
  if (markers.length === 0) return; // rule not used on this post → leave body untouched

  // Split into sections. Nodes before the first marker stay as "intro" (untouched).
  var sections = [];
  var current = null;
  children.forEach(function (node) {
    if (isTabHeading(node)) {
      var label = node.textContent
        .trim()
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      current = { label: label, nodes: [] };
      sections.push(current);
      // the marker heading itself is not repeated inside the panel
    } else if (current) {
      current.nodes.push(node);
    }
  });

  var wrap = document.createElement('div');
  wrap.className = 'post-tabs';

  var tablist = document.createElement('div');
  tablist.className = 'post-tabs__list';
  tablist.setAttribute('role', 'tablist');

  var panelsWrap = document.createElement('div');
  panelsWrap.className = 'post-tabs__panels';

  var tabs = [];
  var panels = [];

  function activate(index) {
    for (var k = 0; k < tabs.length; k++) {
      var on = k === index;
      tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[k].setAttribute('tabindex', on ? '0' : '-1');
      panels[k].hidden = !on;
    }
  }

  sections.forEach(function (sec, i) {
    var id = 'post-tab-panel-' + i;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'post-tabs__tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', id);
    btn.textContent = sec.label;
    btn.addEventListener('click', function () { activate(i); });
    // iOS Safari는 touch 리스너가 없는 요소엔 :active를 적용하지 않는다. 빈 touchstart를 달아
    // 탭 시 모바일 press(:active) 효과가 실제로 나오게 한다(다른 페이지와 동일 패턴).
    btn.addEventListener('touchstart', function () {}, { passive: true });
    // basic keyboard nav (left/right)
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = e.key === 'ArrowRight' ? i + 1 : i - 1;
        if (next < 0) next = tabs.length - 1;
        if (next >= tabs.length) next = 0;
        activate(next);
        tabs[next].focus();
      }
    });
    tablist.appendChild(btn);
    tabs.push(btn);

    var panel = document.createElement('div');
    panel.className = 'post-tabs__panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    sec.nodes.forEach(function (n) { panel.appendChild(n); }); // moves nodes out of article
    panelsWrap.appendChild(panel);
    panels.push(panel);
  });

  wrap.appendChild(tablist);
  wrap.appendChild(panelsWrap);

  // Insert the tab UI where the first marker was, then remove the marker headings.
  article.insertBefore(wrap, markers[0]);
  markers.forEach(function (m) { if (m.parentNode) m.parentNode.removeChild(m); });

  activate(0);
})();
