// ---------- Asset URLs served from /public/assets ----------
const cardBaseURL = './assets/Card_Base.png';
const cardTextURL = './assets/Card_Text.png';
const tri1URL     = './assets/Triangles1.png';
const tri2URL     = './assets/Triangles2.png';
const tri3URL     = './assets/Triangles3.png';
const tri4URL     = './assets/Triangles4.png';

// ---------- Alignment knobs (tweak if overlay is a hair off) ----------
const FIT = {
  width:  1.000,   // bump slightly (e.g., 1.012) if needed
  height: 0.780,   // your current tuned value
  x: 0.000,
  y: 0.000
};

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD while tracked
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // create a layer helper
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

  // layers (stacked a tiny bit in Z)
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  // set textures (plain URLs from /public)
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

  // triangles start semi-opaque for pulse range
  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // ----- Animations (event-driven; Safari-friendly) -----
  // Fade the text when we emit 'start-fade'
  text.setAttribute(
    'animation__fade',
    'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade'
  );

  // Triangle pulses; start on 'pulse-start', pause on 'pulse-stop'
  const pulse = (el, name, delay) => {
    el.setAttribute(
      `animation__${name}`,
      `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`
    );
  };
  pulse(t1, 'p1',   0);
  pulse(t2, 'p2', 200);
  pulse(t3, 'p3', 400);
  pulse(t4, 'p4', 600);

  // ----- Sequence control per detection -----
  let fadeTimer = null;

  const startSequence = () => {
    text.setAttribute('material', 'opacity:1');          // ensure visible first
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-start')); // start pulses

    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => text.emit('start-fade'), 10000); // fade after 10s
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1'); // reset for next detection
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // optional HUD buttons
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
