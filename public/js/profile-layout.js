(function(){

const sites=document.getElementById('win-blog');
const duck=[...document.querySelectorAll('.mac-window--image')].find(w=>w.id.includes('04-'));
if (sites) sites.classList.add('profile-docked','profile-sites');
const mobileLayout=matchMedia('(max-width:768px)');
function syncDuckLayout(){
 if (!duck) return;
 duck.classList.toggle('profile-docked',!mobileLayout.matches);
 duck.classList.toggle('profile-duck',!mobileLayout.matches);
 duck.hidden=mobileLayout.matches;
}
syncDuckLayout();
mobileLayout.addEventListener('change',syncDuckLayout);
document.querySelectorAll('.mac-window__lights').forEach(e=>e.removeAttribute('aria-hidden'));

})();
