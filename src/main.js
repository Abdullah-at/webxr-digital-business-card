// ---------- Asset imports (Vite) ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';

// ---------- Alignment knobs ----------
const FIT = {
  width:  1.000,
  height: 0.780,
  x: 0.000,
  y: 0.000
};

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // HUD toggle
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // Helper to create layers
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
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // Animations
  text.setAttribute('animation__fade', 'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade');
  const pulse = (el, name, delay) => {
    el.setAttribute(`animation__${name}`, `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`);
  };
  pulse(t1, 'p1',   0);
  pulse(t2, 'p2', 200);
  pulse(t3, 'p3', 400);
  pulse(t4, 'p4', 600);

  // ---------- UFO + LIGHT ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  ufo.setAttribute('gltf-model', '/assets/ufo/UFO.glb');
  ufo.setAttribute('position', '0 0.4 -0.6'); // slightly above and behind
  ufo.setAttribute('scale', '0.4 0.4 0.4');
  ufo.setAttribute('animation__move', 'property: position; to: 0 0.4 0; dur: 3000; easing: easeInOutQuad; startEvents: ufoStart');
  markerRoot.appendChild(ufo);

  const light = document.createElement('a-entity');
  light.setAttribute('id', 'ufoLight');
  light.setAttribute('gltf-model', '/assets/ufo/light.glb');
  light.setAttribute('position', '0 0.15 0');
  light.setAttribute('scale', '0.4 0.4 0.4');
  light.setAttribute('material', 'opacity:0');
  light.setAttribute('animation__fade', 'property: material.opacity; from: 0; to: 1; dur: 2000; startEvents: lightStart');
  markerRoot.appendChild(light);

  // ---------- Sequence logic ----------
  let fadeTimer = null;

  const startSequence = () => {
    // Hide the card at first
    [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', false));

    // UFO flight animation
    ufo.emit('ufoStart');

    // After UFO arrives, turn on light
    setTimeout(() => light.emit('lightStart'), 3000);

    // After light on, show the card and start animations
    setTimeout(() => {
      [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', true));
      text.setAttribute('material', 'opacity:1');
      [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));
      fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
    }, 5000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // HUD buttons
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('About me'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Journal'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Career'));
  document.getElementById('btn-4')?.addEventListener('click', () => console.log('Project'));
});
