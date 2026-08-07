(function () {
  var root = document.querySelector("[data-lab-home]");

  if (!root) {
    return;
  }

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
      var sideInset = isMobile ? -3 : 2;
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
  var pressTargets = root.querySelectorAll(".lab-callout, .lab-profile-links a");
  Array.prototype.forEach.call(pressTargets, function (el) {
    el.addEventListener("touchstart", function () {}, { passive: true });
  });

  updateTime();
  window.setInterval(updateTime, 30000);
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
