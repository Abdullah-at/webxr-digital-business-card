// ---------- Asset imports (Vite) ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';

// ---------- Alignment knobs ----------
const FIT = {
  width:  1.300,
  height: 0.980,
  x: 0.000,
  y: 0.000
};

window.addEventListener('DOMContentLoaded', () => {
  const trackerOverlay = document.getElementById('tracker-overlay');
  const markerRoot     = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // Tracker overlay toggle (hide when target found)
  markerRoot.addEventListener('targetFound', () => {
    trackerOverlay?.classList.add('hidden');
  });
  markerRoot.addEventListener('targetLost', () => {
    trackerOverlay?.classList.remove('hidden');
  });

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
  
  // Content layer (sits above base, replaces text/triangles when cube face tapped)
  const content = makeLayer('cardContent', 0.006);
  content.setAttribute('visible', false);

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
  text.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-text');
  
  const pulse = (el, name, delay) => {
    el.setAttribute(`animation__${name}`, `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`);
  };
  pulse(t1, 'p1',   0);
  pulse(t2, 'p2', 200);
  pulse(t3, 'p3', 400);
  pulse(t4, 'p4', 600);
  
  // Fade out animations for triangles
  [t1, t2, t3, t4].forEach((el, i) => {
    el.setAttribute('animation__fadeout', `property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-triangles; delay: ${i * 100}`);
  });
  
  // Content layer fade in/out
  content.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-content');
  content.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-content');

  // ---------- UFO (GLB) ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  // Use preloaded asset to avoid network delay
  ufo.setAttribute('gltf-model', '#ufoModel');
  // Place slightly above the image and a hair in front so it's visible
  ufo.setAttribute('position', '0 -0.35 -0.12');
  ufo.setAttribute('scale', '0.3 0.3 0.3');
  markerRoot.appendChild(ufo);

  // ---------- CUBE (3D Button Panel Replacement) ----------
  const cube = document.createElement('a-entity');
  cube.setAttribute('id', 'cube');
  cube.setAttribute('gltf-model', '#cubeModel');
  // Position below the card with clear separation
  cube.setAttribute('position', '0 -1.2 0');
  cube.setAttribute('scale', '0.25 0.25 0.25');
  cube.setAttribute('visible', 'false');
  // Enable 360° rotation interaction
  cube.setAttribute('class', 'clickable');
  markerRoot.appendChild(cube);

  // Ensure animation-mixer exists after model loads
  let ufoLoaded = false;
  ufo.addEventListener('model-loaded', () => {
    ufoLoaded = true;
    // Detect clips from GLB and log them for debugging
    const evt = event; // implicit event in handler
    const animations = evt?.detail?.model?.animations || [];
    const clipNames = animations.map(a => a.name);
    console.log('[UFO] model-loaded. Clips:', clipNames);
    const firstClip = clipNames[0] || '*';
    // Initialize mixer paused on the detected clip
    ufo.setAttribute('animation-mixer', `clip: ${firstClip}; loop: once; repetitions: 1; clampWhenFinished: true; timeScale: 0`);

    // Visibility safety: disable frustum culling and force DoubleSide on materials
    try {
      const model = evt.detail.model;
      const THREE = window.THREE;
      if (model && THREE) {
        model.traverse((node) => {
          if (node.isMesh || node.isSkinnedMesh) {
            node.frustumCulled = false;
            if (node.material) {
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              materials.forEach((m) => { m.side = THREE.DoubleSide; m.needsUpdate = true; });
            }
          }
        });
        // Log bounding box to debug scale
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        console.log('[UFO] bounds size (m):', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));
      }
    } catch (e) {
      console.warn('[UFO] post-load adjustments failed', e);
    }
  });

  // ---------- Cube Interaction (360° Rotation) ----------
  let isDragging = false;
  let previousMouseX = 0;
  let cubeRotation = { x: 0, y: 0 };

  // Touch/Mouse start
  cube.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMouseX = e.detail.intersection?.point?.x || 0;
  });

  cube.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches?.[0];
    previousMouseX = touch?.clientX || 0;
  });

  // Touch/Mouse move - rotate cube
  const onMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - previousMouseX;
    cubeRotation.y += deltaX * 100; // Sensitivity
    cube.setAttribute('rotation', `${cubeRotation.x} ${cubeRotation.y} 0`);
    previousMouseX = clientX;
  };

  document.addEventListener('mousemove', (e) => {
    if (isDragging) onMove(e.clientX);
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches?.[0]) {
      onMove(e.touches[0].clientX);
    }
  });

  // Touch/Mouse end
  const stopDrag = () => { isDragging = false; };
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  // ---------- Sequence logic ----------
  let fadeTimer = null;

  const startSequence = () => {
    // Hide the card and cube at first
    [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', false));
    cube.setAttribute('visible', false);
    
    // Reset and play GLB baked animation from the start (wait if still loading)
    const play = () => {
      const mixer = ufo.components['animation-mixer'];
      if (mixer) {
        mixer.stopAction('*');
        mixer.playAction('*');
        // Unpause and ensure one-shot
        const current = ufo.getAttribute('animation-mixer') || '';
        ufo.setAttribute('animation-mixer', `${current}; timeScale: 1; loop: once; repetitions: 1; clampWhenFinished: true`);
      }
    };
    if (ufoLoaded) play(); else ufo.addEventListener('model-loaded', play, { once: true });

    // After 6 seconds, show the card layers, cube, and start triangle pulses
    setTimeout(() => {
      [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', true));
      text.setAttribute('material', 'opacity:1');
      [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));
      fadeTimer = setTimeout(() => text.emit('start-fade'), 10000);
      
      // Show interactive cube
      cube.setAttribute('visible', true);
    }, 6000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-stop'));
    text.setAttribute('material', 'opacity:1');
    // Hide cube when target lost
    cube.setAttribute('visible', false);
    isDragging = false;
    // Pause animation when target lost
    const mixer = ufo.components['animation-mixer'];
    if (mixer) {
      ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; timeScale: 0');
    }
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // ---------- Content Switching System ----------
  let currentContent = null;
  
  const showContent = (contentName, imageUrl) => {
    if (currentContent === contentName) return; // Already showing
    
    console.log(`[CUBE] Switching to: ${contentName}`);
    currentContent = contentName;
    
    // Stop triangle pulses and fade everything out
    [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
    text.emit('hide-text');
    [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    
    // After fade out, show new content
    setTimeout(() => {
      content.setAttribute('src', imageUrl);
      content.setAttribute('visible', true);
      content.setAttribute('material', 'opacity:0');
      content.emit('show-content');
    }, 900); // Wait for fade out to complete
  };
  
  const resetToDefault = () => {
    if (!currentContent) return; // Already in default state
    
    console.log('[CUBE] Resetting to default view');
    currentContent = null;
    
    // Fade out content
    content.emit('hide-content');
    
    // After fade out, restore text and triangles
    setTimeout(() => {
      content.setAttribute('visible', false);
      text.setAttribute('material', 'opacity:1');
      [t1, t2, t3, t4].forEach(el => {
        el.setAttribute('material', 'opacity:0.5');
        el.emit('pulse-start');
      });
    }, 900);
  };

  // ---------- Cube Face Click Detection ----------
  cube.addEventListener('click', (e) => {
    const intersection = e.detail.intersection;
    if (!intersection) return;
    
    const normal = intersection.face?.normal;
    if (!normal) return;
    
    // Detect which face was clicked based on normal vector
    const absX = Math.abs(normal.x);
    const absY = Math.abs(normal.y);
    const absZ = Math.abs(normal.z);
    
    let face = 'unknown';
    if (absX > absY && absX > absZ) {
      face = normal.x > 0 ? 'right' : 'left';
    } else if (absY > absX && absY > absZ) {
      face = normal.y > 0 ? 'top' : 'bottom';
    } else if (absZ > absX && absZ > absY) {
      face = normal.z > 0 ? 'front' : 'back';
    }
    
    console.log(`[CUBE] Face clicked: ${face}`);
    
    // Map faces to content
    switch(face) {
      case 'front':
        showContent('about', './assets/Art.png');
        break;
      case 'right':
        showContent('journal', './assets/Journal.png');
        break;
      case 'back':
        showContent('career', './assets/Career.png');
        break;
      case 'left':
        showContent('project', './assets/Project.png');
        break;
      case 'top':
        resetToDefault();
        break;
      case 'bottom':
        resetToDefault();
        break;
    }
  });
});
