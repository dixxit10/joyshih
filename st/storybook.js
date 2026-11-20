(() => {
 const canvas = document.querySelector('#bloom-canvas');
 const context = canvas.getContext('2d');
 const density = document.querySelector('#bloom-density');
 const status = document.querySelector('#bloom-status');
 const palettes = [
  ['#ad656f', '#76815f', '#cb9a57'],
  ['#7c739e', '#668982', '#c18065'],
  ['#aa7551', '#79908a', '#b07191']
 ];
 const rabbit = new Image();
 const play = document.querySelector('#bloom-play');
 const save = document.querySelector('#bloom-save');
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const crops = [28, 528, 1024];
 let seed = 19;
 let sequence = null;
 let transition = null;

 function redraw(animate = false) {
  transition?.cancel();
  draw();
  if (animate && !reducedMotion.matches) {
   transition = canvas.animate([{opacity: 0.5}, {opacity: 1}], {duration: 420, easing: 'ease-out'});
  }
 }

 function stopSequence() {
  clearInterval(sequence);
  sequence = null;
  play.setAttribute('aria-pressed', 'false');
  play.textContent = 'Play complexity sequence';
 }

 function draw() {
  let state = seed;
  const random = () => {
   state = (Math.imul(1664525, state) + 1013904223) >>> 0;
   return state / 4294967296;
  };
  const level = Number(density.value);
  const colors = palettes[Math.floor(random() * palettes.length)];
  context.fillStyle = '#f4e8d7';
  context.fillRect(0, 0, 1200, 800);
  context.fillStyle = '#785249';
  context.globalAlpha = 0.13;
  for (let i = 0; i < 16000; i++) {
   context.fillRect(random() * 1200, random() * 800, 1 + random(), 1);
  }

  function branch(x, y, angle, length, depth) {
   const endX = x + Math.cos(angle) * length;
   const endY = y + Math.sin(angle) * length;
   context.lineWidth = depth * 0.9;
   for (let i = 0; i < 3; i++) {
    context.beginPath();
    context.moveTo(x + random() * 3, y);
    context.quadraticCurveTo((x + endX) / 2 + random() * 9, (y + endY) / 2, endX, endY + random() * 3);
    context.stroke();
   }
   if (depth > 1) {
    branch(endX, endY, angle - 0.35 - random() * 0.35, length * 0.68, depth - 1);
    branch(endX, endY, angle + 0.35 + random() * 0.35, length * 0.66, depth - 1);
   }
  }

  context.globalAlpha = 0.33;
  for (let i = 0; i < level * 6; i++) {
   const right = i % 2 === 1;
   context.strokeStyle = colors[i % colors.length];
   branch(right ? 970 + random() * 240 : random() * 245,
    765 - random() * 330, -Math.PI / 2 + (random() - 0.5) * 1.6,
    55 + random() * 95, level + 1);
  }
  context.globalAlpha = 1;
  if (rabbit.naturalWidth) {
   context.drawImage(rabbit, crops[level - 1], 208, 380, 380, 414, 105, 372, 372);
  }

  context.textAlign = 'center';
  context.fillStyle = '#42303a';
  context.font = 'italic 52px Georgia, serif';
  context.fillText('A small rabbit watched the garden wake.', 600, 560, 880);
  context.font = '24px Georgia, serif';
  context.fillText('01', 600, 670);
 }

 density.addEventListener('change', () => {
  stopSequence();
  redraw(true);
  status.textContent = 'Pattern density updated.';
 });
 document.querySelector('#bloom-generate').addEventListener('click', () => {
  stopSequence();
  seed = (seed + 2654435761) >>> 0;
  redraw(true);
  status.textContent = 'A new variation is ready.';
 });
 play.addEventListener('click', () => {
  if (sequence !== null) {
   stopSequence();
   return;
  }
  density.value = '1';
  redraw(true);
  play.setAttribute('aria-pressed', 'true');
  play.textContent = 'Pause complexity sequence';
  sequence = setInterval(() => {
   density.value = String(Number(density.value) % 3 + 1);
   redraw(true);
  }, 2100);
 });
 save.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `a-page-in-bloom-${seed}-${density.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  status.textContent = 'The illustration was exported as a PNG.';
 });
 play.disabled = save.disabled = true;
 rabbit.addEventListener('load', () => {
  play.disabled = save.disabled = false;
  draw();
 });
 rabbit.addEventListener('error', () => {
  status.textContent = 'The rabbit illustration could not load.';
 });
 rabbit.src = `data:image/svg+xml;base64,${canvas.dataset.rabbit}`;
 draw();
})();
