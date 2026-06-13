(function () {
  // Reference (Beckmans) approach: the actual in-cell thumbnail image is what
  // expands, via pure CSS (height first, then width, delayed). JS only measures
  // each image's natural aspect ratio and exposes it as a CSS custom property,
  // so the expanded preview keeps the image's real proportions instead of a
  // fixed, cropped box.

  var MIN_ASPECT = 0.55; // tall portrait clamp
  var MAX_ASPECT = 2.2;  // wide landscape clamp (avoid covering the whole row)

  function cssLengthToPx(value, context) {
    var probe = document.createElement('span');
    probe.style.cssText = [
      'display:block',
      'position:absolute',
      'visibility:hidden',
      'height:0',
      'width:' + value
    ].join(';');
    context.appendChild(probe);
    var px = probe.getBoundingClientRect().width;
    context.removeChild(probe);
    return px;
  }

  function applyAspect(row, img) {
    var nw = img.naturalWidth;
    var nh = img.naturalHeight;
    if (!nw || !nh) return;

    var aspect = nw / nh;
    if (aspect < MIN_ASPECT) aspect = MIN_ASPECT;
    if (aspect > MAX_ASPECT) aspect = MAX_ASPECT;

    var thumbHeight = window.getComputedStyle(row).getPropertyValue('--as-thumb-h').trim();
    var thumbHeightPx = cssLengthToPx(thumbHeight || '13rem', row);
    row.style.setProperty('--as-thumb-w', (thumbHeightPx * aspect) + 'px');
  }

  var rows = document.querySelectorAll('.archive-sheet__row--has-image');

  rows.forEach(function (row) {
    var img = row.querySelector('.archive-sheet__thumb img');
    if (!img) return;

    if (img.complete && img.naturalWidth) {
      applyAspect(row, img);
    } else {
      img.addEventListener('load', function () {
        applyAspect(row, img);
      });
    }
  });
})();
