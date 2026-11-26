/* every page opens at the top (unless a #section was asked for) */
(()=>{try{history.scrollRestoration='manual'}catch(_){}
 const top=()=>{if(location.hash&&document.querySelector(location.hash))return;const h=document.documentElement,b=h.style.scrollBehavior;h.style.scrollBehavior='auto';window.scrollTo(0,0);h.style.scrollBehavior=b};
 top();addEventListener('DOMContentLoaded',top);addEventListener('load',top);addEventListener('pageshow',e=>{if(e.persisted)top()});})();
/* Stories: dim starfield, header state, one reveal motion (repeats) */
(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,lite=matchMedia('(max-width:860px),(pointer:coarse)').matches;
 const cv=document.getElementById('stars'),g=cv.getContext('2d');let S=[];
 const size=()=>{const dp=lite?1:Math.min(devicePixelRatio||1,2);cv.width=innerWidth*dp;cv.height=innerHeight*dp;g.setTransform(dp,0,0,dp,0,0);
  S=Array.from({length:Math.round(innerWidth*innerHeight/(lite?11000:8000))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1+.3,p:Math.random()*6.3,v:.4+Math.random()*1.2}))};
 let last=0;const draw=t=>{if(lite&&t-last<40){requestAnimationFrame(draw);return}last=t;g.clearRect(0,0,innerWidth,innerHeight);
  for(const s of S){const k=reduce?.5:Math.pow((Math.sin(t/1000*s.v+s.p)+1)/2,3);g.fillStyle=`rgba(255,255,255,${(.12+.7*k).toFixed(3)})`;g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill()}
  if(!reduce)requestAnimationFrame(draw)};
 size();requestAnimationFrame(draw);addEventListener('resize',size);
 const rv=[...document.querySelectorAll('[data-rv]')];
 if(reduce)rv.forEach(e=>e.classList.add('in'));else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');else if(e.boundingClientRect.top>0)e.target.classList.remove('in')}),{rootMargin:'0px 0px -8% 0px'});rv.forEach(e=>io.observe(e))}
})();
/* frame-by-frame drawing: plays while on screen, holds the finished art, then draws again */
document.querySelectorAll('.draw[data-frames]').forEach(box=>{
 const n=+box.dataset.frames,src=box.dataset.src,img=box.querySelector('img'),steps=[...box.parentElement.querySelectorAll('.dsteps li')];
 const urls=Array.from({length:n},(_,i)=>`${src}${String(i).padStart(2,'0')}.webp`);urls.forEach(u=>{const im=new Image();im.src=u});
 const mark=i=>{let cur=null;steps.forEach(li=>{if(i>=+li.dataset.at)cur=li});steps.forEach(li=>li.classList.toggle('on',li===cur))};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){img.src=urls[n-1];mark(n-1);return}
 const dur=i=>i<3?380:i===3?520:i===n-1?3200:330;let i=0,t=null,vis=false;
 const step=()=>{img.src=urls[i];mark(i);t=setTimeout(()=>{i=(i+1)%n;if(vis)step();else t=null},dur(i))};
 new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!t){i=0;step()}},{threshold:.35}).observe(box);
});
/* same-page links (#section) still glide; new pages always open at the top */
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href');if(id.length<2)return;const t=document.querySelector(id);if(!t||t.classList.contains('work-category'))return;e.preventDefault();t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});history.pushState(null,'',id)});

document.querySelectorAll('video[data-lab-loop]').forEach(video => {
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const loopDuration = Number(video.dataset.labLoop);
 let inView = false;

 function updatePlayback() {
  if (inView && !document.hidden && !reducedMotion.matches) {
   video.play().catch(() => {});
  } else {
   video.pause();
  }
 }

 function restartAtLimit(time) {
  if (!video.seeking && time >= loopDuration) video.currentTime = 0;
 }
 if (loopDuration && 'requestVideoFrameCallback' in video) {
  const checkFrame = (_now, frame) => {
   restartAtLimit(frame.mediaTime);
   video.requestVideoFrameCallback(checkFrame);
  };
  video.requestVideoFrameCallback(checkFrame);
 } else if (loopDuration) {
  video.addEventListener('timeupdate', () => restartAtLimit(video.currentTime));
 }

 new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  updatePlayback();
 }).observe(video);
 document.addEventListener('visibilitychange', updatePlayback);
 reducedMotion.addEventListener('change', updatePlayback);
});

const ditherFrame = document.querySelector('.dither-tool iframe');
if (ditherFrame) {
 addEventListener('message', ({source, data}) => {
  if (source !== ditherFrame.contentWindow || data?.type !== 'dither-tool-height') return;
  if (!Number.isInteger(data.height) || data.height <= 0 || data.height > 10000) return;
  ditherFrame.style.setProperty('--dither-height', data.height + 'px');
 });
}
