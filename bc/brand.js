(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* values: click flips to the details, then turns back to red after 3s */
document.querySelectorAll('.vflip .vf').forEach(b=>{let t=0;const li=b.parentElement,set=on=>{li.classList.toggle('is-back',on);b.setAttribute('aria-pressed',on)};
 b.addEventListener('click',()=>{clearTimeout(t);const on=!li.classList.contains('is-back');set(on);if(on)t=setTimeout(()=>set(false),3000)})});
/* start the peek when the values row is on screen */
document.querySelectorAll('.vflip').forEach(ul=>new IntersectionObserver(es=>ul.classList.toggle('play',es[0].isIntersecting),{threshold:.4}).observe(ul));
/* ST-X colour selection and rotation */
const st = document.querySelector('.stx-stage');
if (st) {
  const canvas = st.querySelector('.stx-model');
  const render = window.mountStx?.(canvas);
  const images = [...st.querySelectorAll('img')];
  const buttons = [...document.querySelectorAll('.stx-sw button')];
  let colour = 'pink';
  let pitch = .10, yaw = -.24, targetPitch = pitch, targetYaw = yaw;
  let visible = false, frame = 0;
  let touchStart = null;
  const start = performance.now();
  const requestDraw = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  function draw(now) {
    frame = 0;
    pitch += (targetPitch - pitch)*.12;
    yaw += (targetYaw - yaw)*.12;
    const lift = reduce ? 0 : Math.sin((now-start)/900)*6;
    st.classList.toggle('has-model', Boolean(render?.(pitch,yaw,lift,colour)));
    st.style.setProperty('--ss',1-lift/60);
    if (render && visible && !reduce) requestDraw();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    colour = button.dataset.k;
    buttons.forEach(item => item.setAttribute('aria-pressed', item === button));
    images.forEach(image => image.classList.toggle('on', image.dataset.k === colour));
    requestDraw();
  }));
  if (render && !reduce) {
    st.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      touchStart = {x:event.clientX,yaw:targetYaw};
      st.setPointerCapture(event.pointerId);
    });
    st.addEventListener('pointermove', event => {
      const bounds = st.getBoundingClientRect();
      if (event.pointerType === 'mouse' && fine) {
        targetYaw = (event.clientX-bounds.left)/bounds.width*6 - 3;
        targetPitch = .10 - ((event.clientY-bounds.top)/bounds.height-.5)*.65;
      } else if (touchStart) {
        targetYaw = touchStart.yaw + (event.clientX-touchStart.x)/bounds.width*6;
      }
    });
    st.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse') {
        targetPitch = .10;
        targetYaw = -.24;
      }
    });
    st.addEventListener('lostpointercapture', () => { touchStart = null; });
  }
  canvas.addEventListener('webglcontextlost', () => st.classList.remove('has-model'));
  new ResizeObserver(requestDraw).observe(st);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw();
  }).observe(st);
}
/* Start the 4oz cup when the section comes into view. */
const bowl = document.getElementById('bowl3d');
if (bowl && !matchMedia('(max-width:860px)').matches) {
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    const script = document.createElement('script');
    script.src = 'bc/bowl3d.js';
    script.onload = () => window.BOWL3D?.(bowl,bowl.dataset.texture,() => bowl.classList.add('live'));
    document.head.appendChild(script);
  }, {rootMargin:'400px'});
  observer.observe(bowl);
}
/* Tilt the red lettering toward the mouse and ease back on exit. */
const redType = document.querySelector('.ss-red-type');
if (redType && window.ShakingSoonRed) {
  ShakingSoonRed.mount(redType).then(model => {
    if (!model) return;
    redType.classList.add('is-ready');
    let targetPitch = 0, targetYaw = 0, frame = 0;
    const rotation = model.mesh.rotation;

    function draw() {
      frame = 0;
      const pitch = targetPitch-rotation.x;
      const yaw = targetYaw-rotation.y;
      const moving = Math.abs(pitch)+Math.abs(yaw) > .001;
      rotation.x = moving ? rotation.x+pitch*.18 : targetPitch;
      rotation.y = moving ? rotation.y+yaw*.18 : targetYaw;
      model.render();
      if (moving) schedule();
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    redType.addEventListener('pointermove',event => {
      if (event.pointerType !== 'mouse') return;
      const bounds = redType.getBoundingClientRect();
      targetPitch = ((event.clientY-bounds.top)/bounds.height-.5)*1.3;
      targetYaw = ((event.clientX-bounds.left)/bounds.width-.5)*.8;
      schedule();
    });
    redType.addEventListener('pointerleave',() => {
      targetPitch = targetYaw = 0;
      schedule();
    });
  }).catch(error => console.warn('Unable to render the red teaser model',error));
}
})();
