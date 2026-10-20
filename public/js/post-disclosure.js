// Kramdown이 생성한 제목/각주를 Reference 토글 안으로 옮긴다.
(function () {
  var article = document.querySelector('.post-content article');
  if (!article) return;
  var disclosure = article.querySelector('[data-reference-disclosure]');
  if (!disclosure) return;
  var summary = disclosure.querySelector('summary');
  var heading = disclosure.previousElementSibling;
  if (summary && heading && heading.tagName === 'H2') {
    summary.textContent = '';
    summary.appendChild(heading); // 기존 id와 목차 링크를 유지한다.
  }
  var footnotes = article.querySelector('.footnotes');
  if (footnotes) disclosure.appendChild(footnotes);

  function revealHash(hash) {
    var id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (e) { return; }
    var target = document.getElementById(id);
    if (!target || !disclosure.contains(target) || summary.contains(target)) return;
    disclosure.open = true;
    return target;
  }

  // 기본 앵커 이동 전에 열어야 접힌 각주에도 정확히 도착한다.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (link) revealHash(link.getAttribute('href'));
  });
  function revealLocation() {
    var target = revealHash(window.location.hash);
    if (target) target.scrollIntoView();
  }
  window.addEventListener('hashchange', revealLocation);
  revealLocation();
})();
