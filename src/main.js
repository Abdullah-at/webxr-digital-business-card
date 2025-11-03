// ---------- Asset imports (Vite) ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';

// ---------- Constants ----------
const FIT = { width: 1.0, height: 0.78, x: 0.0, y: 0.0 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD toggle
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // Helper to create layered images
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

  // Layers
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  // Textures
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src', tri1URL);
  t2.setAttribute('src', tri2URL);
  t3.setAttribute('src', tri3URL);
  t4.setAttribute('src', tri4URL);

  // Triangles glow animation (intense)
  const glow = (el, name, delay) => {
    el.setAttribute(`animation__${name}`,
      `property: material.opacity; from: 0.4; to: 1.0; dir: alternate; loop: true; dur: 600; easing: easeInOutSine; delay: ${delay}; startEvents: glow-start; pauseEvents: glow-stop`);
  };
  glow(t1, 'g1', 0);
  glow(t2, 'g2', 150);
  glow(t3, 'g3', 300);
  glow(t4, 'g4', 450);

  // Text fade-out animation (after 10s)
  text.setAttribute('animation__fade', 'property: material.opacity; from: 1; to: 0; dur: 1500; easing: easeInOutQuad; startEvents: text-fade');

  // ---------- UFO (animated GLTF) ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  ufo.setAttribute('gltf-model', '/assets/ufo/UFO.glb');
  ufo.setAttribute('position', '0 0.4 0');
  ufo.setAttribute('scale', '0.4 0.4 0.4');
  ufo.setAttribute('animation-mixer', 'clip: *; loop: once'); // Play all animations once
  markerRoot.appendChild(ufo);

  // ---------- Sequence logic ----------
  let timers = [];

  const clearTimers = () => {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  };

  const startSequence = () => {
    clearTimers();

    // Hide everything first
    [base, text, t1, t2, t3, t4].forEach(el => {
      el.setAttribute('visible', false);
      el.setAttribute('material', 'opacity:0; transparent:true; side:double;');
    });

    // Play UFO animation (automatically once)
    ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; clampWhenFinished: true');

    // After 6s, show card layers
    timers.push(setTimeout(() => {
      [base, text, t1, t2, t3, t4].forEach(el => {
        el.setAttribute('visible', true);
        el.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 2000; easing: easeInOutQuad');
      });
      [t1, t2, t3, t4].forEach(el => el.emit('glow-start'));
    }, 6000));

    // After 10s, fade out text
    timers.push(setTimeout(() => {
      text.emit('text-fade');
    }, 10000));
  };

  const stopSequence = () => {
    clearTimers();
    [t1, t2, t3, t4].forEach(el => el.emit('glow-stop'));
    text.setAttribute('material', 'opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // ---------- HUD buttons ----------
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('About me'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Journal'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Career'));
  document.getElementById('btn-4')?.addEventListener('click', () => console.log('Project'));
});
