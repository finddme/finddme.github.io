(function () {
  var root = document.querySelector("[data-lab-home]");

  if (!root) {
    return;
  }

  // 터치 기기 표시. 첫 터치에 has-touch 를 달면 CSS 의 데스크톱 전용 호버 효과
  // (html:not(.has-touch) …:hover)가 터치 기기에서 고정되지 않는다.
  document.addEventListener("touchstart", function () {
    document.documentElement.classList.add("has-touch");
  }, { passive: true });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timeNode = document.querySelector("[data-lab-time]");
  var hero = root.querySelector(".lab-hero");
  var stage = root.querySelector("[data-lab-stage]");
  var desktopMode = window.matchMedia("(min-width: 821px)");
  var mobileMode = window.matchMedia("(max-width: 820px)");

  var STAGE_W = 2000;
  var STAGE_H = 1125;

  function updateStageScale() {
    if (!stage || !hero) {
      return;
    }
    if (!desktopMode.matches) {
      // 모바일: 무대 스케일을 끄고 흐름 레이아웃에 맡긴다.
      stage.style.transform = "";
      return;
    }
    var scale = Math.min(
      hero.clientWidth / STAGE_W,
      hero.clientHeight / STAGE_H
    );
    stage.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
  }

  function updateTime() {
    if (!timeNode) {
      return;
    }

    var formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Seoul"
    });

    timeNode.textContent = "SEL " + formatter.format(new Date());
  }

  function initTitleGlass() {
    if (reduceMotion) {
      return;
    }

    var title = root.querySelector(".lab-title");
    var glassBoxes = root.querySelectorAll(".lab-title__glass");

    if (!title || !glassBoxes.length) {
      return;
    }

    // 빌드 시점에 index.html이 심어둔 public/main-page/glass/ 이미지 목록.
    var glassImages = Array.isArray(window.LAB_GLASS_IMAGES) ? window.LAB_GLASS_IMAGES : [];
    var IMAGE_CHANCE = 0.4; // 등장하는 박스 중 약 40%를 이미지로.
    var IMAGE_OPACITY = 0.7; // 이미지 박스 투명도(1=완전 불투명). 낮출수록 더 투명.

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    // 이번 등장에서 이 박스를 이미지로 보일지(불투명) 그냥 유리로 보일지 결정.
    // 박스마다 매 등장 독립적으로 정하므로 동시 표시 중 이미지/유리가 섞인다.
    function dressBox(box) {
      if (glassImages.length && Math.random() < IMAGE_CHANCE) {
        var src = glassImages[Math.floor(Math.random() * glassImages.length)];
        box.style.backgroundImage = 'url("' + src + '")';
        box.classList.add("is-image");
        return true;
      }
      box.classList.remove("is-image");
      box.style.backgroundImage = "";
      return false;
    }

    // 박스가 로고 영역 안에 머물도록 좌상단 좌표를 박스 크기에 맞춰 클램프한 뒤
    // 매번 무작위 위치를 뽑는다 (단위: .lab-title = 로고 이미지 기준 %).
    function reposition(box) {
      var wPct = (box.offsetWidth / title.offsetWidth) * 100;
      var hPct = (box.offsetHeight / title.offsetHeight) * 100;
      var isMobile = mobileMode.matches;
      // 유리 박스가 좌우로 뻗을 수 있는 한계(%). 음수일수록 타이틀 양끝(F·E)을
      // 더 넘어 덮는다. 데스크톱은 기존 2%라 F·E 끝을 아슬하게 못 덮어서 살짝
      // 음수로 내려 미세하게 덮게 한다. (튜닝 lever: 더 덮으려면 값을 더 낮춤)
      var sideInset = isMobile ? -5 : -4;
      var maxLeft = Math.max(sideInset, 100 - sideInset - wPct);
      // 로고 축소에 맞춰 glass가 더 조밀한 중앙 띠 안에서 움직이도록 한다.
      var topMin = isMobile ? 18 : 14;
      var topMax = Math.max(topMin, (isMobile ? 62 : 66) - hPct);

      box.style.left = rand(sideInset, maxLeft).toFixed(1) + "%";
      box.style.top = rand(topMin, topMax).toFixed(1) + "%";
    }

    // 한 번 등장: 무작위 위치 + 무작위 투명도로 fade-in → 잠깐 머무름 →
    // fade-out → 무작위 간격 후 다시 반복. 위치/타이밍/투명도가 매번 달라진다.
    function cycle(box) {
      reposition(box);
      // 이미지 박스는 IMAGE_OPACITY 로, 일반 유리는 기존처럼 무작위 반투명으로.
      var isImage = dressBox(box);
      box.style.opacity = isImage ? IMAGE_OPACITY.toString() : rand(0.45, mobileMode.matches ? 0.62 : 0.85).toFixed(2);

      window.setTimeout(function () {
        box.style.opacity = "0";
        window.setTimeout(function () {
          cycle(box);
          // 사라짐 간격: 모바일을 데스크톱과의 중간으로(기존 700~1600 → 475~1300).
        }, rand(mobileMode.matches ? 475 : 250, mobileMode.matches ? 1300 : 1000));
        // 표시 시간: 모바일을 데스크톱과의 중간으로(기존 900~1800 → 1150~2400).
      }, rand(mobileMode.matches ? 1150 : 1400, mobileMode.matches ? 2400 : 3000));
    }

    Array.prototype.forEach.call(glassBoxes, function (box) {
      // 시작 시점을 흩뜨려 서로 동기화되지 않게 한다.
      // 모바일 시작 분산도 중간으로(기존 0~4200 → 0~3300).
      window.setTimeout(function () {
        cycle(box);
      }, rand(0, mobileMode.matches ? 3300 : 2400));
    });
  }

  // iOS Safari는 등록된 touch 리스너가 없는 요소에는 :active를 적용하지 않는다.
  // 빈 touchstart 리스너를 달아 탭 시 유리 press 효과(:active)가 실제로 나오게 한다.
  // (profile 페이지에서 검증된 패턴을 홈 callout/pill에도 적용.)
  var pressTargets = root.querySelectorAll(".lab-callout, .lab-profile-links a, .lab-figure");
  Array.prototype.forEach.call(pressTargets, function (el) {
    el.addEventListener("touchstart", function () {}, { passive: true });
  });

  // 모바일: 각 카드가 스크롤로 뷰포트에 들어오면 materialize(등장) 시킨다.
  // 초기 숨김 상태 CSS는 [data-lab-anim]로 게이트되므로, 이 함수가 돌 때만
  // (모바일 + 모션 허용 + IO 지원) 숨겼다가 순차로 드러낸다. 그 외엔 정상 표시.
  function initScrollMaterialize() {
    if (reduceMotion || !mobileMode.matches || !("IntersectionObserver" in window)) {
      return;
    }
    var cards = root.querySelectorAll(".lab-callout");
    if (!cards.length) {
      return;
    }
    root.setAttribute("data-lab-anim", "");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-materialized");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(cards, function (card) {
      io.observe(card);
    });
  }

  // 터치 press를 spring으로 구동(STEP 3b): 누르면 축소, 떼면 velocity를 이어받아
  // 살짝 overshoot 후 정착(iOS식 물리 press). 터치일 때만 개입하고 마우스는 기존
  // CSS :active/hover를 그대로 쓴다. JS가 transform을 잡는 동안엔 CSS transition을
  // 꺼 이중 스무딩을 막고, 정착하면 인라인 스타일을 비워 CSS로 되돌린다.
  function initPressSpring() {
    if (reduceMotion || !window.LabSpring || !("PointerEvent" in window)) {
      return;
    }
    var PRESS_RESPONSE = 0.32;   // 낮을수록 스냅
    var PRESS_DAMPING = 0.55;    // 낮을수록 떼는 순간 더 통통 튐
    var PRESS_SCALE = 0.94;      // 누른 동안 축소 정도
    var targets = root.querySelectorAll(".lab-callout:not(.lab-callout--about), .lab-profile-links a");

    Array.prototype.forEach.call(targets, function (el) {
      var spring = new window.LabSpring({
        response: PRESS_RESPONSE,
        dampingRatio: PRESS_DAMPING,
        value: 1,
        target: 1
      });
      var raf = null;
      var last = 0;

      function tick(now) {
        var t = typeof now === "number" ? now : performance.now();
        var dt = last ? (t - last) / 1000 : 1 / 60;
        last = t;
        spring.step(dt);
        el.style.transform = "scale(" + spring.value.toFixed(4) + ")";
        if (!spring.isResting()) {
          raf = window.requestAnimationFrame(tick);
          return;
        }
        raf = null;
        last = 0;
        // 손을 뗀 뒤(target 1) 정착했을 때만 CSS로 반환. 누르고 있는 중이면 유지.
        if (spring.target === 1) {
          el.style.transform = "";
          el.style.transition = "";
        }
      }

      function start() {
        if (raf === null) {
          last = 0;
          raf = window.requestAnimationFrame(tick);
        }
      }

      el.addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "touch") {
          return;
        }
        el.style.transition = "none";   // JS가 transform 소유
        spring.target = PRESS_SCALE;
        start();
      });

      function release(event) {
        if (event && event.pointerType && event.pointerType !== "touch") {
          return;
        }
        spring.target = 1;
        start();
      }

      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
      el.addEventListener("pointerleave", release);
    });
  }

  // 좌상단 고양이 상자의 눌림 효과는 CSS(.lab-figure:active .lab-figure__img)가 담당한다.
  // 웹·모바일 동일한 플랫 press 로 통일하려고 이전의 터치 전용 JS 스프링은 제거했다.
  // (:active 는 위 문서 레벨 touchstart 리스너 + 아래 pressTargets 덕에 iOS 에서도 발동.)

  updateTime();
  window.setInterval(updateTime, 30000);
  initScrollMaterialize();
  initPressSpring();
  updateStageScale();
  window.addEventListener("resize", updateStageScale);
  window.addEventListener("load", updateStageScale);
  desktopMode.addEventListener("change", updateStageScale);
  window.setTimeout(updateStageScale, 250);

  initTitleGlass();

  if (reduceMotion) {
    return;
  }

  // 포인터 패럴랙스: 고정 lerp 대신 진짜 spring으로 구동한다.
  // X·Y를 독립 spring으로 분해(Apple 스킬 §3) — 두 축 속도가 달라도 desync 없음.
  // 살짝 under-damped(dampingRatio<1)라 빠르게 움직이면 관성을 이어받아
  // 미세하게 overshoot 후 정착하고, 포인터가 벗어나면 target 0으로 복귀한다.
  // 튜닝 lever: PARALLAX_RESPONSE(낮을수록 스냅), PARALLAX_DAMPING(낮을수록 바운스).
  var PARALLAX_RESPONSE = 0.45;
  var PARALLAX_DAMPING = 0.75;
  var Spring = window.LabSpring;
  var springX = Spring ? new Spring({ response: PARALLAX_RESPONSE, dampingRatio: PARALLAX_DAMPING }) : null;
  var springY = Spring ? new Spring({ response: PARALLAX_RESPONSE, dampingRatio: PARALLAX_DAMPING }) : null;
  var frameRequested = false;
  var lastFrameTime = 0;

  function renderPointer(now) {
    if (!springX || !springY) {
      frameRequested = false;
      return;
    }
    var t = typeof now === "number" ? now : performance.now();
    var dt = lastFrameTime ? (t - lastFrameTime) / 1000 : 1 / 60;
    lastFrameTime = t;

    springX.step(dt);
    springY.step(dt);

    root.style.setProperty("--lab-x", springX.value.toFixed(4));
    root.style.setProperty("--lab-y", springY.value.toFixed(4));

    if (!springX.isResting() || !springY.isResting()) {
      window.requestAnimationFrame(renderPointer);
      return;
    }

    frameRequested = false;
  }

  function requestPointerRender() {
    if (frameRequested) {
      return;
    }

    frameRequested = true;
    lastFrameTime = 0;
    window.requestAnimationFrame(renderPointer);
  }

  root.addEventListener("pointermove", function (event) {
    if (!desktopMode.matches || !springX || !springY) {
      return;
    }
    var bounds = root.getBoundingClientRect();
    springX.target = (event.clientX - bounds.left) / bounds.width - 0.5;
    springY.target = (event.clientY - bounds.top) / bounds.height - 0.5;
    requestPointerRender();
  });

  root.addEventListener("pointerleave", function () {
    if (!springX || !springY) {
      return;
    }
    springX.target = 0;
    springY.target = 0;
    requestPointerRender();
  });

})();
