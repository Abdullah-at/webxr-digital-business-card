// --- Exact filenames (match your /src/assets names) ---
import cardBaseURL from './assets/Card_Base.png';
import cardTextURL from './assets/Card_Text.png';
import tri1URL from './assets/Triangles1.png';
import tri2URL from './assets/Triangles2.png';
import tri3URL from './assets/Triangles3.png';
import tri4URL from './assets/Triangles4.png'; // <- ensure this file really exists

window.addEventListener('DOMContentLoaded', () => {
  const hud = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // Show HUD only while tracked
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // Helper: create an a-image layer with correct material
  const layer = (id, z) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('a-image');
      el.id = id;
      el.setAttribute('width',  '1');   // match target aspect 1000x600 -> 1 : 0.6
      el.setAttribute('height', '0.6');
      el.setAttribute('position', `0 0 ${z}`);
      el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:1');
      markerRoot.appendChild(el);
    }
    return el;
  };

  // Layers (base exactly on target, others slightly above)
  const base = layer('cardBase', 0.000);
  const text = layer('cardText', 0.001);
  const t1   = layer('tri1',     0.002);
  const t2   = layer('tri2',     0.003);
  const t3   = layer('tri3',     0.004);
  const t4   = layer('tri4',     0.005);

  // Textures
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

  // Start with modest opacity so pulse is visible
  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // ---- Animations (event driven; very Safari-friendly) ----
  // Fade text when we emit 'start-fade', reset when 'reset-fade'
  text.setAttribute('animation__fade',
    'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade'
  );

  // Triangle pulses; start on 'pulse-start', pause on 'pulse-stop'
  const addPulse = (el, name, delay) => {
    el.setAttribute(`animation__${name}`,
      `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`
    );
  };
  addPulse(t1, 'p1',   0);
  addPulse(t2, 'p2', 200);
  addPulse(t3, 'p3', 400);
  addPulse(t4, 'p4', 600);

  // ---- Sequence control ----
  let fadeTimer = null;

  const startSequence = () => {
    // full overlay each time we re-acquire target
    text.setAttribute('material', 'opacity:1');

    // start pulses
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));

    // schedule text fade after 10s (so digital card covers real text)
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    // ensure text will be visible again on next detection
    text.setAttribute('material', 'opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // (Optional) Your HUD buttons
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
