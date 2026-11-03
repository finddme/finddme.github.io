(function () {
  "use strict";

  var trigger = document.querySelector("[data-sites-open]");
  var dialog = document.getElementById("lab-sites-dialog");
  if (!trigger || !dialog) return;

  // Safari can show :focus-visible on the autofocus target after a tap.
  // Suppress only the pointer focus ring, keeping focus inside the dialog.
  var pointerOpen = false;
  trigger.addEventListener("pointerdown", function () {
    pointerOpen = true;
  });
  trigger.addEventListener("keydown", function () {
    pointerOpen = false;
  });
  trigger.addEventListener("click", function (event) {
    dialog.toggleAttribute("data-pointer-focus", pointerOpen || event.detail > 0);
    pointerOpen = false;
    dialog.showModal();
    document.documentElement.classList.add("lab-sites-open");
  });

  dialog.addEventListener("keydown", function () {
    dialog.removeAttribute("data-pointer-focus");
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
    dialog.setAttribute("data-pointer-focus", "");
    pressedOutside = event.target === dialog && outside(event);
  });
  dialog.addEventListener("click", function (event) {
    if (pressedOutside && event.target === dialog && outside(event)) dialog.close();
    pressedOutside = false;
  });

  // Native dialog handles Escape and keeps keyboard focus inside the popup.
  dialog.addEventListener("close", function () {
    dialog.removeAttribute("data-pointer-focus");
    document.documentElement.classList.remove("lab-sites-open");
    trigger.focus({ preventScroll: true });
  });
})();
