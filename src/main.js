// Vite: turn image files into URLs we can set on <a-image> src
import cardBaseURL   from './assets/Card_Base.png';
import cardTextURL   from './assets/Card_Text.png';
import tri1URL       from './assets/Triangles1.png';
import tri2URL       from './assets/Triangles2.png';
import tri3URL       from './assets/Triangles3.png';
import tri4URL       from './assets/Triangles4.png';

window.addEventListener('DOMContentLoaded', () => {
  const hud        = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');

  // --- HUD show/hide (you already had this) ---
  markerRoot.addEventListener('targetFound', () => hud.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud.classList.remove('active'));

  // Utility: make (or get) an <a-image> with consistent size/alignment
  const ensureImage = (id, z = 0, w = 1, h = 0.6) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('a-image');
      el.setAttribute('id', id);
      el.setAttribute('width',  String(w));
      el.setAttribute('height', String(h));
      el.setAttribute('position', `0 0 ${z}`); // sit directly on the target
      markerRoot.appendChild(el);
    }
    return el;
  };

  // Layers (created if you didn’t add them in HTML)
  const cardBase = ensureImage('cardBase', 0.000);
  const cardText = ensureImage('cardText', 0.001);
  const tri1     = ensureImage('tri1',     0.002);
  const tri2     = ensureImage('tri2',     0.003);
  const tri3     = ensureImage('tri3',     0.004);
  const tri4     = ensureImage('tri4',     0.005);

  // Set sources (from /src/assets via Vite import)
  cardBase.setAttribute('src', cardBaseURL);
  cardText.setAttribute('src', cardTextURL);
  tri1.setAttribute('src', tri1URL);
  tri2.setAttribute('src', tri2URL);
  tri3.setAttribute('src', tri3URL);
  tri4.setAttribute('src', tri4URL);

  // Default opacities (so pulses have headroom)
  [tri1, tri2, tri3, tri4].forEach(el => el.setAttribute('opacity', 0.6));

  // Staggered pulse for triangle groups (desync = nicer look)
  const pulse = (el, delayMs) => {
    el.setAttribute('animation__pulse', {
      property: 'material.opacity',
      from: 0.25,
      to:   1.0,
      dir: 'alternate',
      dur: 900,
      easing: 'easeInOutSine',
      loop: true,
      delay: delayMs,
      // We'll toggle enabled on targetFound/targetLost:
      enabled: false
    });
  };
  pulse(tri1,   0);
  pulse(tri2, 200);
  pulse(tri3, 400);
  pulse(tri4, 600);

  // Fade-out timer for the text layer
  let fadeTimer = null;
  const startSequence = () => {
    // reset text to visible each time tracking resumes
    cardText.setAttribute('material', 'opacity:1');

    // enable triangle pulses
    [tri1, tri2, tri3, tri4].forEach(el =>
      el.setAttribute('animation__pulse', 'enabled: true')
    );

    // schedule fade after 10s
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      cardText.setAttribute('animation__fade', {
        property: 'material.opacity',
        to: 0,
        dur: 1500,
        easing: 'easeInOutQuad'
      });
    }, 10000);
  };

  const stopSequence = () => {
    if (fadeTimer) clearTimeout(fadeTimer);
    // pause triangle pulses when tracking is lost (saves battery and looks clean)
    [tri1, tri2, tri3, tri4].forEach(el =>
      el.setAttribute('animation__pulse', 'enabled: false')
    );
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // Optional: hook up your HUD buttons (keep or delete)
  document.getElementById('btn-1')?.addEventListener('click', () => console.log('Text 1'));
  document.getElementById('btn-2')?.addEventListener('click', () => console.log('Text 2'));
  document.getElementById('btn-3')?.addEventListener('click', () => console.log('Text 3'));
});
