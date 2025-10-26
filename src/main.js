// ---------- Asset imports (match exact filenames in /src/assets) ----------
import cardBaseURL from './assets/Card_Base.png';
import cardTextURL from './assets/Card_Text.png';
import tri1URL     from './assets/Triangles1.png';
import tri2URL     from './assets/Triangles2.png';
import tri3URL     from './assets/Triangles3.png';
import tri4URL     from './assets/Triangles4.png'; // ensure this exists exactly

// ---------- Alignment knobs (tune these 3 values if overlay is slightly off) ----------
const FIT = {
  width:  1.000,   // 1.000 = exact target width; bump to e.g. 1.012 if you need +1.2%
  height: 0.650,   // keep aspect near 1:0.6 (adjust a hair if needed, e.g. 0.606)
  x: 0.002,        // tiny horizontal nudge in meters (e.g. 0.002)
  y: 0.001         // tiny vertical nudge (e.g. -0.001)
};

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // Show HUD only while tracked
  markerRoot.addEventListener('targetFound', () => hud && hud.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud && hud.classList.remove('active'));

  // Helper: create an a-image with correct material + size
  const makeLayer = (id, z) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('a-image');
      el.id = id;
      markerRoot.appendChild(el);
    }
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:1');
    return el;
  };

  // Layers: base on target, others slightly above for stacking
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  // Textures (Vite resolves to URLs)
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

const layers = [base, text, t1, t2, t3, t4];

// keep all layers same size/xy as base
const syncLayers = () => {
  layers.forEach((el, i) => {
    const z = (i === 0) ? 0.000 : 0.001 + (i - 1) * 0.001; // keep your stacking
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
  });
};
  // Modest starting opacity so pulse has headroom
  [t1, t2, t3, t4].forEach(el => el.setAttribute('opacity', '0.5'));

  // ----- Animations (event-driven; works great on mobile Safari) -----

  // Fade the text when we emit 'start-fade'
  text.setAttribute(
    'animation__fade',
    'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade'
  );

  // Triangle pulsing; start on 'pulse-start', pause on 'pulse-stop'
  const addPulse = (el, name, delay) => {
    el.setAttribute(
      `animation__${name}`,
      `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`
    );
  };
  addPulse(t1, 'p1',   0);
  addPulse(t2, 'p2', 200);
  addPulse(t3, 'p3', 400);
  addPulse(t4, 'p4', 600);

  // ----- Sequence control (per detection cycle) -----
  let fadeTimer = null;

  const startSequence = () => {
    // ensure perfect overlay each time
    text.setAttribute('material', 'opacity:1');

    // start triangle pulses
    [t1, t2, t3, t4].forEach(el => el.emit('pulse-start'));

    // fade text after 10s (so digital card hides real printed text)
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1'); // ready for the next lock
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // Optional HUD buttons (keep/remove as you like)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
