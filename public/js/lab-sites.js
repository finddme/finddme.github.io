(function () {
  "use strict";

  var trigger = document.querySelector("[data-sites-open]");
  var dialog = document.getElementById("lab-sites-dialog");
  if (!trigger || !dialog) return;

  trigger.addEventListener("click", function () {
    dialog.showModal();
    document.documentElement.classList.add("lab-sites-open");
  });

  dialog.querySelector("[data-sites-close]").addEventListener("click", function () {
    dialog.close();
  });

  // Only dismiss when both the press and release happen outside the panel.
  function outside(event) {
    var rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  }
  var pressedOutside = false;
  dialog.addEventListener("pointerdown", function (event) {
    pressedOutside = event.target === dialog && outside(event);
  });
  dialog.addEventListener("click", function (event) {
    if (pressedOutside && event.target === dialog && outside(event)) dialog.close();
    pressedOutside = false;
  });

  // Native dialog handles Escape and keeps keyboard focus inside the popup.
  dialog.addEventListener("close", function () {
    document.documentElement.classList.remove("lab-sites-open");
    trigger.focus({ preventScroll: true });
  });
})();
