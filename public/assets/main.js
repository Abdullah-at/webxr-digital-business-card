// Runs after DOM is ready; safe to query #hud and #markerRoot
window.addEventListener('DOMContentLoaded', () => {
  const hud  = document.getElementById('hud');
  const root = document.getElementById('markerRoot');
  const scene = document.querySelector('a-scene');

  // Debug logs (Safari iPhone: enable Web Inspector to see them)
  scene?.addEventListener('arReady', () => console.log('MindAR ready'));
  scene?.addEventListener('arError', (e) => console.warn('MindAR error', e));

  // Show HUD only while tracked
  if (root && hud) {
    root.addEventListener('targetFound', () => hud.classList.add('active'));
    root.addEventListener('targetLost',  () => hud.classList.remove('active'));
  }

  // Example: wire up buttons (open links)
  const open = (url) => window.open(url, '_blank');
  document.getElementById('btn-1')?.addEventListener('click', () => open('https://your-link-1'));
  document.getElementById('btn-2')?.addEventListener('click', () => open('mailto:you@example.com'));
  document.getElementById('btn-3')?.addEventListener('click', () => open('https://your-link-3'));
});
