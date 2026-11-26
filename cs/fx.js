/* energy bar: fills to its value and counts up each time it scrolls into view */
document.querySelectorAll('.eb[data-to]').forEach(el=>{
 const to=+el.dataset.to,num=el.querySelector('.eb-num b'),fill=el.querySelector('.eb-fill'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let raf=0;
 const run=()=>{cancelAnimationFrame(raf);if(reduce){num.textContent=to;fill.style.width=to+'%';return}const t0=performance.now(),D=1800;
  const step=n=>{const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3),v=to*e;fill.style.width=v.toFixed(2)+'%';num.textContent=Math.round(to*Math.min(1,e));if(k<1)raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)};
 new IntersectionObserver(es=>{if(es[0].isIntersecting)run();else{cancelAnimationFrame(raf);fill.style.width='0%';num.textContent='0'}},{threshold:.5}).observe(el);
});
/* social cards: auto flip in a staggered loop; click or tap flips by hand and restarts that card's timer */
document.querySelectorAll('.flip').forEach((li,i)=>{
 const btn=li.querySelector('.flip-in'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let t=null,vis=false,hover=false;
 const set=b=>{li.classList.toggle('is-back',b);btn.setAttribute('aria-pressed',b)};
 const arm=d=>{clearTimeout(t);if(reduce||!vis||hover)return;t=setTimeout(()=>{set(!li.classList.contains('is-back'));arm(4200)},d)};
 btn.addEventListener('click',()=>{set(!li.classList.contains('is-back'));arm(6000)});
 li.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;clearTimeout(t)}});
 li.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hover=false;arm(2500)}});
 new IntersectionObserver(es=>{vis=es[0].isIntersecting;vis?arm(2500+i*450):clearTimeout(t)},{threshold:.3}).observe(li);
});
