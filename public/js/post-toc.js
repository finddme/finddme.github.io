// TOC scroll-spy(P2): 스크롤에 따라 지금 읽는 섹션의 TOC 링크를 하이라이트한다
// (스킬 §16 wayfinding). 스티키 TOC 레일이라 데스크톱에서 특히 유용.
// 상단 임계선(line) 위로 지나간 헤딩 중 문서 순서상 마지막을 "현재"로 삼는다
// → 헤딩 사이 구간에서도 하이라이트가 깜빡이지 않는다.
(function () {
  var toc = document.querySelector('.post-toc #markdown-toc');
  if (!toc) {
    return;
  }
  var links = toc.querySelectorAll('a[href^="#"]');
  if (!links.length) {
    return;
  }

  // TOC 링크 ↔ 본문 헤딩을 요소 단위로 짝짓는다(한글 id의 인코딩 차이를 피함).
  var pairs = [];
  Array.prototype.forEach.call(links, function (a) {
    var raw = a.getAttribute('href').slice(1);
    var h = document.getElementById(raw);
    if (!h) {
      try { h = document.getElementById(decodeURIComponent(raw)); } catch (e) {}
    }
    if (h) {
      pairs.push({ heading: h, link: a });
    }
  });
  if (!pairs.length) {
    return;
  }

  var activeLink = null;
  function setActive(link) {
    if (link === activeLink) {
      return;
    }
    if (activeLink) {
      activeLink.classList.remove('is-active');
    }
    activeLink = link;
    if (activeLink) {
      activeLink.classList.add('is-active');
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    // 뷰포트 상단에서 살짝 내려온 지점을 기준선으로(스티키 레일 top≈1.5rem 아래).
    var line = 140;
    var current = pairs[0].link;
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].heading.getBoundingClientRect().top <= line) {
        current = pairs[i].link;
      } else {
        break;
      }
    }
    setActive(current);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
