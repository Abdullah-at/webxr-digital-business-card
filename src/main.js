// Simple MindAR -> HUD wiring
window.addEventListener('DOMContentLoaded', () => {
  const hud = document.getElementById('hud')!;
  const markerRoot = document.getElementById('markerRoot')!;

  // MindAR fires these A-Frame events on the entity with mindar-image-target
  markerRoot.addEventListener('targetFound', () => {
    hud.classList.add('active');
  });
  markerRoot.addEventListener('targetLost', () => {
    hud.classList.remove('active');
  });

  // Example button hooks
  (document.getElementById('btn-1') as HTMLButtonElement)?.addEventListener('click', () => console.log('Text 1'));
  (document.getElementById('btn-2') as HTMLButtonElement)?.addEventListener('click', () => console.log('Text 2'));
  (document.getElementById('btn-3') as HTMLButtonElement)?.addEventListener('click', () => console.log('Text 3'));
});
