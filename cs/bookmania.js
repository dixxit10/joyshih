(() => {
  const project = document.getElementById('bookmania');
  if (!project) return;

  const opening = project.querySelector('.bk-opening');
  const scene = opening.querySelector('.bk-opening-scene');
  const explore = opening.querySelector('.bk-opening-explore');
  const eraButtons = [...opening.querySelectorAll('.bk-opening-choices button')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = i => (i+eraButtons.length)%eraButtons.length;
  const eraFor = i => eraButtons[wrap(i)].dataset.year;
  const images = new Map([...scene.querySelectorAll('img')].map(img => [img.dataset.era,img]));
  let currentEra = 0;
  let latestSelection = 0;
  let finishTransition;

  function pose(lane) {
    return {
      transform: `translateX(${lane*52}%) scale(${lane === 0 ? 1 : .62})`,
      opacity: lane === 0 ? 1 : Math.abs(lane) === 1 ? .46 : 0
    };
  }

  async function selectEra(button,index) {
    const selection = ++latestSelection;
    if (index === currentEra) return;
    const destination = new Map([-1,0,1].map(lane => [eraFor(index+lane),lane]));
    const additions = [];
    for (const [year] of destination) {
      if (images.has(year)) continue;
      const img = new Image(1920,1080);
      img.className = 'bk-board-base';
      img.dataset.era = year;
      img.src = 'cs/bk-opening-live-'+year+'.svg';
      additions.push(img);
    }
    try {
      await Promise.all(additions.map(img => img.decode()));
    } catch {
      return;
    }
    if (selection !== latestSelection) return;
    finishTransition?.();
    const forward = wrap(index-currentEra);
    const delta = forward > eraButtons.length/2 ? forward-eraButtons.length : forward;
    const {year,title} = button.dataset;
    currentEra = index;
    eraButtons.forEach(era => era.setAttribute('aria-pressed',era === button));
    explore.href = '#bk-'+year;

    const from = new Map([...images].map(([key,img]) => [key,Number(img.dataset.lane)]));
    for (const img of additions) {
      images.set(img.dataset.era,img);
      scene.append(img);
    }

    const motions = [];
    for (const [key,img] of images) {
      const end = destination.has(key) ? destination.get(key) : from.get(key)-delta;
      const start = from.has(key) ? from.get(key) : end+delta;
      img.dataset.lane = end;
      img.alt = end === 0 && destination.has(key) ? 'The Bookmania Story · '+year+' · '+title : '';
      img.setAttribute('aria-hidden',img.alt ? 'false' : 'true');
      if (!reducedMotion.matches && img.animate) {
        motions.push(img.animate([pose(start),pose(end)],{
          duration:860,easing:'cubic-bezier(.23,.61,.31,1)',fill:'both'
        }));
      }
    }
    const finish = () => {
      for (const [key,img] of images) {
        if (!destination.has(key)) {
          img.remove();
          images.delete(key);
        }
      }
      motions.forEach(motion => motion.cancel());
      finishTransition = undefined;
    };
    if (motions.length) {
      finishTransition = finish;
      Promise.allSettled(motions.map(motion => motion.finished)).then(() => {
        if (finishTransition === finish) finish();
      });
    } else {
      finish();
    }
  }
  let timer;
  let openingVisible = false;
  function scheduleAutoplay() {
    clearTimeout(timer);
    if (!openingVisible || document.hidden || reducedMotion.matches ||
        opening.matches(':has(:focus-visible)')) return;
    timer = setTimeout(async () => {
      const index = (currentEra+1)%eraButtons.length;
      await selectEra(eraButtons[index],index);
      scheduleAutoplay();
    },3000);
  }
  eraButtons.forEach((button,index) => button.addEventListener('click',async () => {
    clearTimeout(timer);
    await selectEra(button,index);
    scheduleAutoplay();
  }));
  opening.addEventListener('pointermove',scheduleAutoplay,{passive:true});
  opening.addEventListener('pointerdown',scheduleAutoplay,{passive:true});
  opening.addEventListener('focusin',scheduleAutoplay);
  opening.addEventListener('focusout',() => setTimeout(scheduleAutoplay,0));
  document.addEventListener('visibilitychange',scheduleAutoplay);
  reducedMotion.addEventListener('change',scheduleAutoplay);

  function typeParagraph(board) {
    const visual = board.querySelector('.bk-board-copy [aria-hidden="true"]');
    if (!visual || reducedMotion.matches) return;
    const full = visual.textContent;
    const times = Array.from(full);
    let elapsed = 0;
    const deadlines = times.map(character => {
      elapsed += /[.,:]/.test(character) ? 100 : character === ' ' ? 29 : 31;
      return elapsed;
    });
    const started = performance.now();
    let index = 0;
    visual.textContent = '';
    function draw(now) {
      const before = index;
      while (index < deadlines.length && now-started >= deadlines[index]) index++;
      if (index !== before) visual.textContent = times.slice(0,index).join('');
      if (index < deadlines.length) requestAnimationFrame(draw);
      else visual.textContent = full;
    }
    requestAnimationFrame(draw);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      openingVisible = entry.isIntersecting;
      scheduleAutoplay();
    },{threshold:.35}).observe(opening);
    const motion = new IntersectionObserver(entries => {
      entries.forEach(({target,isIntersecting}) => {
        if (!isIntersecting) return;
        target.querySelector('.bk-board-base').src = target.dataset.animation;
        typeParagraph(target);
        motion.unobserve(target);
      });
    },{threshold:.23});
    project.querySelectorAll('[data-animation]').forEach(board => motion.observe(board));
  }

  const maker = project.querySelector('.bk-maker');
  const text = maker.querySelector('#bk-custom-text');
  const mockup = maker.querySelector('.bk-mockup');
  const print = mockup.querySelector('.bk-print');
  const printText = print.querySelector('text');
  const shell = mockup.querySelector('.bk-product-shell');
  const caption = maker.querySelector('figcaption');
  const coordinates = JSON.parse(project.querySelector('#bk-print-geometry').textContent);
  const svgNS = 'http://www.w3.org/2000/svg';
  const measure = document.createElement('canvas').getContext('2d');
  let box;

  function renderText() {
    if (!box) return;
    const value = text.value;
    const limit = box.width * ({disk:.62,bookmark:.68,stamp:.80}[mockup.dataset.product]);
    const style = getComputedStyle(printText);
    if (measure) measure.font = `${style.fontWeight} ${box.size}px ${style.fontFamily}`;
    const width = line => measure ? measure.measureText(line).width : line.length * box.size * .6;
    const split = value.trim().split(/\n+/);
    let lines = split.length > 1 ? [split[0],split.slice(1).join(' ')] : [value.trim()];
    const originalLines = value.trim() === 'Bookman Old Style';
    if (originalLines) {
      lines = ['Bookman','Old Style'];
    } else if (lines.length === 1 && width(lines[0]) > limit) {
      const words = lines[0].split(/\s+/);
      let minimum = Infinity;
      for (let i=1; i<words.length; i++) {
        const pair = [words.slice(0,i).join(' '),words.slice(i).join(' ')];
        const longer = Math.max(...pair.map(width));
        if (longer < minimum) {
          minimum = longer;
          lines = pair;
        }
      }
    }
    const longest = Math.max(1,...lines.map(width));
    const scale = Math.min(1.24,limit/longest);
    printText.setAttribute('font-size',box.size*scale);
    printText.setAttribute('text-anchor','middle');
    print.setAttribute('aria-label',value);
    const glyphs = lines.map((line,i) => {
      const glyph = document.createElementNS(svgNS,'tspan');
      const anchor = i === 0 ? box.firstX : box.secondX;
      const baseline = i === 0 ? box.first : box.second;
      const spacing = Math.max(0,scale-1)*box.size*.48;
      glyph.setAttribute('x',originalLines ? anchor+width(line)/2 : box.width/2);
      glyph.setAttribute('y',baseline+(i === 0 ? -spacing : spacing));
      glyph.textContent = line;
      return glyph;
    });
    printText.replaceChildren(...glyphs);
  }

  function renderProduct() {
    const product = maker.querySelector('[name="bk-product"]:checked');
    const layout = maker.querySelector('[name="bk-layout"]:checked').value;
    const productName = product.nextElementSibling.textContent;
    const key = `${product.value}-${layout}`;
    box = coordinates[key];
    mockup.dataset.product = product.value;
    mockup.dataset.layout = layout;
    shell.src = `cs/bk-eps-${key}.webp`;
    shell.alt = `${layout} design on ${productName}`;
    print.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    caption.textContent = productName;
    renderText();
  }

  text.addEventListener('input',renderText);
  maker.addEventListener('change',event => {
    if (event.target.name === 'bk-product' || event.target.name === 'bk-layout') renderProduct();
    if (event.target.name === 'bk-ink') mockup.dataset.ink = event.target.value;
  });
  renderProduct();
  document.fonts?.ready.then(renderText);
})();
