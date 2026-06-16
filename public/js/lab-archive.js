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

    function rand(min, max) {
      return min + Math.random() * (max - min);
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
      box.style.opacity = rand(0.45, mobileMode.matches ? 0.62 : 0.85).toFixed(2);

      window.setTimeout(function () {
        box.style.opacity = "0";
        window.setTimeout(function () {
          cycle(box);
        }, rand(mobileMode.matches ? 700 : 250, mobileMode.matches ? 1600 : 1000));
      }, rand(mobileMode.matches ? 900 : 1400, mobileMode.matches ? 1800 : 3000));
    }

    Array.prototype.forEach.call(glassBoxes, function (box) {
      // 시작 시점을 흩뜨려 서로 동기화되지 않게 한다.
      window.setTimeout(function () {
        cycle(box);
      }, rand(0, mobileMode.matches ? 4200 : 2400));
    });
  }

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

  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var frameRequested = false;

  function renderPointer() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    root.style.setProperty("--lab-x", currentX.toFixed(3));
    root.style.setProperty("--lab-y", currentY.toFixed(3));

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
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
    window.requestAnimationFrame(renderPointer);
  }

  root.addEventListener("pointermove", function (event) {
    if (!desktopMode.matches) {
      return;
    }
    var bounds = root.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    requestPointerRender();
  });

  root.addEventListener("pointerleave", function () {
    targetX = 0;
    targetY = 0;
    requestPointerRender();
  });

})();
