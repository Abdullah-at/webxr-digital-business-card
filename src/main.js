// src/main.js
import cardBaseURL from './assets/Card_Base.png';
import cardTextURL from './assets/Card_Text.png';
import tri1URL from './assets/Triangles1.png';
import tri2URL from './assets/Triangles2.png';
import tri3URL from './assets/Triangles3.png';
import tri4URL from './assets/Triangles4.png';

window.addEventListener('DOMContentLoaded', () => {
  const hud = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');

  // safety: exit if markerRoot missing
  if (!markerRoot) {
    console.error('markerRoot not found!');
    return;
  }

  // --- HUD wiring (you had this) ---
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // helper: create a-image if missing
  const ensureImage = (id, z = 0.0, w = 1, h = 0.6) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('a-image');
      el.setAttribute('id', id);
      el.setAttribute('width', String(w));
      el.setAttribute('height', String(h));
      // put it exactly on the target; small offsets in z to layering
      el.setAttribute('position', `0 0 ${z}`);
      // ensure transparent pixels of PNG stay transparent
      el.setAttribute('material', 'transparent: true; alphaTest: 0.01; side: double');
      markerRoot.appendChild(el);
    }
    return el;
  };

  const cardBase = ensureImage('cardBase', 0.000, 1.0, 0.6);
  const cardText = ensureImage('cardText', 0.001, 1.0, 0.6);
  const tri1     = ensureImage('tri1', 0.002, 1.0, 0.6);
  const tri2     = ensureImage('tri2', 0.003, 1.0, 0.6);
  const tri3     = ensureImage('tri3', 0.004, 1.0, 0.6);
  const tri4     = ensureImage('tri4', 0.005, 1.0, 0.6);

  // set textures (Vite gives URLs)
  cardBase.setAttribute('src', cardBaseURL);
  cardText.setAttribute('src', cardTextURL);
  tri1.setAttribute('src', tri1URL);
  tri2.setAttribute('src', tri2URL);
  tri3.setAttribute('src', tri3URL);
  tri4.setAttribute('src', tri4URL);

  // default tri opacity so pulses are visible
  [tri1,tri2,tri3,tri4].forEach(t => t.setAttribute('opacity', '0.5'));

  // Define pulse animation (string syntax - reliable cross-browser)
  const addPulseAnimation = (el, idSuffix, delayMs) => {
    // animated opacity from 0.25 -> 1
    el.setAttribute(
      `animation__pulse${idSuffix}`,
      `property: material.opacity; from: 0.25; to: 1.0; dur: 900; easing: easeInOutSine; loop: true; dir: alternate; delay: ${delayMs}; enabled: false`
    );
  };

  addPulseAnimation(tri1, 'a', 0);
  addPulseAnimation(tri2, 'b', 200);
  addPulseAnimation(tri3, 'c', 400);
  addPulseAnimation(tri4, 'd', 600);

  // Fade animation for cardText (string syntax)
  cardText.setAttribute(
    'animation__fade',
    'property: material.opacity; to: 0; dur: 1500; easing: easeInOutQuad; enabled: false'
  );

  let fadeTimer = null;
  const startSequence = () => {
    // show text immediately when found
    cardText.setAttribute('material', 'opacity: 1');

    // enable pulses
    [tri1,tri2,tri3,tri4].forEach(t => t.setAttribute(`animation__pulse${t.id.slice(-1)}`, 'enabled: true'));

    // schedule fade after 10s
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      cardText.setAttribute('animation__fade', 'enabled: true');
    }, 10000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    // disable pulses & fade (so it restarts clean next time)
    [tri1,tri2,tri3,tri4].forEach(t => t.setAttribute(`animation__pulse${t.id.slice(-1)}`, 'enabled: false'));
    cardText.setAttribute('animation__fade', 'enabled: false');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // buttons (optional)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
