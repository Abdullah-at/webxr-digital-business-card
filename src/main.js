// ---------- Asset imports ----------
import cardBaseURL from './assets/Card_Base.png';
import cardTextURL from './assets/Card_Text.png';
import tri1URL     from './assets/Triangles1.png';
import tri2URL     from './assets/Triangles2.png';
import tri3URL     from './assets/Triangles3.png';
import tri4URL     from './assets/Triangles4.png';
import loaderWebmURL from './assets/loader.webm';   // one single loader file

// ---------- Alignment knobs ----------
const FIT = { width: 1.000, height: 0.600, x: 0.000, y: 0.000 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const loader     = document.getElementById('loader');
  const loaderVid  = document.getElementById('loaderVid');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // Setup loader
  loaderVid.src = loaderWebmURL;
  loaderVid.style.display = 'block';
  const showLoader = (on=true) => loader?.classList.toggle('show', on);

  // Show loader immediately
  showLoader(true);

  // --- HUD visibility ---
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // Helper to make layer
  const makeLayer = (id, z) => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('a-image'); el.id = id; markerRoot.appendChild(el); }
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:1');
    return el;
  };

  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1', 0.002);
  const t2   = makeLayer('tri2', 0.003);
  const t3   = makeLayer('tri3', 0.004);
  const t4   = makeLayer('tri4', 0.005);

  // Preload assets
  const loadImage = url => new Promise((res, rej) => { const i = new Image(); i.onload = res; i.onerror = rej; i.src = url; });
  Promise.all([cardBaseURL, cardTextURL, tri1URL, tri2URL, tri3URL, tri4URL].map(loadImage)).then(() => {
    base.setAttribute('src', cardBaseURL);
    text.setAttribute('src', cardTextURL);
    t1.setAttribute('src', tri1URL);
    t2.setAttribute('src', tri2URL);
    t3.setAttribute('src', tri3URL);
    t4.setAttribute('src', tri4URL);
    showLoader(false); // hide loader once assets ready
  });

  // Animations
  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));
  text.setAttribute('animation__fade', 'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade');
  const pulse = (el, name, delay) => el.setAttribute(`animation__${name}`,
    `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`);
  pulse(t1, 'p1', 0); pulse(t2, 'p2', 200); pulse(t3, 'p3', 400); pulse(t4, 'p4', 600);

  let fadeTimer = null;
  const startSequence = () => {
    text.setAttribute('material','opacity:1');
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
  };
  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer=null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material','opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost', stopSequence);
});
