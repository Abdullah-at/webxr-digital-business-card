// ---------- Images ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';

const FIT = { width: 1.0, height: 0.78, x: 0, y: 0 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD on/off with tracking
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // helper
  const mkLayer = (id, z, src) => {
    const el = document.createElement('a-image');
    el.id = id;
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('src', src);
    el.setAttribute('visible', 'false');
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
    // event-driven fade-in so we can retrigger every time
    el.setAttribute('animation__in',
      'property: material.opacity; from: 0; to: 1; dur: 2000; easing: easeInOutQuad; startEvents: animate-in');
    markerRoot.appendChild(el);
    return el;
  };

  // layers
  const base = mkLayer('cardBase', 0.000, cardBaseURL);
  const text = mkLayer('cardText', 0.001, cardTextURL);
  const t1   = mkLayer('tri1',     0.002, tri1URL);
  const t2   = mkLayer('tri2',     0.003, tri2URL);
  const t3   = mkLayer('tri3',     0.004, tri3URL);
  const t4   = mkLayer('tri4',     0.005, tri4URL);

  // triangle glow (intense)
  const glow = (el, name, d) => {
    el.setAttribute(
      `animation__${name}`,
      `property: material.opacity; from: 0.35; to: 1; dir: alternate; loop: true; dur: 500; easing: easeInOutSine; delay: ${d}; startEvents: glow-start; pauseEvents: glow-stop`
    );
  };
  glow(t1, 'g1', 0);
  glow(t2, 'g2', 120);
  glow(t3, 'g3', 240);
  glow(t4, 'g4', 360);

  // text fade after 10s
  text.setAttribute('animation__fadeout',
    'property: material.opacity; from: 1; to: 0; dur: 1500; easing: easeInOutQuad; startEvents: do-fade');

  // ---------- UFO (single GLB with animation) ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  ufo.setAttribute('gltf-model', '#ufoModel');
  // conservative placement (above card)
  ufo.setAttribute('position', '0 0.35 0');
  ufo.setAttribute('scale', '0.25 0.25 0.25');
  // play all clips once; freeze on last frame
  ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; clampWhenFinished: true');
  markerRoot.appendChild(ufo);

  ufo.addEventListener('model-loaded', e => {
    console.log('[UFO] model-loaded', e.detail);
  });
  ufo.addEventListener('model-error', e => {
    console.error('[UFO] model-error', e.detail);
  });

  // ---------- sequencing ----------
  const layers = [base, text, t1, t2, t3, t4];
  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const resetLayers = () => {
    layers.forEach(el => {
      el.setAttribute('visible', 'false');
      el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
    });
  };

  const showCard = () => {
    layers.forEach(el => {
      el.setAttribute('visible', 'true');
      el.emit('animate-in');          // <- retrigger fade-in every time
    });
    [t1, t2, t3, t4].forEach(el => el.emit('glow-start'));
  };

  const startSeq = () => {
    clearTimers();
    resetLayers();

    // ensure the mixer restarts from frame 0 on each reacquire
    // (re-applying attribute restarts the mixer)
    ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; clampWhenFinished: true');

    timers.push(setTimeout(showCard, 6000));     // show card at T+6s
    timers.push(setTimeout(() => text.emit('do-fade'), 10000)); // fade text at T+10s
  };

  const stopSeq = () => {
    clearTimers();
    [t1, t2, t3, t4].forEach(el => el.emit('glow-stop'));
    // Hide everything so next detection is fresh
    resetLayers();
    // Also restore text opacity so next fade works
    text.setAttribute('material', 'opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSeq);
  markerRoot.addEventListener('targetLost',  stopSeq);

  // HUD (placeholders)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('About me'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Journal'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Career'));
  document.getElementById('btn-4')?.addEventListener('click', () => console.log('Project'));
});
