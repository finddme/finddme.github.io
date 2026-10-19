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

  var rail = toc.closest('.post-rail__sticky');
  var mobileLayout = window.matchMedia('(max-width: 48em)');

  function updateRailHeight() {
    if (!rail) return;
    if (mobileLayout.matches) {
      rail.style.removeProperty('--toc-available-height');
      return;
    }
    // 제목/태그/날짜 아래에서 시작할 때도 스크롤 영역의 바닥이 화면 안에 온다.
    var railStyle = window.getComputedStyle(rail);
    var bottomGap = parseFloat(railStyle.paddingBottom) || 0;
    // 포스트 끝에서 sticky가 위로 밀려나도 높이가 계속 커지지 않게 제한한다.
    var top = Math.max(parseFloat(railStyle.top) || 0, rail.getBoundingClientRect().top);
    var available = Math.max(0,
      window.innerHeight - top - bottomGap);
    rail.style.setProperty('--toc-available-height', available + 'px');
  }

  var activeLink = null;
  var followPausedUntil = 0;
  var railPointerDown = false;

  function pauseFollow() {
    // 타이머로 강제로 되돌리지 않고, 이후 본문 스크롤/리사이즈에서 추적을 재개한다.
    followPausedUntil = Date.now() + 1500;
  }

  function revealActiveLink() {
    if (!rail || !activeLink || mobileLayout.matches || railPointerDown ||
        Date.now() < followPausedUntil) return;

    var bounds = rail.getBoundingClientRect();
    var linkBounds = activeLink.getBoundingClientRect();
    var top = Math.max(0, bounds.top + rail.clientTop) + 12;
    var bottom = Math.min(window.innerHeight,
      bounds.top + rail.clientTop + rail.clientHeight) - 12;
    if (bottom <= top) return;

    // scrollIntoView는 본문도 움직일 수 있으므로 목차의 scrollTop만 조정한다.
    if (linkBounds.top < top) {
      rail.scrollTop += linkBounds.top - top;
    } else if (linkBounds.bottom > bottom) {
      rail.scrollTop += linkBounds.bottom - bottom;
    }
  }

  if (rail) {
    rail.addEventListener('wheel', pauseFollow, { passive: true });
    rail.addEventListener('touchmove', pauseFollow, { passive: true });
    rail.addEventListener('keydown', pauseFollow);
    rail.addEventListener('pointerdown', function () {
      railPointerDown = true;
      pauseFollow();
    });
    function releaseRailPointer() {
      if (!railPointerDown) return;
      railPointerDown = false;
      pauseFollow();
    }
    window.addEventListener('pointerup', releaseRailPointer);
    window.addEventListener('pointercancel', releaseRailPointer);
    window.addEventListener('blur', releaseRailPointer);
  }

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
    updateRailHeight();
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
    revealActiveLink();
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  // 웹폰트가 제목 높이를 바꾸면 목차 시작 위치도 다시 측정한다.
  if (document.fonts) document.fonts.ready.then(onScroll);
  if (rail && window.ResizeObserver) {
    var layoutObserver = new ResizeObserver(onScroll);
    layoutObserver.observe(document.querySelector('.post-lab-sheet'));
  }
  update();
})();
