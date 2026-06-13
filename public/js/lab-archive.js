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
  var connectorKeys = ["nlp", "all", "multi", "ling"];

  var STAGE_W = 1580;
  var STAGE_H = 1324;

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

  function connectorPath(from, near, far, underlineY) {
    // stepped diagonal lead: short horizontal off the node, a slanted segment
    // down to the caption's node-side edge, then a horizontal underline.
    // No right angles.
    var bendX = from.x + (near - from.x) * 0.4;

    return [
      "M", from.x.toFixed(2), from.y.toFixed(2),
      "H", bendX.toFixed(2),
      "L", near.toFixed(2), underlineY.toFixed(2),
      "H", far.toFixed(2)
    ].join(" ");
  }

  function updateConnectors() {
    if (!stage || !desktopMode.matches) {
      return false;
    }

    var bounds = stage.getBoundingClientRect();
    var updated = false;

    function toX(value) {
      return (value - bounds.left) / bounds.width * 100;
    }

    function toY(value) {
      return (value - bounds.top) / bounds.height * 100;
    }

    connectorKeys.forEach(function (key) {
      var node = root.querySelector("[data-lab-node=\"" + key + "\"]");
      var callout = root.querySelector("[data-lab-callout=\"" + key + "\"]");
      var line = root.querySelector("[data-lab-connector=\"" + key + "\"]");

      if (!node || !callout || !line) {
        return;
      }

      var nodeRect = node.getBoundingClientRect();
      var calloutRect = callout.getBoundingClientRect();

      if (callout.classList.contains("lab-callout--card")) {
        // Connector meets the exposed bottom line of the SVG card frame.
        var cardFrom = {
          x: toX(nodeRect.right),
          y: toY(nodeRect.top + nodeRect.height / 2)
        };
        var cornerX = toX(calloutRect.left + calloutRect.width * (56 / 660));
        var cornerY = toY(calloutRect.bottom);
        var cardBend = cardFrom.x + (cornerX - cardFrom.x) * 0.58;

        line.setAttribute("d", [
          "M", cardFrom.x.toFixed(2), cardFrom.y.toFixed(2),
          "H", cardBend.toFixed(2),
          "L", cornerX.toFixed(2), cornerY.toFixed(2)
        ].join(" "));
        updated = true;
        return;
      }

      var small = callout.querySelector("small") || callout;
      var smallRect = small.getBoundingClientRect();

      var nodeCenterX = nodeRect.left + nodeRect.width / 2;
      var calloutCenterX = calloutRect.left + calloutRect.width / 2;
      // caption sits to the left of the node -> line approaches from the right
      var captionOnLeft = calloutCenterX < nodeCenterX;

      var from = {
        x: toX(captionOnLeft ? nodeRect.left : nodeRect.right),
        y: toY(nodeRect.top + nodeRect.height / 2)
      };
      // the diagonal meets the full label's node-side edge (so it clears the
      // big text), and the underline runs along the bottom of the small
      // caption out to its far edge
      var nearX = toX(captionOnLeft ? calloutRect.right : calloutRect.left);
      var farX = toX(captionOnLeft ? smallRect.left : smallRect.right);
      var underlineY = toY(smallRect.bottom + 1);

      line.setAttribute("d", connectorPath(from, nearX, farX, underlineY));
      updated = true;
    });

    return updated;
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

  updateTime();
  window.setInterval(updateTime, 30000);
  updateStageScale();
  updateConnectors();
  window.addEventListener("resize", function () {
    updateStageScale();
    updateConnectors();
  });
  window.addEventListener("load", function () {
    updateStageScale();
    updateConnectors();
  });
  desktopMode.addEventListener("change", function () {
    updateStageScale();
    updateConnectors();
  });
  window.setTimeout(function () {
    updateStageScale();
    updateConnectors();
  }, 250);

  if (reduceMotion) {
    return;
  }

  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var frameRequested = false;
  var connectorFrame = 0;

  function renderPointer() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    root.style.setProperty("--lab-x", currentX.toFixed(3));
    root.style.setProperty("--lab-y", currentY.toFixed(3));
    updateConnectors();

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

  function trackMovingNodes() {
    if (desktopMode.matches) {
      updateConnectors();
    }
    connectorFrame = window.requestAnimationFrame(trackMovingNodes);
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

  connectorFrame = window.requestAnimationFrame(trackMovingNodes);

})();
