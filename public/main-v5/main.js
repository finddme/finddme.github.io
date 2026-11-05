
// Keep the link name stable for assistive technology while its visible text types.
const exploreWord=document.querySelector('#explore-word');
const exploreWords=['linguistics','language models','multimodal AI','methods','FINDDME'];
let exploreIndex=0;
const exploreMotion=matchMedia('(prefers-reduced-motion: reduce)');
let exploreTimer,exploreDeleting=true;
function typeExplore(){
  if(document.hidden||exploreMotion.matches)return;
  const exploreText=exploreWords[exploreIndex];
  exploreWord.classList.toggle("is-brand",exploreText==='FINDDME');
  const length=exploreWord.textContent.length;
  exploreWord.textContent=exploreText.slice(0,length+(exploreDeleting?-1:1));
  let delay=exploreDeleting?50:85;
  if(!exploreWord.textContent){exploreDeleting=false;exploreIndex=(exploreIndex+1)%exploreWords.length;delay=300;}
  else if(exploreWord.textContent===exploreText){exploreDeleting=true;delay=2200;}
  exploreTimer=setTimeout(typeExplore,delay);
}
function restartExplore(){
  clearTimeout(exploreTimer);
  exploreIndex=0;
  exploreWord.classList.remove("is-brand");
  exploreWord.textContent=exploreWords[exploreIndex];
  exploreDeleting=true;
  if(!document.hidden&&!exploreMotion.matches)exploreTimer=setTimeout(typeExplore,2200);
}
exploreMotion.addEventListener('change',restartExplore);
document.addEventListener('visibilitychange',restartExplore);
restartExplore();
const dialog=document.querySelector('#sites');
const trigger=document.querySelector('.sites-trigger');
// Safari may mark the dialog's automatically focused close button as focus-visible.
// Suppress that ring for pointer input, then restore it as soon as a keyboard is used.
document.addEventListener('pointerdown',()=>dialog.classList.add('pointer-focus'),{passive:true});
document.addEventListener('keydown',()=>dialog.classList.remove('pointer-focus'));
const dialogMotion=matchMedia('(prefers-reduced-motion: reduce)');
let dialogAnimation=null;
function animateDialog(closing){
  if(dialogAnimation){dialogAnimation.cancel();dialogAnimation=null;}
  if(dialogMotion.matches){if(closing)dialog.close();return;}
  const frames=[{opacity:0,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}];
  dialogAnimation=dialog.animate(closing?frames.slice().reverse():frames,{duration:closing?150:210,easing:'cubic-bezier(.22,1,.36,1)'});
  const animation=dialogAnimation;
  animation.onfinish=()=>{if(dialogAnimation!==animation)return;dialogAnimation=null;if(closing)dialog.close();};
}
trigger.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();animateDialog(false);});
function closeSites(){if(dialog.open)animateDialog(true);}
document.querySelector('.close').addEventListener('click',closeSites);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeSites();});
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeSites();});
dialog.addEventListener('close',()=>{if(dialogAnimation)dialogAnimation.cancel();dialogAnimation=null;trigger.focus({preventScroll:true});});
dialogMotion.addEventListener('change',()=>{if(dialogAnimation)dialogAnimation.finish();});
