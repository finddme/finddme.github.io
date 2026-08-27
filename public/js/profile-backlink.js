/*
 * 프로필 창(Official/Personal Projects, Dev Logs)에서 들어온 포스트에서는
 * 좌측 상단 로고를 "FindDMe : Profile"로 바꾸고, 블로그 홈 대신 프로필 페이지로
 * 돌려보낸다. 이때 어느 창에서 왔는지도 넘겨서 그 창이 열린 채로 복귀한다.
 * 진입 링크가 붙여준 ?from=profile&win=<window-id> 로 판단한다.
 */
(function () {
  'use strict';

  var search = window.location.search;
  if (!search || search.indexOf('from=profile') === -1) return;

  var params;
  try {
    params = new URLSearchParams(search);
  } catch (e) {
    return;
  }
  if (params.get('from') !== 'profile') return;

  var link = document.querySelector('[data-masthead-link]');
  var wordmark = document.querySelector('[data-masthead-wordmark]');
  if (!link || !wordmark) return;

  var profileUrl = link.getAttribute('data-profile-url') || '/profile/';
  var win = params.get('win') || '';

  link.setAttribute('href', win ? profileUrl + '?open=' + encodeURIComponent(win) : profileUrl);
  link.setAttribute('title', 'Profile');
  wordmark.textContent = 'FindDMe : Profile';
  wordmark.classList.add('masthead-wordmark--profile');
})();
