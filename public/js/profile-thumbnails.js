// Request profile list thumbnails only when their rows enter the visible area.
(function () {
  'use strict';
  var images = Array.from(document.querySelectorAll('img[data-profile-thumbnail]'));
  if (!images.length) return;

  function load(image) {
    if (!image.hasAttribute('data-profile-thumbnail')) return;
    var win = image.closest('.mac-window');
    if (win && win.hidden) return;
    // Visibility is already decided here; do not add native lazy-loading delay.
    image.loading = 'eager';
    image.src = image.getAttribute('data-profile-thumbnail');
    image.removeAttribute('data-profile-thumbnail');
  }

  if ('IntersectionObserver' in window) {
    // A viewport root also respects clipping by each window's scrolling body.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var image = entry.target.querySelector('img[data-profile-thumbnail]');
        if (image) load(image);
        if (!image || !image.hasAttribute('data-profile-thumbnail')) observer.unobserve(entry.target);
      });
    }, {rootMargin:'0px', threshold:0});
    images.forEach(function (image) { observer.observe(image.closest('.archive-sheet__row')); });
    return;
  }

  // Older browsers: retain the same visible-row policy without an observer.
  var frame = null;
  function check() {
    frame = null;
    images = images.filter(function (image) {
      var body = image.closest('.mac-window__body');
      var row = image.closest('.archive-sheet__row');
      if (!body || !row) return false;
      var r = row.getBoundingClientRect(), b = body.getBoundingClientRect();
      if (r.width && r.height && r.bottom > Math.max(0,b.top) &&
          r.top < Math.min(innerHeight,b.bottom) && r.right > Math.max(0,b.left) &&
          r.left < Math.min(innerWidth,b.right)) load(image);
      return image.hasAttribute('data-profile-thumbnail');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(check); }
  document.addEventListener('scroll', schedule, {capture:true, passive:true});
  window.addEventListener('resize', schedule);
  var changes = new MutationObserver(schedule);
  document.querySelectorAll('.mac-window').forEach(function (win) {
    changes.observe(win, {attributes:true, attributeFilter:['hidden','style','class','data-closing']});
  });
  schedule();
})();
