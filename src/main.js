// ---------- Asset imports ----------
import cardBaseURL from './assets/Card_Base.png';
import cardTextURL from './assets/Card_Text.png';
import tri1URL     from './assets/Triangles1.png';
import tri2URL     from './assets/Triangles2.png';
import tri3URL     from './assets/Triangles3.png';
import tri4URL     from './assets/Triangles4.png';

// Loader media (put your files in /src/assets and rename here)
import loaderWebmURL from './assets/loader.webm';

// ---------- Alignment knobs ----------
const FIT = { width: 1.000, height: 0.780, x: 0.000, y: 0.000 };

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const loader     = document.getElementById('loader');
  const loaderVid  = document.getElementById('loaderVid');
  const loaderGif  = document.getElementById('loaderGif');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // --- pick WebM if the browser supports it, else GIF ---
  const canWebm = (() => {
    const v = document.createElement('video');
    return !!v.canPlayType && v.canPlayType('video/webm; codecs="vp9,opus"');
  })();
  if (canWebm) {
    loaderVid.src = loaderWebmURL;
    loaderVid.style.display = 'block';
    loaderGif.style.display = 'none';
  } else {
    loaderGif.src = loaderGifURL;
    loaderGif.style.display = 'block';
    loaderVid.style.display = 'none';
  }
  const showLoader = (on=true) => loader?.classList.toggle('show', on);

  // --- HUD show/hide while tracked ---
  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // --- layers helper ---
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
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);

  // --- preload images, then set srcs ---
  const loadImage = url => new Promise((res, rej) => { const i = new Image(); i.onload = res; i.onerror = rej; i.src = url; });
  const assetURLs = [cardBaseURL, cardTextURL, tri1URL, tri2URL, tri3URL, tri4URL];

  let assetsReady = false;
  let trackingReady = false;

  const maybeHideLoader = () => {
    if (assetsReady && trackingReady) showLoader(false);
  };

  showLoader(true); // show immediately

  Promise.all(assetURLs.map(loadImage))
    .then(() => {
      // set textures after preloading (prevents white flashes)
      base.setAttribute('src', cardBaseURL);
      text.setAttribute('src', cardTextURL);
      t1.setAttribute('src',   tri1URL);
      t2.setAttribute('src',   tri2URL);
      t3.setAttribute('src',   tri3URL);
      t4.setAttribute('src',   tri4URL);
      assetsReady = true;
      maybeHideLoader();
    })
    .catch(() => {
      // even if one fails, proceed (but keep loader until targetFound)
      base.setAttribute('src', cardBaseURL);
      text.setAttribute('src', cardTextURL);
      t1.setAttribute('src',   tri1URL);
      t2.setAttribute('src',   tri2URL);
      t3.setAttribute('src',   tri3URL);
      t4.setAttribute('src',   tri4URL);
      assetsReady = true;
      maybeHideLoader();
    });

  // --- animations (event-driven; Safari-friendly) ---
  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  text.setAttribute(
    'animation__fade',
    'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade'
  );

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

  // --- sequence per detection ---
  let fadeTimer = null;

  const startSequence = () => {
    trackingReady = true;
    maybeHideLoader();

    text.setAttribute('material', 'opacity:1');
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));

    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
  };

  const stopSequence = () => {
    trackingReady = false;
    showLoader(true); // show loader while target is lost (optional; remove if you prefer)
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // HUD buttons (optional)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
