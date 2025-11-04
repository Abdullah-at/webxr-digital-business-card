// ---------- Image assets ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';

// ---------- Layout ----------
const FIT = { width: 1.0, height: 0.78, x: 0, y: 0 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD on track
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // helper to make a flat image layer
  const makeLayer = (id, z) => {
    const el = document.createElement('a-image');
    el.id = id;
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
    el.setAttribute('visible', 'false');
    markerRoot.appendChild(el);
    return el;
  };

  // layers
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  // apply textures
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src', tri1URL);
  t2.setAttribute('src', tri2URL);
  t3.setAttribute('src', tri3URL);
  t4.setAttribute('src', tri4URL);

  // triangle glow animation
  const glow = (el, name, delay) => {
    el.setAttribute(
      `animation__${name}`,
      `property: material.opacity; from: 0.4; to: 1; dir: alternate; loop: true; dur: 600; easing: easeInOutSine; delay: ${delay}; startEvents: glow-start; pauseEvents: glow-stop`
    );
  };
  glow(t1, 'g1',   0);
  glow(t2, 'g2', 150);
  glow(t3, 'g3', 300);
  glow(t4, 'g4', 450);

  // text fade-out when told
  text.setAttribute('animation__fadeout', 'property: material.opacity; from: 1; to: 0; dur: 1500; easing: easeInOutQuad; startEvents: do-fade');

  // ---------- UFO (single GLTF with baked animation) ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  // Use asset by id for reliable loading
  ufo.setAttribute('gltf-model', '#ufoModel');
  ufo.setAttribute('position', '0 0.4 0');
  ufo.setAttribute('scale', '0.4 0.4 0.4');
  // Play all clips once (aframe-extras provides animation-mixer)
  ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; clampWhenFinished: true');
  markerRoot.appendChild(ufo);

  // ---------- sequence ----------
  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const showCard = () => {
    [base, text, t1, t2, t3, t4].forEach(el => {
      el.setAttribute('visible', 'true');
      el.setAttribute('animation__in', 'property: material.opacity; from: 0; to: 1; dur: 2000; easing: easeInOutQuad');
    });
    [t1, t2, t3, t4].forEach(el => el.emit('glow-start'));
  };

  const startSequence = () => {
    clearTimers();

    // reset visibility
    [base, text, t1, t2, t3, t4].forEach(el => {
      el.setAttribute('visible', 'false');
      el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
    });

    // ensure ufo mixer plays once from start whenever we reacquire
    ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; clampWhenFinished: true');

    // T+6s -> show the card
    timers.push(setTimeout(showCard, 6000));

    // T+10s -> fade out text
    timers.push(setTimeout(() => text.emit('do-fade'), 10000));
  };

  const stopSequence = () => {
    clearTimers();
    [t1, t2, t3, t4].forEach(el => el.emit('glow-stop'));
    text.setAttribute('material', 'opacity:1');
  };

  // kick sequence on track events
  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // Also start the sequence as soon as the model is definitely ready,
  // but only if we're currently tracked (helps on iOS timing).
  ufo.addEventListener('model-loaded', () => {
    // nothing else required—animation-mixer autoplays
    // console.log('UFO model loaded');
  });

  // HUD click handlers (placeholder)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('About me'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Journal'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Career'));
  document.getElementById('btn-4')?.addEventListener('click', () => console.log('Project'));
});
