// ---------- Asset imports (Vite) ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/textures/Triangles1.png';
import tri2URL     from '/assets/textures/Triangles2.png';
import tri3URL     from '/assets/textures/Triangles3.png';
import tri4URL     from '/assets/textures/Triangles4.png';

// ---------- Card alignment ----------
const FIT = { width: 1.000, height: 0.780, x: 0.000, y: 0.000 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD toggle with tracking
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // Helper to (create or) get a child element
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

  // ---------- Card layers (created once) ----------
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

  // Triangles pulsers (we’ll start/stop them via events)
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

  // Text fade animation (we’ll trigger by event)
  text.setAttribute(
    'animation__fade',
    'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade'
  );

  // ---------- UFO (created once, animation triggered on each detection) ----------
  let ufo = document.getElementById('ufo');
  if (!ufo) {
    ufo = document.createElement('a-entity');
    ufo.setAttribute('id', 'ufo');
    // Use preloaded asset from <a-assets>, so we avoid any path issues
    ufo.setAttribute('gltf-model', '#ufoModel');
    // Start a bit above / behind; your internal GLB animation will take it from there.
    ufo.setAttribute('position', '0 0.35 -0.35');
    ufo.setAttribute('rotation', '0 0 0');
    ufo.setAttribute('scale',    '0.4 0.4 0.4');
    // Keep it hidden until we play the animation
    ufo.setAttribute('visible', 'false');
    markerRoot.appendChild(ufo);

    // Log once to confirm load
    ufo.addEventListener('model-loaded', e => {
      console.log('[UFO] model-loaded', e.detail);
    });
  }

  // ---------- Sequence control ----------
  let textFadeTimer = null;
  let cardShowTimer = null;

  // Reset everything so re-detections behave
  const resetCardState = () => {
    [base, text, t1, t2, t3, t4].forEach(el => el.setAttribute('visible', 'false'));
    [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1');
  };

  const playUFOOnce = () => {
    // Re-apply animation-mixer to restart baked animation each detection
    // Play every clip, exactly once, and keep the final pose.
    ufo.setAttribute(
      'animation-mixer',
      'clip: *; loop: once; repetitions: 1; clampWhenFinished: true; crossFadeDuration: 0.2'
    );
    ufo.setAttribute('visible', 'true');
  };

  const startSequence = () => {
    resetCardState();

    // 1) Play the GLB’s internal animation once
    playUFOOnce();

    // 2) After 6s show card + start triangle glow; schedule text fade at 10s
    if (cardShowTimer) clearTimeout(cardShowTimer);
    cardShowTimer = setTimeout(() => {
      [base, text, t1, t2, t3, t4].forEach(el => el.setAttribute('visible', 'true'));
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-start'));

      if (textFadeTimer) clearTimeout(textFadeTimer);
      textFadeTimer = setTimeout(() => text.emit('start-fade'), 4000); // 6s + 4s = 10s
    }, 6000);
  };

  const stopSequence = () => {
    if (textFadeTimer) { clearTimeout(textFadeTimer); textFadeTimer = null; }
    if (cardShowTimer) { clearTimeout(cardShowTimer); cardShowTimer = null; }
    // Hide card + stop pulses immediately
    resetCardState();
    // Hide UFO (next detection will replay its animation by re-setting animation-mixer)
    ufo.setAttribute('visible', 'false');
    // Remove the mixer so the next setAttribute re-initializes and plays again
    if (ufo.hasAttribute('animation-mixer')) ufo.removeAttribute('animation-mixer');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // ---------- HUD buttons (kept simple for now) ----------
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('About me'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Journal'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Career'));
  document.getElementById('btn-4')?.addEventListener('click', () => console.log('Project'));
});
