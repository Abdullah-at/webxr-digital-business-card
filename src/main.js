// --- helpers ---
const setVisible = (els, v) => els.forEach(el => el.setAttribute('visible', v));
const setMatOpacity = (el, v) => el.setAttribute('material', `transparent:true; alphaTest:0.01; side:double; opacity:${v}`);

// ...

// Layers
const base = makeLayer('cardBase', 0.000);
const text = makeLayer('cardText', 0.001);
const t1   = makeLayer('tri1',     0.002);
const t2   = makeLayer('tri2',     0.003);
const t3   = makeLayer('tri3',     0.004);
const t4   = makeLayer('tri4',     0.005);

// Apply textures
base.setAttribute('src', cardBaseURL);
text.setAttribute('src', cardTextURL);
[t1,t2,t3,t4].forEach((el,i)=>el.setAttribute('src',[tri1URL,tri2URL,tri3URL,tri4URL][i]));

// Start fully invisible
[base,text,t1,t2,t3,t4].forEach(el => setMatOpacity(el, 0));
setVisible([base,text,t1,t2,t3,t4], false);

// --- animations we’ll trigger by events ---
const addReveal = el => {
  el.setAttribute('animation__reveal', {
    property: 'material.opacity',
    from: 0, to: 1, dur: 900, easing: 'easeOutQuad',
    startEvents: 'card-reveal'
  });
};
[base,text,t1,t2,t3,t4].forEach(addReveal);

// Triangle glow (pulse after reveal)
const addGlow = (el, name, delay=0) => {
  el.setAttribute(`animation__${name}`, {
    property: 'material.opacity',
    from: 0.6, to: 1.0,
    dir: 'alternate', loop: true,
    dur: 850, easing: 'easeInOutSine',
    delay,
    startEvents: 'tri-glow-start',
    pauseEvents: 'tri-glow-stop'
  });
};
addGlow(t1,'g1',0);
addGlow(t2,'g2',120);
addGlow(t3,'g3',240);
addGlow(t4,'g4',360);

// ---------- UFO + BEAM ----------
const ufo = document.createElement('a-entity');
ufo.setAttribute('id', 'ufo');
ufo.setAttribute('gltf-model', '/assets/ufo/UFO.glb');
ufo.setAttribute('position', '0 0.4 -0.6');
ufo.setAttribute('scale', '0.4 0.4 0.4');
ufo.setAttribute('animation__move', 'property: position; to: 0 0.4 0; dur: 3000; easing: easeInOutQuad; startEvents: ufoStart');
markerRoot.appendChild(ufo);

const light = document.createElement('a-entity');
light.setAttribute('id', 'ufoLight');
light.setAttribute('gltf-model', '/assets/ufo/light.glb');
// ensure beam starts above the card if you need a top→down presence
light.setAttribute('position', '0 0.15 0');
light.setAttribute('scale', '0.4 0.4 0.4');
light.setAttribute('material', 'transparent:true; opacity:0');
light.setAttribute('animation__fade', 'property: material.opacity; from: 0; to: 1; dur: 2000; easing: easeOutQuad; startEvents: lightStart');
markerRoot.appendChild(light);

// ---------- Sequence logic ----------
let fadeTimer = null;
let running = false;

const startSequence = () => {
  if (running) return;
  running = true;

  // 0) Hide everything
  setVisible([base,text,t1,t2,t3,t4], false);
  [base,text,t1,t2,t3,t4].forEach(el => setMatOpacity(el, 0));

  // 1) UFO flies in
  ufo.emit('ufoStart');

  // 2) Beam fades on after UFO arrives
  setTimeout(() => {
    light.emit('lightStart');

    // 3) Once beam is on, reveal the whole card together
    setTimeout(() => {
      setVisible([base,text,t1,t2,t3,t4], true);
      [base,text,t1,t2,t3,t4].forEach(el => el.emit('card-reveal'));

      // 4) After reveal finishes, start triangle glow
      fadeTimer = setTimeout(() => {
        [t1,t2,t3,t4].forEach(el => el.emit('tri-glow-start'));
      }, 950);
    }, 2000); // wait for beam fade (match light dur)
  }, 3000);   // wait for UFO flight (match ufo dur)
};

const stopSequence = () => {
  running = false;
  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }

  // stop triangle glow + reset opacities
  [t1,t2,t3,t4].forEach(el => el.emit('tri-glow-stop'));
  [base,text,t1,t2,t3,t4].forEach(el => setMatOpacity(el, 0));
  setVisible([base,text,t1,t2,t3,t4], false);

  // reset beam & UFO
  light.setAttribute('material', 'transparent:true; opacity:0');
  ufo.setAttribute('position', '0 0.4 -0.6');
};

markerRoot.addEventListener('targetFound', startSequence);
markerRoot.addEventListener('targetLost',  stopSequence);
