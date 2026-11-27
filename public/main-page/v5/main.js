
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

// Promo windows (data: _data/main_promos.yml).
// Desktop: windows are laid out on a reference stage (data-ref-w/h = the cover size the layout was composed on)
// fitted into the cover with its ratio kept and centred, growing on big screens. Each window keeps its "wanted"
// geometry as stage fractions in data-wl/wt/ww (%) + data-ar (width/height); clamping into the cover only writes
// temporary px, so a wider viewport restores the composition. Nothing persists across reloads.
(()=>{
  const PR=document.querySelector('.promos');
  if(!PR)return;
  const cover=PR.closest('.cover'),intro=document.querySelector('.intro'),mark=document.querySelector('.mark');
  const REF={w:+PR.dataset.refW,h:+PR.dataset.refH};
  const mobileQuery=matchMedia('(max-width:800px)'),isMobile=()=>mobileQuery.matches;
  const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const wins=[...PR.querySelectorAll('.promo')];
  const MIN_W=260,MIN_H=180,MARGIN=8;
  let zTop=10;
  const coverBox=()=>cover.getBoundingClientRect();
  const pct=(v,total)=>+(v/total*100).toFixed(2);
  function stage(){const c=coverBox(),k=Math.min(c.width/REF.w,c.height/REF.h),w=REF.w*k,h=REF.h*k;return{x:(c.width-w)/2,y:(c.height-h)/2,w,h,k,cw:c.width,ch:c.height};}
  // Typing line + statement. The typing line is shifted with a transform, so take the union of both boxes.
  function introBox(){const i=intro.getBoundingClientRect(),m=mark?mark.getBoundingClientRect():i,top=Math.min(i.top,m.top),bottom=Math.max(i.bottom,m.bottom);return{top,height:bottom-top};}
  function rel(el){const c=coverBox(),r=el.getBoundingClientRect();return{l:r.left-c.left,t:r.top-c.top,w:r.width,h:r.height};}
  function place(win,st){
    const d=win.dataset,w=d.ww/100*st.w,h=w/d.ar;
    const left=Math.min(Math.max(st.x+d.wl/100*st.w,MARGIN),Math.max(MARGIN,st.cw-w-MARGIN));
    const top=Math.min(Math.max(st.y+d.wt/100*st.h,0),Math.max(0,st.ch-h-MARGIN));
    Object.assign(win.style,{left:left+'px',top:top+'px',width:w+'px',height:h+'px'});
  }
  // Mobile: the list box is exactly the intro box; desktop: no inline box on the container.
  function placeMobile(){
    if(isMobile()){const c=coverBox(),i=introBox();PR.style.top=(i.top-c.top)+'px';PR.style.height=i.height+'px';}
    else{PR.style.top='';PR.style.height='';}
  }
  function updFade(){PR.classList.toggle('has-more',PR.scrollHeight-PR.clientHeight-PR.scrollTop>2);}
  function fitAll(){
    const c=coverBox(),i=introBox();
    PR.style.setProperty('--intro-top',(i.top-c.top)+'px');
    PR.style.setProperty('--intro-h',i.height+'px');
    placeMobile();
    if(isMobile()){wins.forEach(w=>w.removeAttribute('style'));updFade();return;}
    const st=stage();
    PR.style.setProperty('--k',Math.max(1,st.k).toFixed(3));
    wins.forEach(w=>{if(!w.hidden)place(w,st);});
  }
  function closeWin(win){
    if(reduceQuery.matches){win.hidden=true;updFade();return;}
    win.classList.add('is-closing');
    setTimeout(()=>{win.hidden=true;win.classList.remove('is-closing');updFade();},160);
  }
  wins.forEach(win=>{
    ['n','s','e','w','ne','nw','se','sw'].forEach(dir=>{const h=document.createElement('span');h.className='promo-rz';h.dataset.rz=dir;h.setAttribute('aria-hidden','true');win.appendChild(h);});
    win.querySelector('.promo-x').addEventListener('click',()=>closeWin(win));
    let op=null;
    win.addEventListener('pointerdown',e=>{
      if(isMobile()||e.button!==0)return;
      win.style.zIndex=++zTop;
      const rz=e.target.closest('.promo-rz'),bar=e.target.closest('.promo-bar');
      if(!rz&&(!bar||e.target.closest('.promo-x')))return;
      op={x:e.clientX,y:e.clientY,b:rel(win),dir:rz?rz.dataset.rz:null};
      win.classList.add(rz?'is-resizing':'is-dragging');
      e.target.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    win.addEventListener('pointermove',e=>{
      if(!op)return;
      const dx=e.clientX-op.x,dy=e.clientY-op.y,b=op.b,d=op.dir;
      if(!d){win.style.left=(b.l+dx)+'px';win.style.top=(b.t+dy)+'px';return;}
      if(d.includes('e'))win.style.width=Math.max(MIN_W,b.w+dx)+'px';
      if(d.includes('w')){const w=Math.max(MIN_W,b.w-dx);win.style.width=w+'px';win.style.left=(b.l+b.w-w)+'px';}
      if(d.includes('s'))win.style.height=Math.max(MIN_H,b.h+dy)+'px';
      if(d.includes('n')){const h=Math.max(MIN_H,b.h-dy);win.style.height=h+'px';win.style.top=(b.t+b.h-h)+'px';}
    });
    const end=()=>{
      if(!op)return;
      op=null;win.classList.remove('is-dragging','is-resizing');
      const b=rel(win),st=stage(),d=win.dataset;
      d.wl=pct(b.l-st.x,st.w);d.wt=pct(b.t-st.y,st.h);d.ww=pct(b.w,st.w);d.ar=(b.w/b.h).toFixed(4);
      place(win,st);
    };
    win.addEventListener('pointerup',end);
    win.addEventListener('pointercancel',end);
  });
  // ?layout: copy the current geometry as YAML lines for _data/main_promos.yml
  if(new URLSearchParams(location.search).has('layout')){
    const btn=document.createElement('button');
    btn.type='button';btn.className='promo-layout-copy';btn.textContent='copy positions';
    btn.addEventListener('click',async()=>{
      const st=stage();
      const out=wins.map(w=>{const b=rel(w);return`- slug: ${w.dataset.name}\n  left: ${pct(b.l-st.x,st.w)}\n  top: ${pct(b.t-st.y,st.h)}\n  width: ${pct(b.w,st.w)}\n  aspect: ${(b.w/b.h).toFixed(4)}`;}).join('\n');
      try{await navigator.clipboard.writeText(out);btn.textContent='copied';}catch{prompt('positions',out);}
      setTimeout(()=>{btn.textContent='copy positions';},1500);
    });
    document.body.appendChild(btn);
  }
  addEventListener('resize',()=>requestAnimationFrame(fitAll));
  PR.addEventListener('scroll',updFade,{passive:true});
  // the statement reflows when fonts arrive or the width changes; keep the list/blur box on it
  if(window.ResizeObserver)new ResizeObserver(()=>fitAll()).observe(intro);
  mobileQuery.addEventListener('change',fitAll);
  if(document.fonts)document.fonts.ready.then(fitAll);
  fitAll();
})();
